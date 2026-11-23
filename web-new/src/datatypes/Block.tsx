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
	// summaries keyed by document id, written alongside each document
	documents?: Record<string, BasicBlock>,
	folderId?: string,
	characters?: string[]
}

export interface Folder extends Block {
	// summaries keyed by project id, written alongside each project
	projects?: Record<string, BasicBlock>
}
