import React, {useEffect, useState} from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faEllipsisH as dotsIcon, faHome} from '@fortawesome/free-solid-svg-icons';

import {useTitle, getClassCode, MacTitlebarSpacing} from '../App';

import Files from './Files';

import { setTitleForBrowser } from '../resources/title';
import { db, getDoc } from "../firebase/config";

import { Navigate, useParams } from 'react-router-dom';
import { Project } from '../Recents/popups/NewProject';
import TitleBar from '../objects/TitleBar';
import { MainView, MainViewTop, sidebarIcon, Title } from '../Recents/Home';
import Sidebar from './Sidebar';
import Menu from '../objects/Menu';
import ButtonObject from '../objects/ButtonObject';

type Props = { 
    isDarkTheme: boolean; 
    mode: string;
    setMode: (e: string) => void; 
    switchTheme: (arg0: boolean) => void; 
}

const getDetails = async (uid: string) => {
    return await db.collection("users").doc(uid).get()
    .then(snapshot => snapshot.data())
}

const Home = (props: Props) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [current, setCurrent] = useState('cards');
    const [hideSidebar, setHideSidebar] = useState(false);

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

    var color = getClassCode(props.mode, props.isDarkTheme)
    const darkTheme = getClassCode("", props.isDarkTheme)

    const leftMenu: ButtonObject[] = [
        {
            id: "sidebar",
            onClick: (e: Event) => {
                e.preventDefault();
                setHideSidebar(!hideSidebar);
            },
            text: <FontAwesomeIcon icon={sidebarIcon((!hideSidebar))} />
        }
    ]

    let title = projectData ? projectData.name : "";

    useTitle(setTitleForBrowser(title));

    let authToken = sessionStorage.getItem('Auth Token');

    if (!authToken) {
        return (<Navigate to="/" />)
    }

    const sidebarElements = ["cards", "story-map"];

    return (
        <div className={"full-screen"}>
            <TitleBar 
                mode={props.mode}
                setMode={props.setMode}
                title={title}
                isDarkTheme={props.isDarkTheme}
                switchTheme={props.switchTheme}
            />
            <Sidebar 
                elements={sidebarElements} 
                current={current} 
                setCurrent={setCurrent}
                isDarkTheme={props.isDarkTheme}
                mode={props.mode}
                setMode={props.setMode}
                color={color} 
                hide={hideSidebar} 
                projectId={projectId} 
                projectFiles={projectData ? projectData.files : []}
            />
            <MainView className="no-select grow">
                <MainViewTop>
                    <Menu 
                        className="top-layer"
                        isDarkTheme={props.isDarkTheme} 
                        color={color} 
                        border={false}
                        data={leftMenu}
                    />
                    <Title className={color + "-color"}>{title}</Title>

                </MainViewTop>
                <Files 
                    color={color} 
                    isDarkTheme={props.isDarkTheme} 
                    list={projectData ? projectData.files : []}
                    current={current} 
                />
            </MainView>
        </div>
    )
}

export default Home;