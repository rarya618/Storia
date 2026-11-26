import { Ref, useRef, useState } from "react";
import {
  ActivityIndicator, KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, Text, TextInput, TextInputInstance,
  TextInputProps, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { signInWithEmailAndPassword } from "@react-native-firebase/auth";
import { toMessage } from "@storia/core/misc/errors";
import { REVISIONS } from "@storia/core/screenplay/revisions";
import { auth, usesEmulators } from "@/firebase/main";
import { colours, radii, shadows, type } from "@/world/theme";

type Missing = "email" | "password";

// sign in with the same email and password as the web app; accounts are made
// there. Once signed in, the root layout's guard swaps this screen for the scripts.
// It's web-new's AuthCard: one white page on the rail's tint, the next two
// revisions (blue, pink) fanned beneath it, under the wordmark
export default function SignIn() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<{message: string, field?: Missing}>();
  const [submitting, setSubmitting] = useState(false);
  const emailField = useRef<TextInputInstance>(null);
  const passwordField = useRef<TextInputInstance>(null);

  const signIn = async () => {
    if (submitting) return;
    if (email.trim() === "") {
      emailField.current?.focus();
      return setError({message: "Please enter your email", field: "email"});
    }
    if (password === "") {
      passwordField.current?.focus();
      return setError({message: "Please enter your password", field: "password"});
    }
    setSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (caught) {
      setError({message: toMessage(caught)});
      setSubmitting(false);
    }
  };

  const edit = (set: (value: string) => void) => (value: string) => {
    set(value);
    if (error) setError(undefined);
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.screen}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.content, {paddingTop: insets.top + 48, paddingBottom: insets.bottom + 48}]}
      >
        <View style={styles.column}>
          <Text style={styles.wordmark} accessibilityRole="header">Storia</Text>

          <View>
            <View style={[styles.under, styles.underPink]} />
            <View style={[styles.under, styles.underBlue]} />
            <View style={styles.page}>
              <Text style={[type.heading, styles.title]} accessibilityRole="header">Log in</Text>
              {usesEmulators && (
                <Text style={[type.small, styles.muted, styles.note]}>Development build: accounts on the local emulators</Text>
              )}

              <View style={styles.fields}>
                <Field
                  ref={emailField}
                  label="Email"
                  invalid={error?.field === "email"}
                  value={email}
                  onChangeText={edit(setEmail)}
                  placeholder="you@example.com"
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
                <Field
                  ref={passwordField}
                  label="Password"
                  invalid={error?.field === "password"}
                  value={password}
                  onChangeText={edit(setPassword)}
                  secureTextEntry
                  autoComplete="current-password"
                  textContentType="password"
                  returnKeyType="go"
                  onSubmitEditing={signIn}
                />
              </View>

              {error && <Text style={[type.small, styles.error]} accessibilityRole="alert">{error.message}</Text>}

              <Pressable
                onPress={signIn}
                disabled={submitting}
                accessibilityRole="button"
                accessibilityLabel="Log in"
                accessibilityState={{busy: submitting}}
                style={({pressed}) => [styles.primary, (pressed || submitting) && styles.primaryPressed]}
              >
                {submitting
                  ? <ActivityIndicator color={colours.paper} />
                  : <Text style={[type.control, styles.primaryLabel]}>Log in</Text>}
              </Pressable>
            </View>
          </View>

          <Text style={[type.small, styles.muted, styles.footer]}>
            New to Storia? Create an account on the web, then log in here.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

type FieldProps = TextInputProps & {label: string, invalid?: boolean, ref?: Ref<TextInputInstance>};

// a labelled input in the world's form style: the border turns ink while typed
// in, and Signal Red when it's the reason the form failed
function Field({label, invalid, ref, onFocus, onBlur, ...input}: FieldProps) {
  const [focused, setFocused] = useState(false);
  return (
    <View>
      <Text style={[type.label, styles.label]}>{label}</Text>
      <TextInput
        ref={ref}
        {...input}
        accessibilityLabel={label}
        placeholderTextColor={colours.muted}
        selectionColor={colours.ink}
        onFocus={event => { setFocused(true); onFocus?.(event); }}
        onBlur={event => { setFocused(false); onBlur?.(event); }}
        style={[styles.input, focused && styles.inputFocused, invalid && styles.inputInvalid]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colours.rail},
  content: {flexGrow: 1, justifyContent: "center", paddingHorizontal: 16},
  column: {width: "100%", maxWidth: 420, alignSelf: "center"},
  wordmark: {...type.wordmark, fontSize: 36, lineHeight: 36, letterSpacing: -0.72, textAlign: "center", marginBottom: 32},
  // the next revisions, fanned under the page as on a phone-width web screen
  under: {...StyleSheet.absoluteFill, borderRadius: radii.bar, borderWidth: 1, ...shadows.under},
  underPink: {
    backgroundColor: REVISIONS[2].color, borderColor: REVISIONS[2].edge,
    transform: [{translateX: 6}, {translateY: 10}, {rotate: "1.2deg"}],
  },
  underBlue: {
    backgroundColor: REVISIONS[1].color, borderColor: REVISIONS[1].edge,
    transform: [{translateX: 3}, {translateY: 5}, {rotate: "0.6deg"}],
  },
  page: {
    backgroundColor: colours.paper, borderRadius: radii.bar, borderWidth: 1, borderColor: colours.hairStrong,
    paddingHorizontal: 24, paddingTop: 24, paddingBottom: 28, ...shadows.sheet,
  },
  title: {marginBottom: 24},
  note: {marginTop: -16, marginBottom: 24},
  fields: {gap: 16},
  label: {marginBottom: 6},
  input: {
    ...type.body, minHeight: 44, paddingHorizontal: 12, paddingVertical: 9,
    borderRadius: radii.control, borderWidth: 1, borderColor: colours.hairStrong, backgroundColor: colours.paper,
  },
  inputFocused: {borderColor: colours.ink, boxShadow: [{offsetX: 0, offsetY: 0, spreadDistance: 1, blurRadius: 0, color: colours.ink}]},
  inputInvalid: {borderColor: colours.signal, boxShadow: [{offsetX: 0, offsetY: 0, spreadDistance: 1, blurRadius: 0, color: colours.signal}]},
  error: {color: colours.signal, marginTop: 12},
  primary: {
    height: 48, borderRadius: radii.control, marginTop: 24, backgroundColor: colours.ink,
    alignItems: "center", justifyContent: "center",
  },
  primaryPressed: {backgroundColor: colours.inkHover},
  primaryLabel: {fontSize: 16, color: colours.paper},
  muted: {color: colours.muted},
  footer: {marginTop: 40, textAlign: "center"},
});
