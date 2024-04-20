export type Project = {
	id: string,
	name: string,
	description: string,
	public: boolean,
	documents: string[],
	users: string[],
	time?: any
}