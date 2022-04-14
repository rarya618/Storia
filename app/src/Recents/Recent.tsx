import React, { useEffect, useState } from "react";
import { ClipLoader } from 'react-spinners';
import { db } from "../firebase/config";
import RecentFile from "./RecentFile";

type Props = { 
	color: string; 
	isDarkTheme: boolean;
	mode: string;
};

// get files from db
function GetFiles() {
    const [files, setFiles] = useState([{}]);

    async function getFiles() {
        await db.collection('files').get().then((querySnapshot) => {
            const tempDoc = querySnapshot.docs.map((doc) => {
                return {id: doc.id, ...doc.data()}
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
	const filesFromDB = GetFiles();

	return (
		<div className="container">
			<h1 className={"heading small left small-spaced-none " + props.color + "-color"}>Recents</h1>
			<div className="row wrap">
				{filesFromDB.map((file) => {
					// @ts-ignore
					if (file.name) {
						// @ts-ignore
						if (file.mode === props.mode) {
							// @ts-ignore
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