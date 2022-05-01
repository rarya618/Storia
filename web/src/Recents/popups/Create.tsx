import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import styled from "styled-components";
import { getClassCode } from "../../App";
import Button from "../../objects/Button";
import ErrorDisplay from "../../objects/ErrorDisplay";
import Toggle, { ToggleItem } from "../../objects/Toggle";
import NewFile from "./NewFile";
import NewProject from "./NewProject";

// generate random string of specified length
export function randomString(length: number) {
    var result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    
	for (var i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * characters.length));
	}

	return result;
}

const CreateButton = styled.button`
    position: fixed;
    z-index: 100;
    bottom: 0;
    right: 0;
    padding: 2.5px;
    border-radius: 25px;
    border: none;
    width: 50px;
    height: 50px;
    font-size: 28px;
`;

const CreatePopup = styled.div`
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

    const [showPopup, togglePopup] = useState(false);

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
        showPopup ? (<CreatePopup className={getClassCode("", props.isDarkTheme) + " create"}>
            <ErrorDisplay error={errorValue} isDarkTheme={props.isDarkTheme} display={errorDisplay} toggleDisplay={setErrorDisplay} />
            <ToggleContainer>
                <Toggle current={current} setCurrent={setCurrent} isDarkTheme={props.isDarkTheme} content={viewToggle} />
                <Button
                    className="absolute push-right"
                    color={props.color}
                    onClick={() => togglePopup(!showPopup)}
                    border="no"
                    text={<FontAwesomeIcon 
                        icon={faTrash}
                    />}
                />
            </ToggleContainer>
            {   
                current === "project"
                ? <NewProject color={props.color} setErrorValue={setErrorValue} setErrorDisplay={setErrorDisplay} isDarkTheme={props.isDarkTheme} />
                : <NewFile color={props.color} setErrorValue={setErrorValue} setErrorDisplay={setErrorDisplay} isDarkTheme={props.isDarkTheme} mode={props.mode} changeColor={() => props.setMode(props.mode)} />
            }
        </CreatePopup>) :
        <CreateButton 
            className={props.color + " white-color create"}
            onClick={() => togglePopup(!showPopup)}>
            +
        </CreateButton>
    )
}

export default Create;