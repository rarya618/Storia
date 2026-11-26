import ConfirmDelete from "../../components/ConfirmDelete";

// Delete document: the last step, from the editor's menu and the project shelf.
// onConfirm deletes it (and leaves, or closes); a failure stays in the dialog
const DeleteDocument = ({name, onConfirm, onClose}: {name: string, onConfirm: () => Promise<void>, onClose: () => void}) => (
  <ConfirmDelete
    noun="document"
    name={name}
    message="The document and everything written in it go for good. This can't be undone. Later drafts move up a colour."
    onConfirm={onConfirm}
    onCancel={onClose}
  />
);

export default DeleteDocument;
