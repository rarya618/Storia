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
import { Document } from "../../Recents/popups/NewFile";

export type Card = {
    text: string, 
    title: string
}

export type PageProps = { 
    isDarkTheme: boolean, 
    switchTheme: (arg0: boolean) => void
}

export const Loading = () => {
    return (
        <div className="page-view" style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
        }}>
            <HashLoader color="#6166B3" />
        </div>
    )
}

const Page = (props: PageProps) => {
    // sidebar status
    const [hideSidebar, setHideSidebar] = useState(true);

    // show popup
    const [showPopup, setShowPopup] = useState(false);

    // server status
    var connectionStatus = "Connecting";

    // get details from params
    let { documentId } = useParams<string>();

    let docId = documentId ? documentId : "";

    // initialise file data
    // @ts-ignore
    const [fileData, setData] = useState<Document>({});

    async function getFileData() {
        const docRef = db.collection('files').doc(docId);

        // @ts-ignore
        const tempDoc: Document = (await getDoc(docRef)).data();
        
        if (tempDoc) {
            setData(tempDoc);
        }
    }

    // call function
    useEffect(() => {
        getFileData();
    }, [])

    // set page color scheme
    const color = getClassCode("ideate", props.isDarkTheme);

    // create page title
    let title = fileData.name ? fileData.name : "";

    // @ts-ignore
    if (fileData.name) {
        connectionStatus = "Online";
    }

    // set title
    useTitle(setTitleForBrowser(title));

    var darkTheme = getClassCode("", props.isDarkTheme);

    return (
        <div className={"full-screen row"}>
            {/* <Sidebar elements ={elements} setElements={setElements} color={color} hide={hideSidebar} /> */}
            
            <div className={"main-view fill-space " + darkTheme}>
                <TitleBar 
                    title={title}
                    status={connectionStatus}
                    color={color}
                    isDarkTheme={props.isDarkTheme}
                    hideSidebar={hideSidebar}
                    setHideSidebar={setHideSidebar}
                    switchTheme={props.switchTheme}
                />
                {
                    fileData.name ? (
                    <div className={"page-view"}>
                        <div className="full-fixed">
                            <div className={"row flex-space-between cards-menu " + darkTheme}>
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
                        </div>
                        
                        <div className="row cards-container">
                            {fileData.content.map((data: Card, index: number) => {
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
                    <Loading />
                )}
                
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
                    file={fileData}
                    updateFile={async () => {
                        await getFileData();
                    }}
                /> : null}
            </div>
        </div>
    )
}

export default Page;