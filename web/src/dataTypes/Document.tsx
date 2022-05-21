import { Card, StoryBlock } from "./Block"
import { Group } from "./Group"

export type Document = {
	mode: string,
	name: string,
	public: boolean,
	type: string,
	content: Card[] | StoryBlock[],
	groups?: Group[],
	users: string[],
	time?: any,
	project?: string
}

export type DocumentWithId = {
	id: string,
	mode: string,
	name: string,
	public: boolean,
	type: string,
	content: Card[] | StoryBlock[],
	groups?: Group[],
	users: string[],
	time?: any,
	project?: string
}