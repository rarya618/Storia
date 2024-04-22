export type Project = {
	id: string,
	name: string,
	description: string,
	isPublic: boolean,
	owner: string,
	documents?: string[],
	guests?: string[],
	time?: any
}