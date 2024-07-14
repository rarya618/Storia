import Block from "./StandardBlock";
import Group from "./Group";
import Guest from "./Guest";

type Document = {
	id: string,
	name: string,
	description: string,
	isPublic: boolean,
	owner: string,
	projectId?: string,
	content?: Block[],
	groups?: Group[],
	guests?: Guest[],
	time?: any,
}

export default Document;