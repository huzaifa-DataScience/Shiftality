// src/components/BlueHeader.tsx
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../theme/ThemeProvider';

type Props = {
  showBack?: boolean;
  onBack?: () => void;
  height?: number; // visible height below the notch
};

export default function BlueHeader({ showBack, onBack, height = 120 }: Props) {
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ backgroundColor: theme.colors.darkBlue }}>
      {/* Paint the notch area in blue */}
      <View
        style={{ height: insets.top, backgroundColor: theme.colors.darkBlue }}
      />

      <View style={[styles.bar, { height }]}>
        {showBack ? (
          <TouchableOpacity
            onPress={onBack}
            style={styles.backBtn}
            hitSlop={12}
          >
            <Text style={[styles.backGlyph, { color: theme.colors.text }]}>
              ‹
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.backBtn} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    paddingHorizontal: 16,
    justifyContent: 'flex-end',
    paddingBottom: 12,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backGlyph: {
    fontSize: 28,
    lineHeight: 28,
    fontFamily: 'SourceSansPro-Regular',
  },
});
