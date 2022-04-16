import { useParams } from "react-router-dom";
import React, {useState} from 'react';

import { getClassCode, useTitle } from "../../App";
import { setTitleForBrowser } from "../../resources/title";
import TitleBar from "./TitleBar";
import BottomBar from "./BottomBar";
import Block from "./Block";
import NewBlock from "./popups/NewBlock";
import { GetFileData, Loading, PageProps } from "../Cards/Page";

export type Card = {
    text: string
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