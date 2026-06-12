import { Text } from 'react-native';

import { ScoreRow } from './score-row';

import { OPTION_LABELS, TRUE_FALSE_LABELS } from '@/constants/game';
import { Player } from '@/types/game';

interface RankingProps {
  players: Player[];
  myId: string;
  gs: any;
  theme: {
    textSecondary: string;
  };
  answers?: Record<string, number | null>;
  correctIndex?: number;
  questionType?: 'multiple_choice' | 'true_false';
  serverUrl?: string;
  usedBonuses?: Record<string, { fiftyFifty?: boolean; doublePoints?: boolean }>;
}

export default function Ranking({
  players,
  myId,
  gs,
  theme,
  answers,
  correctIndex,
  questionType,
  serverUrl,
  usedBonuses,
}: RankingProps) {
  const labels = questionType === 'true_false' ? TRUE_FALSE_LABELS : OPTION_LABELS;

  return (
    <>
      <Text
        style={[
          gs.sectionLabel,
          { color: theme.textSecondary },
        ]}
      >
        CLASSIFICA
      </Text>

      {players
        .slice()
        .sort((a, b) => b.score - a.score)
        .map((player, index) => {
          const playerAnswer = answers?.[player.id];
          const answerLabel = playerAnswer != null ? labels[playerAnswer] : undefined;
          const isCorrect = playerAnswer === correctIndex;
          const noAnswer = playerAnswer == null;

          return (
            <ScoreRow
              key={player.id}
              player={player}
              rank={index}
              myId={myId}
              answerLabel={answerLabel}
              isCorrect={isCorrect}
              noAnswer={noAnswer}
              serverUrl={serverUrl}
              usedBonuses={usedBonuses?.[player.id]}
            />
          );
        })}
    </>
  );
}