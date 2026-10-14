// Lecture et utilitaires partagés entre le site, le CV PDF et les scripts.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { parse } from 'yaml';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const LANGS = ['fr', 'en'];

export function loadCv(path = process.env.CV_FILE || resolve(ROOT, 'data/cv.yaml')) {
  return parse(readFileSync(path, 'utf8'));
}

/** Résout un texte `string | { fr, en }` dans la langue demandée. */
export function t(value, lang) {
  if (value == null) return '';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  return value[lang] ?? value.fr ?? '';
}

const MONTHS = {
  fr: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};

export function formatMonth(ym, lang) {
  if (!ym) return lang === 'fr' ? "aujourd'hui" : 'present';
  const [y, m] = String(ym).split('-').map(Number);
  return `${MONTHS[lang][m - 1]} ${y}`;
}

export function formatRange(start, end, lang) {
  if (!end) return lang === 'fr' ? `Depuis ${formatMonth(start, lang)}` : `Since ${formatMonth(start, lang)}`;
  return `${formatMonth(start, lang)} – ${formatMonth(end, lang)}`;
}

/** Filtre pour le CV : retire les éléments `cv: false` et les expériences sans contenu. */
export function forCv(cv) {
  const keep = (x) => x?.cv !== false;
  return {
    ...cv,
    work: cv.work.filter(keep).map((w) => ({ ...w, highlights: (w.highlights || []).filter(keep) })),
    skills: cv.skills.filter(keep),
    certificates: (cv.certificates || []).filter(keep),
    projects: (cv.projects || []).filter(keep),
  };
}
