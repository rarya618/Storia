import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import styled from 'styled-components';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDoubleLeft as closeSidebar, faBars as openSidebar} from '@fortawesome/free-solid-svg-icons';

import {useTitle, getClassCode, capitalize} from '../App';
import { db } from '../firebase/config';
import { setTitleForBrowser } from '../resources/title';

import TitleBar from './TitleBar';
import Sidebar from './Sidebar';
import Projects from './Projects';
import Files from './Files';
import ButtonObject from '../objects/ButtonObject';
import Menu from '../objects/Menu';

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

const MainViewTop = styled.div`
    height: 50px;
    padding: 5px 0 0 0;
    display: flex;
    align-items: center;
`;

const Title = styled.h1`
    font-size: 22px;
    font-weight: 400;
    margin: 0 5px;
`;

const MainView = styled.div`
    margin: 0 5px;
`;

const sidebarIcon = (display: boolean) => {
    if (display)
        return closeSidebar;
    
    else 
        return openSidebar;
}

const Home = (props: Props) => {
    // sidebar status
    const [hideSidebar, setHideSidebar] = useState(false);

    const [current, setCurrent] = useState('project');
    
    var color = getClassCode(props.mode, props.isDarkTheme)
    let title = "Dashboard";

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
                setHideSidebar(!hideSidebar);
            },
            text: <FontAwesomeIcon icon={sidebarIcon((!hideSidebar))} />
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
                    hide={hideSidebar} 
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
                        <Title className={color + "-color"}>My {capitalize(current)}s</Title>
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