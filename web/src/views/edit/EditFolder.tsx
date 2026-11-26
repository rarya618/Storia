import { Folder, Project } from "@storia/core/datatypes/Block";
import { deleteFolder, updateFolderDetails } from "../../firebase/database";
import ConfirmDelete from "../../components/ConfirmDelete";
import EditDetails from "./EditDetails";

const plural = (count: number, one: string, many: string) => count + " " + (count === 1 ? one : many);

// Edit folder: name and description. Opened from the folder page and home
export const EditFolder = ({folder, onClose}: {folder: Folder, onClose: () => void}) => (
  <EditDetails
    kind="folder"
    details={{name: folder.name, description: folder.description ?? ""}}
    onSave={details => updateFolderDetails(folder.id, details)}
    onClose={onClose}
  />
);

type DeleteFolderProps = {
  folder: Folder,
  // the projects that name this folder
  projects: Project[],
  onClose: () => void,
  // around the delete, for a page that shows this folder and has to leave it
  onDeleting?: () => void,
  onDeleteFailed?: () => void,
  onDeleted?: () => void,
};

// Delete folder: keeps the folder's projects (moving them to no folder) unless
// the writer ticks the box to take them, and their documents, too
export const DeleteFolder = ({folder, projects, onClose, onDeleting, onDeleteFailed, onDeleted}: DeleteFolderProps) => {
  const documents = projects.reduce((total, project) => total + Object.keys(project.documents ?? {}).length, 0);
  return (
    <ConfirmDelete
      noun="folder"
      name={folder.name}
      message={projects.length === 0
        ? "The folder goes for good. This can't be undone."
        : "The folder goes for good. " + (projects.length === 1 ? "Its project stays" : "Its " + projects.length + " projects stay") + ", under Projects with no folder. This can't be undone."}
      option={projects.length === 0 ? undefined : {
        label: "Also delete " + (projects.length === 1 ? "its project" : "its " + projects.length + " projects") + (documents === 0 ? "" : " and " + (projects.length === 1 ? "its " : "their ") + plural(documents, "document", "documents")),
        confirmLabel: "Delete folder and " + (projects.length === 1 ? "project" : "projects"),
      }}
      onConfirm={async withProjects => {
        onDeleting?.();
        try {
          await deleteFolder(folder.id, projects, withProjects);
        } catch (error) {
          onDeleteFailed?.();
          throw error;
        }
        onClose();
        onDeleted?.();
      }}
      onCancel={onClose}
    />
  );
};
