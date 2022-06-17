import { Link, useParams } from "react-router-dom";
import React, {useState, useEffect} from 'react';
import { HashLoader } from 'react-spinners';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faEllipsisV as dotsIcon } from "@fortawesome/free-solid-svg-icons";

import { getClassCode, syncHistory, useTitle } from "../../App";
import { setTitleForBrowser } from "../../resources/title";
import { db, getDoc } from "../../firebase/config";

import Block from "./Block";
import NewBlock, { updateContent } from "./popups/NewBlock";
import TitleBar from "../../objects/TitleBar";
import Sidebar from "../Sidebar";
import ButtonObject from "../../objects/ButtonObject";
import Menu from "../../objects/Menu";
import BottomBar from "../BottomBar";
import { StatusView } from "../StoryMap/Page";
import DocumentDropdown from "./popups/DotDropdown";
import { Card, checkForGroup } from "../../dataTypes/Block";
import { SyncObject } from "../../dataTypes/Sync";
import { Group } from "../../dataTypes/Group";
import ErrorDisplay from "../../objects/ErrorDisplay";
import { Document } from "../../dataTypes/Document";
import BackButton from "../BackButton";
import { PageProps } from "../../dashboard/Home";
import { MainView, MainViewContent, MainViewTop, sidebarIcon, Title } from "../../objects/MainView";
import { ProjectWithId } from "../../dataTypes/Project";
import { defaultGroup, Filter } from "../../dataTypes/Filter";

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
    const [current, setCurrent] = useState<Filter>(defaultGroup);

    // server status
    const [connectionStatus, setConnectionStatus] = useState('Connecting');

    const [currentBlock, setCurrentBlock] = useState<Card>();


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

    // right sidebar toggle
    const [showRightSidebar, toggleRightSidebar] = useState(false);

    // show dropdown
    const [showDropdown, toggleDropdown] = useState(false);

    const [errorValue, setError] = useState("");
    const [errorDisplay, setErrorDisplay] = useState(false);

    // get details from params
    let { documentId } = useParams<string>();

    let docId = documentId ? documentId : "";

    // initialise file data
    // @ts-ignore
    const [fileData, setData] = useState<Document>({});

    // initialise project data
    const [projectData, setProjectData] = useState<ProjectWithId>();

    async function getFileData() {
        updateStatus({
            display: "Syncing", 
            details: "Getting document...",
            timeStamp: Date.now()
        });
        const docRef = db.collection('files').doc(docId);

        // @ts-ignore
        const tempDoc: Document = (await getDoc(docRef)).data();
        
        if (tempDoc) {
            setData(tempDoc);
            let projectId = tempDoc.project ? tempDoc.project : "";
            await getProjectData(projectId);

            updateStatus({
                display: "Online", 
                details: "Retrieved " + tempDoc.name,
                timeStamp: Date.now()
            });
        }
    }

    async function getProjectData(projectId: string) {
        if (projectId !== "") {
            updateStatus({
                display: "Syncing", 
                details: "Getting project...",
                timeStamp: Date.now()
            });

            const docRef = db.collection('projects').doc(projectId);

            // @ts-ignore
            const tempDoc: ProjectWithId = {id: projectId, ...(await getDoc(docRef)).data()};
            
            if (tempDoc) {
                setProjectData(tempDoc);
                updateStatus({
                    display: "Online", 
                    details: "Retrieved " + tempDoc.name,
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

    const toggleCurrentBlock = (block: Card) => {
        setCurrentBlock(block)
        toggleRightSidebar(true);
    }

    const closeRightSidebar = () => {
        setCurrentBlock(undefined);
        toggleRightSidebar(false);
    }

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

    const updateBlock = (block: Card, count: number) => {
        updateStatus({
            display: "Updating", 
            details: "Updating Block " + count + " of " + fileData.name,
            timeStamp: Date.now()
        });
        // @ts-ignore
        var tempContent: Card[] = [...fileData.content];
        tempContent[count - 1] = block;

        updateContentTo(tempContent);
    }

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

    var groups: Group[] = fileData.groups ? [...fileData.groups] : []

    return (
        <div className={"full-screen row"}>
            {/* <Sidebar elements ={elements} setElements={setElements} color={color} hide={hideSidebar} /> */}
            <ErrorDisplay error={errorValue} isDarkTheme={props.isDarkTheme} display={errorDisplay} toggleDisplay={setErrorDisplay} />

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
                        errorValue={errorValue}
                        setErrorValue={setError}
                        errorDisplay={errorDisplay}
                        setErrorDisplay={setErrorDisplay}
                        reloadFileData={getFileData}
                    />
                    <MainView className="no-select grow">
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
                            <Link to={'/dashboard'}>
                                <BackButton color={color} text="Dashboard" />
                            </Link>
                            <Title className={color + "-color"}>{title}</Title>
                            
                            <div className="grow"></div>
                            <Menu 
                                isDarkTheme={props.isDarkTheme} 
                                color={color} 
                                border={false}
                                data={rightMenu}
                            />
                            {statusPopup ? <StatusView history={syncHistory} /> : null}
                        </MainViewTop>
                        <MainViewContent>
                        <div className={"page-view"}>
                            <div className="row wrap">
                                {// @ts-ignore
                                fileData.content.map((data: Card, index: number) => {
                                    if (current === defaultGroup || (checkForGroup(data, current.value)))
                                        return (
                                            <Block 
                                                color={color} 
                                                isDarkTheme={props.isDarkTheme} 
                                                block={data}
                                                fileGroups={groups} 
                                                update={(block: Card, count: number) => updateBlock(block, count)}
                                                count={index + 1}
                                                currentBlock={currentBlock}
                                                documentId={docId}
                                                setCurrentBlock={toggleCurrentBlock}
                                                errorValue={errorValue}
                                                setErrorValue={setError}
                                                errorDisplay={errorDisplay}
                                                setErrorDisplay={setErrorDisplay}
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