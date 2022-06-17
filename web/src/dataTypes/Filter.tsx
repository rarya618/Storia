export type Filter = {
    type: string,
    value: string
}

export const filterGen = (type: string, value: string): Filter => {
    return {type: type, value: value}
}

export const groupFilterGen = (value: string): Filter => {
    return {type: 'groups', value: value}
}

export const characterFilterGen = (value: string): Filter => {
    return {type: 'characters', value: value}
}

export const defaultGroup = filterGen('groups', 'view-all');
export const defaultCharacter = filterGen('characters', 'view-all');