// Prépare et génère un CV ciblé à partir de data/cv.yaml.
//
// Deux usages :
//   1. Créer un brouillon filtré par tags, que l'agent (ou toi) retouche ensuite :
//      npm run tailor -- init --name locam --tags devops,integration,linux [--max 4] [--target "Intitulé de l'offre"]
//      → écrit variants/locam.yaml
//   2. Construire le PDF d'une variante (validation + rendu + contrôle ATS) :
//      npm run tailor -- build --name locam [--lang fr]
//      → out/hermann-kao-cv-locam-fr.pdf
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { stringify } from 'yaml';
import { ROOT, loadCv } from './lib/cv.mjs';

const [cmd, ...rest] = process.argv.slice(2);
const args = Object.fromEntries(
  rest.reduce((acc, a, i, all) => (a.startsWith('--') ? [...acc, [a.slice(2), all[i + 1]]] : acc), []),
);
const name = args.name;
if (!['init', 'build'].includes(cmd) || !name || !/^[a-z0-9-]+$/.test(name)) {
  console.error('Usage : npm run tailor -- init|build --name <slug> [--tags a,b] [--max 4] [--lang fr,en] [--target "..."]');
  process.exit(1);
}
const variant = resolve(ROOT, 'variants', `${name}.yaml`);

if (cmd === 'init') {
  const cv = loadCv();
  const wanted = (args.tags || '').split(',').filter(Boolean);
  const max = Number(args.max || 4);
  const score = (tags = []) => tags.filter((t) => wanted.includes(t)).length;

  if (wanted.length) {
    cv.work = cv.work.map((w) => {
      // On garde toutes les expériences (pas de trou dans le parcours) mais on ne retient
      // que les réalisations les plus pertinentes, dans l'ordre de pertinence.
      const ranked = (w.highlights || [])
        .map((h, i) => ({ h, s: score(h.tags), i }))
        .sort((a, b) => b.s - a.s || a.i - b.i);
      const relevant = ranked.filter((x) => x.s > 0);
      const keep = (relevant.length ? relevant : ranked.slice(0, 1)).slice(0, max).map((x) => x.h);
      return { ...w, highlights: keep };
    });
    cv.projects = (cv.projects || []).map((p) => (score(p.tags) ? p : { ...p, cv: false }));
  }
  cv.meta = { ...cv.meta, target: args.target || `tags: ${wanted.join(', ') || 'aucun'}` };

  mkdirSync(resolve(ROOT, 'variants'), { recursive: true });
  if (existsSync(variant) && !args.force) {
    console.error(`✗ ${variant} existe déjà (ajoutez --force pour l'écraser)`);
    process.exit(1);
  }
  writeFileSync(
    variant,
    `# yaml-language-server: $schema=../schema/cv.schema.json\n# Variante dérivée de data/cv.yaml. Ne pas inventer de faits : voir AGENTS.md.\n` +
      stringify(cv, { lineWidth: 0 }),
  );
  console.log(`✓ variants/${name}.yaml créé. Retouchez-le, puis : npm run tailor -- build --name ${name}`);
}

if (cmd === 'build') {
  if (!existsSync(variant)) {
    console.error(`✗ ${variant} introuvable. Lancez d'abord : npm run tailor -- init --name ${name}`);
    process.exit(1);
  }
  const lang = args.lang || 'fr,en';
  const pdfName = `hermann-kao-cv-${name}`;
  const run = (script, extra) => {
    const r = spawnSync('node', [resolve(ROOT, 'scripts', script), ...extra], { stdio: 'inherit' });
    if (r.status !== 0) process.exit(r.status ?? 1);
  };
  run('validate.mjs', [variant]);
  run('build-cv.mjs', ['--in', variant, '--out', resolve(ROOT, 'out'), '--name', pdfName, '--lang', lang]);
  run('check-ats.mjs', ['--dir', resolve(ROOT, 'out'), '--name', pdfName, '--lang', lang]);
}
