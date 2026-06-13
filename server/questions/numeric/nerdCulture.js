export const QUESTIONS = [
  {
    id: 'ner_2001',
    type: 'numeric',
    question: "In quale episodio di DragonBall venne sconfitto Majin Bu (291 episodi totali)?",
    min: 1,
    max: 291,
    step: 1,
    unit: '',
    correctValue: 286,
    explaination: [
      "Majin Bu viene sconfitto nell'episodio 286 di DragonBall Z",
      "Viene sconfitto da Son Goku, utilizzando la tecnica del Genkidama."
    ],
  },
  {
    id: 'ner_2002',
    type: 'numeric',
    question: "In che anno è uscita la Playstation 2?",
    min: 1995,
    max: 2015,
    step: 1,
    unit: '',
    correctValue: 2000,
    explaination: [
      "La Playstation 2 è stata lanciata sul mercato giapponese il 4 marzo 2000.",
      "È arrivata in Europa il 24 novembre 2000.",
    ],
  },
  {
    id: 'ner_2003',
    type: 'numeric',
    question: "Nella serie animata Pokémon, quanti membri ha la squadra iniziale di Ash Ketchum quando parte all'avventura?",
    min: 1,
    max: 10,
    step: 1,
    unit: 'Pokémon',
    correctValue: 6,
    explaination: [
      "Ash parte all'avventura solamente con Pikachu."
    ],
  },
]