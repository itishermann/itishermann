// Génère README.md (affiché sur github.com/itishermann) à partir de data/cv.yaml.
// Usage : node scripts/build-readme.mjs [--check]
//   --check : n'écrit rien, échoue si README.md n'est pas à jour.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { ROOT, loadCv, t, formatRange } from './lib/cv.mjs';

const cv = loadCv();
const b = cv.basics;
const SITE = b.website || 'https://itishermann.me';
const profile = (name) => (b.profiles || []).find((p) => p.network === name);

const T = {
  en: {
    now: 'Currently',
    experience: 'Experience',
    when: 'When',
    role: 'Role',
    where: 'Where',
    toolbox: 'Toolbox',
    projects: 'Side projects',
    education: 'Education',
    interests: 'Interests',
    links: 'Links',
    site: 'Website',
    resume: 'Resume (PDF)',
    cvOther: 'CV in French (PDF)',
    blog: 'Blog',
  },
  fr: {
    now: 'En ce moment',
    experience: 'Parcours',
    when: 'Quand',
    role: 'Poste',
    where: 'Où',
    toolbox: 'Outils',
    projects: 'Projets perso',
    education: 'Formation',
    interests: 'Centres d\'intérêt',
    links: 'Liens',
    site: 'Site',
    resume: 'CV (PDF)',
    cvOther: 'CV en anglais (PDF)',
    blog: 'Blog',
  },
};

// Échappe ce qui casserait un tableau Markdown.
const cell = (s) => String(s).replace(/\|/g, '\\|').replace(/\n/g, ' ');

function section(lang) {
  const L = T[lang];
  const ongoing = cv.work.filter((w) => !w.end);
  const other = lang === 'fr' ? 'en' : 'fr';
  const colon = lang === 'fr' ? ' : ' : ': ';
  const lines = [];

  lines.push(`### ${t(b.greeting, lang)}`, '');
  lines.push(`**${t(b.label, lang)}**, ${lang === 'fr' ? 'basé à' : 'based in'} ${b.location.city}, France.`, '');
  lines.push(t(b.summary, lang).trim(), '');

  if (ongoing.length) {
    lines.push(`**${L.now}**`, '');
    for (const w of ongoing) lines.push(`- ${t(w.position, lang)}, ${t(w.organization, lang)}`);
    lines.push('');
  }

  lines.push(`#### ${L.experience}`, '', `| ${L.when} | ${L.role} | ${L.where} |`, '|---|---|---|');
  for (const w of cv.work) {
    lines.push(`| ${cell(formatRange(w.start, w.end, lang))} | ${cell(t(w.position, lang))} | ${cell(t(w.organization, lang))} |`);
  }
  lines.push('');

  lines.push(`#### ${L.toolbox}`, '');
  for (const s of cv.skills) lines.push(`- **${t(s.name, lang)}**${colon}${s.keywords.join(', ')}`);
  lines.push('');

  if (cv.projects?.length) {
    lines.push(`#### ${L.projects}`, '');
    for (const p of cv.projects) {
      const name = p.url ? `[${t(p.name, lang)}](${p.url})` : t(p.name, lang);
      lines.push(`- **${name}**${colon}${t(p.description, lang)}`);
    }
    lines.push('');
  }

  lines.push(`#### ${L.education}`, '');
  for (const e of cv.education) lines.push(`- ${t(e.studyType, lang)}, ${t(e.area, lang)}. ${e.institution}, ${e.end}`);
  lines.push('');

  if (cv.interests?.length) {
    lines.push(`#### ${L.interests}`, '', cv.interests.map((i) => t(i, lang)).join(' · '), '');
  }

  const blog = profile('Blog');
  const linkedin = profile('LinkedIn');
  const links = [
    `[${L.site}](${lang === 'fr' ? SITE : `${SITE}/en/`})`,
    blog && `[${L.blog}](${blog.url})`,
    linkedin && `[LinkedIn](${linkedin.url})`,
    `[${L.resume}](${SITE}/cv/hermann-kao-cv-${lang}.pdf)`,
    `[${L.cvOther}](${SITE}/cv/hermann-kao-cv-${other}.pdf)`,
    `[Contact](${lang === 'fr' ? `${SITE}/#contact` : `${SITE}/en/#contact`})`,
  ].filter(Boolean);
  lines.push(`#### ${L.links}`, '', links.join(' · '), '');
  return lines.join('\n');
}

const readme = `<!-- Généré depuis data/cv.yaml par scripts/build-readme.mjs. Ne pas modifier à la main : éditer cv.yaml puis lancer npm run build. -->

<a href="${SITE}"><img src="public/og.png" alt="${t(b.greeting, 'en')} ${t(b.greeting, 'fr')}" width="100%"></a>

${section('en')}
<details>
<summary>Version française</summary>

${section('fr')}
</details>

<details>
<summary>About this repository</summary>

This repository is the source of [${SITE.replace(/^https?:\/\//, '')}](${SITE}) and of my PDF resumes. Everything comes from [\`data/cv.yaml\`](data/cv.yaml): one build validates it against [\`schema/cv.schema.json\`](schema/cv.schema.json), renders the French and English PDFs with Typst, builds the static site with Astro, checks that every line of the PDFs can be read by an applicant tracking system, and regenerates this README. AI agents tailoring a resume follow [\`AGENTS.md\`](AGENTS.md).
</details>
`;

const target = resolve(ROOT, 'README.md');
if (process.argv.includes('--check')) {
  const current = existsSync(target) ? readFileSync(target, 'utf8') : '';
  if (current !== readme) {
    console.error('✗ README.md n\'est pas à jour : lancez npm run readme');
    process.exit(1);
  }
  console.log('✓ README.md à jour');
} else {
  writeFileSync(target, readme);
  console.log('✓ README.md');
}
