import { collection } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { ClipLoader } from 'react-spinners';
import styled from "styled-components";
import { db, getDocs, query, where } from "../firebase/config";
import { WSFileWithId } from "./popups/NewFile";
import RecentFile from "./RecentFile";

type Props = { 
	color: string; 
	isDarkTheme: boolean;
	mode: string;
};

export const Heading = styled.h1`
	font-weight: 400;
	margin: 5px 0;
	font-size: 26px;
	margin: 0 10px;
	text-align: left;
`;

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

		if (filesFromDB.length === 0) {
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
	}

	return (
		<div className="container">
			<Heading className={props.color + "-color"}>My Documents</Heading>
			<div className="row mob-col wrap">
				{filesFromDB.map((file) => {
					if (file.name) {
						if (file.mode === props.mode) {
							return <RecentFile file={file} isDarkTheme={props.isDarkTheme}/>
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