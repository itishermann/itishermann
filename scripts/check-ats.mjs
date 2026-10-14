// Vérifie que chaque PDF généré est lisible par un ATS : le texte extrait par
// pdftotext doit contenir, mot pour mot, tout ce qui a été envoyé au template.
// Usage : node scripts/check-ats.mjs [--dir public/cv] [--name hermann-kao-cv]
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { ROOT } from './lib/cv.mjs';

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, all) => (a.startsWith('--') ? [...acc, [a.slice(2), all[i + 1]]] : acc), []),
);
const dir = resolve(args.dir || resolve(ROOT, 'public/cv'));
const name = args.name || 'hermann-kao-cv';
const langs = (args.lang || 'fr,en').split(',');

// Compare sans espaces ni tirets de césure : seule la séquence de caractères compte.
const norm = (s) => s.normalize('NFC').replace(/\s+/g, '').replace(/[­]/g, '');
let failed = false;

for (const lang of langs) {
  const pdf = resolve(dir, `${name}-${lang}.pdf`);
  const data = resolve(ROOT, `cv/build/${name}.${lang}.json`);
  if (!existsSync(pdf) || !existsSync(data)) {
    console.error(`✗ ${pdf} ou ${data} introuvable`);
    failed = true;
    continue;
  }
  const text = execFileSync('pdftotext', ['-enc', 'UTF-8', pdf, '-'], { stdio: ['ignore', 'pipe', 'ignore'] }).toString();
  const haystack = norm(text);
  const d = JSON.parse(readFileSync(data, 'utf8'));

  const expected = [
    d.name, d.label, ...d.contact,
    ...['summary', 'experience', 'skills', 'education', 'languages'].map((k) => d.labels[k]),
    ...(d.projects.length ? [d.labels.projects] : []),
    ...(d.certificates.length ? [d.labels.certificates] : []),
    ...d.projects.flatMap((p) => [p.name, p.description]),
    d.summary,
    ...d.work.flatMap((w) => [w.position, w.dates, w.meta, w.summary, ...w.highlights]),
    ...d.skills.flatMap((s) => [s.name, ...s.keywords]),
    ...d.education.flatMap((e) => [e.title, e.meta]),
    ...d.languages, ...d.certificates,
  ].filter(Boolean);

  const missing = expected.filter((s) => !haystack.includes(norm(s)) && !haystack.includes(norm(s.toUpperCase())));
  const words = text.split(/\s+/).filter(Boolean).length;

  if (missing.length) {
    failed = true;
    console.error(`✗ ${name}-${lang}.pdf : ${missing.length} passage(s) non extractible(s)`);
    for (const m of missing.slice(0, 10)) console.error(`    « ${m.slice(0, 90)} »`);
  } else if (words < 200) {
    failed = true;
    console.error(`✗ ${name}-${lang}.pdf : seulement ${words} mots extraits`);
  } else {
    console.log(`✓ ${name}-${lang}.pdf : ${expected.length} passages retrouvés, ${words} mots extraits`);
  }
}
process.exit(failed ? 1 : 0);
