import {Folder, Project} from "../datatypes/Block"
import { getDate } from "./date";

type Block = Project | Folder;

export const sortBlocksByCreatedOn = (blocks: Block[]) => {
  return blocks.sort((a, b) => {
    let date1 = getDate(a.createdOn);
    let date2 = getDate(b.createdOn);

    return date2.valueOf() - date1.valueOf();
  })
}