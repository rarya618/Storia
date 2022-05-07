import React, {useEffect, useState} from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faEllipsisH as dotsIcon, faHome} from '@fortawesome/free-solid-svg-icons';

import {useTitle, getClassCode, MacTitlebarSpacing} from '../App';

import Files from './Files';

import { setTitleForBrowser } from '../resources/title';
import { recentsDotDropdown } from '../resources/dropdowns';
import { db, getDoc } from "../firebase/config";

import { DropdownGen } from '../objects/Dropdown';
import Menu from '../objects/Menu';
import ButtonObject from '../objects/ButtonObject';

import { Navigate, useParams } from 'react-router-dom';
import Create from './popups/Create';
import { Project } from '../Recents/popups/NewProject';

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

    const leftMenu: ButtonObject[] = [
        {
            id: "home",
            type: "link",
            onClick: "/",
            text: <FontAwesomeIcon icon={faHome} />
        }
    ];
    const rightMenu: ButtonObject[] = [{
        id: "dots",
        onClick: (e: Event) => {
            e.preventDefault();
            setShowDropdown(!showDropdown);
        },
        text: <FontAwesomeIcon icon={dotsIcon} />
    }];

    var color = getClassCode(props.mode, props.isDarkTheme)
    const darkTheme = getClassCode("", props.isDarkTheme)

    let title = projectData ? projectData.name : "";

    useTitle(setTitleForBrowser(title));

    let authToken = sessionStorage.getItem('Auth Token');

    if (!authToken) {
        return (<Navigate to="/" />)
    }

    return (
        <div className={"full-screen"}>
            <div className={"title-bar row " + color + "-color " + darkTheme + " no-select drag"}>
                {
                    // macOS overlay
                    MacTitlebarSpacing(true)
                }
                <div className="absolute title-container">
                    <h1 className="heading title no-animation">{title}</h1>
                </div>
                <Menu 
                    className="absolute top-layer"
                    isDarkTheme={props.isDarkTheme} 
                    color={color} 
                    border={false}
                    data={leftMenu}
                />
                <Menu 
                    className="absolute push-right top-layer"
                    isDarkTheme={props.isDarkTheme} 
                    color={color} 
                    border={false}
                    data={rightMenu}
                />
                {
                    showDropdown 
                    ? DropdownGen(
                        color, 
                        props.isDarkTheme, 
                        recentsDotDropdown(props.isDarkTheme, props.switchTheme)
                    ) : null
                }
            </div>
            <div className="recent-view no-select spaced-small">
                <Create 
                    color={color} 
                    isDarkTheme={props.isDarkTheme} 
                    mode={props.mode} 
                    setMode={props.setMode} 
                    projectId={projectId} 
                    currentFiles={projectData ? projectData.files : []}
                />
                <Files 
                    color={color} 
                    isDarkTheme={props.isDarkTheme} 
                    list={projectData ? projectData.files : []}
                    mode={props.mode} 
                />
            </div>
        </div>
    )
}

export default Home;