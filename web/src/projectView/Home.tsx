import React, {useEffect, useState} from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faEllipsisV as dotsIcon} from '@fortawesome/free-solid-svg-icons';

import { setTitleForBrowser } from '../resources/title';
import { db, getDoc } from "../firebase/config";

import {useTitle, getClassCode} from '../App';

import Files from './Files';
import { Project } from '../Recents/popups/NewProject';
import TitleBar from '../objects/TitleBar';
import { MainView, MainViewContent, MainViewTop, sidebarIcon, Title } from '../Recents/Home';
import Sidebar from './Sidebar';
import Menu from '../objects/Menu';
import ButtonObject from '../objects/ButtonObject';
import ErrorDisplay from '../objects/ErrorDisplay';
import ProjectDropdown from './popups/DotDropdown';

type Props = { 
    isDarkTheme: boolean; 
    mode: string;
    setMode: (e: string) => void; 
    switchTheme: (arg0: boolean) => void;
    showMenu: boolean;
    toggleMenu: (e: boolean) => void;
    hideSidebar: boolean;
    setHideSidebar: (e: boolean) => void;
}

const getDetails = async (uid: string) => {
    return await db.collection("users").doc(uid).get()
    .then(snapshot => snapshot.data())
}

const Home = (props: Props) => {
    const [current, setCurrent] = useState('view-all');
    const [showDropdown, toggleDropdown] = useState(false);

    const [errorValue, setErrorValue] = useState("");
    const [errorDisplay, setErrorDisplay] = useState(false);

    let { projectId } = useParams<string>();

    projectId = projectId ? projectId : "";

    // initialise file data
    const [projectData, setData] = useState<Project>();

    async function getProjectData() {
        const docRef = db.collection('projects').doc(projectId);

        // @ts-ignore
        const tempDoc: Project = (await getDoc(docRef)).data();
        
        if (tempDoc) {
            setData(tempDoc);
        }
    }

    // call function
    useEffect(() => {
        getProjectData();
    }, [])

    var color = getClassCode(props.mode, props.isDarkTheme);
    var darkTheme = getClassCode("", props.isDarkTheme);

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

    const rightMenu: ButtonObject[] = [{
        id: "dots",
        onClick: (e: Event) => {
            e.preventDefault();
            e.stopPropagation()
            toggleDropdown(!showDropdown);
        },
        text: <FontAwesomeIcon icon={dotsIcon} />
    }];

    let title = projectData ? projectData.name : "";

    useTitle(setTitleForBrowser(title));

    let authToken = sessionStorage.getItem('Auth Token');

    if (!authToken) {
        return (<Navigate to="/" />)
    }

    const sidebarElements = ["view-all", "cards", "story-map"];

    return (
        <div className={"full-screen"}>
            {/* Error display popup */}
            <ErrorDisplay error={errorValue} isDarkTheme={props.isDarkTheme} display={errorDisplay} toggleDisplay={setErrorDisplay} />
            
            {/* setup titlebar */}
            <TitleBar 
                mode={props.mode}
                setMode={props.setMode}
                title={title}
                isDarkTheme={props.isDarkTheme}
                switchTheme={props.switchTheme}
                showMenu={props.showMenu}
                toggleMenu={props.toggleMenu}
            />

            {/* setup sidebar */}
            <Sidebar 
                elements={sidebarElements} 
                current={current} 
                setCurrent={setCurrent}
                isDarkTheme={props.isDarkTheme}
                mode={props.mode}
                setMode={props.setMode}
                color={color} 
                hide={props.hideSidebar} 
                setHide={props.setHideSidebar} 
                projectId={projectId} 
                projectFiles={projectData ? projectData.files : []}
                errorValue={errorValue}
                setErrorValue={setErrorValue}
                errorDisplay={errorDisplay}
                setErrorDisplay={setErrorDisplay}
            />

            <MainView className="no-select grow"
                onClick={(e) => toggleDropdown(false)}
            >
                <MainViewContent>
                <MainViewTop className="white">
                    {props.hideSidebar ? <Menu 
                        isDarkTheme={props.isDarkTheme} 
                        color={color} 
                        border={false}
                        data={leftMenu}
                    /> : null}
                    <Link to={'/dashboard'}>
                        <span className="row">
                            <Title className={color + "-color underline"}>My Projects</Title>
                            <Title className={color + "-color"}>/</Title>
                        </span>
                    </Link>
                    <Title className={color + "-color"}>{title}</Title>
                    <div className="grow"></div>
                    <Menu 
                        isDarkTheme={props.isDarkTheme} 
                        color={color} 
                        border={false}
                        data={rightMenu}
                    />
                </MainViewTop>
                <Files 
                    color={color} 
                    projectId={projectId}
                    isDarkTheme={props.isDarkTheme} 
                    list={projectData ? projectData.files : []}
                    current={current} 
                />
                <ProjectDropdown 
                    showDropdown={showDropdown}
                    toggleDropdown={toggleDropdown}
                    classCode={color}
                    isDarkTheme={props.isDarkTheme}
                    project={projectData ? {id: projectId, ...projectData} : null}
                    topBar={true}
                />
                </MainViewContent>
            </MainView>
        </div>
    )
}

export default Home;