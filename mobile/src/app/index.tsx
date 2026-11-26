import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, AppState, Pressable, SectionList, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { onValue } from "@react-native-firebase/database";
import { getIdToken, reload, sendEmailVerification, signOut } from "@react-native-firebase/auth";
import { Project } from "@storia/core/datatypes/Block";
import { toMessage } from "@storia/core/misc/errors";
import { NOT_INVITED } from "@storia/core/misc/invites";
import { Revision, ordinal } from "@storia/core/screenplay/revisions";
import { auth } from "@/firebase/main";
import { projectsOf } from "@/firebase/database";
import { placeDrafts, useMade } from "@/firebase/revisions";
import { useUser } from "@/firebase/session";
import { Icon } from "@/world/Icon";
import { RevisionPage } from "@/world/Revision";
import { colours, radii, type } from "@/world/theme";

type Draft = {id: string, name: string, revision?: Revision, index?: number};
type Section = {id: string, title: string, count: number, data: Draft[]};

// the most recently written in first, as on web's home
const byActivity = (a: Project, b: Project) =>
  (Date.parse(b.lastUpdated ?? b.createdOn) || 0) - (Date.parse(a.lastUpdated ?? a.createdOn) || 0);

// as web's home greets the writer (without their first name, which is in Firestore)
const greeting = () => {
  const hour = new Date().getHours();
  return hour < 5 ? "Good evening" : hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
};

const plural = (n: number, one: string) => `${n} ${one}${n === 1 ? "" : "s"}`;

// the writer's scripts, project by project, from the summaries each project
// keeps; each draft on its revision's paper, in the order they were made
const toSections = (projects: Project[], made?: Map<string, string>): Section[] =>
  projects.map(project => {
    const drafts = Object.values(project.documents ?? {}).map(doc => ({id: doc.id, name: doc.name}));
    return {
      id: project.id,
      title: project.name,
      count: drafts.length,
      data: made
        ? placeDrafts(drafts, made)
        : drafts.sort((a, b) => a.name.localeCompare(b.name, undefined, {numeric: true})),
    };
  });

