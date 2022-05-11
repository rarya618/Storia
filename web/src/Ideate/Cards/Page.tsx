import { Link, useParams } from "react-router-dom";
import React, {useState, useEffect} from 'react';
import { HashLoader } from 'react-spinners';

import { getClassCode, useTitle } from "../../App";
import { setTitleForBrowser } from "../../resources/title";
import { db, getDoc } from "../../firebase/config";
import Block from "./Block";
import NewBlock from "./popups/NewBlock";
import { Document } from "../../Recents/popups/NewFile";
import TitleBar from "../../objects/TitleBar";
import { MainView, MainViewContent, MainViewTop, PageProps, sidebarIcon, Title } from "../../Recents/Home";
import Sidebar from "../StoryMap/Sidebar";
import { ProjectWithId } from "../../Recents/popups/NewProject";
import ButtonObject from "../../objects/ButtonObject";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faEllipsisH as dotsIcon } from "@fortawesome/free-solid-svg-icons";
import Menu from "../../objects/Menu";
import BottomBar from "../StoryMap/BottomBar";

export type Card = {
    text: string, 
    title: string
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
    // currently selected group
    const [current, setCurrent] = useState('default');

    // show popup
    const [showPopup, setShowPopup] = useState(false);

    // show dropdown
    const [showDropdown, setShowDropdown] = useState(false);

    // server status
    var connectionStatus = "Connecting";

    // get details from params
    let { documentId } = useParams<string>();

    let docId = documentId ? documentId : "";

    // initialise file data
    // @ts-ignore
    const [fileData, setData] = useState<Document>({});

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
    let title = fileData.name ? fileData.name : "";

    // @ts-ignore
    if (fileData.name) {
        connectionStatus = "Online";
    }

    // set title
    useTitle(setTitleForBrowser(title));

    var darkTheme = getClassCode("", props.isDarkTheme);

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
                {fileData.name ? (<>
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
                        <div className={"page-view"}>
                            <div className="row wrap">
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
                        </MainViewContent>
                        <BottomBar 
                            color={color}
                            isDarkTheme={props.isDarkTheme}
                            switchTheme={props.switchTheme}
                            blockCount={fileData.content.length}
                        />
                        </MainView>
                </>) : (
                    <Loading />
                )}
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