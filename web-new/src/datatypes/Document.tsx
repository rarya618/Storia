import Group from "./Group";
import Guest from "./Guest";
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
	groups?: Group[],
	guests?: Guest[],
}

export default Document;
