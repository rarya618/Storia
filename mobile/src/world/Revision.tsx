import { StyleSheet, Text, View } from "react-native";
import { Revision, ordinal } from "@storia/core/screenplay/revisions";
import { radii, type } from "./theme";

// A draft's revision colour shows only as paper (the Revision Paper Rule):
// a page from the strip, or the chip that names its place in the project.

// a small page on the draft's paper, as in the web's revision strip
export function RevisionPage({revision}: {revision?: Revision}) {
  return <View style={[styles.page, revision && {backgroundColor: revision.color, borderColor: revision.edge}]} />;
}

// "2nd draft" on its paper; only worth showing when the project holds more than one
export function RevisionChip({revision, index}: {revision: Revision, index: number}) {
  return (
    <View style={[styles.chip, {backgroundColor: revision.color, borderColor: revision.edge}]}
      accessibilityLabel={`${ordinal(index + 1)} draft, ${revision.name} pages`}>
      <Text style={type.control}>{ordinal(index + 1)} draft</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {width: 18, height: 26, borderRadius: radii.strip, borderWidth: 1, borderColor: "#D9D4CB", backgroundColor: "#FFFFFF"},
  chip: {height: 24, paddingHorizontal: 10, borderRadius: radii.full, borderWidth: 1, justifyContent: "center"},
});
