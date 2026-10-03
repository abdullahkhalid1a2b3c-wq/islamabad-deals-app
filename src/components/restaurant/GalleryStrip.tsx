import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { GalleryViewer } from './GalleryViewer';
import { theme } from '../../theme';

export interface GalleryStripProps {
  images: string[];
}

export const GalleryStrip: React.FC<GalleryStripProps> = ({ images }) => {
  const [viewerVisible, setViewerVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const handleThumbnailPress = (index: number) => {
    setSelectedIndex(index);
    setViewerVisible(true);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {images.map((img, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.thumbnailWrapper}
            onPress={() => handleThumbnailPress(idx)}
            activeOpacity={0.8}
            accessibilityLabel={`View gallery image ${idx + 1}`}
          >
            <Image source={{ uri: img }} style={styles.thumbnail} contentFit="cover" />
          </TouchableOpacity>
        ))}
      </ScrollView>

      <GalleryViewer
        visible={viewerVisible}
        images={images}
        initialIndex={selectedIndex}
        onClose={() => setViewerVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: theme.spacing.sm,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  thumbnailWrapper: {
    width: 110,
    height: 90,
    borderRadius: theme.radii.card,
    overflow: 'hidden',
    backgroundColor: theme.colors.border,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
});
