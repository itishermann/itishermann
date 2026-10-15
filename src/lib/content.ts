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
    eyebrow: { work: 'Parcours', skills: 'Compétences', projects: 'Projets', education: 'Formation', interests: "Centres d'intérêt", contact: 'Contact' },
    interestsTitle: 'En dehors du code',
    workTitle: 'Mon parcours',
    scrollDown: 'Défiler',
    menu: 'Menu',
    quickActions: 'Accès rapide',
    available: 'Ouvert aux missions',
    graphKey: 'missions en parallèle',
    social: 'Retrouvez-moi',
    cvOther: 'CV en anglais (PDF)',
    resume: 'Télécharger mon CV',
    resumeShort: 'CV (PDF)',
    email: 'Écrire un mail',
    scroll: 'Mon parcours',
    work: 'Parcours',
    workIntro: 'Un aperçu des missions en tête, le détail poste par poste en dessous.',
    overviewLegend: 'Chaque barre, une mission. Empilées, elles sont simultanées.',
    overviewSummary: (n: number) => `Jusqu'à ${n} missions menées en parallèle sur la période.`,
    showMore: (n: number) => `Voir ${n} de plus`,
    showLess: 'Réduire',
    skills: "Ce que j'utilise",
    projects: 'Projets perso',
    education: 'Formation',
    languages: 'Langues',
    contactTitle: 'Une mission à me proposer ?',
    contactLead: 'Un mot via le formulaire, je réponds vite.',
    contactAlt: 'Vous préférez un échange direct ? ',
    contactAltLink: 'Écrivez-moi sur LinkedIn',
    contactCta: 'Me contacter',
    form: {
      name: 'Nom',
      email: 'Email',
      message: 'Message',
      send: 'Envoyer',
      sending: 'Envoi…',
      ok: 'Merci, votre message est parti. Je réponds vite.',
      error: "L'envoi a échoué. Réessayez, ou écrivez-moi via LinkedIn.",
      spam: 'Formulaire protégé du spam par un test anti-robot.',
      hp: 'Laissez ce champ vide',
    },
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
    eyebrow: { work: 'Work', skills: 'Skills', projects: 'Projects', education: 'Education', interests: 'Interests', contact: 'Contact' },
    interestsTitle: 'Away from the keyboard',
    workTitle: 'My path',
    scrollDown: 'Scroll down',
    menu: 'Menu',
    quickActions: 'Quick access',
    available: 'Open to new work',
    graphKey: 'concurrent assignments',
    social: 'Find me',
    cvOther: 'Resume in French (PDF)',
    resume: 'Download my resume',
    resumeShort: 'Resume (PDF)',
    email: 'Email me',
    scroll: 'My path',
    work: 'Work',
    workIntro: 'A quick overview up top, then role-by-role detail below.',
    overviewLegend: 'Each bar is one assignment. Stacked bars overlap in time.',
    overviewSummary: (n: number) => `Up to ${n} assignments running at the same time.`,
    showMore: (n: number) => `Show ${n} more`,
    showLess: 'Show less',
    skills: 'Tools I use',
    projects: 'Side projects',
    education: 'Education',
    languages: 'Languages',
    contactTitle: 'Have an assignment in mind?',
    contactLead: 'Drop a line through the form; I reply fast.',
    contactAlt: 'Prefer a direct line? ',
    contactAltLink: 'Message me on LinkedIn',
    contactCta: 'Contact me',
    form: {
      name: 'Name',
      email: 'Email',
      message: 'Message',
      send: 'Send',
      sending: 'Sending…',
      ok: "Thanks, your message is on its way. I'll reply soon.",
      error: 'Sending failed. Try again, or reach me on LinkedIn.',
      spam: 'This form is protected from spam by an anti-bot check.',
      hp: 'Leave this field empty',
    },
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
export interface Bar { id: string; lane: number; leftPct: number; widthPct: number; ongoing: boolean }
export interface TimelineRow { item: Work; lane: number }

export function timeline(): {
  bars: Bar[];
  rows: TimelineRow[];
  years: { year: number; leftPct: number }[];
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
  // Axe horizontal : le plus ancien à gauche (0 %), le plus récent à droite (100 %).
  const pct = (tm: number) => ((tm - spanStart) / span) * 100;
  const clamp = (n: number) => Math.min(100, Math.max(0, n));

  const bars: Bar[] = items.map((it) => ({
    id: it.w.id,
    lane: laneOf.get(it.w)!,
    leftPct: clamp(pct(it.s)),
    widthPct: Math.max(2, clamp(((it.e - it.s) / span) * 100)),
    ongoing: !it.w.end,
  }));

  const years: { year: number; leftPct: number }[] = [];
  for (let y = Math.floor(spanStart / 12); y <= Math.floor(spanEnd / 12); y++) {
    const p = pct(y * 12);
    if (p >= -2 && p <= 102) years.push({ year: y, leftPct: clamp(p) });
  }

  // Liste menée par l'activité la plus récente : postes en cours d'abord, puis par fin décroissante.
  const rows: TimelineRow[] = [...items]
    .sort((a, b) => b.e - a.e || b.s - a.s)
    .map((it) => ({ item: it.w, lane: laneOf.get(it.w)! }));

  return { bars, rows, years, lanes };
}
