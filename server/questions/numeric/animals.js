export const QUESTIONS = [
  {
    id: 'ani_2001',
    type: 'numeric',
    question: "Quanto pesa approssimativamente una Farfalla Moncaca?",
    min: 1,
    max: 25,
    step: 1,
    unit: 'g',
    correctValue: 1,
    explaination: [
      "Il peso della Farfalla Monarca (Danaus plexippus) varia tipicamente tra 0,25 e 0,75 grammi",
      "Misura approssimativamente tra 8 e 10 centimetri."
    ],
  },
  {
    id: 'ani_2002',
    type: 'numeric',
    question: "Quanti denti ha un cavallo maschio adulto? (senza considerare i denti lupini presenti in alcune specie)",
    min: 4,
    max: 50,
    step: 2,
    unit: 'denti',
    correctValue: 40,
    explaination: [
      "I cavalli maschi adulti hanno 40 denti",
      "Le femmine, invece, ne hanno 36",
      "I denti lupini sono piccoli pre-molari presenti solo in alcune specie di cavalli. Oggi non hanno più una vera funzione masticatoria significativa ma sono un rettaggio evolutivo di quando i cavalli avevano una dentatura più simile a quella dei suini."
    ],
  },
  {
    id: 'ani_2003',
    type: 'numeric',
    question: "A quale velocità riesce ad arrivare un elefante?",
    min: 20,
    max: 80,
    step: 5,
    unit: 'km/h',
    correctValue: 40,
    explaination: [
      "In sprint brevi, un elefante può toccare velocità intorno ai 40 chilometri orari",
      "Tuttavia mantenere questa velocità per lungo tempo non è possibile per un animale della loro massa."
    ],
  },
]