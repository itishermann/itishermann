### Salut, moi c'est Hermann. Hi, I'm Hermann.

Développeur fullstack JavaScript / TypeScript, orienté DevOps, basé à Saint-Étienne.
Fullstack JavaScript / TypeScript developer with a DevOps focus, based in Saint-Étienne, France.

[itishermann.me](https://itishermann.me) · [CV (FR)](https://itishermann.me/cv/hermann-kao-cv-fr.pdf) · [Resume (EN)](https://itishermann.me/cv/hermann-kao-cv-en.pdf) · [LinkedIn](https://www.linkedin.com/in/itishermann)

<details>
<summary>Comment ce dépôt fonctionne</summary>

Ce dépôt est aussi la source de mon site et de mes CV. Tout part de [`data/cv.yaml`](data/cv.yaml) :

- `npm run build` valide le fichier contre [`schema/cv.schema.json`](schema/cv.schema.json), génère les CV PDF en français et en anglais avec Typst, construit le site statique (Astro), puis vérifie que tout le texte des PDF est extractible par un logiciel de recrutement.
- Chaque push sur `master` relance cette chaîne et déploie sur Cloudflare Pages. Chaque pull request obtient une adresse de prévisualisation.
- `npm run tailor` prépare un CV ciblé pour une offre. Les règles pour les agents IA sont dans [`AGENTS.md`](AGENTS.md).
- Le site publie aussi [`/cv.json`](https://itishermann.me/cv.json) et [`/llms.txt`](https://itishermann.me/llms.txt) pour les outils qui veulent lire le parcours.

En local : `npm ci`, puis `npm run dev`. Il faut [Typst](https://typst.app) (ou `pip install typst`) et `pdftotext` (poppler) pour les PDF.
</details>
