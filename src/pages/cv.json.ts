// Version JSON publique du CV, lisible par les agents et les outils (même contenu que data/cv.yaml).
import { cv } from '../lib/content';

export const GET = () =>
  new Response(JSON.stringify(cv, null, 2), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
