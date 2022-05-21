import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import styled from 'styled-components';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDoubleLeft as closeSidebar, faBars as openSidebar} from '@fortawesome/free-solid-svg-icons';

import {useTitle, getClassCode, capitalize} from '../App';
import { db } from '../firebase/config';
import { setTitleForBrowser } from '../resources/title';

import TitleBar from '../objects/TitleBar';
import Sidebar from './Sidebar';
import Projects from './Projects';
import Files from './Files';
import ButtonObject from '../objects/ButtonObject';
import Menu from '../objects/Menu';
import Toggle, { ToggleItem } from '../objects/Toggle';
import ErrorDisplay from '../objects/ErrorDisplay';

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

export const MainView = styled.div`
    margin: 0 auto;
    padding: 0;
    // max-width: 1200px;
    overflow: scroll;
`;

export const MainViewTop = styled.div`
    height: 45px;
    top: 0px;
    padding: 0;
    display: flex;
    position: sticky;
    flex-direction: row;
    align-items: center;
    z-index: 100;
`;

export const MainViewContent = styled.div`
    padding: 10px 5px;
`;

export const Title = styled.h1`
    font-size: 16px;
    font-weight: 400;
    margin: 0 0 0 8px;
`;

export const sidebarIcon = (display: boolean) => {
    if (display)
        return closeSidebar;
    
    else 
        return openSidebar;
}

const Home = (props: PageProps) => {
    const [current, setCurrent] = useState('project');

    const [errorValue, setErrorValue] = useState("");
    const [errorDisplay, setErrorDisplay] = useState(false);
    
    var color = getClassCode(props.mode, props.isDarkTheme)
    let title = 'My ' + capitalize(current) + 's';

    useTitle(setTitleForBrowser(title));

    let authToken = sessionStorage.getItem('Auth Token');

    if (!authToken) {
        return (<Navigate to="/" />)
    }

    const sidebarElements = ["project", "document"];
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
                    <MainViewContent>
                    <MainViewTop className="white">
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
                    {current === 'project' ?
                        <Projects 
                            color={color} 
                            isDarkTheme={props.isDarkTheme} 
                            mode={props.mode} 
                        /> :
                        <Files 
                            color={color} 
                            isDarkTheme={props.isDarkTheme} 
                            mode={props.mode} 
                        />
                    }
                    </MainViewContent>
                </MainView>
            </div>
        </div>
    )
}

export default Home;