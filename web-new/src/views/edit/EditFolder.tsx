import { Folder, Project } from "@storia/core/datatypes/Block";
import { deleteFolder, updateFolderDetails } from "../../firebase/database";
import EditDetails from "./EditDetails";

const plural = (count: number, one: string, many: string) => count + " " + (count === 1 ? one : many);

type EditFolderProps = {
  folder: Folder,
  // the projects that name this folder
  projects: Project[],
  onClose: () => void,
  // around a delete, for a page that shows this folder and has to leave it
  onDeleting?: () => void,
  onDeleteFailed?: () => void,
  onDeleted?: () => void,
};

// Edit folder: name and description, and Delete, which keeps the folder's
// projects (moving them to no folder) unless the writer ticks the box to take
// them, and their documents, too. Opened from the folder page and home
const EditFolder = ({folder, projects, onClose, onDeleting, onDeleteFailed, onDeleted}: EditFolderProps) => {
  const documents = projects.reduce((total, project) => total + Object.keys(project.documents ?? {}).length, 0);
  return (
    <EditDetails
      kind="folder"
      details={{name: folder.name, description: folder.description ?? ""}}
      onSave={details => updateFolderDetails(folder.id, details)}
      onClose={onClose}
      onDelete={async withProjects => {
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
      deleteMessage={projects.length === 0
        ? "The folder goes for good. This can't be undone."
        : "The folder goes for good. " + (projects.length === 1 ? "Its project stays" : "Its " + projects.length + " projects stay") + ", under Projects with no folder. This can't be undone."}
      deleteOption={projects.length === 0 ? undefined : {
        label: "Also delete " + (projects.length === 1 ? "its project" : "its " + projects.length + " projects") + (documents === 0 ? "" : " and " + (projects.length === 1 ? "its " : "their ") + plural(documents, "document", "documents")),
        confirmLabel: "Delete folder and " + (projects.length === 1 ? "project" : "projects"),
      }}
    />
  );
};

export default EditFolder;
