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
    workIntro: 'Les missions qui se chevauchent apparaissent côte à côte.',
    skills: "Ce que j'utilise",
    projects: 'Projets perso',
    education: 'Formation',
    languages: 'Langues',
    contactTitle: 'Une mission à me proposer ?',
    contactLead: "Le plus simple est de m'écrire.",
    cvLinks: 'CV en PDF',
    cvFr: 'français',
    cvEn: 'anglais',
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
    workIntro: 'Overlapping assignments appear side by side.',
    skills: 'Tools I use',
    projects: 'Side projects',
    education: 'Education',
    languages: 'Languages',
    contactTitle: 'Have an assignment in mind?',
    contactLead: 'The easiest way is to email me.',
    cvLinks: 'Resume as PDF',
    cvFr: 'French',
    cvEn: 'English',
    ongoing: 'ongoing',
    photoAlt: 'Portrait of Hermann Kao',
    description: (label: string) => `Hermann Kao, ${label.toLowerCase()} based in Saint-Étienne, France. Experience, skills and downloadable resume.`,
  },
} as const;

export const photoExists = cv.basics.photo && existsSync(resolve(ROOT, 'public', cv.basics.photo.replace(/^\//, '')));
export const resumeHref = (lang: Lang) => `/cv/hermann-kao-cv-${lang}.pdf`;
export const range = (s: string, e: string | undefined, lang: Lang) => formatRange(s, e, lang);

// ---------- Ruban temporel du parcours ----------
// Chaque expérience reçoit une « voie » : deux expériences qui se chevauchent
// dans le temps n'en partagent jamais une. Le ruban place chaque poste sur un
// axe d'années (le plus récent en haut) ; deux barres côte à côte = simultané.
const toNum = (ym: string) => {
  const [y, m] = ym.split('-').map(Number);
  return y * 12 + (m - 1);
};
const now = (() => {
  const d = new Date();
  return d.getFullYear() * 12 + d.getMonth();
})();

type Work = (typeof cv.work)[number];
export interface Bar { id: string; lane: number; topPct: number; heightPct: number; ongoing: boolean }
export interface TimelineRow { item: Work; lane: number }

export function timeline(): {
  bars: Bar[];
  rows: TimelineRow[];
  years: { year: number; topPct: number }[];
  lanes: number;
} {
  const items = cv.work.map((w: Work) => ({ w, s: toNum(w.start), e: w.end ? toNum(w.end) : now }));
  // Affectation des voies : par ordre de début, chaque poste prend la première voie libre.
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
  const spanStart = Math.min(...items.map((i) => i.s));
  const spanEnd = now;
  const span = Math.max(1, spanEnd - spanStart);
  // Le plus récent en haut (0 %), le plus ancien en bas (100 %).
  const pct = (tm: number) => ((spanEnd - tm) / span) * 100;
  const clamp = (n: number) => Math.min(100, Math.max(0, n));

  const bars: Bar[] = [...items]
    .sort((a, b) => b.e - a.e)
    .map((it) => ({
      id: it.w.id,
      lane: laneOf.get(it.w)!,
      topPct: clamp(pct(it.e)),
      heightPct: Math.max(3, clamp(((it.e - it.s) / span) * 100)),
      ongoing: !it.w.end,
    }));

  const years: { year: number; topPct: number }[] = [];
  for (let y = Math.floor(spanEnd / 12); y >= Math.floor(spanStart / 12); y--) {
    const p = pct(y * 12);
    if (p >= -2 && p <= 102) years.push({ year: y, topPct: clamp(p) });
  }

  const rows: TimelineRow[] = [...items]
    .sort((a, b) => b.s - a.s)
    .map((it) => ({ item: it.w, lane: laneOf.get(it.w)! }));

  return { bars, rows, years, lanes };
}
