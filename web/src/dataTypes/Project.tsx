export type Project = {
	name: string,
	public: boolean,
	files: string[],
	users: string[],
	time?: any
}

export type ProjectWithId = {
	id: string,
	name: string,
	public: boolean,
	files: string[],
	users: string[],
	time?: any
}

export type StringOrProjectWithId = (string | ProjectWithId);