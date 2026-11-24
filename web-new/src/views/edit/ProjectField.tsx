import { useEffect, useState } from "react";
import { get } from "firebase/database";
import { Folder, Project } from "../../datatypes/Block";
import { getFoldersQueryForOwner, getProjectsQueryForOwner } from "../../firebase/database";
import { seenHomeFolders, seenHomeProjects } from "../../misc/seen";

const byName = <T extends {name: string}>(items: T[]) => [...items].sort((a, b) => a.name.localeCompare(b.name));

// which project a document sits in, as a select named projectId, its projects
// grouped under their folders' names, those in no folder last. A document is
// moved into a project, never out of one, so "No project" shows only for an
// older document that already has none. It starts from what the rail
// already knows, then reads the projects and folders fresh
const ProjectField = ({current}: {current?: string}) => {
  const [projects, setProjects] = useState<Project[] | undefined>(seenHomeProjects);
  const [folders, setFolders] = useState<Folder[] | undefined>(seenHomeFolders);
  const [value, setValue] = useState(current ?? "");

  useEffect(() => {
    const userId = sessionStorage.getItem("User ID") ?? "";
    let gone = false;
    const read = <T,>(query: ReturnType<typeof getProjectsQueryForOwner>, set: (items: T[]) => void) => {
      if (!query) return;
      get(query).then(snapshot => {
        if (gone) return;
        const found: T[] = [];
        snapshot.forEach(child => { found.push({id: child.key, ...child.val()} as T); });
        set(found);
      }).catch(() => {});
    };
    read<Project>(getProjectsQueryForOwner(userId), setProjects);
    read<Folder>(getFoldersQueryForOwner(userId), setFolders);
    return () => { gone = true; };
  }, []);

  const all = projects ?? [];
  const groups = [
    ...byName(folders ?? []).map(folder => ({key: folder.id, label: folder.name, projects: byName(all.filter(project => project.folderId === folder.id))})),
    {key: "", label: "No folder", projects: byName(all.filter(project => !project.folderId || !folders?.some(folder => folder.id === project.folderId)))},
  ].filter(group => group.projects.length > 0);
  // the document's own project stays choosable even before the list arrives
  const missing = current && !all.some(project => project.id === current);

  return (
    <div>
      <label htmlFor="create-projectId" className="sw-label mb-1.5 block">Project</label>
      <select id="create-projectId" name="projectId" value={value} onChange={event => setValue(event.target.value)} className="sw-select w-full !h-10">
        {/* an older document in no project keeps that until a project is chosen */}
        {!current && <option value="">No project</option>}
        {missing && <option value={current}>Current project</option>}
        {groups.map(group => (
          <optgroup key={group.key} label={group.label}>
            {group.projects.map(project => <option key={project.id} value={project.id}>{project.name}</option>)}
          </optgroup>
        ))}
      </select>
    </div>
  );
};

export default ProjectField;
