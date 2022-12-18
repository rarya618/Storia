const white = "#fff";
const purpleLight = 'rgba(97, 102, 179, 0.8)';
const purpleViewLight = 'rgba(97, 102, 179, 0.1)';

const black = "#000";
const purpleDark = 'rgba(127, 152, 220, 0.8)';
const purpleViewDark = 'rgba(127, 152, 220, 0.2)';

export default {
  light: {
    text: purpleLight,
    background: white,
    lightPurple: purpleViewLight,
    tint: purpleLight,
    tabIconDefault: '#ccc',
    tabIconSelected: purpleLight,
  },
  dark: {
    text: purpleDark,
    background: black,
    lightPurple: purpleViewDark,
    tint: purpleDark,
    tabIconDefault: '#ccc',
    tabIconSelected: purpleDark,
  },
};
