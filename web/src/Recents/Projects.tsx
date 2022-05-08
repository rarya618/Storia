import { collection } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { ClipLoader } from 'react-spinners';
import { db, getDocs, query, where } from "../firebase/config";
import { ProjectWithId } from "./popups/NewProject";
import RecentProject from "./RecentProject";

type Props = { 
	color: string; 
	isDarkTheme: boolean;
	mode: string;
};

// get files from db
function GetProjects(userId: string) {
    const [projects, setProjects] = useState<ProjectWithId[]>([]);

    async function getProjects() {
		const filesRef = collection(db, 'projects');
		const q = query(filesRef, where("users", "array-contains", userId));

		await getDocs(q).then((querySnapshot) => {
            const tempDoc = querySnapshot.docs.map((doc) => {
				// @ts-ignore
				const file: ProjectWithId = {id: doc.id, ...doc.data()};

				return file;
            })

			setProjects(tempDoc);
        })


    }

    useEffect(() => {
        getProjects();
    }, [])

    return projects;
}

const Recent = (props: Props) => {
	const userId = sessionStorage.getItem("userId");
	let filesFromDB: ProjectWithId[] = [];
	const [timedOut, toggleTimedout] = useState(false);

	if (userId) {
		filesFromDB = GetProjects(userId);
		setTimeout(() => {
			toggleTimedout(!timedOut);
		}, 5000);

		if (filesFromDB.length === 0) {
			if (timedOut) {
				return (<h1 className={"heading small " + props.color + "-color"}>No documents found...</h1>)
			}
			return (<div style={{
				width: "100%",
				height: "calc(100% - 55px)",
				display: "flex",
				justifyContent: "center",
				alignItems: "center"
			}}>
				<ClipLoader color="#6166B3" />
			</div>)
		}
	}

	return (
		<div className="row mob-col wrap">
			{filesFromDB.map((file) => {
				if (file.name) {
					return <RecentProject file={file} classCode={props.color} isDarkTheme={props.isDarkTheme} />
				}
			})}
		</div>
	);
}

export default Recent;