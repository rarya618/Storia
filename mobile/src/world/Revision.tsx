import { StyleSheet, View } from "react-native";
import { Revision } from "@storia/core/screenplay/revisions";
import { radii } from "./theme";

// A draft's revision colour shows only as paper (the Revision Paper Rule).
// The script's bar names its place in words, since no bar carries a chip.

// a small page on the draft's paper, as in the web's revision strip
export function RevisionPage({revision}: {revision?: Revision}) {
  return <View style={[styles.page, revision && {backgroundColor: revision.color, borderColor: revision.edge}]} />;
}

const styles = StyleSheet.create({
  page: {width: 18, height: 26, borderRadius: radii.strip, borderWidth: 1, borderColor: "#D9D4CB", backgroundColor: "#FFFFFF"},
});
