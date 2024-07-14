import Document from "./Document"
import Guest from "./Guest"

export type BasicBlock = {
	id: string,
	name: string,
	type: string
  }

interface Block extends BasicBlock {
	description: string,
	isPublic: boolean,
	owner: string,
	createdOn: string,
	lastOpened?: string,
	lastUpdated?: string,
	guests?: Guest[]
}

export interface Project extends Block {
	documents?: Document[],
	folderId?: string,
	characters?: string[]
}

export interface Folder extends Block {
	projects?: {}
}
