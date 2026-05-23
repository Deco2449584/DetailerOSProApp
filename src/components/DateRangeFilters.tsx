import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/context/ThemeContext';

import { useThemedStyles } from '@/hooks/useThemedStyles';
import type { AppColors } from '@/theme/palettes';
import { fonts } from '@/theme/typography';
import {
  formatFilterDate,
  type DateFilterPreset,
} from '@/utils/filterVehicles';

type DateRangeFiltersProps = {
  preset: DateFilterPreset;
  onPresetChange: (preset: DateFilterPreset) => void;
  customFrom: Date;
  customTo: Date;
  onCustomFromChange: (date: Date) => void;
  onCustomToChange: (date: Date) => void;
};

type PickerTarget = 'from' | 'to' | null;

const PRESETS: { id: DateFilterPreset; label: string }[] = [
  { id: 'day', label: 'Today' },
  { id: 'week', label: 'This week' },
  { id: 'month', label: 'This month' },
  { id: 'custom', label: 'Custom' },
];

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    wrap: {
      gap: 12,
      marginBottom: 16,
    },
    label: {
      fontFamily: fonts.headingSemiBold,
      fontSize: 15,
      color: colors.text.primary,
    },
    hint: {
      fontFamily: fonts.body,
      fontSize: 13,
      color: colors.text.secondary,
      lineHeight: 18,
    },
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border.default,
      backgroundColor: colors.surface.card,
    },
    chipActive: {
      borderColor: colors.accent.primary,
      backgroundColor: 'rgba(226, 31, 40, 0.12)',
    },
    chipText: {
      fontFamily: fonts.bodyMedium,
      fontSize: 13,
      color: colors.text.secondary,
    },
    chipTextActive: {
      color: colors.accent.primary,
      fontFamily: fonts.bodySemiBold,
    },
    customRow: {
      flexDirection: 'row',
      gap: 10,
    },
    dateField: {
      flex: 1,
      gap: 6,
    },
    dateLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.text.onSurfaceMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.4,
    },
    dateBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 12,
      paddingVertical: 12,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border.onSurface,
      backgroundColor: colors.surface.card,
    },
    dateBtnPressed: {
      opacity: 0.88,
    },
    dateBtnText: {
      flex: 1,
      fontFamily: fonts.bodySemiBold,
      fontSize: 14,
      color: colors.text.onSurface,
    },
  });
}

export function DateRangeFilters({
  preset,
  onPresetChange,
  customFrom,
  customTo,
  onCustomFromChange,
  onCustomToChange,
}: DateRangeFiltersProps) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const [pickerTarget, setPickerTarget] = useState<PickerTarget>(null);

  const onPickerChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') {
      setPickerTarget(null);
      if (event.type === 'dismissed' || !selected) return;
    } else if (event.type === 'dismissed') {
      return;
    }

    const next = selected ?? (pickerTarget === 'from' ? customFrom : customTo);
    if (pickerTarget === 'from') {
      onCustomFromChange(next);
      if (next > customTo) onCustomToChange(next);
    } else if (pickerTarget === 'to') {
      onCustomToChange(next);
      if (next < customFrom) onCustomFromChange(next);
    }
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Date range</Text>
      <Text style={styles.hint}>Filter records by when they were registered</Text>

      <View style={styles.chipRow}>
        {PRESETS.map((item) => {
          const active = preset === item.id;
          return (
            <Pressable
              key={item.id}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => onPresetChange(item.id)}>
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {preset === 'custom' ? (
        <View style={styles.customRow}>
          <View style={styles.dateField}>
            <Text style={styles.dateLabel}>From</Text>
            <Pressable
              style={({ pressed }) => [styles.dateBtn, pressed && styles.dateBtnPressed]}
              onPress={() => setPickerTarget(pickerTarget === 'from' ? null : 'from')}>
              <Ionicons name="calendar-outline" size={18} color={colors.accent.primary} />
              <Text style={styles.dateBtnText}>{formatFilterDate(customFrom)}</Text>
            </Pressable>
          </View>
          <View style={styles.dateField}>
            <Text style={styles.dateLabel}>To</Text>
            <Pressable
              style={({ pressed }) => [styles.dateBtn, pressed && styles.dateBtnPressed]}
              onPress={() => setPickerTarget(pickerTarget === 'to' ? null : 'to')}>
              <Ionicons name="calendar-outline" size={18} color={colors.accent.primary} />
              <Text style={styles.dateBtnText}>{formatFilterDate(customTo)}</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      {pickerTarget ? (
        <>
          <DateTimePicker
            value={pickerTarget === 'from' ? customFrom : customTo}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={onPickerChange}
            maximumDate={new Date()}
          />
          {Platform.OS === 'ios' ? (
            <Pressable
              style={({ pressed }) => [styles.chip, pressed && { opacity: 0.85 }]}
              onPress={() => setPickerTarget(null)}>
              <Text style={[styles.chipText, styles.chipTextActive]}>Done</Text>
            </Pressable>
          ) : null}
        </>
      ) : null}
    </View>
  );
}
