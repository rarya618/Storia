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

export const MainView = styled.div`
    margin: 0 5px;
`;

export const MainViewTop = styled.div`
    height: 50px;
    padding: 5px 0 0 0;
    display: flex;
    align-items: center;
`;

export const Title = styled.h1`
    font-size: 22px;
    font-weight: 400;
    margin: 0 5px;
`;

export const sidebarIcon = (display: boolean) => {
    if (display)
        return closeSidebar;
    
    else 
        return openSidebar;
}

const Home = (props: Props) => {
    const [current, setCurrent] = useState('project');
    
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
                </MainView>
            </div>
        </div>
    )
}

export default Home;