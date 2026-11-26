import { useEffect, useState } from "react";
import { ActivityIndicator, AppState, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { get } from "firebase/database";
import Document from "@storia/core/datatypes/Document";
import { readBlocks } from "@storia/core/screenplay/content";
import { ScriptBlock } from "@storia/core/screenplay/types";
import { toMessage } from "@storia/core/misc/errors";
import { documentRef, projectFolderRef, saveDocumentContent, touchParents } from "@/firebase/database";
import { createSaver, SaveStatus } from "@/script/saver";
import { ScriptEditor } from "@/script/ScriptEditor";
import { colours } from "@/script/theme";

// as web-new's editor
const SAVE_DELAY_MS = 800;
const RETRY_MS = 5000;

type Loaded = {doc: Document, blocks: ScriptBlock[], folderId?: string};
const statusLabel: Record<SaveStatus, string | undefined> = {
  saved: undefined,
  saving: "Saving…",
  error: "Not saved, retrying",
};

// one of the writer's scripts, open in the editor. Like web-new, it loads the
// script once rather than subscribing, so a change from elsewhere can't
// overwrite what's being typed, and saves the whole script after a pause
export default function DocumentScreen() {
  const {id, name} = useLocalSearchParams<{id: string, name?: string}>();
  const [loaded, setLoaded] = useState<Loaded>();
  const [error, setError] = useState<string>();
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let live = true;
    (async () => {
      const snapshot = await get(documentRef(id));
      if (!snapshot.exists()) throw new Error("This script doesn't exist, or it isn't yours.");
      const doc = {...snapshot.val(), id} as Document;
      // the folder is only for marking it as written in; a script opens without it
      const folderId = doc.projectId
        ? await get(projectFolderRef(doc.projectId)).then(folder => folder.val() ?? undefined, () => undefined)
        : undefined;
      if (live) setLoaded({doc, blocks: readBlocks(doc.content), folderId});
    })().catch(caught => {
      // the rules refuse a read of a document that isn't there as well as one that isn't the writer's
      const denied = (caught as {code?: string})?.code === "PERMISSION_DENIED" || /permission/i.test(String(caught));
      if (live) setError(denied ? "This script doesn't exist, or it isn't yours." : toMessage(caught));
    });
    return () => { live = false; };
  }, [id, attempt]);

  if (!loaded) {
    return <Waiting title={name ?? "Script"} error={error} onRetry={() => { setError(undefined); setAttempt(n => n + 1); }} />;
  }
  return <Editing key={id} loaded={loaded} />;
}

function Editing({loaded}: {loaded: Loaded}) {
  const {doc, folderId} = loaded;
  const [status, setStatus] = useState<SaveStatus>("saved");
  // the screen is keyed on the document, so one saver lasts it
  const [saver] = useState(() => createSaver<ScriptBlock[]>({
    write: async content => {
      try {
        await saveDocumentContent(doc.id, content);
      } catch (caught) {
        console.error("save script", caught);
        throw caught;
      }
      touchParents({projectId: doc.projectId, folderId});
    },
    onStatus: setStatus,
    delay: SAVE_DELAY_MS,
    retry: RETRY_MS,
  }));

  // save at once when the writer leaves the script or the app
  useEffect(() => {
    const state = AppState.addEventListener("change", next => { if (next !== "active") saver.flush(); });
    return () => {
      state.remove();
      saver.flush();
    };
  }, [saver]);

  return (
    <ScriptEditor
      initial={() => loaded.blocks}
      title={doc.name || "Untitled"}
      onChange={saver.change}
      status={statusLabel[status]}
      onBack={() => router.back()}
    />
  );
}

function Waiting({title, error, onRetry}: {title: string, error?: string, onRetry: () => void}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.screen}>
      <View style={[styles.header, {paddingTop: insets.top + 8}]}>
        <Pressable onPress={() => router.back()} hitSlop={12} accessibilityRole="button" style={styles.back}>
          <Text style={styles.backLabel}>‹ Scripts</Text>
        </Pressable>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
      </View>
      {error ? (
        <View style={styles.message}>
          <Text style={styles.error}>{error}</Text>
          <Pressable onPress={onRetry} hitSlop={12} accessibilityRole="button">
            <Text style={styles.retry}>Try again</Text>
          </Pressable>
        </View>
      ) : (
        <ActivityIndicator style={styles.message} color={colours.muted} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colours.paper},
  header: {
    paddingHorizontal: 16, paddingBottom: 8, backgroundColor: colours.paper,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colours.hair,
  },
  back: {alignSelf: "flex-start", marginBottom: 4},
  backLabel: {fontSize: 17, color: colours.ink},
  title: {fontSize: 17, fontWeight: "600", color: colours.ink},
  message: {padding: 24, alignItems: "center", gap: 16},
  error: {fontSize: 16, color: colours.signal, textAlign: "center"},
  retry: {fontSize: 17, fontWeight: "600", color: colours.ink},
});
