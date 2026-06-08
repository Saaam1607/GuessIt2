import React, { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  Text,
  Pressable,
  View,
  type TextInputProps,
  type PressableProps,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type StyledInputProps = TextInputProps & {
  label?: string;
  error?: string;
};

export function StyledInput({ label, error, style, ...rest }: StyledInputProps) {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const borderOpacity = useSharedValue(0.1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      borderColor: isFocused
        ? theme.background === '#000000'
          ? 'rgba(99, 102, 241, 0.8)' // Indigo glow in dark mode
          : 'rgba(79, 70, 229, 0.8)'  // Indigo in light mode
        : theme.background === '#000000'
        ? 'rgba(255, 255, 255, 0.1)'
        : 'rgba(0, 0, 0, 0.1)',
      borderWidth: isFocused ? 2 : 1.5,
    };
  });

  return (
    <View style={styles.inputContainer}>
      {!!label && (
        <Text style={[styles.label, { color: theme.textSecondary }]}>
          {label}
        </Text>
      )}
      <Animated.View style={[styles.inputWrapper, animatedStyle]}>
        <TextInput
          style={[
            styles.input,
            { color: theme.text },
            style,
          ]}
          placeholderTextColor={theme.textSecondary}
          onFocus={(e) => {
            setIsFocused(true);
            borderOpacity.value = withSpring(0.8);
            if (rest.onFocus) rest.onFocus(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            borderOpacity.value = withSpring(0.1);
            if (rest.onBlur) rest.onBlur(e);
          }}
          {...rest}
        />
      </Animated.View>
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

type StyledButtonProps = PressableProps & {
  title: string;
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
};

export function StyledButton({
  title,
  variant = 'primary',
  isLoading = false,
  disabled,
  style,
  ...rest
}: StyledButtonProps) {
  const theme = useTheme();
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.96);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const getButtonStyles = () => {
    if (variant === 'primary') {
      return {
        backgroundColor: '#4f46e5', // Indigo
        textColor: '#ffffff',
      };
    } else if (variant === 'danger') {
      return {
        backgroundColor: '#dc2626', // Red
        textColor: '#ffffff',
      };
    } else {
      // Secondary
      return {
        backgroundColor:
          theme.background === '#000000'
            ? 'rgba(255, 255, 255, 0.08)'
            : 'rgba(0, 0, 0, 0.05)',
        textColor: theme.text,
      };
    }
  };

  const { backgroundColor, textColor } = getButtonStyles();

  return (
    <AnimatedPressable
      style={[
        styles.button,
        { backgroundColor, opacity: disabled || isLoading ? 0.6 : 1 },
        animatedStyle,
        style as any,
      ]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.buttonText, { color: textColor }]}>{title}</Text>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    width: '100%',
    gap: Spacing.one,
    marginBottom: Spacing.two,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingLeft: Spacing.one,
  },
  inputWrapper: {
    borderRadius: Spacing.two,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  input: {
    fontSize: 16,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    height: 48,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '500',
    paddingLeft: Spacing.one,
  },
  button: {
    height: 52,
    borderRadius: Spacing.two,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginVertical: Spacing.one,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
