import { useEffect } from "react";

// set page title
export function useTitle(title: string) {
	useEffect(() => {
		const prevTitle = document.title;

		document.title = setTitleForBrowser(title);
		
		return () => {
			document.title = prevTitle
		}
	})
}

// set title from browser
export function setTitleForBrowser(title: string) {
    return title + " – Storia";
}