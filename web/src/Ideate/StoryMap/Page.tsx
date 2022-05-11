import { Link, useParams } from "react-router-dom";
import React, { useEffect, useState } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEllipsisH as dotsIcon } from '@fortawesome/free-solid-svg-icons';

import { getClassCode, useTitle } from "../../App";
import { setTitleForBrowser } from "../../resources/title";
// import TitleBar from "./TitleBar";
import BottomBar from "./BottomBar";
import Block from "./Block";
import NewBlock, { updateContent } from "./popups/NewBlock";
import { Loading } from "../Cards/Page";
import { Document } from "../../Recents/popups/NewFile";

import { db, getDoc } from "../../firebase/config";
import ErrorDisplay from "../../objects/ErrorDisplay";
import TitleBar from "../../objects/TitleBar";
import { MainView, MainViewContent, MainViewTop, PageProps, sidebarIcon, Title } from "../../Recents/Home";
import Sidebar from "./Sidebar";
import Menu from "../../objects/Menu";
import ButtonObject from "../../objects/ButtonObject";
import { ProjectWithId } from "../../Recents/popups/NewProject";
import { DropdownGen } from "../../objects/Dropdown";
import { writerDotDropdown } from "../../resources/dropdowns";

export type Card = {
    text: string
}

const Page = (props: PageProps) => {
    const [current, setCurrent] = useState('default');

    // show popup
    const [showPopup, setShowPopup] = useState(false);

    // show dropdown
    const [showDropdown, setShowDropdown] = useState(false);

    // server status
    var connectionStatus = "Connecting";

    const [errorValue, setError] = useState("");
    const [errorDisplay, setErrorDisplay] = useState(false);

    // get details from params
    let { documentId } = useParams<string>();
    let docId = documentId ? documentId : "";

    // initialise file data
    // @ts-ignore
    const [file, setData] = useState<Document>({});

    // initialise file data
    const [projectData, setProjectData] = useState<ProjectWithId>();

    async function getFileData() {
        console.log("Fetching file data...")
        const docRef = db.collection('files').doc(docId);

        // @ts-ignore
        const tempDoc: Document = (await getDoc(docRef)).data();
        
        if (tempDoc) {
            setData(tempDoc);
            let projectId = tempDoc.project ? tempDoc.project : "";
            getProjectData(projectId);
        }
    }

    async function getProjectData(projectId: string) {
        if (projectId !== "") {
            console.log("Getting project data...");
            const docRef = db.collection('projects').doc(projectId);

            // @ts-ignore
            const tempDoc: ProjectWithId = {id: projectId, ...(await getDoc(docRef)).data()};
            
            if (tempDoc) {
                setProjectData(tempDoc);
            }
        }
    }

    // call function
    useEffect(() => {
        getFileData();
    }, [])

    // set page color scheme
    const color = getClassCode("ideate", props.isDarkTheme);

    // create page title
    let title = file.name ? file.name : "";

    if (file.name) {
        connectionStatus = "Online";
    }

    // set title
    useTitle(setTitleForBrowser(title));

    var darkTheme = getClassCode("", props.isDarkTheme);

    const updateContentTo = (newContent: any[]) => {
        updateContent(newContent, docId)
        .then(async () => {
            await getFileData();
        })
        .catch(err => {
            setError(err);
            setErrorDisplay(true);
        })
    }

    const updateBlock = (text: string, count: number) => {
        var tempContent = [...file.content];
        tempContent[count - 1] = {text: text};

        updateContentTo(tempContent);
    }

    const deleteBlock = (count: number) => {
        var tempContent = [...file.content];
        tempContent.splice(count - 1, 1);

        updateContentTo(tempContent);
    }

    const groups = ["default"];
    const leftMenu: ButtonObject[] = [
        {
            id: "sidebar",
            onClick: (e: Event) => {
                e.preventDefault();
                props.setHideSidebar(!props.hideSidebar);
            },
            text: <FontAwesomeIcon icon={sidebarIcon((!props.hideSidebar))} />
        }
    ]

    const rightMenu: ButtonObject[] = [
        {
            id: "status",
            onClick: (e: Event) => {
                e.preventDefault();
            },
            text: connectionStatus
        },
        {
            id: "add",
            onClick: (e: Event) => {
                e.preventDefault();
                setShowPopup(true);
            },
            text: <FontAwesomeIcon icon={faPlus} />
        },
        {
            id: "dots",
            onClick: (e: Event) => {
                e.preventDefault();
                setShowDropdown(!showDropdown);
            },
            text: <FontAwesomeIcon icon={dotsIcon} />
        }
    ]

    return (
        <div className={"full-screen row"}>
            {/* <Sidebar elements ={elements} setElements={setElements} color={color} hide={hideSidebar} /> */}
            <TitleBar 
                mode={props.mode}
                setMode={props.setMode}
                title={title}
                isDarkTheme={props.isDarkTheme}
                switchTheme={props.switchTheme}
                showMenu={props.showMenu}
                toggleMenu={props.toggleMenu}
            />
            <div className="row grow">
            { file.name ? (<>
                <Sidebar 
                    groups={groups} 
                    project={projectData} 
                    fileId={docId}
                    current={current} 
                    setCurrent={setCurrent}
                    isDarkTheme={props.isDarkTheme}
                    mode={props.mode}
                    setMode={props.setMode}
                    color={color} 
                    hide={props.hideSidebar} 
                />
                <MainView className="no-select grow">
                    <MainViewContent>
                    <MainViewTop className="white">
                        <Menu 
                            isDarkTheme={props.isDarkTheme} 
                            color={color} 
                            border={false}
                            data={leftMenu}
                        />
                        {projectData ? 
                            <><Link to={'/project/' + projectData.id}><Title className={color + "-color underline"}>{projectData.name}</Title></Link><Title className={color + "-color"}>/ {title}</Title></>:
                            <Title className={color + "-color"}>{title}</Title>
                        }
                        <div className="grow"></div>
                        <Menu 
                            isDarkTheme={props.isDarkTheme} 
                            color={color} 
                            border={false}
                            data={rightMenu}
                        />
                        {/* {showDropdown ? DropdownGen(color, props.isDarkTheme, writerDotDropdown(props.isDarkTheme, props.switchTheme)) : null} */}
                    </MainViewTop>
                    <div className="page-view">                        
                        <div className="row wrap">
                            {file.content.map((data: Card, index: number) => {
                                return (
                                    <Block 
                                        color={color} 
                                        isDarkTheme={props.isDarkTheme} 
                                        text={data.text} 
                                        count={index + 1}
                                        updateFile={(text: string, count: number) => updateBlock(text, count)}
                                    />
                                )
                            })}
                        </div>
                    </div>
                    </MainViewContent>
                    <BottomBar 
                        color={color}
                        isDarkTheme={props.isDarkTheme}
                        switchTheme={props.switchTheme}
                        blockCount={file.content.length}
                    />

                    <ErrorDisplay error={errorValue} isDarkTheme={props.isDarkTheme} display={errorDisplay} toggleDisplay={setErrorDisplay} />
                    
                    {showPopup ? <NewBlock 
                        color={color} 
                        isDarkTheme={props.isDarkTheme}
                        id={documentId ? documentId : ''} 
                        closePopup={() => setShowPopup(false)}
                        content={file.content} 
                        updateFile={() => {
                            getFileData();
                        }}
                    /> : null}
                </MainView>
                </>) : (
                    <Loading />
                )}
            </div>
        </div>
    )
}

export default Page;