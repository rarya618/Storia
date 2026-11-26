import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ELEMENTS, ElementType } from "@screenplay/types";
import { colours } from "./theme";

// The bar above the keyboard, which stands in for the keys a phone doesn't
// have: Tab, the element picker (Cmd+1–0 on the web), and the cue suggestions
// the web editor shows under a character line. Its taps keep the keyboard up.

type Props = {
  type: ElementType,
  suggestions: string[],
  onTab: () => void,
  onPick: (type: ElementType) => void,
  onSuggestion: (name: string) => void,
  onDone: () => void,
};

export function ElementBar({type, suggestions, onTab, onPick, onSuggestion, onDone}: Props) {
  return (
    <View style={styles.bar}>
      {suggestions.length > 0 && (
        <ScrollView horizontal keyboardShouldPersistTaps="always" showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.row}>
          {suggestions.map(name => (
            <Pressable key={name} onPress={() => onSuggestion(name)} style={styles.suggestion}
              accessibilityRole="button" accessibilityLabel={`Cue ${name}`}>
              <Text style={styles.suggestionText}>{name}</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
      <View style={styles.controls}>
        <Pressable onPress={onTab} style={styles.tab} accessibilityRole="button" accessibilityLabel="Next element">
          <Text style={styles.tabText}>Tab</Text>
        </Pressable>
        <ScrollView horizontal keyboardShouldPersistTaps="always" showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.row} style={styles.elements}>
          {ELEMENTS.map(element => {
            const current = element.type === type;
            return (
              <Pressable key={element.type} onPress={() => onPick(element.type)}
                style={[styles.chip, current && styles.chipCurrent]}
                accessibilityRole="button" accessibilityState={{selected: current}}>
                <Text style={[styles.chipText, current && styles.chipTextCurrent]}>{element.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
        <Pressable onPress={onDone} style={styles.done} accessibilityRole="button" accessibilityLabel="Hide keyboard">
          <Text style={styles.doneText}>Done</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colours.rail,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colours.hair,
    paddingVertical: 6,
    gap: 6,
  },
  row: {gap: 6, paddingHorizontal: 8, alignItems: "center"},
  controls: {flexDirection: "row", alignItems: "center"},
  elements: {flex: 1},
  tab: {
    marginLeft: 8, paddingHorizontal: 12, minHeight: 36, justifyContent: "center",
    borderRadius: 8, backgroundColor: colours.ink,
  },
  tabText: {color: colours.paper, fontSize: 15, fontWeight: "600"},
  chip: {
    paddingHorizontal: 12, minHeight: 36, justifyContent: "center", borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth, borderColor: colours.hair, backgroundColor: colours.paper,
  },
  chipCurrent: {borderColor: colours.ink, borderWidth: 1.5},
  chipText: {color: colours.muted, fontSize: 15},
  chipTextCurrent: {color: colours.ink, fontWeight: "600"},
  suggestion: {paddingHorizontal: 12, minHeight: 32, justifyContent: "center", borderRadius: 16, backgroundColor: colours.wash},
  suggestionText: {color: colours.ink, fontSize: 15, fontWeight: "600"},
  done: {paddingHorizontal: 12, minHeight: 36, justifyContent: "center", marginRight: 4},
  doneText: {color: colours.ink, fontSize: 15, fontWeight: "600"},
});
