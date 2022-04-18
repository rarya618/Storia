import { collection } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { ClipLoader } from 'react-spinners';
import { db, getDocs, query, where } from "../firebase/config";
import { WSFileWithId } from "./NewProject";
import RecentFile from "./RecentFile";

type Props = { 
	color: string; 
	isDarkTheme: boolean;
	mode: string;
};

// get files from db
function GetFiles(userId: string) {
    const [files, setFiles] = useState<WSFileWithId[]>([]);

    async function getFiles() {
		const filesRef = collection(db, 'files');
		const q = query(filesRef, where("users", "array-contains", userId));

		await getDocs(q).then((querySnapshot) => {
            const tempDoc = querySnapshot.docs.map((doc) => {
				// @ts-ignore
				const file: WSFileWithId = {id: doc.id, ...doc.data()};

				return file;
            })

			setFiles(tempDoc);
        })


    }

    useEffect(() => {
        getFiles();
    }, [])

    return files;
}

const Recent = (props: Props) => {
	const userId = sessionStorage.getItem("userId");
	let filesFromDB: WSFileWithId[] = [];

	if (userId) {
		filesFromDB = GetFiles(userId);
	} else {
		return (<div style={{
			width: "100%",
			height: "100vh",
			display: "flex",
			justifyContent: "center",
			alignItems: "center"
		}}>
			<ClipLoader color="#6166B3" />
		</div>)
	}

	return (
		<div className="container">
			<h1 className={"heading small left small-spaced-none " + props.color + "-color"}>Recents</h1>
			<div className="row mob-col wrap">
				{filesFromDB.map((file) => {
					if (file.name) {
						if (file.mode === props.mode) {
							return <RecentFile name={file.name} isDarkTheme={props.isDarkTheme} type={file.type} id={file.id} />
						}
					} else {
						return (<div style={{
							width: "100%",
							height: "100",
							display: "flex",
							justifyContent: "center",
							alignItems: "center"
						}}>
							<ClipLoader color="#6166B3" />
						</div>)
					}
				})}
			</div>
		</div>
	);
}

export default Recent;