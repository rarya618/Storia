import { Folder, Project } from "../datatypes/Block";
import Document from "../datatypes/Document";
import { User } from "../datatypes/User";

// What this tab has last seen of the writer's folders, projects and documents.
// A screen starts from it, so it draws its content on its first frame instead
// of an empty page, and its live subscription then brings it up to date. It
// lives only in memory: logging out reloads the page, which clears it.
const seen = new Map<string, unknown>();

const recall = <T>(key: string) => seen.get(key) as T | undefined;
const remember = <T>(key: string, value: T) => { seen.set(key, value); };

const userId = () => sessionStorage.getItem("User ID") ?? "";

// the signed-in writer's profile, for home's greeting and the rail's account
export const rememberUser = (user: User) => remember("user:" + userId(), user);
export const seenUser = () => recall<User>("user:" + userId());

// home's lists, which the other screens can also read from
export const rememberHome = (folders?: Folder[], projects?: Project[]) => {
  if (folders) remember("folders:" + userId(), folders);
  if (projects) remember("projects:" + userId(), projects);
};
export const seenHomeFolders = () => recall<Folder[]>("folders:" + userId());
export const seenHomeProjects = () => recall<Project[]>("projects:" + userId());

export const rememberFolder = (folder: Folder) => remember("folder:" + folder.id, folder);
export const seenFolder = (id: string) =>
  recall<Folder>("folder:" + id) ?? seenHomeFolders()?.find(folder => folder.id === id);

export const rememberProjectsIn = (folderId: string, projects: Project[]) => remember("projectsIn:" + folderId, projects);
export const seenProjectsIn = (folderId: string) =>
  recall<Project[]>("projectsIn:" + folderId) ?? seenHomeProjects()?.filter(project => project.folderId === folderId);

export const rememberProject = (project: Project) => remember("project:" + project.id, project);
export const seenProject = (id: string) =>
  recall<Project>("project:" + id) ?? seenHomeProjects()?.find(project => project.id === id);

export const rememberDocument = (doc: Document) => remember("document:" + doc.id, doc);
export const seenDocument = (id: string) => recall<Document>("document:" + id);
// after a save, so the project's shelf opens on the new text, not the old
export const rememberContent = (id: string, content: Document["content"]) => {
  const doc = seenDocument(id);
  if (doc) rememberDocument({...doc, content});
};
