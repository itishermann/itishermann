# Instructions pour les agents IA

Ce dépôt contient le parcours de Hermann Kao sous forme de données. `data/cv.yaml` est la source de vérité : le site itishermann.me et les CV PDF en sont générés. Ton travail habituel ici est de **dériver un CV ciblé** pour une offre, une entreprise ou un contexte, sans toucher à la source.

## Règles à respecter

1. **Ne rien inventer.** Tu peux reformuler, réordonner, raccourcir, choisir et mettre en avant. Tu ne peux pas ajouter un fait, un chiffre, une technologie, un titre, une date ou une responsabilité absents de `data/cv.yaml`. Si l'offre demande quelque chose qui n'y est pas, ne le prétends pas : signale-le dans ta réponse comme un écart.
2. **Ne jamais nommer les clients finaux.** Ils sont décrits par secteur et taille dans la source, garde cette forme. Les employeurs et donneurs d'ordre déjà nommés dans la source (organisation) peuvent rester.
3. **Ne pas modifier `data/cv.yaml`** pour un CV ciblé. Travaille sur une variante dans `variants/` (ignoré par Git, donc jamais publié).
4. **Garder toutes les expériences.** Un trou dans le parcours fait plus de tort qu'une ligne peu pertinente. Réduis les réalisations d'une expérience, ne la supprime pas.
5. **Rester sobre.** Pas de superlatifs, pas de « passionné », pas de tirets cadratins (le validateur les refuse). Phrases courtes, verbes d'action, vocabulaire de l'offre quand il correspond à un fait réel.
6. **Les deux langues.** Chaque texte est un objet `{ fr, en }`. Mets à jour les deux, ou génère seulement la langue demandée avec `--lang`.

## Procédure

```bash
npm ci
# 1. Brouillon filtré par tags (voir la liste plus bas)
npm run tailor -- init --name <slug> --tags devops,integration --max 4 --target "Intitulé exact de l'offre"
# 2. Retouche variants/<slug>.yaml :
#    - basics.label : intitulé proche de l'offre, s'il reste vrai
#    - basics.summary : 3 ou 4 phrases orientées vers l'offre, uniquement avec des faits de la source
#    - work[].highlights : choisis et reformule, mets le plus pertinent en premier
#    - skills : réordonne les groupes et les mots-clés, retire ceux hors sujet
#    - `cv: false` masque un élément sans le supprimer
# 3. Construction et contrôles (schéma, rendu PDF, texte extractible par un ATS)
npm run tailor -- build --name <slug> --lang fr
# → out/hermann-kao-cv-<slug>-fr.pdf
```

`build` échoue si le YAML ne respecte pas `schema/cv.schema.json` ou si un passage du PDF n'est pas extractible. Corrige jusqu'à ce que tout passe, puis livre le PDF avec la liste des écarts entre l'offre et le profil.

Sans accès au terminal, produis directement le YAML de la variante en respectant le schéma, et indique la commande `build` à lancer.

## Tags disponibles

Les réalisations et les projets portent des tags. Les principaux : `devops`, `cicd`, `kubernetes`, `aws`, `gcp`, `linux`, `integration`, `api`, `backend`, `web`, `nextjs`, `cms`, `php`, `dotnet`, `mobile`, `react-native`, `architecture`, `ia`, `tooling`, `lead`.
Pour la liste à jour : `grep -o "tags: \[.*\]" data/cv.yaml | sort -u`.

## Modifier la source (seulement à la demande d'Hermann)

Quand Hermann demande d'ajouter ou de corriger une expérience, édite `data/cv.yaml`, puis lance `npm run build` : il régénère aussi `README.md` (profil GitHub), à committer avec la modification. Ne modifie jamais `README.md` à la main. Un push sur `master` reconstruit et redéploie le site et les deux PDF. Les `TODO(hermann)` dans le fichier signalent des informations qu'il doit fournir : ne les remplis pas à sa place.
