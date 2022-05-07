/**
 * Learn more about Light and Dark modes:
 * https://docs.expo.io/guides/color-schemes/
 */

import { Text as DefaultText, View as DefaultView, StyleSheet, TextInput } from 'react-native';

import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme();
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

export type TextProps = ThemeProps & DefaultText['props'];
export type ViewProps = ThemeProps & DefaultView['props'];

export function Text(props: TextProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return <DefaultText style={[{ color }, style]} {...otherProps} />;
}

export function View(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return <DefaultView style={[{ backgroundColor }, style]} {...otherProps} />;
}

type BlockProps = {
  title: string,
  date: string
}

export const Block = (props: BlockProps) => {
  const backgroundColor = useThemeColor({}, 'lightPurple');

  return (
    <View style={[{backgroundColor}, styles.block]}>
      <Text style={styles.title}>{props.title}</Text>
      <Text style={styles.text}>Last updated at {props.date}</Text>
    </View>
  )
}

type InputProps = {
  label: string,
  value: string,
  onChange: (value: string) => void
}

export const Input = (props: InputProps) => {
  const backgroundColor = useThemeColor({}, 'lightPurple');
  const color = useThemeColor({}, 'text');

  return (
    <>
      <Text style={styles.text}>{props.label}</Text>
      <TextInput
        style={[{ backgroundColor }, {color}, styles.input]}

        onChangeText={props.onChange}
        value={props.value}
      />
    </>
  )
}

const standardMargin = 3;

const styles = StyleSheet.create({
  block: {
    margin: 6,
    borderRadius: 5,
    padding: 10
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'NotoSans-Regular',
    textAlign: 'left',
    margin: standardMargin
  },
  text: {
    fontSize: 17,
    lineHeight: 24,
    textAlign: 'left',
    fontFamily: 'NotoSans-Regular',
    margin: standardMargin
  },
  input: {
    height: 40,
    margin: standardMargin,
    padding: 8,
    borderRadius: 5,
    fontSize: 17
  },
});