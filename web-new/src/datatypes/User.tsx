export type User = {
	id: string,
	firstName: string,
	lastName: string,
	plan: string,
	email: string,
	projects?: string[],
	documents?: string[],
	favourites?: string[],
}