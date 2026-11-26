import { memo } from "react";
import {
  StyleSheet, TextInput, TextInputInstance,
  TextInputKeyPressEvent, TextInputSelectionChangeEvent,
} from "react-native";
import { ScriptBlock, elementLabel, inCapitals } from "@storia/core/screenplay/types";
import { colours, script } from "@/world/theme";

// One block of the script, as its own native text field, so typing, selection,
// autocorrect and dictation are the platform's own within a line. Enter and
// Backspace at its start are handed up, to move between fields.

export type FieldHandlers = {
  register: (id: string, input: TextInputInstance | null) => void,
  onText: (id: string, text: string) => void,
  onEnter: (id: string) => void,
  onBackspace: (id: string) => void,
  onSelection: (id: string, start: number, end: number) => void,
  onFocus: (id: string) => void,
  onGrow: (id: string) => void,
};

type Props = {block: ScriptBlock, handlers: FieldHandlers};

export const BlockField = memo(function BlockField({block, handlers}: Props) {
  // the keyboard starts in capitals there, and autocorrect, which only gets them wrong, is off
  const capitals = inCapitals(block.type);
  return (
    <TextInput
      ref={input => handlers.register(block.id, input)}
      value={block.text}
      placeholder={elementLabel(block.type)}
      placeholderTextColor={colours.muted}
      selectionColor={colours.ink}
      multiline
      scrollEnabled={false}
      submitBehavior="submit"
      autoCapitalize={capitals ? "characters" : "sentences"}
      autoCorrect={!capitals}
      spellCheck={!capitals}
      onChangeText={text => handlers.onText(block.id, text)}
      onSubmitEditing={() => handlers.onEnter(block.id)}
      onKeyPress={(event: TextInputKeyPressEvent) => {
        if (event.nativeEvent.key === "Backspace") handlers.onBackspace(block.id);
      }}
      onSelectionChange={(event: TextInputSelectionChangeEvent) => {
        const {start, end} = event.nativeEvent.selection;
        handlers.onSelection(block.id, start, end);
      }}
      onFocus={() => handlers.onFocus(block.id)}
      onContentSizeChange={() => handlers.onGrow(block.id)}
      style={[styles.field, styles[block.type]]}
    />
  );
});

// The page on a phone, as web drafts it under 640px (world.css): Courier
// Prime at 13px, the same element order and spacing as print (a blank line
// before most elements, two before a scene heading or an act), and the indents
// as shares of the screen's width, roomier than print's, so lines wrap sooner
const line = script.lineHeight;
// a note's rule sits 1.5ch into the left margin (Courier's ch is 0.6em)
const ch = script.size * 0.6;

const styles = StyleSheet.create({
  field: {
    fontFamily: script.font,
    fontSize: script.size,
    lineHeight: line,
    color: colours.ink,
    padding: 0,
    paddingVertical: 0,
    textAlignVertical: "top",
  },
  heading: {marginTop: line * 2, fontWeight: "700"},
  action: {marginTop: line},
  character: {marginTop: line, marginLeft: "38%"},
  parenthetical: {marginLeft: "24%", marginRight: "16%"},
  dialogue: {marginLeft: "12%", marginRight: "12%"},
  transition: {marginTop: line, textAlign: "right"},
  shot: {marginTop: line},
  act: {marginTop: line * 2, textAlign: "center", textDecorationLine: "underline"},
  lyrics: {marginLeft: "12%", marginRight: "12%", fontStyle: "italic"},
  // the writer's own, never printed: quiet italic with a rule in the margin
  note: {
    marginTop: line, color: colours.muted, fontStyle: "italic",
    marginLeft: -1.5 * ch - 2, paddingLeft: 1.5 * ch, borderLeftWidth: 2, borderLeftColor: colours.hairStrong,
  },
});
