import { memo } from "react";
import {
  StyleSheet, TextInput, TextInputInstance,
  TextInputKeyPressEvent, TextInputSelectionChangeEvent,
} from "react-native";
import { ElementType, ScriptBlock, elementLabel } from "@screenplay/types";
import { colours, script } from "./theme";

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

// elements written in capitals, which autocorrect only gets wrong
const CAPITALS: ElementType[] = ["heading", "character", "transition", "shot", "act"];

type Props = {block: ScriptBlock, handlers: FieldHandlers};

export const BlockField = memo(function BlockField({block, handlers}: Props) {
  const capitals = CAPITALS.includes(block.type);
  return (
    <TextInput
      ref={input => handlers.register(block.id, input)}
      value={block.text}
      placeholder={elementLabel(block.type)}
      placeholderTextColor={colours.faint}
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

// The page on a phone: the same element order and spacing as print, with the
// indents as shares of the screen's width (print's 60-character line), at a size
// you can write at, so lines wrap sooner than they would on paper
const styles = StyleSheet.create({
  field: {
    fontFamily: script.font,
    fontSize: script.size,
    lineHeight: script.lineHeight,
    color: colours.ink,
    padding: 0,
    paddingVertical: 2,
    textAlignVertical: "top",
  },
  heading: {marginTop: script.lineHeight * 1.5, fontWeight: "700"},
  action: {marginTop: script.lineHeight * 0.75},
  character: {marginTop: script.lineHeight * 0.75, marginLeft: "37%"},
  parenthetical: {marginLeft: "27%", marginRight: "20%"},
  dialogue: {marginLeft: "17%", marginRight: "12%"},
  transition: {marginTop: script.lineHeight * 0.75, textAlign: "right"},
  shot: {marginTop: script.lineHeight * 0.75},
  act: {marginTop: script.lineHeight * 1.5, textAlign: "center", textDecorationLine: "underline"},
  lyrics: {marginLeft: "17%", marginRight: "12%", fontStyle: "italic"},
  note: {
    marginTop: script.lineHeight * 0.5, color: colours.muted, fontStyle: "italic",
    backgroundColor: colours.wash, paddingHorizontal: 6, borderRadius: 4,
  },
});
