import { useEffect, useState } from "react";
import { onValue } from "firebase/database";
import { Folder, Project } from "@storia/core/datatypes/Block";
import { getBoardRef, getFolderRef, getProjectRef } from "../firebase/database";
import { rememberBoard, rememberFolder, rememberProject, seenBoard, seenFolder, seenProject } from "../misc/seen";
import { toMessage } from "../misc/errors";
import { readBoard } from "@storia/core/board/board";

// what a board screen (the board, or one card's page) needs, live: the
// project, its folder for the breadcrumb, and the board. Each starts from what
// this tab last saw, so the screen usually draws on its first frame. A project
// that has never had a board reads as an empty one
export const useBoardScreen = (projectId: string) => {
  const [project, setProject] = useState(() => seenProject(projectId));
  const [folder, setFolder] = useState(() => { const folderId = seenProject(projectId)?.folderId; return folderId ? seenFolder(folderId) : undefined; });
  const [board, setBoard] = useState(() => seenBoard(projectId));
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState<string>();

  useEffect(() => {
    setProject(seenProject(projectId));
    setNotFound(false);
    setLoadError(undefined);
    const projectRef = getProjectRef(projectId);
    if (!projectRef) return;
    return onValue(projectRef, (snapshot) => {
      if (!snapshot.exists()) return setNotFound(true);
      const found: Project = {id: projectId, ...snapshot.val()};
      rememberProject(found);
      setProject(found);
    }, (error) => setLoadError(toMessage(error)));
  }, [projectId]);

  const folderId = project?.folderId;
  useEffect(() => {
    setFolder(folderId ? seenFolder(folderId) : undefined);
    if (!folderId) return;
    const folderRef = getFolderRef(folderId);
    if (!folderRef) return;
    return onValue(folderRef, (snapshot) => {
      if (!snapshot.exists()) return;
      const found: Folder = {id: folderId, ...snapshot.val()};
      rememberFolder(found);
      setFolder(found);
    }, () => setFolder(undefined));
  }, [folderId]);

  useEffect(() => {
    setBoard(seenBoard(projectId));
    return onValue(getBoardRef(projectId), (snapshot) => {
      const found = readBoard(snapshot.val());
      rememberBoard(projectId, found);
      setBoard(found);
    }, (error) => setLoadError(toMessage(error)));
  }, [projectId]);

  // the trail up from the board: home, the folder if there is one, the project
  const trail = project ? [
    {label: "Home", to: "/home"},
    ...(folder ? [{label: folder.name, to: "/folder/" + folder.id}] : []),
    {label: project.name, to: "/project/" + project.id},
  ] : [];

  return {project, folder, board, setBoard, notFound, loadError, trail};
};
