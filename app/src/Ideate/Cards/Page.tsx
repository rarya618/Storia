import { useParams } from "react-router-dom";
import React, {useState, useEffect} from 'react';
import { HashLoader } from 'react-spinners';

import { getClassCode, useTitle } from "../../App";
import { setTitleForBrowser } from "../../resources/title";
import { db, getDoc } from "../../firebase/config";
import TitleBar from "./TitleBar";
import BottomBar from "./BottomBar";
import Block from "./Block";

// import fs from "fs";
// import xml2js from "xml2js";

// get file from server
function GetFileData(fileId: string) {
    // initialise file data
    const [data, setData] = useState({});

    async function getFileData() {
        const docRef = db.collection('files').doc(fileId);
        const tempDoc = (await getDoc(docRef)).data();
        console.log(tempDoc);
        if (tempDoc)
            setData(tempDoc);
    }

    // call function
    useEffect(() => {
        getFileData();
    }, [])

    return data;
}

type Props = { 
    isDarkTheme: boolean, 
    switchTheme: (arg0: boolean) => void
}

const Page = (props: Props) => {
    // sidebar status
    const [hideSidebar, setHideSidebar] = useState(true);

    // server status
    var connectionStatus = "Connecting";

    // get details from params
    let { documentId } = useParams<string>();

    // @ts-ignore
    const fileData = GetFileData(documentId);

    // set page color scheme
    const color = getClassCode("ideate", props.isDarkTheme);

    // create page title
    // @ts-ignore
    let title = fileData.name ? fileData.name : "";

    // @ts-ignore
    if (fileData.name) {
        connectionStatus = "Online";
    }

    // set title
    useTitle(setTitleForBrowser(title));

    return (
        <div className={"full-screen row"}>
            {/* <Sidebar elements ={elements} setElements={setElements} color={color} hide={hideSidebar} /> */}
            
            <div className={"main-view fill-space " + getClassCode("", props.isDarkTheme)}>
                <TitleBar 
                    title={title}
                    status={connectionStatus}
                    color={color}
                    isDarkTheme={props.isDarkTheme}
                    hideSidebar={hideSidebar}
                    setHideSidebar={setHideSidebar}
                    switchTheme={props.switchTheme}
                />

                <div className={"page-view"}>
                    <div className="row cards-container">{
                        // @ts-ignore
                        fileData.name ? (
                            // @ts-ignore
                            fileData.content.map((data, index) => {
                                return (
                                    <Block 
                                        color={color} 
                                        isDarkTheme={props.isDarkTheme} 
                                        title={data.title} 
                                        text={data.text} 
                                        count={index + 1}
                                    />
                                )
                            })
                        ) : (<div className="page-view" style={{
                                width: "100%",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center"
                            }}>
                                <HashLoader color="#6166B3" />
                            </div>)
                    }</div>
                </div>

                <BottomBar 
                    color={color}
                    isDarkTheme={props.isDarkTheme}
                    switchTheme={props.switchTheme}
                />
            </div>
        </div>
    )
}

export default Page;