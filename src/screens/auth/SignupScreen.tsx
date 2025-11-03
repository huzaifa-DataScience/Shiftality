import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { scale as s, verticalScale as vs, moderateScale as ms, scale } from 'react-native-size-matters';
import GradientCard from '../../components/GradientCard';
import { palette } from '../../theme';
import PrimaryButton from '../../components/PrimaryButton';
import GradientInput from '../../components/GradientInput';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/AuthStack'; 
import { useNavigation } from '@react-navigation/native';

// TODO: replace with your actual assets
const eyeOpen   = require('../../assets/eye-off.png');
const eyeClosed = require('../../assets/eye-off.png');

export default function SignUpScreen() {
  

// inside component
const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();


  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [showCPwd, setShowCPwd] = useState(false);

  return (
    <View style={[styles.root, { backgroundColor: palette.darkBlue }]}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <GradientCard style={{ marginTop: vs(24),width:scale(330) }}>
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
              placeholder="********"
              secureTextEntry={!showPwd}
              value={password}
              onChangeText={setPassword}
              style={{ paddingRight: s(44) }}
            />
            <TouchableOpacity
              onPress={() => setShowPwd((v) => !v)}
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
              onPress={() => setShowCPwd((v) => !v)}
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

          <View style={{ height: vs(24) }} />

         <PrimaryButton
  backgroundColor={palette.white}
  textColor={palette.darkBlue}
  title="Get started"
  onPress={() => {
    navigation.navigate('Login');
  }}
/>

          <Text style={styles.footerText}>
            Do you have account? <TouchableOpacity onPress={() => { navigation.navigate('Login');}} > <Text style={styles.link}>Sign In</Text></TouchableOpacity>
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
  },
  subtitle: {
    color: '#B0B6C3',
    fontSize: ms(14),
    textAlign: 'center',
    width: '80%',
    marginTop: vs(6),
    lineHeight: ms(20),
  },
  label: {
    color: '#FFFFFF',
    fontSize: ms(14),
    marginTop: vs(16),
    marginBottom: vs(6),
    fontWeight: '600',
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
  },
  link: {
    color: '#3DA9FF',
    fontWeight: '600',
  },
});
