import { logout } from "../login/SignIn";
import { Item } from "../objects/Dropdown";

export const divider = {id: "divider"};
const DarkMode = (darkTheme: boolean, toggle: (arg0: boolean) => void) => {
    if (darkTheme)
        return {
            id: "dark", 
            display: "Light Mode", 
            onClick: toggle
        }

    return {
        id: "dark", 
        display: "Dark Mode", 
        onClick: toggle
    }
}

const biggerText: Item = {id: "bigger-text", display: "Bigger Text"};
const fullWidth: Item = {id: "full-width", display: "Full Width"};

const signOut: Item = {id: "sign-out", display: "Sign out", onClick: logout};

const userId = sessionStorage.getItem("userId");

// writer dot dropdown
export function writerDotDropdown(isDarkTheme: boolean, toggleDarkMode: (arg0: boolean) => void): Item[] {
    return [
        {id: "copy", display: "Create a Copy"},
        {id: "bookmark", display: "Bookmark"},
        {id: "delete", display: "Delete"},
        divider,
        // DarkMode(isDarkTheme, toggleDarkMode),
        biggerText,
        fullWidth,
        divider,
        {id: "versions", display: "Versions"},
        {id: "comments", display: "Comments"},
        {id: "stats", display: "Statistics"},
        {id: "details", display: "Project Details"},
        divider,
        {id: "account", display: "Account"},
        {id: "resources", display: "Resources"},
        divider,
        signOut
    ]
}

// recents dot dropdown
export function recentsDotDropdown(isDarkTheme: boolean, toggleDarkMode: (arg0: boolean) => void): Item[] {
    return [
        {id: "bookmarks", display: "Bookmarks"},
        {id: "delete", display: "Deleted"},
        divider,
        // DarkMode(isDarkTheme, toggleDarkMode),
        biggerText,
        fullWidth,
        divider,
        {id: "comments", display: "Comments"},
        {id: "stats", display: "Statistics"},
        divider,
        {id: "account", display: "Account"},
        {id: "resources", display: "Resources"},
        divider,
        signOut
    ]
}

// recents dot dropdown
export function projectDotDropdown(): Item[] {
    return [
        {id: "statistics", display: "Statistics"},
        {id: "project-info", display: "Project Info"},
        divider,
        {id: "share", display: "Share"},
        {id: "bookmark", display: "Bookmark"},
        divider,
        {id: "rename", display: "Rename"},
        {id: "delete", display: "Delete"},
    ]
}