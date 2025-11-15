import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import {
  scale as s,
  verticalScale as vs,
  moderateScale as ms,
  scale,
} from 'react-native-size-matters';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import GradientCard from '../../components/GradientCard';
import GradientInput from '../../components/GradientInput';
import PrimaryButton from '../../components/PrimaryButton';
import { palette } from '../../theme';
import type { AuthStackParamList } from '../../navigation/AuthStack';

// TODO: swap with your actual icons
const eyeOpen = require('../../assets/eye-off.png');
const eyeClosed = require('../../assets/eye-off.png');

type Nav = NativeStackNavigationProp<AuthStackParamList>;

export default function LoginScreen({
  onSignedIn,
}: {
  onSignedIn?: () => void;
}) {
  const navigation = useNavigation<Nav>();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  const handleSignIn = () => {
    // TODO: do validation / API, then:
    onSignedIn?.();
  };

  return (
    <View style={[styles.root, { backgroundColor: palette.darkBlue }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <GradientCard style={{ marginTop: vs(24), width: scale(330) }}>
          {/* Header */}
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.title}>Sign In</Text>
            <Text style={styles.subtitle}>
              Best and popular apps for live education course from home
            </Text>
          </View>

          {/* Email */}
          <Text style={styles.label}>Email</Text>
          <GradientInput
            placeholder="Enter your email"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          {/* Password */}
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputWithIcon}>
            <GradientInput
              placeholder="************"
              secureTextEntry={!showPwd}
              value={password}
              onChangeText={setPassword}
              style={{ paddingRight: s(44) }}
            />
            <TouchableOpacity
              onPress={() => setShowPwd(v => !v)}
              style={styles.eyeBtn}
              hitSlop={{ top: vs(8), bottom: vs(8), left: s(8), right: s(8) }}
            >
              <Image
                source={showPwd ? eyeOpen : eyeClosed}
                style={styles.eyeIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>

          {/* Forgot password */}
          <TouchableOpacity
            onPress={() => {
              /* TODO: navigate to ForgotPassword when you add it */
            }}
          >
            <Text style={styles.forgot}>Forget Password?</Text>
          </TouchableOpacity>

          <View style={{ height: vs(16) }} />

          {/* CTA */}
          <PrimaryButton
            backgroundColor={palette.white}
            textColor={palette.darkBlue}
            title="Get Started"
            onPress={handleSignIn}
          />

          {/* Footer */}
          <Text style={styles.footerText}>
            Don’t have account?{' '}
            <Text
              style={styles.link}
              onPress={() => navigation.navigate('Signup')}
            >
              Sign Up
            </Text>
          </Text>
        </GradientCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    alignItems: 'center',
    paddingVertical: vs(48),
    paddingBottom: vs(64),
  },
  title: {
    color: '#FFFFFF',
    fontSize: ms(26),
    fontWeight: '700',
    textAlign: 'center',
    marginTop: vs(4),
    fontFamily: 'SourceSansPro-Regular',
  },
  subtitle: {
    color: '#B0B6C3',
    fontSize: ms(14),
    textAlign: 'center',
    width: '80%',
    marginTop: vs(6),
    lineHeight: ms(20),
    fontFamily: 'SourceSansPro-Regular',
  },
  label: {
    color: '#FFFFFF',
    fontSize: ms(14),
    marginTop: vs(16),
    marginBottom: vs(6),
    fontWeight: '600',
    fontFamily: 'SourceSansPro-Regular',
  },
  inputWithIcon: {
    position: 'relative',
    width: '100%',
  },
  eyeBtn: {
    position: 'absolute',
    right: s(14),
    top: '50%',
    transform: [{ translateY: -vs(12) }],
  },
  eyeIcon: {
    width: s(22),
    height: s(22),
    opacity: 0.9,
  },
  forgot: {
    alignSelf: 'flex-end',
    color: '#FFFFFF',
    fontSize: ms(14),
    marginTop: vs(8),
    opacity: 0.9,
    fontFamily: 'SourceSansPro-Regular',
  },
  footerText: {
    color: '#B0B6C3',
    marginTop: vs(18),
    fontSize: ms(14),
    textAlign: 'center',
    fontFamily: 'SourceSansPro-Regular',
  },
  link: {
    color: '#3DA9FF',
    fontWeight: '600',
  },
});
