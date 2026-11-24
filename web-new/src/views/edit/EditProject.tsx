import { Project } from "../../datatypes/Block";
import { deleteProject, updateProjectDetails } from "../../firebase/database";
import EditDetails from "./EditDetails";
import FolderField from "./FolderField";

type EditProjectProps = {
  project: Project,
  onClose: () => void,
  // around a delete, for a page that shows this project and has to leave it
  onDeleting?: () => void,
  onDeleteFailed?: () => void,
  onDeleted?: () => void,
};

// Edit project: name, description and folder, and Delete, which takes the
// project's documents with it. Opened from the project page and the folder page
const EditProject = ({project, onClose, onDeleting, onDeleteFailed, onDeleted}: EditProjectProps) => {
  const documents = Object.keys(project.documents ?? {}).length;
  return (
    <EditDetails
      kind="project"
      details={{name: project.name, description: project.description ?? ""}}
      onSave={(details, form) => updateProjectDetails(
        {id: project.id, type: project.type, folderId: project.folderId},
        {...details, folderId: form.folderId || undefined},
      )}
      onClose={onClose}
      onDelete={async () => {
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
      deleteMessage={(documents === 0 ? "The project goes" : documents === 1 ? "The project and its document go" : "The project and its " + documents + " documents go") + " for good. This can't be undone."}
    >
      <FolderField current={project.folderId} />
    </EditDetails>
  );
};

export default EditProject;
