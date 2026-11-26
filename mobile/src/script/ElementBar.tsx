import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ELEMENTS, ElementType } from "@storia/core/screenplay/types";
import { colours, fonts, radii, shadows, type } from "@/world/theme";

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
        <Pressable onPress={onTab} style={({pressed}) => [styles.tab, pressed && styles.tabPressed]} accessibilityRole="button" accessibilityLabel="Next element">
          <Text style={styles.tabText}>Tab</Text>
        </Pressable>
        <ScrollView horizontal keyboardShouldPersistTaps="always" showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.row} style={styles.elements}>
          {ELEMENTS.map(element => {
            const current = element.type === type;
            return (
              <Pressable key={element.type} onPress={() => onPick(element.type)}
                style={({pressed}) => [styles.chip, pressed && !current && styles.chipPressed, current && styles.chipCurrent]}
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

// the bar is the rail's paper over the keyboard, flat under a hairline; the
// current element is the rail's white slip, as the current row is on the web
const styles = StyleSheet.create({
  bar: {
    backgroundColor: colours.rail,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colours.hair,
    paddingVertical: 6,
    gap: 4,
  },
  row: {gap: 2, paddingHorizontal: 8, alignItems: "center"},
  controls: {flexDirection: "row", alignItems: "center"},
  elements: {flex: 1},
  tab: {
    marginLeft: 8, paddingHorizontal: 14, minHeight: 40, justifyContent: "center",
    borderRadius: radii.control, borderWidth: 1, borderColor: colours.hairStrong, backgroundColor: colours.paper,
  },
  tabPressed: {backgroundColor: colours.tint},
  tabText: type.control,
  chip: {paddingHorizontal: 12, minHeight: 40, justifyContent: "center", borderRadius: radii.row},
  chipPressed: {backgroundColor: colours.railHover},
  chipCurrent: {backgroundColor: colours.paper, ...shadows.slip},
  chipText: {...type.small, fontWeight: "600", color: colours.muted},
  chipTextCurrent: {fontWeight: "700", color: colours.ink},
  // a cue, as the script will print it
  suggestion: {
    paddingHorizontal: 12, minHeight: 36, justifyContent: "center", borderRadius: radii.control,
    borderWidth: 1, borderColor: colours.hair, backgroundColor: colours.paper,
  },
  suggestionText: {fontFamily: fonts.script, fontSize: 14, color: colours.ink, textTransform: "uppercase"},
  done: {paddingHorizontal: 12, minHeight: 44, justifyContent: "center", marginRight: 4},
  doneText: type.control,
});
