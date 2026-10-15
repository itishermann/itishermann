// Génère les CV PDF (FR + EN) à partir de data/cv.yaml via Typst.
// Usage : node scripts/build-cv.mjs [--in data/cv.yaml] [--out public/cv] [--name hermann-kao-cv] [--lang fr,en]
// Typst : binaire `typst` (CI) ou module Python `typst` en secours. Forcer avec TYPST_BIN.
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import { spawnSync } from 'node:child_process';
import { ROOT, LANGS, loadCv, t, formatRange, forCv } from './lib/cv.mjs';

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, all) => (a.startsWith('--') ? [...acc, [a.slice(2), all[i + 1]]] : acc), []),
);
const input = resolve(args.in || process.env.CV_FILE || resolve(ROOT, 'data/cv.yaml'));
const outDir = resolve(args.out || resolve(ROOT, 'public/cv'));
const baseName = args.name || 'hermann-kao-cv';
const langs = (args.lang || LANGS.join(',')).split(',');

const LABELS = {
  fr: {
    summary: 'Profil', experience: 'Expérience professionnelle', skills: 'Compétences', projects: 'Projets personnels',
    education: 'Formation', languages: 'Langues', certificates: 'Formations complémentaires', colon: ' : ',
  },
  en: {
    summary: 'Summary', experience: 'Professional experience', skills: 'Skills', projects: 'Personal projects',
    education: 'Education', languages: 'Languages', certificates: 'Additional training', colon: ': ',
  },
};

function resolveForLang(raw, lang) {
  const cv = forCv(raw);
  const b = cv.basics;
  const site = b.website ? b.website.replace(/^https?:\/\//, '') : null;
  const contact = [
    `${b.location.city}, France`,
    site,
    ...(b.profiles || []).map((p) => p.url.replace(/^https?:\/\/(www\.)?/, '')),
  ].filter(Boolean);

  return {
    lang,
    labels: LABELS[lang],
    name: b.name,
    label: t(b.label, lang),
    contact,
    summary: t(b.summary, lang).trim(),
    keywords: cv.skills.flatMap((s) => s.keywords),
    work: cv.work
      .filter((w) => (w.highlights || []).length || w.summary)
      .map((w) => ({
        position: t(w.position, lang),
        dates: formatRange(w.start, w.end, lang),
        meta: [t(w.organization, lang), t(w.contract, lang), t(w.location, lang)].filter(Boolean).join(' · '),
        summary: t(w.summary, lang).trim(),
        highlights: (w.highlights || []).map((h) => h[lang]),
      })),
    skills: cv.skills.map((s) => ({ name: t(s.name, lang), keywords: s.keywords })),
    projects: cv.projects.map((p) => ({ name: t(p.name, lang), description: t(p.description, lang) })),
    education: cv.education.map((e) => ({
      title: `${t(e.studyType, lang)}, ${t(e.area, lang)}`,
      dates: String(e.end ?? ''),
      meta: [e.institution, e.location].filter(Boolean).join(', '),
    })),
    languages: (cv.languages || []).map((l) => `${t(l.language, lang)}${LABELS[lang].colon}${t(l.fluency, lang)}`),
    certificates: cv.certificates.map((c) => t(c.name, lang)),
  };
}

function compile(dataPath, pdfPath) {
  const template = resolve(ROOT, 'cv/cv.typ');
  const fonts = resolve(ROOT, 'cv/fonts');
  const dataArg = '/' + relative(ROOT, dataPath).split('\\').join('/');
  const bin = process.env.TYPST_BIN || 'typst';
  const cli = spawnSync(bin, [
    'compile', '--root', ROOT, '--font-path', fonts, '--ignore-system-fonts',
    '--input', `data=${dataArg}`, template, pdfPath,
  ], { stdio: 'inherit' });
  if (cli.error?.code !== 'ENOENT') {
    if (cli.status !== 0) throw new Error(`typst a échoué (${cli.status})`);
    return;
  }
  // Secours : module Python typst (pip install typst)
  const py = spawnSync('python3', ['-c', `
import sys, typst
typst.compile(sys.argv[1], output=sys.argv[2], root=sys.argv[3], font_paths=[sys.argv[4]], ignore_system_fonts=True, sys_inputs={"data": sys.argv[5]})
`, template, pdfPath, ROOT, fonts, dataArg], { stdio: 'inherit' });
  if (py.status !== 0) throw new Error('Typst introuvable : installez le binaire typst ou `pip install typst`.');
}

const raw = loadCv(input);
mkdirSync(outDir, { recursive: true });
mkdirSync(resolve(ROOT, 'cv/build'), { recursive: true });

for (const lang of langs) {
  const dataPath = resolve(ROOT, `cv/build/${baseName}.${lang}.json`);
  writeFileSync(dataPath, JSON.stringify(resolveForLang(raw, lang), null, 2));
  const pdf = resolve(outDir, `${baseName}-${lang}.pdf`);
  compile(dataPath, pdf);
  if (!existsSync(pdf)) throw new Error(`PDF absent : ${pdf}`);
  console.log(`✓ ${relative(ROOT, pdf)}`);
}
