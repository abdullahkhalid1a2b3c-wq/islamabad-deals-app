import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Category } from '../../types/domain';
import { Chip } from '../ui/Chip';
import { theme } from '../../theme';

export interface CategoryChipsProps {
  categories: Category[];
  selectedSlug?: string | null;
  onSelectCategory?: (slug: string | null) => void;
  onSelect?: (slug: string | null) => void;
}

export const CategoryChips: React.FC<CategoryChipsProps> = ({
  categories,
  selectedSlug = null,
  onSelectCategory,
  onSelect,
}) => {
  const handleSelect = onSelect || onSelectCategory;
  const allCategories: Array<{ id: string; name: string; slug: string | null }> = [
    { id: 'all', name: 'All Deals', slug: null },
    ...categories,
  ];

  return (
    <View style={styles.container}>
      <FlatList
        data={allCategories}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const isSelected = selectedSlug === item.slug;
          return (
            <Chip
              label={item.name}
              selected={isSelected}
              onPress={() => handleSelect?.(item.slug)}
            />
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: theme.spacing.sm,
  },
  listContent: {
    paddingHorizontal: theme.spacing.lg,
  },
});
