// src/screens/SearchScreen.tsx
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { palette } from '../../theme';
import { ms, s, scale, vs } from 'react-native-size-matters';
import GradientCardHome from '../../components/GradientCardHome';
import GradientHintBox from '../../components/GradientHintBox';
import GradientBoxWithButton from '../../components/GradientBoxWithButton';
import OutlinePillWithIcon from '../../components/OutlinePillWithIcon';
import StatsOverviewBox from '../../components/StatsOverviewBox';
import TripleRingGauge from '../../components/TripleRingGauge';
import LikertPill from '../../components/survey/LikertPill';
import ShiftGridChart from '../../components/graph/ShiftGridChart';
import ShiftMapChart from '../../components/graph/ShiftMapChart';
export default function SearchScreen() {
  const [selected, setSelected] = useState<'map' | 'grid'>('grid');

  return (
    <View style={styles.root}>
      <View style={styles.titleWrapper}>
        <Text style={styles.title}>Your Reality Shift Dashboard</Text>
      </View>
      <ScrollView
        style={{ backgroundColor: palette.darkBlue, marginVertical: scale(30) }}
        showsVerticalScrollIndicator={false}
      >
        <GradientCardHome style={{ width: scale(330) }}>
          <View
            style={{
              flexDirection: 'row',
              gap: s(12),
              marginBottom: s(25),
              justifyContent: 'flex-end',
            }}
          >
            <OutlinePillWithIcon
              width={s(100)}
              label="Demo"
              icon={require('../../assets/play.png')}
              onPress={() => console.log('Demo pressed')}
            />
            <OutlinePillWithIcon
              width={s(100)}
              label="Setting"
              icon={require('../../assets/gear.png')}
              onPress={() => console.log('Settings pressed')}
            />
          </View>
          <Text style={styles.title}>Hey Huzaifa, ready to shift?</Text>
          <Text style={styles.subTitle}>
            Your daily reality shift journey continues
          </Text>
          <View style={{ height: scale(10) }} />
          <GradientBoxWithButton
            title="Today's Shift"
            text="Check what felt true today. Empowering Beliefs raise your score; Shadow Beliefs lower it. Max ±10 per day."
            tickIcon={require('../../assets/tick.png')}
            onPressDetails={() => console.log('View details pressed')}
          />
        </GradientCardHome>
        <View style={{ height: scale(20) }} />

        <GradientHintBox
          title="Highest Vibration (North Star)"
          text={
            'Lorem Ipsum is simply dummy text of the printing and typesetting industry.'
          }
          style={{ width: scale(330) }}
        />
        <View style={{ height: scale(20) }} />
        <GradientHintBox
          title="Shadow Path"
          text={
            'Lorem Ipsum is simply dummy text of the printing and typesetting industry.'
          }
          style={{ width: scale(330) }}
        />
        <View style={{ height: scale(20) }} />
        <StatsOverviewBox
          data={[
            {
              icon: require('../../assets/checkin.png'),
              value: 0,
              label: 'Check-in',
            },
            {
              icon: require('../../assets/positive.png'),
              value: 6,
              label: 'Positive',
            },
            {
              icon: require('../../assets/clean.png'),
              value: 7,
              label: 'Clean',
            },
          ]}
        />
        <View style={{ height: scale(20) }} />
        <GradientCardHome>
          <Text style={styles.title}>Shift Likelihood</Text>
          <Text style={styles.subTitle}>Based on your last 30 days.</Text>
          <View style={styles.gaugeContainer}>
            <TripleRingGauge valuePct={93} idBase="shiftGauge" size={s(110)} />
          </View>
          <Text style={styles.bottomText}>
            Very likely to shift - momentum is strong
          </Text>
        </GradientCardHome>
        <View style={{ height: scale(20) }} />

        <>
          {/* Toggle Buttons */}
          <GradientCardHome>
            <View style={styles.toggleRow}>
              <LikertPill
                label="Shift Map"
                width={s(120)}
                borderRadius={s(12)}
                selected={selected === 'map'}
                onPress={() => setSelected('map')}
              />
              <LikertPill
                label="Shift Grid"
                width={s(120)}
                borderRadius={s(12)}
                selected={selected === 'grid'}
                onPress={() => setSelected('grid')}
              />
            </View>
          </GradientCardHome>

          {/* Graph Display */}
          <View style={styles.chartWrapper}>
            {selected === 'map' ? <ShiftMapChart /> : <ShiftGridChart />}
          </View>
        </>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: palette.darkBlue,
  },
  titleWrapper: {
    marginTop: scale(50),
  },
  title: {
    fontSize: scale(22),
    color: palette.white,
    fontWeight: '700',
  },
  subTitle: {
    fontSize: scale(16),
    color: palette.white,
    fontWeight: '400',
    lineHeight: scale(30),
  },
  gaugeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: vs(4),
  },
  bottomText: {
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: ms(13.5),
    marginTop: vs(12),
  },
  toggleRow: {
    flexDirection: 'row',
    gap: s(12),
  },
  chartWrapper: {
    marginTop: vs(10),
    width: s(330),
    alignSelf: 'center',
  },
});
