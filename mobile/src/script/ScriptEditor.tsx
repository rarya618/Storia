import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList, Keyboard, KeyboardAvoidingView, ListRenderItem,
  StyleSheet, Text, TextInputInstance, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { characterNames, characterSuggestions } from "@storia/core/screenplay/characters";
import { paginate } from "@storia/core/screenplay/pages";
import { ElementType, ScriptBlock, elementLabel } from "@storia/core/screenplay/types";
import { Caret, Change, backspaceAtStart, cycleType, enter, setType, type } from "./blocks";
import { BlockField, FieldHandlers } from "./BlockField";
import { ElementBar } from "./ElementBar";
import { colours } from "./theme";

// The block editor spike: the script as a list of native text fields, one per
// block, with web-new's element rules (flow.ts) moving the caret between them.
// It holds the script in memory only; nothing is saved.

type Selection = {id: string, start: number, end: number};

export function ScriptEditor({initial, title}: {initial: () => ScriptBlock[], title: string}) {
  const insets = useSafeAreaInsets();
  const [blocks, setBlocks] = useState(initial);
  const [focused, setFocused] = useState<string | null>(null);
  // where the caret should go after a change; a new object each time, so
  // asking for the same place twice still moves it
  const [request, setRequest] = useState<Caret | null>(null);

  // the handlers read these, so they never change and the rows never redraw for them
  const latest = useRef(blocks);
  // the block holding the caret, as the editor sees it: it moves the moment a
  // change asks, before the field that will hold it has focus
  const focusedRef = useRef<string | null>(null);
  // the caret's place in that block (or the selection), by the same rule
  const selection = useRef<Selection | null>(null);
  // the field the platform has focused, which lags a move by a frame or more
  const nativeFocus = useRef<string | null>(null);
  // a block the caret has moved to whose field doesn't have focus yet. Until it
  // does, keys pressed in the old field (a quick second Return) act on this
  // block, and the old field's late focus and selection events are ignored
  const pending = useRef<string | null>(null);
  const inputs = useRef(new Map<string, TextInputInstance>());
  const list = useRef<FlatList<ScriptBlock>>(null);
  const viewport = useRef({offset: 0, height: 0});

  const apply = useCallback((next: ScriptBlock[], caret: Caret | null) => {
    if (caret) {
      selection.current = {id: caret.id, start: caret.at, end: caret.at};
      if (caret.id !== nativeFocus.current) {
        pending.current = caret.id;
        // focus a field that's already drawn (the block before, on a join) now,
        // before this change takes the focused field away: a focused field going
        // closes the keyboard on iOS. A new block's field is focused once drawn
        inputs.current.get(caret.id)?.focus();
      }
      focusedRef.current = caret.id;
      setFocused(caret.id);
      setRequest({...caret});
    }
    latest.current = next;
    setBlocks(next);
  }, []);

  const indexOf = useCallback((id: string) => latest.current.findIndex(block => block.id === id), []);

  // the caret's offset in a block, or its end when the field hasn't said
  const caretIn = useCallback((id: string) => {
    const current = selection.current;
    return current?.id === id ? current.start : latest.current[indexOf(id)]?.text.length ?? 0;
  }, [indexOf]);

  // scroll just enough to keep a field clear of the screen's edges and the keyboard
  const reveal = useCallback((id: string) => {
    const input = inputs.current.get(id);
    const scroller = list.current?.getNativeScrollRef();
    if (!input || !scroller) return;
    input.measureLayout(scroller as never, (_x, y, _width, height) => {
      const {offset, height: visible} = viewport.current;
      const margin = 40;
      if (y + height > offset + visible - margin) {
        list.current?.scrollToOffset({offset: y + height - visible + margin * 2, animated: true});
      } else if (y < offset + margin) {
        list.current?.scrollToOffset({offset: Math.max(0, y - margin * 2), animated: true});
      }
    }, () => {});
  }, []);

  // move the caret where a change asked: focus that field (scrolling it into
  // the list's window first if it isn't drawn) and place the caret
  useEffect(() => {
    if (!request) return;
    let tries = 0;
    let frame = 0;
    const attempt = () => {
      const input = inputs.current.get(request.id);
      if (!input) {
        const index = indexOf(request.id);
        if (tries === 0 && index !== -1) list.current?.scrollToIndex({index, viewPosition: 0.4, animated: false});
        if (index !== -1 && tries++ < 20) frame = requestAnimationFrame(attempt);
        return;
      }
      if (!input.isFocused()) input.focus();
      const at = Math.min(request.at, latest.current[indexOf(request.id)]?.text.length ?? 0);
      input.setSelection(at, at);
      selection.current = {id: request.id, start: at, end: at};
      nativeFocus.current = request.id;
      if (pending.current === request.id) pending.current = null;
      reveal(request.id);
    };
    frame = requestAnimationFrame(attempt);
    return () => cancelAnimationFrame(frame);
  }, [request, reveal, indexOf]);

  useEffect(() => {
    const hidden = Keyboard.addListener("keyboardDidHide", () => {
      // a hide in the middle of a move is the platform catching up, not the writer leaving
      if (pending.current) return;
      focusedRef.current = null;
      nativeFocus.current = null;
      setFocused(null);
    });
    return () => hidden.remove();
  }, []);

  const handlers = useMemo<FieldHandlers>(() => ({
    register: (id, input) => {
      if (input) inputs.current.set(id, input);
      else inputs.current.delete(id);
    },
    onText: (id, text) => {
      const index = indexOf(id);
      if (index === -1) return;
      const typed = type(latest.current, index, text);
      apply(typed.blocks, typed.caret);
    },
    onEnter: field => {
      // a Return pressed before the caret's new field has focus belongs to that block
      const id = pending.current ?? field;
      const index = indexOf(id);
      if (index === -1) return;
      let blocks = latest.current;
      let at = caretIn(id);
      // Return over a selection replaces it, as typing would
      const current = selection.current;
      if (current?.id === id && current.end > current.start) {
        const block = blocks[index];
        blocks = [...blocks];
        blocks[index] = {...block, text: block.text.slice(0, current.start) + block.text.slice(current.end)};
        at = current.start;
      }
      const change = enter(blocks, index, at);
      apply(change.blocks, change.caret);
    },
    onBackspace: field => {
      // only at the very start of the block; elsewhere the field deletes as usual
      const id = pending.current ?? field;
      const current = selection.current;
      if (current?.id !== id || current.start !== 0 || current.end !== 0) return;
      const index = indexOf(id);
      if (index === -1) return;
      const change = backspaceAtStart(latest.current, index);
      if (change) apply(change.blocks, change.caret);
    },
    onSelection: (id, start, end) => {
      if (pending.current && id !== pending.current) return;
      selection.current = {id, start, end};
    },
    onFocus: id => {
      nativeFocus.current = id;
      // the old field can report focus late, mid-move; the caret has already left it
      if (pending.current && id !== pending.current) return;
      focusedRef.current = id;
      setFocused(id);
    },
    onGrow: id => { if (id === focusedRef.current) reveal(id); },
  }), [apply, reveal, indexOf, caretIn]);

  // the bar's actions, on the block holding the caret
  const onBlock = (change: (blocks: ScriptBlock[], index: number, caret: number) => Change) => {
    const id = focusedRef.current;
    if (!id) return;
    const index = indexOf(id);
    if (index === -1) return;
    const next = change(latest.current, index, caretIn(id));
    apply(next.blocks, next.caret);
  };

  const current = focused ? blocks.find(block => block.id === focused) : undefined;
  const suggestions = useMemo(
    () => current?.type === "character" ? characterSuggestions(characterNames(blocks), current.text) : [],
    [blocks, current],
  );
  const {pages, pageOf} = useMemo(() => paginate(blocks), [blocks]);

  const renderItem = useCallback<ListRenderItem<ScriptBlock>>(
    ({item}) => <BlockField block={item} handlers={handlers} />,
    [handlers],
  );

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.screen}>
      <View style={[styles.header, {paddingTop: insets.top + 8}]}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <Text style={styles.meta}>
          {current ? `${elementLabel(current.type)} · page ${pageOf.get(current.id) ?? 1} of ${pages}` : `${pages} pages · ${blocks.length} blocks`}
        </Text>
      </View>
      <FlatList
        ref={list}
        data={blocks}
        keyExtractor={block => block.id}
        renderItem={renderItem}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.page, {paddingBottom: focused ? 48 : insets.bottom + 48}]}
        initialNumToRender={40}
        maxToRenderPerBatch={30}
        windowSize={15}
        scrollEventThrottle={16}
        onScroll={event => { viewport.current.offset = event.nativeEvent.contentOffset.y; }}
        onLayout={event => {
          viewport.current.height = event.nativeEvent.layout.height;
          // the list shrinks when the keyboard comes up: keep the caret's line in view
          if (focusedRef.current) reveal(focusedRef.current);
        }}
        onScrollToIndexFailed={info => {
          list.current?.scrollToOffset({offset: info.averageItemLength * info.index, animated: false});
        }}
      />
      {current && (
        <ElementBar
          type={current.type}
          suggestions={suggestions}
          onTab={() => onBlock(cycleType)}
          onPick={(to: ElementType) => onBlock((blocks, index, caret) => setType(blocks, index, to, caret))}
          onSuggestion={name => onBlock((blocks, index) => {
            // pick the cue and go straight on to its dialogue
            const named = type(blocks, index, name).blocks;
            return enter(named, index, name.length);
          })}
          onDone={() => Keyboard.dismiss()}
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colours.paper},
  header: {
    paddingHorizontal: 16, paddingBottom: 8, backgroundColor: colours.paper,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colours.hair,
  },
  title: {fontSize: 17, fontWeight: "600", color: colours.ink},
  meta: {fontSize: 14, color: colours.muted, marginTop: 2},
  page: {paddingHorizontal: 20, paddingTop: 12},
});
