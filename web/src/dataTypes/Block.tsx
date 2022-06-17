export type Card = {
    text: string, 
    title: string,
    groups?: string[]
}

export type StoryBlock = {
    text: string,
    groups?: string[]
}

export type Block = Card | StoryBlock;

// check for groups
export const checkForGroup = (block: Card | StoryBlock, currentGroup: string): boolean => {
    if (block.groups) {
        for (const group of block.groups) {
            if (group === currentGroup) {
                return true;
            }
        }
        return false;
    } else {
        return false;
    }
};