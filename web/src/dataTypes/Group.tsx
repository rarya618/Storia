export type Group = {
    id: string,
    name: string,
}

// get group name
export const getGroupName = (groupId: string, groups: Group[]): string => {
    for (const group of groups) {
        if (group.id === groupId) {
            return group.name;
        }
    }

    return "";
};