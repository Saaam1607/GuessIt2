export const QUESTIONS = [
  {
    id: 'spo_2001',
    type: 'numeric',
    question: "Quanti milioni di euro ha speso il Real Madrid per l'acquisto di Kylian Mbappé dal PSG? (senza considerare stipendio e agenti)",
    min: 0,
    max: 300,
    step: 1,
    unit: 'milioni',
    correctValue: 0,
    explaination: [
      "Kylian Mbappé è arrivato al Real Madrid a parametro zero dal Paris Saint-Germain al termine del suo contratto con il club parigino."
    ],
  },
  {
    id: 'spo_2002',
    type: 'numeric',
    question: "Quanti giocatori sono in campo per squadra nella pallamano?",
    min: 1,
    max: 20,
    step: 1,
    unit: 'giocatori',
    correctValue: 7,
    explaination: [
      "Nella pallamano, ogni squadra ha in campo 7 giocatori.",
      "I giocatori sono divisi in 6 giocatori di movimento e 1 portiere."
    ],
  },
  {
    id: 'spo_2003',
    type: 'numeric',
    question: "Quanti ori ha vinto l'Italia alle ultime Olimpiadi? (Parigi 2024)",
    min: 1,
    max: 31,
    step: 5,
    unit: 'ori',
    correctValue: 12,
    explaination: [
      "L'Italia ha vinto 12 medaglie d'oro alle Olimpiadi di Parigi 2024.",
      "I podi azzurri sono stati in totale 32, frutto di 12 medaglie d'oro, 13 d'argento e 7 di bronzo."
    ],
  },
]