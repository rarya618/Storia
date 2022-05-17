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
import { StatusView, syncHistory, SyncObject } from "../StoryMap/Page";
import DocumentDropdown from "../../Recents/popups/DocDropdown";

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

    // server status
    const [connectionStatus, setConnectionStatus] = useState('Connecting');

    const updateStatus = (status: SyncObject) => {
        syncHistory.reverse();
        syncHistory.push(status);
        syncHistory.reverse();
        setConnectionStatus(status.display);
    }

    // show popup
    const [showPopup, setShowPopup] = useState(false);

    // show status popup
    const [statusPopup, toggleStatusPopup] = useState(false);

    // show dropdown
    const [showDropdown, toggleDropdown] = useState(false);

    // get details from params
    let { documentId } = useParams<string>();

    let docId = documentId ? documentId : "";

    // initialise file data
    // @ts-ignore
    const [fileData, setData] = useState<Document>({});

    // initialise file data
    const [projectData, setProjectData] = useState<ProjectWithId>();

    async function getFileData() {
        updateStatus({
            display: "Syncing", 
            details: "Getting document [" + docId + "] from server",
            timeStamp: Date.now()
        });
        const docRef = db.collection('files').doc(docId);

        // @ts-ignore
        const tempDoc: Document = (await getDoc(docRef)).data();
        
        if (tempDoc) {
            setData(tempDoc);
            let projectId = tempDoc.project ? tempDoc.project : "";
            updateStatus({
                display: "Online", 
                details: "Retrieved document [" + docId + "] from server",
                timeStamp: Date.now()
            });
            getProjectData(projectId);
        }
    }

    async function getProjectData(projectId: string) {
        if (projectId !== "") {
            updateStatus({
                display: "Syncing", 
                details: "Getting project [" + projectId + "] from server",
                timeStamp: Date.now()
            });
            const docRef = db.collection('projects').doc(projectId);

            // @ts-ignore
            const tempDoc: ProjectWithId = {id: projectId, ...(await getDoc(docRef)).data()};
            
            if (tempDoc) {
                setProjectData(tempDoc);
                updateStatus({
                    display: "Online", 
                    details: "Retrieved project [" + projectId + "] from server",
                    timeStamp: Date.now()
                });
            }
        }
    }

    // call function
    useEffect(() => {
        getFileData();
    }, [docId])

    // set page color scheme
    const color = getClassCode("ideate", props.isDarkTheme);

    // create page title
    let title = fileData.name ? fileData.name : "";

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
                toggleStatusPopup(!statusPopup);
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
                toggleDropdown(!showDropdown);
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
                        setHide={props.setHideSidebar} 
                    />
                    <MainView className="no-select grow">
                        <MainViewContent>
                        <MainViewTop className="white">
                            <DocumentDropdown 
                                projectId={projectData ? projectData.id : ""}
                                showDropdown={showDropdown}
                                toggleDropdown={toggleDropdown}
                                classCode={color}
                                isDarkTheme={props.isDarkTheme}
                                file={{id: docId, ...fileData}}
                            />
                            {props.hideSidebar ? <Menu 
                                isDarkTheme={props.isDarkTheme} 
                                color={color} 
                                border={false}
                                data={leftMenu}
                            /> : null}
                            {projectData ? 
                            <>
                                <Link to={'/project/' + projectData.id}>
                                    <span className="row ext-mob-hide">
                                        <Title className={color + "-color underline"}>{projectData.name} </Title>
                                        <Title className={color + "-color"}>/</Title>
                                    </span>
                                </Link>
                                <Title className={color + "-color"}>{title}</Title>
                            </> :
                            <Title className={color + "-color"}>{title}</Title>}
                            <div className="grow"></div>
                            <Menu 
                                isDarkTheme={props.isDarkTheme} 
                                color={color} 
                                border={false}
                                data={rightMenu}
                            />
                            {statusPopup ? <StatusView history={syncHistory} /> : null}
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
                        updateStatus({
                            display: "Updating", 
                            details: "New Block created in document [" + docId + "]",
                            timeStamp: Date.now()
                        });
                        await getFileData();
                    }}
                /> : null}
            </div>
        </div>
    )
}

export default Page;