import { Project } from "@storia/core/datatypes/Block";
import { deleteProject, updateProjectDetails } from "../../firebase/database";
import ConfirmDelete from "../../components/ConfirmDelete";
import EditDetails from "./EditDetails";
import FolderField from "./FolderField";

// Edit project: name, description and folder. Opened from the project page,
// the folder page and home
export const EditProject = ({project, onClose}: {project: Project, onClose: () => void}) => (
  <EditDetails
    kind="project"
    details={{name: project.name, description: project.description ?? ""}}
    onSave={(details, form) => updateProjectDetails(
      {id: project.id, type: project.type, folderId: project.folderId},
      {...details, folderId: form.folderId || undefined},
    )}
    onClose={onClose}
  >
    <FolderField current={project.folderId} />
  </EditDetails>
);

type DeleteProjectProps = {
  project: Project,
  onClose: () => void,
  // around the delete, for a page that shows this project and has to leave it
  onDeleting?: () => void,
  onDeleteFailed?: () => void,
  onDeleted?: () => void,
};

// Delete project: takes the project's documents and board with it
export const DeleteProject = ({project, onClose, onDeleting, onDeleteFailed, onDeleted}: DeleteProjectProps) => {
  const documents = Object.keys(project.documents ?? {}).length;
  return (
    <ConfirmDelete
      noun="project"
      name={project.name}
      message={(documents === 0 ? "The project goes" : documents === 1 ? "The project and its document go" : "The project and its " + documents + " documents go") + " for good. This can't be undone."}
      onConfirm={async () => {
        onDeleting?.();
        try {
          await deleteProject({id: project.id, folderId: project.folderId, documents: project.documents});
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
