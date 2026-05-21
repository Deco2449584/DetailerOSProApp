import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';

type OptionGroupProps<T extends string> = {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  getLabel?: (option: T) => string;
};

export function OptionGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  getLabel = (option) => option,
}: OptionGroupProps<T>) {
  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.options}>
        {options.map((option) => {
          const selected = value === option;
          return (
            <Pressable
              key={option}
              style={[styles.chip, selected && styles.chipSelected]}
              onPress={() => onChange(option)}>
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                {getLabel(option)}
              </Text>
            </Pressable>
          );
        })}
      </View>
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
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
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
