import { ScriptBlock } from "../screenplay/types";

type Document = {
	id: string,
	name: string,
	description: string,
	isPublic: boolean,
	owner: string,
	projectId?: string,
	createdOn?: string,
	lastUpdated?: string,
	content?: ScriptBlock[],
}

export default Document;
