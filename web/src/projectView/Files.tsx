import { collection } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { ClipLoader } from 'react-spinners';
import styled from "styled-components";
import { db, getDocs, query, where } from "../firebase/config";
import { DocumentWithId } from "../Recents/popups/NewFile";
import RecentFile from "../Recents/RecentFile";

type Props = { 
	color: string; 
	isDarkTheme: boolean;
	mode: string;
	list: string[];
};

export const Heading = styled.h1`
	font-weight: 400;
	margin: 5px 0;
	font-size: 26px;
	margin: 0 10px;
	text-align: left;
`;

const Recent = (props: Props) => {
	const userId = sessionStorage.getItem("userId");
    const [files, setFiles] = useState<DocumentWithId[]>([]);
	const fileList = props.list;
	var filesFromDB: DocumentWithId[] = [];

    async function getFiles() {
		const filesRef = collection(db, 'files');
		const q = query(filesRef, where("users", "array-contains", userId));

		await getDocs(q).then((querySnapshot) => {
			console.log(fileList)
            querySnapshot.docs.map((doc) => {
				// @ts-ignore
				const file: DocumentWithId = {id: doc.id, ...doc.data()};

				if (fileList.length > 0) {
					fileList.forEach(fileName => {
						if (file.id === fileName) {
							filesFromDB.push(file);
						}
					})
				}
				return file;
            })
			setFiles(filesFromDB);
        })
    }

    useEffect(() => {
		getFiles();
    }, [fileList])

	const [timedOut, toggleTimedout] = useState(false);

	useEffect(() => {
		setTimeout(() => {
			toggleTimedout(!timedOut);
		}, 4000);
	}, [])

	if (userId) {
		if (files.length === 0) {
			if (timedOut) {
				return (<h1 className={"heading " + props.color + "-color"}>No documents found...</h1>)
			}
			return (<div style={{
				width: "100%",
				height: "100%",
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
			<div className="row mob-col wrap">
				{files.map((file) => {
					if (file.name) {
						if (file.mode === props.mode) {
							return <RecentFile file={file} isDarkTheme={props.isDarkTheme}/>
						}
					}
				})}
			</div>
		</div>
	);
}

export default Recent;