// src/screens/LoginScreen.tsx
import React from 'react';
import {View, Text, Button} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {AuthStackParamList} from '../navigation/AuthStack';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'> & {
  onSignedIn: () => void;
};

export default function LoginScreen({navigation, onSignedIn}: Props) {
  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Text>Login</Text>
      <Button title="Sign In" onPress={onSignedIn} />
      <Button
        title="Go to Signup"
        onPress={() => navigation.navigate('Signup')}
      />
    </View>
  );
}
