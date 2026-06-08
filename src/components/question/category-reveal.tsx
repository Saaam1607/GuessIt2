import { Text } from 'react-native';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';

import { QuestionImage } from '@/components/ui/questionImage';

interface CategoryRevealProps {
  category: string;
  imageName?: string;
  index: number;
  total: number;
  theme: {
    textSecondary: string;
  };
  gs: any;
}

export default function CategoryReveal({
  category,
  imageName,
  index,
  total,
  theme,
  gs,
}: CategoryRevealProps) {
  return (
    <Animated.View
      exiting={FadeOut.duration(200)}
      style={gs.revealContainer}
    >
      <Animated.View
        entering={FadeInDown.delay(100).duration(400)}
        style={[
          gs.revealPill,
          { backgroundColor: 'rgba(99,102,241,0.15)' },
        ]}
      >
        <Text
          style={[
            gs.revealCategory,
            { color: '#6366f1' },
          ]}
        >
          {category}
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300).duration(400)}>
        <QuestionImage imageName={imageName} />
      </Animated.View>

      <Animated.Text
        entering={FadeInDown.delay(500).duration(400)}
        style={[
          gs.revealProgress,
          { color: theme.textSecondary },
        ]}
      >
        {index + 1} / {total}
      </Animated.Text>
    </Animated.View>
  );
}