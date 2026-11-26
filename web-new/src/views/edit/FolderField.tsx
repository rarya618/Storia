import { useEffect, useState } from "react";
import { get } from "firebase/database";
import { Folder } from "@storia/core/datatypes/Block";
import { getFoldersQueryForOwner } from "../../firebase/database";
import { seenHomeFolders } from "../../misc/seen";

// which folder a project sits in, as a select named folderId ("" for none).
// It starts from the folders the rail already knows, then reads them fresh
const FolderField = ({current}: {current?: string}) => {
  const [folders, setFolders] = useState<Folder[] | undefined>(seenHomeFolders);
  const [value, setValue] = useState(current ?? "");

  useEffect(() => {
    const userId = sessionStorage.getItem("User ID") ?? "";
    const foldersQuery = getFoldersQueryForOwner(userId);
    if (!foldersQuery) return;
    let gone = false;
    get(foldersQuery).then(snapshot => {
      if (gone) return;
      const found: Folder[] = [];
      snapshot.forEach(child => { found.push({id: child.key, ...child.val()}); });
      setFolders(found);
    }).catch(() => {});
    return () => { gone = true; };
  }, []);

  const sorted = [...(folders ?? [])].sort((a, b) => a.name.localeCompare(b.name));
  // the project's own folder stays choosable even before the list arrives
  const missing = current && !sorted.some(folder => folder.id === current);

  return (
    <div>
      <label htmlFor="create-folderId" className="sw-label mb-1.5 block">Folder</label>
      <select id="create-folderId" name="folderId" value={value} onChange={event => setValue(event.target.value)} className="sw-select w-full !h-10">
        <option value="">No folder</option>
        {missing && <option value={current}>Current folder</option>}
        {sorted.map(folder => <option key={folder.id} value={folder.id}>{folder.name}</option>)}
      </select>
    </div>
  );
};

export default FolderField;
