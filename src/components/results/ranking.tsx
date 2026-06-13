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
  questionType?: 'multiple_choice' | 'true_false' | 'numeric';
  serverUrl?: string;
  usedBonuses?: Record<string, { fiftyFifty?: boolean; doublePoints?: boolean; targeting?: boolean }>;
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

      {(() => {
        let closestPlayers: string[] = [];
        if (questionType === 'numeric' && correctIndex != null) {
          let closestDiff = Infinity;
          for (const pid of Object.keys(answers || {})) {
            const a = answers?.[pid];
            if (a !== null && a !== undefined) {
              const diff = Math.abs(a - correctIndex);
              if (diff < closestDiff) {
                closestDiff = diff;
                closestPlayers = [pid];
              } else if (diff === closestDiff) {
                closestPlayers.push(pid);
              }
            }
          }
        }

        return players
          .slice()
          .sort((a, b) => b.score - a.score)
          .map((player, index) => {
            const playerAnswer = answers?.[player.id];
            let answerLabel = undefined;
            if (playerAnswer != null) {
              if (questionType === 'numeric') {
                answerLabel = String(playerAnswer);
              } else {
                answerLabel = labels[playerAnswer];
              }
            }
            let isCorrect = false;
            if (questionType === 'numeric') {
              isCorrect = closestPlayers.includes(player.id);
            } else {
              isCorrect = playerAnswer === correctIndex;
            }
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
        });
      })()}
    </>
  );
}