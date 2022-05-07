import { logout } from "../login/SignIn";
import { Item } from "../objects/Dropdown";

const divider = {id: "divider"};
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
const signOut: Item = {id: "sign-out", display: "Sign out", onClick: logout};

const userId = sessionStorage.getItem("userId");

// writer dot dropdown
export function writerDotDropdown(isDarkTheme: boolean, toggleDarkMode: (arg0: boolean) => void) {
    return [
        {id: "copy", display: "Create a Copy"},
        {id: "bookmark", display: "Bookmark"},
        {id: "delete", display: "Delete"},
        divider,
        // DarkMode(isDarkTheme, toggleDarkMode),
        biggerText,
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
export function recentsDotDropdown(isDarkTheme: boolean, toggleDarkMode: (arg0: boolean) => void) {
    return [
        {id: "bookmarks", display: "Bookmarks"},
        {id: "delete", display: "Deleted"},
        divider,
        // DarkMode(isDarkTheme, toggleDarkMode),
        biggerText,
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
export function documentDotDropdown() {
    return [
        {id: "statistics", display: "Statistics"},
        {id: "doc-info", display: "Document Info"},
        divider,
        {id: "add-to-project", display: "Add to Project"},
        {id: "share", display: "Share"},
        {id: "bookmark", display: "Bookmark"},
        divider,
        {id: "rename", display: "Rename"},
        {id: "delete", display: "Delete"},
    ]
}

// recents dot dropdown
export function projectDotDropdown() {
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