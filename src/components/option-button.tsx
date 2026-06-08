import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import Animated, {
  ZoomIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface OptionButtonProps {
  label: string;
  text: string;
  index: number;
  selectedIndex: number | null;
  correctIndex: number | null;
  onPress: (index: number) => void;
  disabled: boolean;
  questionType?: 'multiple_choice' | 'true_false';
}

export function OptionButton({ label, text, index, selectedIndex, correctIndex, onPress, disabled, questionType }: OptionButtonProps) {
  const theme = useTheme();
  const scale = useSharedValue(1);

  const isSelected = selectedIndex === index;
  const isCorrect = correctIndex === index;
  const isWrong = correctIndex !== null && isSelected && !isCorrect;
  const revealed = correctIndex !== null;
  const isTrueFalse = questionType === 'true_false';

  let bgColor: string;
  let borderColor: string;
  let textColor: string;

  if (!revealed) {
    if (isSelected) {
      bgColor = isTrueFalse
        ? (index === 0 ? 'rgba(16, 185, 129, 0.18)' : 'rgba(239, 68, 68, 0.18)')
        : 'rgba(99, 102, 241, 0.18)';
      borderColor = isTrueFalse
        ? (index === 0 ? '#10b981' : '#ef4444')
        : '#6366f1';
      textColor = theme.text;
    } else if (isTrueFalse) {
      bgColor = index === 0 ? 'rgba(16, 185, 129, 0.06)' : 'rgba(239, 68, 68, 0.06)';
      borderColor = index === 0 ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)';
      textColor = theme.text;
    } else {
      bgColor = 'rgba(0,0,0,0.03)';
      borderColor = 'rgba(0,0,0,0.09)';
      textColor = theme.text;
    }
  } else {
    if (isCorrect) {
      bgColor = 'rgba(16, 185, 129, 0.15)';
      borderColor = '#10b981';
      textColor = '#10b981';
    } else if (isWrong) {
      bgColor = 'rgba(239, 68, 68, 0.12)';
      borderColor = '#ef4444';
      textColor = '#ef4444';
    } else {
      bgColor = 'rgba(0,0,0,0.02)';
      borderColor = 'rgba(0,0,0,0.05)';
      textColor = theme.textSecondary;
    }
  }

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[animStyle, { width: '100%' }]}>
      <Pressable
        onPressIn={() => { scale.value = withSpring(0.97); }}
        onPressOut={() => { scale.value = withSpring(1); }}
        onPress={() => !disabled && onPress(index)}
        disabled={disabled}
        style={[styles.option, { backgroundColor: bgColor, borderColor }]}
      >
        <View style={[styles.badge, { borderColor }]}>
          <Text style={[styles.badgeText, { color: borderColor }]}>{label}</Text>
        </View>
        <Text style={[styles.optText, { color: textColor }]}>{text}</Text>
        {revealed && isCorrect && (
          <Animated.Text entering={ZoomIn.duration(300)} style={styles.icon}>✓</Animated.Text>
        )}
        {revealed && isWrong && (
          <Animated.Text entering={ZoomIn.duration(300)} style={[styles.icon, { color: '#ef4444' }]}>✗</Animated.Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: Spacing.two + 2,
    borderWidth: 1.5,
    marginBottom: Spacing.two,
    gap: Spacing.two,
  },
  badge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: { fontSize: 13, fontWeight: '800' },
  optText: { flex: 1, fontSize: 15, fontWeight: '500', lineHeight: 20 },
  icon: { fontSize: 18, fontWeight: '800', color: '#10b981' },
});
