import React, { useState } from 'react';
import { StyleSheet, View, ViewStyle, Image, type ViewProps } from 'react-native';

import { Spacing } from '@/constants/theme';

const API_URL = 'http://localhost:3000';

type QuestionImageProps = ViewProps & {
  imageName?: string;
  style?: ViewStyle;
};

const ImageSize = 300;

export function QuestionImage({ style, imageName = '', ...otherProps }: QuestionImageProps) {

  const [imageUri, setImageUri] = useState(
    imageName
      ? `${API_URL}/images/questions/${imageName}.png`
      : `${API_URL}/images/placeholder.png`
  );

  return (
    <View style={[styles.image_container, style]}>
      <Image
        source={{ uri: imageUri }}
        style={styles.image}
        resizeMode="contain"
        onError={() =>
          setImageUri(`${API_URL}/images/placeholder.png`)
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  image_container: {
    borderRadius: Spacing.four,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    overflow: 'hidden',
    width: ImageSize,
    height: ImageSize,
    alignSelf: 'center',
  },
  image: {
    width: ImageSize,
    height: ImageSize,
    alignSelf: 'center',
  },
});
