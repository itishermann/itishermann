// Données du site : lit data/cv.yaml une fois au build et prépare ce que les pages affichent.
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
// @ts-ignore module JS partagé avec les scripts du CV
import { loadCv, t, formatRange } from '../../scripts/lib/cv.mjs';

// Le build Astro tourne depuis la racine du dépôt ; import.meta.url pointe vers dist/ une fois bundlé.
const ROOT = process.cwd();

export type Lang = 'fr' | 'en';
export const cv = loadCv(process.env.CV_FILE || resolve(ROOT, 'data/cv.yaml'));
export { t };

export const ui = {
  fr: {
    otherLang: 'English',
    otherHref: '/en/',
    iam: "Moi c'est",
    hello: 'Salut',
    nav: { home: 'Accueil', work: 'Parcours', skills: 'Compétences', projects: 'Projets', blog: 'Blog', contact: 'Contact' },
    eyebrow: { work: 'Parcours', skills: 'Compétences', projects: 'Projets', education: 'Formation', contact: 'Contact' },
    workTitle: 'Mon parcours',
    scrollDown: 'Défiler',
    menu: 'Menu',
    quickActions: 'Accès rapide',
    graphKey: 'missions en parallèle',
    social: 'Retrouvez-moi',
    cvOther: 'CV en anglais (PDF)',
    resume: 'Télécharger mon CV',
    resumeShort: 'CV (PDF)',
    email: 'Écrire un mail',
    scroll: 'Mon parcours',
    work: 'Parcours',
    workIntro: 'Les missions qui se chevauchent sont sur des branches parallèles.',
    skills: "Ce que j'utilise",
    projects: 'Projets perso',
    education: 'Formation',
    languages: 'Langues',
    contactTitle: 'Une mission à me proposer ?',
    contactLead: "Le plus simple est de m'écrire.",
    cvLinks: 'CV en PDF',
    cvFr: 'français',
    cvEn: 'anglais',
    footer: 'Ce site et mon CV en PDF sont générés depuis un seul fichier YAML.',
    source: 'Voir la source',
    ongoing: 'en cours',
    photoAlt: 'Portrait de Hermann Kao',
    description: (label: string) => `Hermann Kao, ${label.toLowerCase()} basé à Saint-Étienne. Parcours, compétences et CV à télécharger.`,
  },
  en: {
    otherLang: 'Français',
    otherHref: '/',
    iam: "I'm",
    hello: 'Hello',
    nav: { home: 'Home', work: 'Work', skills: 'Skills', projects: 'Projects', blog: 'Blog', contact: 'Contact' },
    eyebrow: { work: 'Work', skills: 'Skills', projects: 'Projects', education: 'Education', contact: 'Contact' },
    workTitle: 'My path',
    scrollDown: 'Scroll down',
    menu: 'Menu',
    quickActions: 'Quick access',
    graphKey: 'concurrent assignments',
    social: 'Find me',
    cvOther: 'Resume in French (PDF)',
    resume: 'Download my resume',
    resumeShort: 'Resume (PDF)',
    email: 'Email me',
    scroll: 'My path',
    work: 'Work',
    workIntro: 'Assignments that overlapped sit on parallel branches.',
    skills: 'Tools I use',
    projects: 'Side projects',
    education: 'Education',
    languages: 'Languages',
    contactTitle: 'Have an assignment in mind?',
    contactLead: 'The easiest way is to email me.',
    cvLinks: 'Resume as PDF',
    cvFr: 'French',
    cvEn: 'English',
    footer: 'This site and my PDF resume are built from a single YAML file.',
    source: 'View the source',
    ongoing: 'ongoing',
    photoAlt: 'Portrait of Hermann Kao',
    description: (label: string) => `Hermann Kao, ${label.toLowerCase()} based in Saint-Étienne, France. Experience, skills and downloadable resume.`,
  },
} as const;

export const photoExists = cv.basics.photo && existsSync(resolve(ROOT, 'public', cv.basics.photo.replace(/^\//, '')));
export const resumeHref = (lang: Lang) => `/cv/hermann-kao-cv-${lang}.pdf`;
export const range = (s: string, e: string | undefined, lang: Lang) => formatRange(s, e, lang);

// ---------- Graphe Git du parcours ----------
// Chaque expérience reçoit une « voie ». Deux expériences qui se chevauchent dans le temps
// ne partagent jamais une voie. Pour chaque ligne (une expérience), on calcule quelles voies
// sont actives en haut et en bas de la ligne.
const toNum = (ym: string) => {
  const [y, m] = ym.split('-').map(Number);
  return y * 12 + (m - 1);
};
const now = (() => {
  const d = new Date();
  return d.getFullYear() * 12 + d.getMonth();
})();

type Work = (typeof cv.work)[number];
export interface Row { item: Work; lane: number; above: boolean[]; below: boolean[] }

export function graph(): { rows: Row[]; lanes: number } {
  const items = cv.work.map((w: Work) => ({ w, s: toNum(w.start), e: w.end ? toNum(w.end) : now }));
  const asc = [...items].sort((a, b) => a.s - b.s);
  const laneEnds: number[] = [];
  const laneOf = new Map<Work, number>();
  for (const it of asc) {
    let lane = laneEnds.findIndex((end) => end < it.s);
    if (lane === -1) lane = laneEnds.length;
    laneEnds[lane] = it.e;
    laneOf.set(it.w, lane);
  }
  const lanes = laneEnds.length;
  const desc = [...items].sort((a, b) => b.s - a.s);
  // Expérience qui occupe une voie à une date donnée (au plus une, par construction).
  const occ = (lane: number, time: number) =>
    items.find((it) => laneOf.get(it.w) === lane && it.s <= time && time <= it.e)?.w;
  // Un segment n'est tracé que si c'est la même expérience des deux côtés :
  // deux missions successives sur une même voie ne sont pas reliées.
  const same = (lane: number, a: number, b: number) => {
    const x = occ(lane, a);
    return !!x && x === occ(lane, b);
  };

  const rows = desc.map((it, i) => {
    const lane = laneOf.get(it.w)!;
    const tHere = it.s;
    const tAbove = i === 0 ? now : desc[i - 1].s;
    const tBelow = i === desc.length - 1 ? -Infinity : desc[i + 1].s;
    const above = Array.from({ length: lanes }, (_, l) => same(l, tHere, tAbove));
    // Sous le nœud, sa voie s'arrête : c'est le début de l'expérience.
    const below = Array.from({ length: lanes }, (_, l) => l !== lane && same(l, tHere, tBelow));
    return { item: it.w, lane, above, below };
  });
  return { rows, lanes };
}
