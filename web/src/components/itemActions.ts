import { MenuAction } from "./ActionMenu";

// what a folder, project or document's dot menu offers: Edit details, then
// Delete apart, so editing never sits beside the way to lose it
export type ItemActions = {onEdit: () => void, onDelete: () => void};
export const itemActions = ({onEdit, onDelete}: ItemActions): MenuAction[] => [
  {label: "Edit details", onSelect: onEdit},
  {label: "Delete", onSelect: onDelete, apart: true},
];
