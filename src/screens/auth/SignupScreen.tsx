// src/screens/SignupScreen.tsx
import React from 'react';
import {View, Text, Button} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {AuthStackParamList} from '../navigation/AuthStack';

type Props = NativeStackScreenProps<AuthStackParamList, 'Signup'> & {
  onSignedIn: () => void;
};

export default function SignupScreen({onSignedIn}: Props) {
  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Text>Signup</Text>
      <Button title="Create Account" onPress={onSignedIn} />
    </View>
  );
}
