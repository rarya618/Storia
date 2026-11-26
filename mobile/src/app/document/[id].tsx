import { useEffect, useState } from "react";
import { ActivityIndicator, AppState, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { get } from "@react-native-firebase/database";
import Document from "@storia/core/datatypes/Document";
import { readBlocks } from "@storia/core/screenplay/content";
import { ScriptBlock } from "@storia/core/screenplay/types";
import { toMessage } from "@storia/core/misc/errors";
import { documentRef, projectDocumentsRef, projectFolderRef, saveDocumentContent, touchParents } from "@/firebase/database";
import { placeDrafts, useMade } from "@/firebase/revisions";
import { createSaver, SaveStatus } from "@/script/saver";
import { ScriptEditor } from "@/script/ScriptEditor";
import { Icon } from "@/world/Icon";
import { colours, radii, type } from "@/world/theme";

// as web's editor
const SAVE_DELAY_MS = 800;
const RETRY_MS = 5000;

type Loaded = {doc: Document, blocks: ScriptBlock[], folderId?: string, drafts: string[]};
const statusLabel: Record<SaveStatus, {text: string, failed?: boolean} | undefined> = {
  saved: undefined,
  saving: {text: "Saving…"},
  error: {text: "Couldn’t save. Retrying…", failed: true},
};

// one of the writer's scripts, open in the editor. Like web, it loads the
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
      // and its project's drafts only for its revision chip
      const [folderId, drafts] = doc.projectId ? await Promise.all([
        get(projectFolderRef(doc.projectId)).then(folder => folder.val() ?? undefined, () => undefined),
        get(projectDocumentsRef(doc.projectId)).then(summaries => Object.keys(summaries.val() ?? {}), () => [id]),
      ]) : [undefined, [id]];
      if (live) setLoaded({doc, blocks: readBlocks(doc.content), folderId, drafts});
    })().catch(caught => {
      // the rules refuse a read of a document that isn't there as well as one that isn't the writer's
      const denied = (caught as {code?: string})?.code === "database/permission-denied";
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
  const {doc, folderId, drafts} = loaded;
  const made = useMade(drafts);
  const placed = made && placeDrafts(drafts.map(draft => ({id: draft})), made).find(draft => draft.id === doc.id);
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
      revision={placed && {revision: placed.revision, index: placed.index, of: drafts.length}}
      onBack={() => router.back()}
    />
  );
}

function Waiting({title, error, onRetry}: {title: string, error?: string, onRetry: () => void}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.screen}>
      <View style={[styles.bar, {paddingTop: insets.top}]}>
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Back to your scripts"
          style={({pressed}) => [styles.back, pressed && styles.backPressed]}>
          <Icon name="back" size={22} />
        </Pressable>
        <Text style={[type.body, styles.title]} numberOfLines={1}>{title}</Text>
      </View>
      {error ? (
        <View style={styles.message}>
          <Text style={[type.section, styles.centred]}>Couldn’t open this script</Text>
          <Text style={[type.body, styles.muted, styles.centred]}>{error}</Text>
          <Pressable onPress={onRetry} accessibilityRole="button"
            style={({pressed}) => [styles.primary, pressed && styles.primaryPressed]}>
            <Text style={[type.button, styles.primaryLabel]}>Try again</Text>
          </Pressable>
        </View>
      ) : (
        <ActivityIndicator style={styles.waiting} color={colours.muted} />
      )}
    </View>
  );
}

// a load error as on the web: centred, the title, the reason in quiet ink, then an ink Try again
const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colours.paper},
  bar: {flexDirection: "row", alignItems: "center", gap: 4, paddingLeft: 4, paddingRight: 16, paddingBottom: 6, minHeight: 50},
  back: {width: 44, height: 44, borderRadius: radii.control, alignItems: "center", justifyContent: "center"},
  backPressed: {backgroundColor: colours.wash},
  title: {flex: 1, fontWeight: "700", paddingLeft: 4},
  waiting: {padding: 24},
  message: {padding: 24, paddingTop: 64, alignItems: "center", gap: 8, maxWidth: 384, alignSelf: "center"},
  centred: {textAlign: "center"},
  muted: {color: colours.muted},
  primary: {
    marginTop: 16, minHeight: 44, paddingHorizontal: 16, borderRadius: radii.control,
    backgroundColor: colours.ink, alignItems: "center", justifyContent: "center",
  },
  primaryPressed: {backgroundColor: colours.inkHover},
  primaryLabel: {color: colours.paper},
});
