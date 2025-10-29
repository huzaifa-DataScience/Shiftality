// src/screens/WelcomeScreen.tsx
import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, Image, StatusBar, TouchableOpacity, Alert } from 'react-native';
import { useAppTheme } from '../../theme/ThemeProvider';
import { palette } from '../../theme/colors';
import PrimaryButton from '../../components/PrimaryButton';

export default function WelcomeScreen({ navigation }: any) {


  return (
    <SafeAreaView style={[styles.root, { backgroundColor: palette.darkBlue }]}>
      <StatusBar barStyle="light-content" />
      <View style={styles.body}>
        {/* <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" /> */}

        <View style={{ alignItems: 'center', gap: 8 }}>
          <Text style={[styles.title, { color: palette.white }]}>Welcome to SHIFTALITY</Text>
          <Text style={[styles.sub, { color: 'rgba(255,255,255,0.8)' }]}>
            Best and popular apps for live education{'\n'}course from home
          </Text>
        </View>

        <PrimaryButton backgroundColor={palette.white}
  textColor={palette.darkBlue} title="Get started" onPress={() => navigation.navigate('Signup')} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: { flex: 1, justifyContent: 'space-between', padding: 24, paddingBottom: 32 },
  logo: { width: '60%', height: 160, alignSelf: 'center', marginTop: 48 },
  title: { fontSize: 24, fontWeight: '800', letterSpacing: 0.4 },
  sub: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  check: { alignSelf: 'center', marginTop: 10, paddingVertical: 8, paddingHorizontal: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
});
