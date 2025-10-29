import React, {useState} from 'react';
import {SafeAreaView, View, Text, StyleSheet, Image, StatusBar, Alert} from 'react-native';
import {useAppTheme} from '../../theme/ThemeProvider';
import {palette} from '../../theme/colors';
import PrimaryButton from '../../components/PrimaryButton';
import TextField from '../../components/TextField';

export default function SignupScreen({navigation}: any) {
  const {colors} = useAppTheme();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const onSubmit = () => {
    if (!name || !email || !password || !confirm) {
      Alert.alert('Missing info', 'Please fill all fields.');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Password mismatch', 'Both passwords must match.');
      return;
    }
    // TODO: call your signup API
    Alert.alert('Signup', 'Submitted!');
  };

  return (
    <SafeAreaView style={[styles.root, {backgroundColor: colors.background}]}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        {/* <Image
          source={require('../../assets/signup_hero.png')} // replace with your artwork if you have it
          resizeMode="contain"
          style={{width: 120, height: 120}}
        /> */}
      </View>

      <View style={styles.body}>
        <View style={styles.titleContainer}>
        <Text style={[styles.title, {color: palette.darkBlue}]}>Sign Up</Text>
        <Text style={[styles.subtitle, {color: colors.text}]}>
          Best and popular apps for live education{'\n'}course from home
        </Text>
        </View>

        <View style={{height: 16}} />

        <TextField
          label="Name"
          placeholder="Sofia"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          containerStyle={styles.field}
        />
        <TextField
          label="Email/Phone Number"
          placeholder="sofiaasseggaf@gmail.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          containerStyle={styles.field}
        />
        <TextField
          label="Password"
          placeholder="************"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          secureToggle
          containerStyle={styles.field}
        />
        <TextField
          label="Confirm Password"
          placeholder="************"
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry
          secureToggle
          containerStyle={styles.field}
        />

        <View style={{height: 12}} />

        <PrimaryButton backgroundColor={palette.darkBlue}
            textColor={palette.white}
            title="Get started" onPress={onSubmit} />

        <View style={{height: 18}} />

        <Text style={[styles.footerText, {color: 'rgba(15,23,42,0.5)'}]}>
          Do you have account?{' '}
          <Text
            style={{color: palette.darkBlue, fontWeight: '700'}}
            onPress={() => navigation.navigate('Login')}>
            Sign In
          </Text>
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1},
  header: {
    alignItems: 'center',
    paddingTop: 24,
  },
  body: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 6,
  },
  titleContainer:{
alignItems:"center"
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  field: {marginTop: 14},
  footerText: {
    textAlign: 'center',
    fontSize: 14,
  },
});
