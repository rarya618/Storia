import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, SectionList, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { onValue } from "firebase/database";
import { signOut } from "firebase/auth";
import { Project } from "@storia/core/datatypes/Block";
import { toMessage } from "@storia/core/misc/errors";
import { auth } from "@/firebase/main";
import { projectsOf } from "@/firebase/database";
import { useUser } from "@/firebase/session";
import { colours } from "@/script/theme";

type Section = {id: string, title: string, data: {id: string, name: string}[]};

// the most recently written in first, as on web-new's home
const byActivity = (a: Project, b: Project) =>
  (Date.parse(b.lastUpdated ?? b.createdOn) || 0) - (Date.parse(a.lastUpdated ?? a.createdOn) || 0);

// the writer's scripts, project by project, from the summaries each project keeps
const toSections = (projects: Record<string, Project> | null): Section[] =>
  Object.values(projects ?? {})
    .sort(byActivity)
    .map(project => ({
      id: project.id,
      title: project.name,
      data: Object.values(project.documents ?? {})
        .map(doc => ({id: doc.id, name: doc.name}))
        .sort((a, b) => a.name.localeCompare(b.name, undefined, {numeric: true})),
    }));

export default function Scripts() {
  const insets = useSafeAreaInsets();
  const user = useUser();
  const [sections, setSections] = useState<Section[]>();
  const [error, setError] = useState<string>();

  useEffect(() => onValue(
    projectsOf(user.uid),
    snapshot => { setSections(toSections(snapshot.val())); setError(undefined); },
    caught => setError(toMessage(caught)),
  ), [user.uid]);

  return (
    <View style={styles.screen}>
      <View style={[styles.header, {paddingTop: insets.top + 8}]}>
        <Text style={styles.title}>Scripts</Text>
        <Pressable onPress={() => signOut(auth)} hitSlop={12} accessibilityRole="button">
          <Text style={styles.action}>Log out</Text>
        </Pressable>
      </View>
      {error ? (
        <Text style={[styles.message, styles.error]}>{error}</Text>
      ) : !sections ? (
        <ActivityIndicator style={styles.message} color={colours.muted} />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={item => item.id}
          stickySectionHeadersEnabled
          contentContainerStyle={{paddingBottom: insets.bottom + 24}}
          ListEmptyComponent={<Text style={styles.message}>No scripts yet. Start one on the web, and it shows here.</Text>}
          renderSectionHeader={({section}) => (
            <Text style={styles.project} numberOfLines={1}>{section.title}</Text>
          )}
          renderSectionFooter={({section}) => section.data.length === 0
            ? <Text style={styles.empty}>No drafts in this project</Text>
            : null}
          renderItem={({item}) => (
            <Pressable
              onPress={() => router.push({pathname: "/document/[id]", params: {id: item.id, name: item.name}})}
              accessibilityRole="button"
              style={({pressed}) => [styles.row, pressed && styles.rowPressed]}
            >
              <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colours.paper},
  header: {
    flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between",
    paddingHorizontal: 16, paddingBottom: 12, backgroundColor: colours.paper,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colours.hair,
  },
  title: {fontSize: 28, fontWeight: "700", color: colours.ink},
  action: {fontSize: 17, color: colours.ink, paddingBottom: 4},
  project: {
    fontSize: 14, fontWeight: "600", color: colours.muted, backgroundColor: colours.rail,
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 6,
  },
  row: {
    flexDirection: "row", alignItems: "center", minHeight: 52, paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colours.hair,
  },
  rowPressed: {backgroundColor: colours.wash},
  name: {flex: 1, fontSize: 17, color: colours.ink},
  chevron: {fontSize: 22, color: colours.faint, marginLeft: 8},
  empty: {fontSize: 15, color: colours.faint, paddingHorizontal: 16, paddingVertical: 14},
  message: {fontSize: 16, color: colours.muted, padding: 24, textAlign: "center"},
  error: {color: colours.signal},
});
