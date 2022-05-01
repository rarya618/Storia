import React, { useState } from "react";
import styled from "styled-components";
import { getClassCode } from "../../App";
import ErrorDisplay from "../../objects/ErrorDisplay";
import Toggle, { ToggleItem } from "../../objects/Toggle";
import NewFile from "../NewFile";
import NewProject from "../NewProject";

// generate random string of specified length
export function randomString(length: number) {
    var result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    
	for (var i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * characters.length));
	}

	return result;
}

const CreatePopup = styled.div`
    margin: 20px;
    padding: 5px;
    width: 300px;
    border-radius: 5px;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.25);
    position: fixed;
    z-index: 100;
    bottom: 0;
    right: 0;
`;

export const Form = styled.form`
    display: flex;
    flex-direction: column;
`;

export const TextBoxContainer = styled.div`
    display: flex;
    flex-direction: row;
    padding: 5px 8px;
    width: calc(100% - 26px);
    height: 30px;
    margin: 5px;
    border: none;
    border-radius: 5px;
`;

export const TextBox = styled.input`
    flex-grow: 1;
    height: 30px;
    padding: 0;
    margin: 0;
    background: transparent;
    border: none;
`;

const ToggleContainer = styled.div`
    display: flex;
    flex-grow: 0;
    margin: auto;
    height: 40px;
    align-items: center;
    text-align: center;
    justify-content: center;
`;

type Props = { 
    isDarkTheme: boolean; 
    mode: string;
    setMode: (e: string) => void; 
    color: string;
}

const Create = (props: Props) => {
    const [current, setCurrent] = useState("project");
    const [errorValue, setErrorValue] = useState("");
    const [errorDisplay, setErrorDisplay] = useState(false);

    let viewToggle: ToggleItem[] = [
        {
            id: "project",
            display: "Project", 
            color: props.color
        },
        {
            id: "document",
            display: "Document", 
            color: props.color
        }
    ]
    return (
        <CreatePopup className={getClassCode("", props.isDarkTheme)}>
            <ErrorDisplay error={errorValue} isDarkTheme={props.isDarkTheme} display={errorDisplay} toggleDisplay={setErrorDisplay} />
            <ToggleContainer>
                <Toggle current={current} setCurrent={setCurrent} isDarkTheme={props.isDarkTheme} content={viewToggle} />
            </ToggleContainer>
            {   
                current === "project"
                ? <NewProject color={props.color} setErrorValue={setErrorValue} setErrorDisplay={setErrorDisplay} isDarkTheme={props.isDarkTheme} />
                : <NewFile color={props.color} setErrorValue={setErrorValue} setErrorDisplay={setErrorDisplay} isDarkTheme={props.isDarkTheme} mode={props.mode} changeColor={() => props.setMode(props.mode)} />
            }
        </CreatePopup>
    )
}

export default Create;