import { ScrollView, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';

type ColorPickerCarouselProps = {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
};

export function ColorPickerCarousel({
  label,
  options,
  value,
  onChange,
}: ColorPickerCarouselProps) {
  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {options.map((option) => {
          const selected = value === option;
          return (
            <Pressable
              key={option}
              style={[styles.chip, selected && styles.chipSelected]}
              onPress={() => onChange(option)}>
              <Text style={[styles.chipText, selected && styles.chipTextSelected]} numberOfLines={2}>
                {option}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.onSurface,
  },
  scrollContent: {
    gap: 8,
    paddingVertical: 2,
  },
  chip: {
    maxWidth: 160,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border.onSurface,
    backgroundColor: colors.surface.default,
  },
  chipSelected: {
    borderColor: colors.accent.primary,
    backgroundColor: '#FDE8EA',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text.onSurfaceMuted,
  },
  chipTextSelected: {
    color: colors.accent.primaryPressed,
    fontWeight: '700',
  },
});
