import { useParams } from "react-router-dom";
import React, {useState, useEffect} from 'react';
import { HashLoader } from 'react-spinners';

import { getClassCode, useTitle } from "../../App";
import { setTitleForBrowser } from "../../resources/title";
import { db, getDoc } from "../../firebase/config";
import TitleBar from "./TitleBar";
import BottomBar from "./BottomBar";
import Block from "./Block";
import NewBlock from "./popups/NewBlock";

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

export type Card = {
    text: string, 
    title: string
}

type Props = { 
    isDarkTheme: boolean, 
    switchTheme: (arg0: boolean) => void
}

const Page = (props: Props) => {
    // sidebar status
    const [hideSidebar, setHideSidebar] = useState(true);

    // show popup
    const [showPopup, setShowPopup] = useState(false);

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
                {// @ts-ignore
                    fileData.name ? (
                    <div className={"page-view"}>
                        <div className="row flex-space-between cards-container">
                            <div></div>
                            <button 
                                className={
                                    "button " + color + 
                                    " small-spaced-none white-color standard round-5px"
                                }
                                onClick={() => setShowPopup(true)}
                            >
                                New
                            </button>
                        </div>
                        
                        <div className="row cards-container">
                            {// @ts-ignore
                            fileData.content.map((data: Card, index: number) => {
                                return (
                                    <Block 
                                        color={color} 
                                        isDarkTheme={props.isDarkTheme} 
                                        title={data.title} 
                                        text={data.text} 
                                        count={index + 1}
                                    />
                                )
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="page-view" style={{
                        width: "100%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center"
                    }}>
                        <HashLoader color="#6166B3" />
                    </div>
                )})
                
                <BottomBar 
                    color={color}
                    isDarkTheme={props.isDarkTheme}
                    switchTheme={props.switchTheme}
                />
                {showPopup ? <NewBlock 
                    color={color} 
                    isDarkTheme={props.isDarkTheme}
                    id={documentId ? documentId : ''} 
                    closePopup={() => setShowPopup(false)}
                    content={
                        // @ts-ignore
                        fileData.content
                    } 
                /> : null}
            </div>
        </div>
    )
}

export default Page;