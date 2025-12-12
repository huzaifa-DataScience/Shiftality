// src/screens/WelcomeScreen.tsx
import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Image,
  StatusBar,
} from 'react-native';
import {
  scale as s,
  verticalScale as vs,
  moderateScale as ms,
} from 'react-native-size-matters';
import PrimaryButton from '../../components/PrimaryButton';
import { useAppTheme, useThemeMode } from '../../theme/ThemeProvider';
import GradientBackground from '../../components/GradientBackground';

export default function WelcomeScreen({ navigation }: any) {
  const theme = useAppTheme();
  const { themeMode } = useThemeMode();
  const isDark = themeMode === 'dark';

  return (
    <GradientBackground style={styles.root}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

        <Image
          source={require('../../assets/WelcomeIcon.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <View style={styles.body}>
          <View style={styles.headerBlock}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              Welcome to SHIFTALITY
            </Text>
            <Text style={[styles.sub, { color: theme.colors.textMuted }]}>
              Best and popular apps for live education{'\n'}course from home
            </Text>
          </View>

          <PrimaryButton
            title="Get started"
            onPress={() => navigation.navigate('Login')}
          />
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  // Use verticalScale for vertical spacing/height of the hero image
  logo: {
    width: '100%',
    height: vs(220),
    alignSelf: 'center',
    marginTop: vs(100),
  },

  // Use scaled padding; keep layout flexible
  body: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: s(24),
    paddingBottom: vs(32),
    paddingTop: vs(24),
  },

  headerBlock: {
    alignItems: 'center',
    gap: vs(8),
  },

  // Fonts scaled with ms(); vertical offset with vs()
  title: {
    fontSize: ms(26),
    fontWeight: '800',
    letterSpacing: 0.4,
    textAlign: 'center',
    marginTop: vs(70),
    fontFamily: 'SourceSansPro-Regular',
    // color is set dynamically
  },

  sub: {
    fontSize: ms(14),
    textAlign: 'center',
    lineHeight: ms(20),
    fontFamily: 'SourceSansPro-Regular',
    // color is set dynamically
  },
});
