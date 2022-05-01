import React from 'react';
import { StyleSheet } from 'react-native';
import { Block, View } from '../components/Themed';

export default function TabTwoScreen() {
  return (
    <View style={styles.container}>
      <Block title="The Americans" date="18:03, 21 April" />
      <Block title="Sample Story Map" date="14:21, 21 April" />
      <Block title="Sample Cards" date="10:12, 19 April" />
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