export default function Scripts() {
  const insets = useSafeAreaInsets();
  const user = useUser();
  const [projects, setProjects] = useState<Project[]>();
  const [error, setError] = useState<string>();
  const [unverified, setUnverified] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => onValue(
    projectsOf(user.uid),
    snapshot => {
      setProjects(Object.values((snapshot.val() ?? {}) as Record<string, Project>).sort(byActivity));
      setError(undefined);
      setUnverified(false);
    },
    // the rules refuse an email that hasn't been verified, or isn't on the
    // closed beta's invite list
    caught => {
      if ((caught as {code?: string}).code !== "database/permission-denied") return setError(toMessage(caught));
      if (!auth.currentUser?.emailVerified) return setUnverified(true);
      setError(NOT_INVITED);
    },
  ), [user.uid, attempt]);

  const ids = useMemo(() => (projects ?? []).flatMap(project => Object.keys(project.documents ?? {})), [projects]);
  const made = useMade(ids);
  const sections = useMemo(() => projects && toSections(projects, made), [projects, made]);
  const drafts = ids.length;

  return (
    <View style={styles.screen}>
      <View style={[styles.bar, {paddingTop: insets.top, height: insets.top + 64}]}>
        <Text style={type.wordmark} accessibilityRole="header">Storia</Text>
        <Pressable onPress={() => signOut(auth)} accessibilityRole="button"
          style={({pressed}) => [styles.button, pressed && styles.buttonPressed]}>
          <Text style={type.control}>Log out</Text>
        </Pressable>
      </View>
      {unverified ? (
        <CheckEmail email={user.email} onVerified={() => setAttempt(n => n + 1)} />
      ) : error ? (
        <View style={styles.message}>
          <Text style={type.section}>Couldn’t load your scripts</Text>
          <Text style={[type.body, styles.muted, styles.centred]}>{error}</Text>
        </View>
      ) : !sections ? (
        <ActivityIndicator style={styles.message} color={colours.muted} />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={item => item.id}
          stickySectionHeadersEnabled={false}
          contentContainerStyle={{paddingBottom: insets.bottom + 40}}
          ListHeaderComponent={
            <View style={styles.heading}>
              <Text style={type.display} accessibilityRole="header">{greeting()}</Text>
              {sections.length > 0 && (
                <Text style={[type.body, styles.muted]}>
                  {plural(sections.length, "project")} · {plural(drafts, "draft")}
                </Text>
              )}
            </View>
          }
          ListEmptyComponent={
            <Text style={[type.body, styles.muted, styles.inset]}>
              No scripts yet. Start a project on the web, and its drafts show here.
            </Text>
          }
          renderSectionHeader={({section}) => (
            <View style={styles.section}>
              <Text style={[type.section, styles.sectionName]} numberOfLines={1} accessibilityRole="header">
                {section.title}
              </Text>
              {section.count > 0 && <Text style={[type.section, styles.count]}>{section.count}</Text>}
            </View>
          )}
          renderSectionFooter={({section}) => section.data.length === 0
            ? <Text style={[type.small, styles.muted, styles.inset, styles.empty]}>No drafts in this project yet</Text>
            : null}
          renderItem={({item, section}) => (
            <Pressable
              onPress={() => router.push({pathname: "/document/[id]", params: {id: item.id, name: item.name}})}
              accessibilityRole="button"
              accessibilityLabel={item.revision && section.count > 1
                ? `${item.name}, ${ordinal((item.index ?? 0) + 1)} draft` : item.name}
              style={({pressed}) => [styles.row, pressed && styles.rowPressed]}
            >
              <RevisionPage revision={item.revision} />
              <View style={styles.rowText}>
                <Text style={[type.body, styles.name]} numberOfLines={1}>{item.name || "Untitled"}</Text>
                {item.revision && section.count > 1 && (
                  <Text style={[type.small, styles.muted]}>
                    {ordinal((item.index ?? 0) + 1)} draft · {item.revision.name} pages
                  </Text>
                )}
              </View>
              <Icon name="chevronRight" size={18} color={colours.muted} />
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

// Check your email, as on the web: the rules refuse an unverified email, so
// the scripts wait until the writer has opened the link Create account sent
function CheckEmail({email, onVerified}: {email: string | null, onVerified: () => void}) {
  const [note, setNote] = useState<{text: string, failed?: boolean}>();
  const [checking, setChecking] = useState(false);

  // fetch the user again, and a fresh token, since the rules read
  // email_verified from the token and the old one says false
  const check = useCallback(async (quietly: boolean) => {
    const current = auth.currentUser;
    if (!current) return;
    setChecking(true);
    try {
      await reload(current);
      if (auth.currentUser?.emailVerified) {
        await getIdToken(auth.currentUser, true);
        return onVerified();
      }
      if (!quietly) setNote({text: "That email isn’t verified yet. Open the link in it, or send a new one.", failed: true});
    } catch (caught) {
      if (!quietly) setNote({text: toMessage(caught), failed: true});
    } finally {
      setChecking(false);
    }
  }, [onVerified]);

  // the link opens in the mail app or a browser, so look again on coming back
  useEffect(() => {
    const listener = AppState.addEventListener("change", state => { if (state === "active") check(true); });
    return () => listener.remove();
  }, [check]);

  const resend = async () => {
    if (!auth.currentUser) return;
    try {
      await sendEmailVerification(auth.currentUser);
      setNote({text: "A new link is on its way. Only the newest one works."});
    } catch (caught) {
      setNote({text: toMessage(caught), failed: true});
    }
  };

  return (
    <View style={styles.check}>
      <Text style={type.heading} accessibilityRole="header">Check your email</Text>
      <Text style={type.body}>
        To finish, open the link we sent to <Text style={styles.name}>{email}</Text>. It proves the email is yours.
      </Text>
      <Text style={[type.small, note?.failed ? styles.failed : styles.muted]} accessibilityLiveRegion="polite">
        {note?.text ?? "It can take a minute, and sometimes lands in spam."}
      </Text>
      <Pressable onPress={() => check(false)} disabled={checking} accessibilityRole="button" accessibilityState={{busy: checking}}
        style={({pressed}) => [styles.primary, (pressed || checking) && styles.primaryPressed]}>
        {checking
          ? <ActivityIndicator color={colours.paper} />
          : <Text style={[type.control, styles.primaryLabel]}>I’ve opened the link</Text>}
      </Pressable>
      <Pressable onPress={resend} accessibilityRole="button"
        style={({pressed}) => [styles.button, styles.wide, pressed && styles.buttonPressed]}>
        <Text style={[type.control, styles.wideLabel]}>Send a new link</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colours.paper},
  // the bar holds controls only, and meets the page with no rule
  bar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  button: {
    minHeight: 44, paddingHorizontal: 16, borderRadius: radii.control, justifyContent: "center",
    backgroundColor: colours.paper, borderWidth: 1, borderColor: colours.hairStrong,
  },
  buttonPressed: {backgroundColor: colours.tint},
  heading: {paddingHorizontal: 16, paddingTop: 8, gap: 8},
  muted: {color: colours.muted},
  centred: {textAlign: "center"},
  inset: {paddingHorizontal: 16, paddingTop: 24},
  section: {flexDirection: "row", alignItems: "baseline", gap: 8, paddingHorizontal: 16, paddingTop: 40, paddingBottom: 8},
  sectionName: {flexShrink: 1},
  count: {fontWeight: "400", color: colours.muted, fontVariant: ["tabular-nums"]},
  empty: {paddingTop: 4},
  row: {
    flexDirection: "row", alignItems: "center", gap: 14, minHeight: 60,
    marginHorizontal: 8, paddingHorizontal: 8, paddingVertical: 8, borderRadius: radii.row,
  },
  rowPressed: {backgroundColor: colours.wash},
  rowText: {flex: 1, gap: 2},
  name: {fontWeight: "600"},
  message: {padding: 24, alignItems: "center", gap: 8},
  check: {paddingHorizontal: 16, paddingTop: 8, gap: 12},
  failed: {color: colours.signal},
  primary: {
    height: 48, borderRadius: radii.control, marginTop: 12, backgroundColor: colours.ink,
    alignItems: "center", justifyContent: "center",
  },
  primaryPressed: {backgroundColor: colours.inkHover},
  primaryLabel: {fontSize: 16, color: colours.paper},
  wide: {height: 48, alignItems: "center"},
  wideLabel: {fontSize: 16, textAlign: "center"},
});
