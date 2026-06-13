import { QUESTIONS as Animals_MultipleChoice } from './questions/multiple_choice/animals.js'
import { QUESTIONS as Animals_Numeric } from './questions/numeric/animals.js'
import { QUESTIONS as Animals_TrueOrFalse } from './questions/true_or_false/animals.js'

import { QUESTIONS as Cinema_MultipleChoice } from './questions/multiple_choice/cinema.js'
import { QUESTIONS as Cinema_Numeric } from './questions/numeric/cinema.js'
import { QUESTIONS as Cinema_TrueOrFalse } from './questions/true_or_false/cinema.js'

import { QUESTIONS as Geography_MultipleChoice } from './questions/multiple_choice/geography.js'
import { QUESTIONS as Geography_Numeric } from './questions/numeric/geography.js'
import { QUESTIONS as Geography_TrueOrFalse } from './questions/true_or_false/geography.js'

import { QUESTIONS as History_MultipleChoice } from './questions/multiple_choice/history.js'
import { QUESTIONS as History_Numeric } from './questions/numeric/history.js'
import { QUESTIONS as History_TrueOrFalse } from './questions/true_or_false/history.js'

import { QUESTIONS as Literature_MultipleChoice } from './questions/multiple_choice/literature.js'
import { QUESTIONS as Literature_Numeric } from './questions/numeric/literature.js'
import { QUESTIONS as Literature_TrueOrFalse } from './questions/true_or_false/literature.js'

import { QUESTIONS as Music_MultipleChoice } from './questions/multiple_choice/music.js'
import { QUESTIONS as Music_Numeric } from './questions/numeric/music.js'
import { QUESTIONS as Music_TrueOrFalse } from './questions/true_or_false/music.js'

import { QUESTIONS as NerdCulture_MultipleChoice } from './questions/multiple_choice/nerdCulture.js'
import { QUESTIONS as NerdCulture_Numeric } from './questions/numeric/nerdCulture.js'
import { QUESTIONS as NerdCulture_TrueOrFalse } from './questions/true_or_false/nerdCulture.js'

import { QUESTIONS as Sport_MultipleChoice } from './questions/multiple_choice/sport.js'
import { QUESTIONS as Sport_Numeric } from './questions/numeric/sport.js'
import { QUESTIONS as Sport_TrueOrFalse } from './questions/true_or_false/sport.js'


export const QUESTIONS = [
  {
    category: 'Animali',
    questions: [...Animals_MultipleChoice, ...Animals_TrueOrFalse, ...Animals_Numeric]
  },
  {
    category: 'Cinema',
    questions: [...Cinema_MultipleChoice, ...Cinema_TrueOrFalse, ...Cinema_Numeric]
  },
  {
    category: 'Geografia',
    questions: [...Geography_MultipleChoice, ...Geography_TrueOrFalse, ...Geography_Numeric]
  },
  {
    category: 'Storia',
    questions: [...History_MultipleChoice, ...History_TrueOrFalse, ...History_Numeric]
  },
  {
    category: 'Letteratura',
    questions: [...Literature_MultipleChoice, ...Literature_TrueOrFalse, ...Literature_Numeric]
  },
  {
    category: 'Musica',
    questions: [...Music_MultipleChoice, ...Music_TrueOrFalse, ...Music_Numeric]
  },
  {
    category: 'Nerd Culture',
    questions: [...NerdCulture_MultipleChoice, ...NerdCulture_TrueOrFalse, ...NerdCulture_Numeric]
  },
  {
    category: 'Sport',
    questions: [...Sport_MultipleChoice, ...Sport_TrueOrFalse, ...Sport_Numeric]
  },
];
