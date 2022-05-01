import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Platform, StyleSheet, TextInput } from 'react-native';

import { Input, Text, View } from '../components/Themed';

export default function ModalScreen() {
  const [text, onChangeText] = useState("");

  return (
    <View style={styles.container}>
      <Input label="Document Name" onChange={onChangeText} value={text} />

      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10
  },
  label: {
    fontSize: 20,
    margin: 7,

  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
