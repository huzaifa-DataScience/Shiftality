import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import Toast from 'react-native-toast-message';
import {
  scale as s,
  verticalScale as vs,
  moderateScale as ms,
  scale,
} from 'react-native-size-matters';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';

import GradientCard from '../../components/GradientCard';
import GradientInput from '../../components/GradientInput';
import PrimaryButton from '../../components/PrimaryButton';
import { palette } from '../../theme';
import type { AuthStackParamList } from '../../navigation/AuthStack';
import { login } from '../../lib/authService';
import { setUserProfile } from '../../store/reducers/profileReducer';
import { saveAuthTokens, saveUserProfile } from '../../lib/authStorage';

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
  const dispatch = useDispatch();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    // Basic validation
    if (!email.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter your email',
      });
      return;
    }

    if (!password.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter your password',
      });
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter a valid email address',
      });
      return;
    }

    setLoading(true);

    try {
      const response = await login({
        email: email.trim(),
        password: password,
      });

      // Store auth tokens in AsyncStorage
      if (response.access_token) {
        await saveAuthTokens(
          response.access_token,
          response.refresh_token,
          response.user.id,
        );
      }

      // Prepare user profile data
      const userProfile = {
        id: response.user.id,
        email: response.user.email,
        emailConfirmed: !!response.user.email_confirmed_at,
        phone: response.user.phone || '',
        createdAt: response.user.created_at,
        updatedAt: response.user.updated_at,
        lastSignInAt: response.user.last_sign_in_at,
        appMetadata: response.user.app_metadata,
        userMetadata: response.user.user_metadata,
      };

      // Save user profile to AsyncStorage
      await saveUserProfile(userProfile);

      // Save user profile to Redux
      dispatch(
        setUserProfile({
          user: userProfile,
          accessToken: response.access_token,
          refreshToken: response.refresh_token,
          expiresAt: response.expires_at,
        }),
      );

      // Show success toast
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Login successful!',
      });

      // Success - navigate to main app
      onSignedIn?.();
    } catch (error: any) {
      // Show error toast
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: error.message || 'Invalid email or password. Please try again.',
      });
    } finally {
      setLoading(false);
    }
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
            title={loading ? 'Signing In...' : 'Sign In'}
            onPress={handleSignIn}
            loading={loading}
            disabled={loading}
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
