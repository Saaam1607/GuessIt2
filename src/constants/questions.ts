export type QuestionType = 'multiple_choice' | 'true_false';

export interface MultipleChoiceQuestion {
  id: string;
  type: 'multiple_choice';
  category: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
}

export interface TrueFalseQuestion {
  id: string;
  type: 'true_false';
  category: string;
  question: string;
  options: [string, string];
  correctIndex: 0 | 1;
}

export type Question = MultipleChoiceQuestion | TrueFalseQuestion;

export const QUESTIONS: Question[] = [
  // --- GEOGRAFIA ---
  { id: 'geo_001', type: 'multiple_choice', category: 'Geografia', question: 'Qual è la capitale della Francia?', options: ['Berlino', 'Madrid', 'Parigi', 'Roma'], correctIndex: 2 },
  { id: 'geo_002', type: 'multiple_choice', category: 'Geografia', question: 'Qual è il paese più grande del mondo per superficie?', options: ['USA', 'Cina', 'Canada', 'Russia'], correctIndex: 3 },
  { id: 'geo_003', type: 'multiple_choice', category: 'Geografia', question: "Qual è la capitale dell'Australia?", options: ['Sydney', 'Melbourne', 'Canberra', 'Brisbane'], correctIndex: 2 },
  { id: 'geo_004', type: 'multiple_choice', category: 'Geografia', question: 'In quale continente si trova il Sahara?', options: ['Asia', 'Africa', 'America del Sud', 'Oceania'], correctIndex: 1 },
  { id: 'geo_005', type: 'multiple_choice', category: 'Geografia', question: 'Quale fiume è il più lungo del mondo?', options: ['Nilo', 'Amazzonia', 'Mississippi', 'Yangtze'], correctIndex: 0 },

  // --- SCIENZA ---
  { id: 'sci_001', type: 'multiple_choice', category: 'Scienza', question: "Qual è il simbolo chimico dell'acqua?", options: ['CO2', 'O2', 'H2O', 'NaCl'], correctIndex: 2 },
  { id: 'sci_002', type: 'multiple_choice', category: 'Scienza', question: 'Quante ossa ha il corpo umano adulto?', options: ['106', '206', '306', '406'], correctIndex: 1 },
  { id: 'sci_003', type: 'multiple_choice', category: 'Scienza', question: 'Qual è la velocità della luce nel vuoto (circa)?', options: ['300.000 km/s', '150.000 km/s', '450.000 km/s', '600.000 km/s'], correctIndex: 0 },
  { id: 'sci_004', type: 'multiple_choice', category: 'Scienza', question: 'Quale pianeta è il più grande del sistema solare?', options: ['Saturno', 'Nettuno', 'Giove', 'Urano'], correctIndex: 2 },
  { id: 'sci_005', type: 'multiple_choice', category: 'Scienza', question: 'Quale elemento chimico ha numero atomico 79?', options: ['Argento', 'Platino', 'Oro', 'Rame'], correctIndex: 2 },

  // --- STORIA ---
  { id: 'sto_001', type: 'multiple_choice', category: 'Storia', question: 'In che anno è caduto il Muro di Berlino?', options: ['1985', '1989', '1991', '1993'], correctIndex: 1 },
  { id: 'sto_002', type: 'multiple_choice', category: 'Storia', question: 'Chi fu il primo presidente degli Stati Uniti?', options: ['Abraham Lincoln', 'Thomas Jefferson', 'Benjamin Franklin', 'George Washington'], correctIndex: 3 },
  { id: 'sto_003', type: 'multiple_choice', category: 'Storia', question: 'In quale anno iniziò la Prima Guerra Mondiale?', options: ['1910', '1914', '1916', '1918'], correctIndex: 1 },
  { id: 'sto_004', type: 'multiple_choice', category: 'Storia', question: 'Chi dipinse la Cappella Sistina?', options: ['Leonardo da Vinci', 'Raffaello', 'Michelangelo', 'Donatello'], correctIndex: 2 },

  // --- SPORT ---
  { id: 'spo_001', type: 'multiple_choice', category: 'Sport', question: 'Quanti giocatori ci sono in una squadra di calcio in campo?', options: ['9', '10', '11', '12'], correctIndex: 2 },
  { id: 'spo_002', type: 'multiple_choice', category: 'Sport', question: 'In quale paese hanno avuto luogo i Giochi Olimpici del 2020?', options: ['Cina', 'USA', 'Giappone', 'Francia'], correctIndex: 2 },
  { id: 'spo_003', type: 'multiple_choice', category: 'Sport', question: 'Quanti set si giocano in un match di tennis al meglio dei 5?', options: ['3', '4', '5', '6'], correctIndex: 2 },

  // --- CULTURA POP ---
  { id: 'pop_001', type: 'multiple_choice', category: 'Cultura Pop', question: 'Chi ha interpretato Iron Man nei film Marvel?', options: ['Chris Evans', 'Robert Downey Jr.', 'Chris Hemsworth', 'Mark Ruffalo'], correctIndex: 1 },
  { id: 'pop_002', type: 'multiple_choice', category: 'Cultura Pop', question: 'Quale canzone di Michael Jackson ha questo verso: "Billie Jean is not my lover"?', options: ['Thriller', 'Beat It', 'Billie Jean', 'Bad'], correctIndex: 2 },
  { id: 'pop_003', type: 'multiple_choice', category: 'Cultura Pop', question: 'In quale anno uscì il primo iPhone?', options: ['2005', '2006', '2007', '2008'], correctIndex: 2 },

  // --- VERO/FALSO: ANIMALI ---
  { id: 'ani_1001', type: 'true_false', category: 'Animali', question: 'Le oche domestiche possono arrivare a vivere fino a 30 anni.', options: ['Vero', 'Falso'], correctIndex: 0 },
  { id: 'ani_1002', type: 'true_false', category: 'Animali', question: 'Un rinoceronte maschio adulto può arrivare a pesare 10.000 kg.', options: ['Vero', 'Falso'], correctIndex: 1 },
  { id: 'ani_1003', type: 'true_false', category: 'Animali', question: 'Il piccione migratore è un animale estinto', options: ['Vero', 'Falso'], correctIndex: 0 },
  { id: 'ani_1004', type: 'true_false', category: 'Animali', question: 'I fenicotteri sono rosa perché mangiano gamberetti.', options: ['Vero', 'Falso'], correctIndex: 0 },
  { id: 'ani_1005', type: 'true_false', category: 'Animali', question: 'I koala sono una specie di orso.', options: ['Vero', 'Falso'], correctIndex: 1 },

  // --- VERO/FALSO: CINEMA ---
  { id: 'cin_1001', type: 'true_false', category: 'Cinema', question: "Il primo film 'Rocky', uscito nel 1977, NON ha mai vinto un Oscar?", options: ['Vero', 'Falso'], correctIndex: 1 },
  { id: 'cin_1002', type: 'true_false', category: 'Cinema', question: "In 'The Simpsons' i personaggi hanno quattro dita per mano invece di cinque.", options: ['Vero', 'Falso'], correctIndex: 0 },
  { id: 'cin_1003', type: 'true_false', category: 'Cinema', question: "Nella serie 'I Griffin', Peter Griffin è più basso della moglie Lois Griffin", options: ['Vero', 'Falso'], correctIndex: 1 },
  { id: 'cin_1004', type: 'true_false', category: 'Cinema', question: "Il primo smartphone della storia è stato l'iPhone nel 2007.", options: ['Vero', 'Falso'], correctIndex: 1 },

  // --- VERO/FALSO: GEOGRAFIA ---
  { id: 'geo_1001', type: 'true_false', category: 'Geografia', question: "La Polonia confina con l'Ungheria", options: ['Vero', 'Falso'], correctIndex: 1 },
  { id: 'geo_1002', type: 'true_false', category: 'Geografia', question: 'Il Burkina Faso è in Africa.', options: ['Vero', 'Falso'], correctIndex: 0 },
  { id: 'geo_1003', type: 'true_false', category: 'Geografia', question: 'In Inghilterra esiste un fiume in cui caderci dentro comporta una probabilità del 100% di fatalità', options: ['Vero', 'Falso'], correctIndex: 0 },
  { id: 'geo_1004', type: 'true_false', category: 'Geografia', question: 'Il Giappone è composto da oltre 6.800 isole.', options: ['Vero', 'Falso'], correctIndex: 0 },
  { id: 'geo_1005', type: 'true_false', category: 'Geografia', question: "Il Monte Everest è la montagna più alta del mondo dal centro della Terra.", options: ['Vero', 'Falso'], correctIndex: 1 },
  { id: 'geo_1006', type: 'true_false', category: 'Geografia', question: 'Il deserto del Sahara è il deserto più grande del mondo.', options: ['Vero', 'Falso'], correctIndex: 1 },

  // --- VERO/FALSO: STORIA ---
  { id: 'his_1003', type: 'true_false', category: 'Storia', question: "Cristoforo Colombo partì alla scoperta dell'America perchè, a seguito di una condanna penale, se non fosse partito sarebbe stato esiliato", options: ['Vero', 'Falso'], correctIndex: 1 },
  { id: 'his_1004', type: 'true_false', category: 'Storia', question: 'La Grande Muraglia Cinese è visibile dallo spazio ad occhio nudo.', options: ['Vero', 'Falso'], correctIndex: 1 },
  { id: 'his_1005', type: 'true_false', category: 'Storia', question: 'La Rivoluzione Francese è iniziata con la presa della Bastiglia nel 1789.', options: ['Vero', 'Falso'], correctIndex: 0 },

  // --- VERO/FALSO: SCIENZA ---
  { id: 'sci_1001', type: 'true_false', category: 'Scienza', question: "L'acqua bolle a 90°C al livello del mare.", options: ['Vero', 'Falso'], correctIndex: 1 },
  { id: 'sci_1002', type: 'true_false', category: 'Scienza', question: 'Gli esseri umani hanno circa 600 muscoli nel corpo.', options: ['Vero', 'Falso'], correctIndex: 0 },
];

export function getRandomQuestions(count: number): Question[] {
  const shuffled = [...QUESTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
