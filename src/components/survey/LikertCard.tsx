import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  scale as s,
  verticalScale as vs,
  moderateScale as ms,
  scale,
} from 'react-native-size-matters';
import GradientCardHome from '../../components/GradientCardHome';
import LikertPill, { LikertValue } from './LikertPill';
import { useAppTheme } from '../../theme/ThemeProvider';

type Props = {
  question: string;
  value: LikertValue;
  onChange: (v: LikertValue) => void;
  cardWidth?: number; // default scale(330)
};

export default function LikertCard({
  question,
  value,
  onChange,
  cardWidth = scale(330),
}: Props) {
  const theme = useAppTheme();
  const PAD_H = s(16);
  const GAP = s(10);
  const SLOT3 = Math.floor((cardWidth - PAD_H * 2 - GAP * 2) / 3);
  const SLOT2 = Math.floor((cardWidth - PAD_H * 2 - GAP * 1) / 2);

  return (
    <GradientCardHome style={{ width: cardWidth, marginBottom: vs(14) }}>
      <Text style={[styles.question, { color: theme.colors.text }]}>{question}</Text>

      <View style={[styles.row, { columnGap: GAP }]}>
        <LikertPill
          width={SLOT3}
          label="Agree"
          selected={value === 'agree'}
          onPress={() => onChange('agree')}
        />
        <LikertPill
          width={SLOT3}
          label="Unsure"
          selected={value === 'unsure'}
          onPress={() => onChange('unsure')}
        />
        <LikertPill
          width={SLOT3}
          label="Disagree"
          selected={value === 'disagree'}
          onPress={() => onChange('disagree')}
        />
      </View>

      <View style={[styles.row, { columnGap: GAP, marginTop: vs(10) }]}>
        <LikertPill
          width={SLOT2}
          label="Strongly agree"
          selected={value === 's_agree'}
          onPress={() => onChange('s_agree')}
        />
        <LikertPill
          width={SLOT2}
          label="Strongly disagree"
          selected={value === 's_disagree'}
          onPress={() => onChange('s_disagree')}
        />
      </View>
    </GradientCardHome>
  );
}

const styles = StyleSheet.create({
  question: {
    fontSize: ms(16),
    fontWeight: '700',
    marginBottom: vs(12),
    fontFamily: 'SourceSansPro-Regular',
  },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
});
