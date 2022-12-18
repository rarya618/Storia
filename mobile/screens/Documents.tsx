import React from 'react';
import { StyleSheet } from 'react-native';
import { Block, View } from '../components/Themed';

export default function TabTwoScreen() {
  return (
    <View style={styles.container}>
      <Block title="The Americans" date="a few months ago" />
      <Block title="Sample Project" date="a few months ago" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  }
});
