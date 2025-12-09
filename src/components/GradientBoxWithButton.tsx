import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  LayoutChangeEvent,
} from 'react-native';
import {
  scale as s,
  verticalScale as vs,
  moderateScale as ms,
} from 'react-native-size-matters';
import Svg, {
  Defs,
  LinearGradient as SvgGrad,
  Stop,
  Rect,
} from 'react-native-svg';
import LinearGradient from 'react-native-linear-gradient';
import { palette } from '../theme';

import { getCheckins, CheckinPayload } from '../lib/authService';

type Props = {
  title?: string;
  text: string;
  successText?: string;
  scoreText?: string;
  onPressDetails?: () => void;
  tickIcon?: any; // PNG source
};

export default function GradientBoxWithButton({
  title,
  text,
  successText = 'Great job completing your check-in!',
  scoreText,
  onPressDetails,
  tickIcon,
}: Props) {
  const [w, setW] = useState(0);
  const [h, setH] = useState(vs(45));

  const [dynamicScoreText, setDynamicScoreText] = useState<string | undefined>(
    scoreText,
  );

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setW(Math.round(width));
    setH(Math.max(vs(45), Math.round(height) || vs(45)));
  }, []);

  // 🔹 Fetch checkins and compute TODAY's score text
  useEffect(() => {
    // If parent passed scoreText, don't override it
    if (scoreText) {
      setDynamicScoreText(scoreText);
      return;
    }

    let isMounted = true;

    const loadTodayScore = async () => {
      try {
        // you can also pass { start_date, end_date } if you want
        const checkins: CheckinPayload[] = await getCheckins();

        if (!isMounted) return;

        const todayStr = new Date().toISOString().slice(0, 10);

        // find today's checkin (by date)
        const todayCheckin = checkins.find(c => c.date === todayStr);

        if (!todayCheckin) {
          setDynamicScoreText("You haven't checked in yet today.");
          return;
        }

        const pos = todayCheckin.pos_yes ?? 0;
        const neg = todayCheckin.neg_yes ?? 0;
        const score = todayCheckin.daily_score ?? 0;

        setDynamicScoreText(
          `Today's score: (+${pos}) + (-${neg}) = ${score / 10}`,
        );
      } catch (err) {
        console.log('[GradientBoxWithButton] getCheckins error:', err);
        if (isMounted) {
          setDynamicScoreText('Unable to load today’s score.');
        }
      }
    };

    loadTodayScore();
    return () => {
      isMounted = false;
    };
  }, [scoreText]);

  const finalScoreText = dynamicScoreText ?? "Today's score: (+0) + (-0) = 0";

  return (
    <View style={[styles.wrap]} onLayout={onLayout}>
      {/* gradient border */}
      {w > 0 && (
        <Svg
          pointerEvents="none"
          style={StyleSheet.absoluteFill}
          width={w}
          height={h}
          viewBox={`0 0 ${w} ${h}`}
        >
          <Defs>
            <SvgGrad id="borderGrad" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor="#0AC4FF" />
              <Stop offset="0.52" stopColor="#0AC4FF" />
              <Stop offset="1" stopColor="#1a4258ff" />
            </SvgGrad>
          </Defs>
          <Rect
            x={1}
            y={1}
            width={w - 2}
            height={h - 2}
            rx={s(12)}
            ry={s(12)}
            fill="#111B2C"
            stroke="url(#borderGrad)"
            strokeWidth={1}
          />
        </Svg>
      )}

      <View style={styles.inner}>
        {title && <Text style={styles.title}>{title}</Text>}
        <Text style={styles.text}>{text}</Text>

        <View style={{ alignItems: 'center', marginTop: vs(12) }}>
          {tickIcon && (
            <Image
              source={tickIcon}
              style={{ width: s(32), height: s(32), marginBottom: vs(4) }}
              resizeMode="contain"
            />
          )}
          <Text style={styles.successText}>{successText}</Text>
        </View>

        <Text style={styles.subText}>
          Progress isn't always perfect, and that's perfectly okay. You showed
          up today, and that matters.
        </Text>

        <Text style={styles.scoreText}>{finalScoreText}</Text>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onPressDetails}
          style={{ marginTop: vs(12) }}
        >
          <LinearGradient
            colors={['#143f65ff', '#1C2A3A']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.cta}
          >
            <Text style={styles.ctaText}>View Details</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', position: 'relative', borderRadius: s(12) },
  inner: { paddingHorizontal: s(16), paddingVertical: vs(14) },

  title: {
    fontSize: ms(20),
    fontWeight: '700',
    color: palette.white,
    marginBottom: vs(6),
    lineHeight: ms(22),
    fontFamily: 'SourceSansPro-Regular',
  },
  text: {
    fontSize: ms(15),
    fontWeight: '500',
    lineHeight: ms(19),
    color: palette.white,
    fontFamily: 'SourceSansPro-Regular',
  },
  successText: {
    fontSize: ms(14),
    fontWeight: '700',
    color: '#04ac6eff',
    textAlign: 'center',
    lineHeight: ms(18),
    fontFamily: 'SourceSansPro-Regular',
  },
  subText: {
    fontSize: ms(15),
    fontWeight: '500',
    color: palette.white,
    marginTop: vs(6),
    textAlign: 'left',
    lineHeight: ms(18),
    fontFamily: 'SourceSansPro-Regular',
  },
  scoreText: {
    fontSize: ms(14),
    fontWeight: '500',
    color: palette.white,
    marginTop: vs(8),
    fontFamily: 'SourceSansPro-Regular',
  },
  cta: {
    width: '100%',
    height: vs(38),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: s(30),
  },
  ctaText: {
    color: palette.txtBlue,
    fontSize: ms(14.5),
    fontWeight: '700',
    opacity: 0.9,
    fontFamily: 'SourceSansPro-Regular',
  },
});
