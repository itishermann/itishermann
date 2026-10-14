// CV ATS : une colonne, texte réel, polices embarquées, aucun tableau ni icône.
// Les données arrivent déjà résolues dans une langue, via --input data=<chemin json>.
#let data = json(sys.inputs.at("data", default: "/cv/build/cv.fr.json"))
#let L = data.labels

#set document(title: data.name + " - " + data.label, author: data.name, keywords: data.keywords)
#set page(paper: "a4", margin: (x: 17mm, top: 15mm, bottom: 15mm))
#set text(font: "Source Sans 3", size: 10pt, lang: data.lang, fill: rgb("#1a1a1a"), hyphenate: false)
#set par(justify: false, leading: 0.55em, spacing: 0.7em)
#set list(indent: 0.6em, body-indent: 0.5em, spacing: 0.45em, marker: [•])
#show link: it => it

#let accent = rgb("#1f3a5f")

#let section(title) = {
  v(0.9em)
  block(below: 0.55em, sticky: true, {
    text(size: 10.5pt, weight: "bold", fill: accent, upper(title))
    v(-0.55em)
    line(length: 100%, stroke: 0.5pt + rgb("#9aa5b1"))
  })
}

// En-tête
#text(size: 20pt, weight: "bold", data.name)
#v(-0.35em)
#text(size: 11.5pt, weight: "semibold", fill: accent, data.label)
#v(-0.25em)
#text(size: 9.5pt, {
  // Coordonnées sur la première ligne, profils en ligne sur la seconde.
  data.contact.slice(0, calc.min(3, data.contact.len())).join("  |  ")
  if data.contact.len() > 3 { linebreak(); data.contact.slice(3).join("  |  ") }
})

#if data.summary != "" {
  section(L.summary)
  data.summary
}

#section(L.experience)
#for (i, w) in data.work.enumerate() {
  block(breakable: true, below: 1em, {
    text(weight: "bold", w.position)
    h(1fr)
    text(size: 9.5pt, w.dates)
    linebreak()
    text(size: 9.5pt, style: "italic", w.meta)
    if w.summary != "" {
      v(-0.2em)
      par(w.summary)
    }
    if w.highlights.len() > 0 {
      v(-0.2em)
      list(..w.highlights)
    }
  })
}

#section(L.skills)
#for s in data.skills [
  #text(weight: "semibold", s.name)#L.colon#s.keywords.join(", ") \
]

#if data.projects.len() > 0 {
  section(L.projects)
  for p in data.projects [
    #text(weight: "semibold", p.name)#L.colon#p.description \
  ]
}

#section(L.education)
#for e in data.education [
  #text(weight: "semibold", e.title)#h(1fr)#text(size: 9.5pt, e.dates) \
  #text(size: 9.5pt, e.meta) \
]

#section(L.languages)
#data.languages.join("  |  ")

#if data.certificates.len() > 0 {
  section(L.certificates)
  list(..data.certificates)
}
