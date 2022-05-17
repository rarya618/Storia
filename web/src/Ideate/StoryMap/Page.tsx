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
import styled from "styled-components";
import DocumentDropdown from "../../Recents/popups/DocDropdown";

export type Card = {
    text: string
}

export type SyncObject = {
    display: string,
    details: string,
    timeStamp: number
};

type StatusProps = {
    history: SyncObject[]
}

export var syncHistory: SyncObject[] = [];

const StatusContainer = styled.div`
    position: absolute;
    padding: 8px 4px;
    border-radius: 5px;
    right: 0;
    top: 40px;
    min-width: 180px;
    max-width: 220px;
    max-height: 320px;
    overflow: scroll;
    box-shadow: 2px 5px 10px 0px rgba(0, 0, 0, 0.25);
    border: solid 0.5px;
`;

const StatusItem = styled.div`
    padding: 5px 6px;
    text-align: left;
    border-radius: 5px;
    font-size: 15px;
`;

const StatusTitle = styled.h1`
    padding: 6px 8px;
    font-weight: 400;
    font-size: 22px;
    margin: 0;
    text-align: left;
`;

const ItemTime = styled.h1`
    padding: 2px 0;
    font-weight: 400;
    font-size: 14px;
    margin: 0;
    text-align: left;
`;

export const StatusView = ({history}: StatusProps) => {
    return (
        <StatusContainer className="white purple-color">
            {history.map((item, key) => {
                const timeStamp = item.timeStamp ? item.timeStamp : Date.now();
                const time = new Intl.DateTimeFormat('en-US', {year: 'numeric', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'}).format(timeStamp);
                return (<StatusItem className="vh-hoverable no-animation">
                    {/* <ItemTitle>{key + 1}. {item.display}</ItemTitle> */}
                    {item.details}
                    <ItemTime>{time}</ItemTime>
                    {/* {key + 1}. {item.details} */}
                </StatusItem>)
            })}
        </StatusContainer>
    )
};

const Page = (props: PageProps) => {
    const [current, setCurrent] = useState('default');
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

    const [errorValue, setError] = useState("");
    const [errorDisplay, setErrorDisplay] = useState(false);

    // get details from params
    let { documentId } = useParams<string>();
    let docId = documentId ? documentId : "";

    // initialise document data
    // @ts-ignore
    const [file, setData] = useState<Document>({});

    // initialise project data
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
    let title = file.name ? file.name : "";

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
        updateStatus({
            display: "Updating", 
            details: "Updating Block " + count + " of document [" + docId + "]",
            timeStamp: Date.now()
        });
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
                            file={{id: docId, ...file}}
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
                            </> : <>
                                <Link to={'/dashboard'}>
                                    <span className="row">
                                        <Title className={color + "-color underline"}>My Projects</Title>
                                        <Title className={color + "-color"}>/</Title>
                                    </span>
                                </Link>
                                <Title className={color + "-color"}>{title}</Title>
                            </>
                        }
                        <div className="grow"></div>
                        <Menu 
                            isDarkTheme={props.isDarkTheme} 
                            color={color} 
                            border={false}
                            data={rightMenu}
                        />
                        {statusPopup ? <StatusView history={syncHistory} /> : null}
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
                        updateFile={async () => {
                            updateStatus({
                                display: "Updating", 
                                details: "New Block created in document [" + docId + "]",
                                timeStamp: Date.now()
                            });
                            await getFileData();
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