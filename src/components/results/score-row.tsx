import { Image, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { Player } from '@/types/game';

interface ScoreRowProps {
  player: Player;
  rank: number;
  myId: string;
  answerLabel?: string;
  isCorrect?: boolean;
  noAnswer?: boolean;
  serverUrl?: string;
  usedBonuses?: { fiftyFifty?: boolean; doublePoints?: boolean };
}

export function ScoreRow({ player, rank, myId, answerLabel, isCorrect, noAnswer, serverUrl, usedBonuses }: ScoreRowProps) {
  const theme = useTheme();
  const isMe = player.id === myId;
  const rankEmoji = ['🥇', '🥈', '🥉'][rank] ?? `${rank + 1}.`;

  return (
    <Animated.View
      entering={FadeInDown.delay(rank * 80).duration(400)}
      style={[
        styles.row,
        isMe && { borderColor: 'rgba(99,102,241,0.4)', backgroundColor: 'rgba(99,102,241,0.05)' },
        rank === 0 && styles.firstPlace,
      ]}
    >
      <Text style={styles.rank}>{rankEmoji}</Text>
      {serverUrl && (
        <Image 
          source={{ uri: `${serverUrl}/images/profiles/${player.profileImage || 'panda.png'}` }} 
          style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.05)' }} 
        />
      )}
      <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
        {player.name}{isMe ? ' (Tu)' : ''}
      </Text>
      <View style={{ flexDirection: 'row', gap: 4, marginRight: 8 }}>
        {usedBonuses?.fiftyFifty && (
          <View style={{ backgroundColor: 'rgba(99,102,241,0.15)', paddingHorizontal: 6, borderRadius: 14, width: 28, height: 28, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: '#6366f1', fontSize: 10, fontWeight: '900' }}>½</Text>
          </View>
        )}
        {usedBonuses?.doublePoints && (
          <View style={{ backgroundColor: 'rgba(99,102,241,0.15)', paddingHorizontal: 6, borderRadius: 14, width: 28, height: 28, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: '#6366f1', fontSize: 10, fontWeight: '900' }}>x2</Text>
          </View>
        )}
      </View>
      <View style={styles.answerBadge}>
        {noAnswer ? (
          <Text style={[styles.answerText, { color: theme.textSecondary }]}>—</Text>
        ) : (
          <Text style={[
            styles.answerText,
            { color: isCorrect ? '#10b981' : '#ef4444' },
          ]}>
            {answerLabel}
          </Text>
        )}
      </View>
      
      <Text style={[styles.score, { color: theme.text }]}>{player.score} pt</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: Spacing.two + 2,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.07)',
    backgroundColor: 'rgba(0,0,0,0.02)',
    marginBottom: Spacing.two,
    gap: Spacing.two,
  },
  firstPlace: {
    borderColor: 'rgba(234,179,8,0.5)',
    backgroundColor: 'rgba(234,179,8,0.06)',
  },
  rank: { fontSize: 22, width: 36, textAlign: 'center' },
  name: { flex: 1, fontSize: 15, fontWeight: '600' },
  answerBadge: {
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.two,
  },
  answerText: { fontSize: 18, fontWeight: '800' },
  score: { fontSize: 15, fontWeight: '800' },
});
