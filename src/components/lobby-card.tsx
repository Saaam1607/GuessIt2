import React from 'react';
import { StyleSheet, View, ViewStyle, type ViewProps } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type LobbyCardProps = ViewProps & {
  children: React.ReactNode;
  style?: ViewStyle;
};

export function LobbyCard({ children, style, ...otherProps }: LobbyCardProps) {
  
  const theme = useTheme();
  
  // Custom dark-mode style with border highlights and soft shadow
  // const cardStyle = {
  //   backgroundColor: theme.background !== '#fcfcf9'
  //     ? 'rgba(28, 32, 42, 0.45)'    // Muted deep slate translucent surface
  //     : 'rgba(242, 244, 241, 0.65)',  // Muted light bone translucent surface
  //   borderColor: theme.background !== '#fcfcf9'
  //     ? 'rgba(255, 255, 255, 0.05)'
  //     : 'rgba(0, 0, 0, 0.03)',
  // };

  return (
    <View style={[styles.card, style]} {...otherProps}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgb(242, 244, 241)',
    borderRadius: Spacing.four,
    // borderWidth: 1.5,
    padding: Spacing.four,
    width: '100%',
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 10 },
    // shadowOpacity: 0.15,
    // shadowRadius: 20,
    // elevation: 8,
    overflow: 'hidden',
  },
});
