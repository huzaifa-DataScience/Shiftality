import React, {useState} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Image,
  StatusBar,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {useAppTheme} from '../../theme/ThemeProvider';
import {palette} from '../../theme/colors';
import TextField from '../../components/TextField';
import PrimaryButton from '../../components/PrimaryButton';

export default function SignInScreen({navigation}: any) {
  const {colors} = useAppTheme();

  const [email, setEmail] = useState('sofiaasseggaf@gmail.com');
  const [password, setPassword] = useState('');

  const onSubmit = () => {
    if (!email || !password) {
      Alert.alert('Missing info', 'Please enter email and password.');
      return;
    }
    // TODO: call your login API
    Alert.alert('Sign In', 'Logged in!');
  };

  return (
    <SafeAreaView style={[styles.root, {backgroundColor: colors.background}]}>
      <StatusBar barStyle="dark-content" />

      {/* Top graphic */}
      <View style={styles.header}>
        {/* <Image
          source={require('../../assets/signin_hero.png')} // replace with your asset or remove
          resizeMode="contain"
          style={{width: 120, height: 120}}
        /> */}
      </View>

      <View style={styles.body}>
        <Text style={[styles.title, {color: palette.darkBlue}]}>Sign In</Text>
        <Text style={[styles.subtitle, {color: colors.text}]}>
          Enter your email below to login to{'\n'}your account
        </Text>

        <View style={{height: 16}} />

        <TextField
          label="Email/Phone Number"
          placeholder="name@example.com"
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

        <TouchableOpacity
          onPress={() => Alert.alert('Forgot Password', 'Handle reset flow')}
          style={{alignSelf: 'flex-end', marginTop: 8}}
        >
          <Text style={{color: palette.darkBlue}}>Forget Password?</Text>
        </TouchableOpacity>

        <View style={{height: 16}} />

        <PrimaryButton
          title="Get started"
          onPress={onSubmit}
          backgroundColor={palette.darkBlue}
          textColor={palette.white}
        />

        <View style={{height: 18}} />

        <Text style={styles.footerText}>
          Don’t have account?{' '}
          <Text
            style={{color: palette.darkBlue, fontWeight: '700'}}
            onPress={() => navigation.navigate('Signup')}
          >
            Sign Up
          </Text>
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1},
  header: {alignItems: 'center', paddingTop: 24},
  body: {flex: 1, paddingHorizontal: 20, paddingTop: 6},
  title: {fontSize: 28, fontWeight: '800', letterSpacing: 0.3, textAlign: 'center'},
  subtitle: {marginTop: 8, fontSize: 14, textAlign: 'center', lineHeight: 20},
  field: {marginTop: 14},
  footerText: {textAlign: 'center', fontSize: 14, color: 'rgba(15,23,42,0.55)'},
});
