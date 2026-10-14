// Valide un fichier CV contre le schéma, plus quelques règles que le schéma ne sait pas exprimer.
// Usage : node scripts/validate.mjs [chemin/vers/cv.yaml]
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { ROOT, loadCv } from './lib/cv.mjs';

const file = resolve(process.argv[2] || process.env.CV_FILE || resolve(ROOT, 'data/cv.yaml'));
const cv = loadCv(file);
const schema = JSON.parse(readFileSync(resolve(ROOT, 'schema/cv.schema.json'), 'utf8'));

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const errors = [];

if (!ajv.validate(schema, cv)) {
  for (const e of ajv.errors) errors.push(`${e.instancePath || '/'} ${e.message}`);
}

// Dates cohérentes
for (const w of cv.work || []) {
  if (w.end && w.end < w.start) errors.push(`/work/${w.id} se termine avant de commencer`);
}

// Ids uniques
for (const key of ['work', 'skills', 'projects']) {
  const ids = (cv[key] || []).map((x) => x.id);
  const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dup.length) errors.push(`/${key} ids en double : ${dup.join(', ')}`);
}

// Pas de tirets cadratins dans les textes rédigés (règle de style), hors plages de dates générées.
const walk = (v, path) => {
  if (typeof v === 'string') {
    if (v.includes('—')) errors.push(`${path} contient un tiret cadratin`);
  } else if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${path}/${i}`));
  else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) walk(x, `${path}/${k}`);
};
walk(cv, '');

if (errors.length) {
  console.error(`✗ ${file}\n  ` + errors.join('\n  '));
  process.exit(1);
}
console.log(`✓ ${file} est valide`);
