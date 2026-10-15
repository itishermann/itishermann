// Point d'entrée pour les agents IA (convention llms.txt).
import { cv, t } from '../lib/content';

export const GET = () => {
  const b = cv.basics;
  const body = `# ${b.name}

> ${t(b.label, 'en')}. ${t(b.summary, 'en').trim()}

## Data
- [Structured resume (JSON)](https://itishermann.me/cv.json): full bilingual source, same content as data/cv.yaml
- [Schema](https://github.com/itishermann/itishermann/blob/master/schema/cv.schema.json)
- [Instructions for agents tailoring a resume](https://github.com/itishermann/itishermann/blob/master/AGENTS.md)

## Resume (PDF)
- [French](https://itishermann.me/cv/hermann-kao-cv-fr.pdf)
- [English](https://itishermann.me/cv/hermann-kao-cv-en.pdf)

## Contact
- Contact form: ${b.website}/#contact
${(b.profiles || []).map((p: any) => `- ${p.network}: ${p.url}`).join('\n')}
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
