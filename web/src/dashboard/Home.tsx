import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import styled from 'styled-components';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDoubleLeft as closeSidebar, faBars as openSidebar} from '@fortawesome/free-solid-svg-icons';

import {useTitle, getClassCode, capitalize} from '../App';
import { db, getDocs, query, where } from "../firebase/config";
import { setTitleForBrowser } from '../resources/title';

import TitleBar from '../objects/TitleBar';
import Sidebar from './Sidebar';
import AllFiles from './Files';
import ButtonObject from '../objects/ButtonObject';
import Menu from '../objects/Menu';
import Toggle, { ToggleItem } from '../objects/Toggle';
import ErrorDisplay from '../objects/ErrorDisplay';
import { ProjectWithId, StringOrProjectWithId } from '../dataTypes/Project';
import { collection } from 'firebase/firestore';
import ProjectFiles from './ProjectFiles';

export type PageProps = { 
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

// get projects from db
export function GetProjects(userId: string) {
    const [projects, setProjects] = useState<ProjectWithId[]>([]);

    async function getProjects() {
		const filesRef = collection(db, 'projects');
		const q = query(filesRef, where("users", "array-contains", userId));

		await getDocs(q).then((querySnapshot) => {
            const tempDoc = querySnapshot.docs.map((doc) => {
				// @ts-ignore
				const file: ProjectWithId = {id: doc.id, ...doc.data()};

				return file;
            })

			setProjects(tempDoc);
        })


    }

    useEffect(() => {
        getProjects();
    }, [])

    return projects;
}

export const MainView = styled.div`
    margin: 0;
    padding: 0;
    // max-width: 1200px;
    overflow: scroll;
`;

export const MainViewTop = styled.div`
    height: 44px;
    top: 0px;
    padding: 0 5px;
    margin: 4px 0 0 0;
    display: flex;
    position: sticky;
    left: 0;
    flex-direction: row;
    align-items: center;
    z-index: 100;
`;

export const MainViewContent = styled.div`
    padding: 0 5px;
    max-width: 1200px;
    margin: 0 auto;
`;

export const Title = styled.h1`
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 0 8px;
`;

export const sidebarIcon = (display: boolean) => {
    if (display)
        return closeSidebar;
    
    else 
        return openSidebar;
}

const Home = (props: PageProps) => {
	const userId = sessionStorage.getItem("userId");

    const [current, setCurrent] = useState<StringOrProjectWithId>('view-all');

    const [errorValue, setErrorValue] = useState("");
    const [errorDisplay, setErrorDisplay] = useState(false);
    
    var color = getClassCode(props.mode, props.isDarkTheme)
    let title = typeof current === "string" ? capitalize(current) : current.name;

	let projects: ProjectWithId[] = userId ? GetProjects(userId) : [];

    useTitle(setTitleForBrowser(title));

    let authToken = sessionStorage.getItem('Auth Token');

    if (!authToken) {
        return (<Navigate to="/" />)
    }

    const sidebarElements = [...projects];
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

    let viewToggle: ToggleItem[] = [
        {
            id: "write",
            display: "Writing", 
            color: getClassCode("write", props.isDarkTheme)
        },
        {
            id: "ideate",
            display: "Ideating", 
            color: getClassCode("ideate", props.isDarkTheme)
        }
    ]

    return (
        <div className="full-screen">
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
                    errorValue={errorValue}
                    setErrorValue={setErrorValue}
                    errorDisplay={errorDisplay}
                    setErrorDisplay={setErrorDisplay}
                />
                <MainView className="no-select grow">
                    <MainViewTop className="white after-shadow">
                        {props.hideSidebar ? <Menu 
                            className="top-layer"
                            isDarkTheme={props.isDarkTheme} 
                            color={color} 
                            border={false}
                            data={leftMenu}
                        /> : null}
                        <Title className={color + "-color"}>{title}</Title>
                        {/* {current === 'document' ? <Toggle current={props.mode} setCurrent={props.setMode} isDarkTheme={props.isDarkTheme} content={viewToggle} /> : null} */}
                    </MainViewTop>
                    <MainViewContent>
                    {typeof current === 'string' ?
                        <AllFiles 
                            color={color} 
                            isDarkTheme={props.isDarkTheme} 
                            mode={props.mode} 
                        /> : <ProjectFiles
                            color={color} 
                            isDarkTheme={props.isDarkTheme}
                            project={current}
                        / >
                    }
                    </MainViewContent>
                </MainView>
            </div>
        </div>
    )
}

export default Home;