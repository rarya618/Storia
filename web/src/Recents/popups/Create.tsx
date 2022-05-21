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

export const CreateButton = styled.button`
    z-index: 100;
    padding: 0;
    border-radius: 5px;
    border: none;
    margin: 10px;
    width: calc(100% - 20px);
    height: 40px;
    font-size: 14px;
`;

export const CreatePopup = styled.div`
    padding: 4px;
    width: 250px;
    border-radius: 5px;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.25);
    position: absolute;
    top: 0;
    z-index: 1000;
    margin: 10px;
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

export const ToggleContainer = styled.div`
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
    errorValue: string;
    setErrorValue: (e: string) => void;
    errorDisplay: boolean;
    setErrorDisplay: (e: boolean) => void;
}

const Create = (props: Props) => {
    const [current, setCurrent] = useState("project");
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
        <>
            {showPopup ? (<CreatePopup className={getClassCode("", props.isDarkTheme) + " create"}>
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
                    ? <NewProject color={props.color} setErrorValue={props.setErrorValue} setErrorDisplay={props.setErrorDisplay} isDarkTheme={props.isDarkTheme} />
                    : <NewFile color={props.color} setErrorValue={props.setErrorValue} setErrorDisplay={props.setErrorDisplay} isDarkTheme={props.isDarkTheme} mode={props.mode} changeColor={() => props.setMode(props.mode)} />
                }
            </CreatePopup>) : null}
            <CreateButton 
                className={props.color + " white-color create"}
                onClick={() => togglePopup(!showPopup)}>
                Create
            </CreateButton>
        </>
    )
}

export default Create;