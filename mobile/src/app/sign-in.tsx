import { useRef, useState } from "react";
import {
  ActivityIndicator, KeyboardAvoidingView, Pressable, StyleSheet, Text, TextInput, TextInputInstance, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { signInWithEmailAndPassword } from "@react-native-firebase/auth";
import { toMessage } from "@storia/core/misc/errors";
import { auth, usesEmulators } from "@/firebase/main";
import { colours } from "@/world/theme";

// sign in with the same email and password as the web app; accounts are made
// there. Once signed in, the root layout's guard swaps this screen for the scripts
export default function SignIn() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const passwordField = useRef<TextInputInstance>(null);

  const signIn = async () => {
    if (submitting) return;
    if (email.trim() === "") return setError("Please enter your email");
    if (password === "") return setError("Please enter your password");
    setSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (caught) {
      setError(toMessage(caught));
      setSubmitting(false);
    }
  };

  const edit = (set: (value: string) => void) => (value: string) => {
    set(value);
    if (error) setError(undefined);
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={[styles.screen, {paddingTop: insets.top + 48}]}>
      <View style={styles.form}>
        <Text style={styles.brand}>Storia</Text>
        <Text style={styles.title}>Log in</Text>
        {usesEmulators && <Text style={styles.note}>Development build: accounts on the local emulators</Text>}

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={edit(setEmail)}
          placeholder="you@example.com"
          placeholderTextColor={colours.muted}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          keyboardType="email-address"
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => passwordField.current?.focus()}
          autoFocus
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          ref={passwordField}
          style={styles.input}
          value={password}
          onChangeText={edit(setPassword)}
          secureTextEntry
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="go"
          onSubmitEditing={signIn}
        />

        {error && <Text style={styles.error} accessibilityRole="alert">{error}</Text>}

        <Pressable
          onPress={signIn}
          disabled={submitting}
          accessibilityRole="button"
          style={({pressed}) => [styles.button, (pressed || submitting) && styles.buttonPressed]}
        >
          {submitting ? <ActivityIndicator color={colours.paper} /> : <Text style={styles.buttonLabel}>Log in</Text>}
        </Pressable>
        <Text style={styles.footer}>New to Storia? Create an account on the web, then log in here.</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colours.rail, paddingHorizontal: 24},
  form: {width: "100%", maxWidth: 420, alignSelf: "center"},
  brand: {fontSize: 15, fontWeight: "600", color: colours.muted, marginBottom: 8},
  title: {fontSize: 28, fontWeight: "700", color: colours.ink, marginBottom: 24},
  note: {fontSize: 14, color: colours.muted, marginTop: -16, marginBottom: 24},
  label: {fontSize: 15, fontWeight: "600", color: colours.ink, marginBottom: 6},
  input: {
    height: 48, borderRadius: 10, paddingHorizontal: 14, marginBottom: 16,
    fontSize: 17, color: colours.ink, backgroundColor: colours.paper,
    borderWidth: StyleSheet.hairlineWidth, borderColor: colours.hair,
  },
  error: {fontSize: 15, color: colours.signal, marginBottom: 12},
  button: {
    height: 50, borderRadius: 10, marginTop: 8, backgroundColor: colours.ink,
    alignItems: "center", justifyContent: "center",
  },
  buttonPressed: {opacity: 0.8},
  buttonLabel: {fontSize: 17, fontWeight: "600", color: colours.paper},
  footer: {fontSize: 14, color: colours.muted, marginTop: 20, textAlign: "center"},
});
