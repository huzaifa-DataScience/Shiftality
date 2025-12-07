import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
} from 'react-native';
import Toast from 'react-native-toast-message';
import {
  scale as s,
  verticalScale as vs,
  moderateScale as ms,
  scale,
} from 'react-native-size-matters';
import GradientCard from '../../components/GradientCard';
import { palette } from '../../theme';
import PrimaryButton from '../../components/PrimaryButton';
import GradientInput from '../../components/GradientInput';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/AuthStack';
import { useNavigation } from '@react-navigation/native';
import { signup } from '../../lib/authService';

// TODO: replace with your actual assets
const eyeOpen = require('../../assets/eye-off.png');
const eyeClosed = require('../../assets/eye-off.png');

export default function SignUpScreen() {
  // inside component
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList>>();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showCPwd, setShowCPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!name.trim()) {
      errors.name = 'Name is required';
    } else if (name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (!email.trim()) {
      errors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        errors.email = 'Please enter a valid email address';
      }
    }

    if (!password.trim()) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (!confirm.trim()) {
      errors.confirm = 'Please confirm your password';
    } else if (password !== confirm) {
      errors.confirm = 'Passwords do not match';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignUp = async () => {
    // Clear previous errors
    setValidationErrors({});

    // Validate form
    if (!validateForm()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please fix all errors before continuing',
      });
      return;
    }

    setLoading(true);

    try {
      const response = await signup({
        email: email.trim(),
        password: password,
        name: name.trim(),
      });

      // Show success message
      Toast.show({
        type: 'success',
        text1: 'Account Created',
        text2: 'Your account has been created successfully!',
      });

      // Navigate to login screen after a short delay
      setTimeout(() => {
        navigation.navigate('Login');
      }, 1000);
    } catch (error: any) {
      console.error('Signup error:', error);
      Toast.show({
        type: 'error',
        text1: 'Signup Failed',
        text2: error.message || 'Failed to create account. Please try again.',
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
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.title}>Sign Up</Text>
            <Text style={styles.subtitle}>
              Best and popular apps for live education course from home
            </Text>
          </View>

          {/* Name */}
          <Text style={styles.label}>Name</Text>
          <GradientInput
            placeholder="Enter Your Name"
            value={name}
            onChangeText={setName}
          />
          {validationErrors.name && (
            <Text style={styles.errorText}>{validationErrors.name}</Text>
          )}

          {/* Email */}
          <Text style={styles.label}>Email</Text>
          <GradientInput
            placeholder="Enter your email"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          {validationErrors.email && (
            <Text style={styles.errorText}>{validationErrors.email}</Text>
          )}

          {/* Password */}
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputWithIcon}>
            <GradientInput
              placeholder="********"
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
          {validationErrors.password && (
            <Text style={styles.errorText}>{validationErrors.password}</Text>
          )}

          {/* Confirm Password */}
          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.inputWithIcon}>
            <GradientInput
              placeholder="********"
              secureTextEntry={!showCPwd}
              value={confirm}
              onChangeText={setConfirm}
              style={{ paddingRight: s(44) }}
            />
            <TouchableOpacity
              onPress={() => setShowCPwd(v => !v)}
              style={styles.eyeBtn}
              hitSlop={{ top: vs(8), bottom: vs(8), left: s(8), right: s(8) }}
            >
              <Image
                source={showCPwd ? eyeOpen : eyeClosed}
                style={styles.eyeIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
          {validationErrors.confirm && (
            <Text style={styles.errorText}>{validationErrors.confirm}</Text>
          )}

          <View style={{ height: vs(24) }} />

          <PrimaryButton
            title={loading ? 'Creating Account...' : 'Get started'}
            onPress={handleSignUp}
            loading={loading}
            disabled={loading}
          />
          {validationErrors.general && (
            <Text style={styles.errorText}>{validationErrors.general}</Text>
          )}

          <Text style={styles.footerText}>
            Do you have account?{' '}
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('Login');
              }}
            >
              {' '}
              <Text style={styles.link}>Sign In</Text>
            </TouchableOpacity>
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
    textAlign: 'center',
    marginBottom: Platform.OS === 'ios' ? scale(-2) : scale(-4),
  },
  errorText: {
    color: '#EF4444',
    fontSize: ms(12),
    marginTop: vs(4),
    fontFamily: 'SourceSansPro-Regular',
  },
});
