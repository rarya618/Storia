import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
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
    padding: 0 8px;
    border-radius: 3px;
    border: none;
    margin: 8px 1px 8px 12px;
    height: 32px;
    font-size: 14px;
`;

export const CreatePopup = styled.div`
    padding: 4px;
    width: 250px;
    border-radius: 3px;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.25);
    position: absolute;
    top: 0;
    z-index: 1000;
    margin: 5px 7px;
`;

export const Form = styled.form`
    display: flex;
    flex-direction: column;
`;

const textboxHeight = 26;

export const TextBox = styled.input`
    flex-grow: 1;
    height: ${textboxHeight}px;
    margin: 3px 5px;
    padding: 5px 8px;
    background: transparent;
    border-radius: 3px;
    border: solid 1px;
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

export const FinalButton = styled.button`
	border: solid 0.5px;
	margin: 7px 5px;
	width: auto;
    font-size: 14px;
	flex-grow: 0;
	padding: 6px 9px;
	border-radius: 3px;
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
            <div className="grow"></div>
            <Button
                color={props.color}
                border="no"
                text={<FontAwesomeIcon 
                    icon={faPlus}
                />}
                onClick={() => togglePopup(!showPopup)}
            />
        </>
    )
}

export default Create;