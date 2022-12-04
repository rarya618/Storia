import { faPen, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { getClassCode } from "../../App";
import { ProjectWithId } from "../../dataTypes/Project";
import { db } from "../../firebase/config";
import Button from "../../objects/Button";
import ErrorDisplay from "../../objects/ErrorDisplay";

type Props = {
    project: ProjectWithId | null,
    color: string,
    isDarkTheme: boolean,
    closePopup: () => void
}

const width = 320;

const Text = styled.p`
    margin: 5px;
`;

const modalPadding = 4;

export const Modal = styled.div`
    position: absolute;
    right: 0;
    padding: ${modalPadding}px 6px ${modalPadding}px ${modalPadding - 1}px;
    margin: 8px 10px;
    border-radius: 5px;
    box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
    border: none;
    z-index: 1000;
`;

export const Popup = styled.form`
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 0;
    min-width: ${width}px;
    max-width: ${width}px;
    border-radius: 5px;
`;

export const TextBox = styled.input`
    padding: 5px;
    background: transparent;
    -webkit-appearance: none;
    border: none;
    border-radius: 5px;
    margin: 2.5px 5px;
`;

// Update project name
async function updateProjectName(project: ProjectWithId, newName: string) {
    await db.collection('projects').doc(project.id).update({name: newName});
}

const RenameProject = (props: Props) => {
	const userId = sessionStorage.getItem("userId");
    let project = props.project;

    const [errorValue, setErrorValue] = useState("")
    const [errorDisplay, setErrorDisplay] = useState(false)

	var darkTheme = getClassCode("", props.isDarkTheme);

    const formAction = (event: FormEvent) => {
        event.preventDefault();

        // @ts-ignore
        const elementsArray = [...event.target.elements];

        const formData = elementsArray.reduce((acc, element) => {
            if (element.id) {
                acc[element.id] = element.value.trim();
            }

            return acc;
        }, {});

        try {
            if (formData.projectName === '') throw("Please enter new project name.");
            else if (!project) throw("Unexpected error: Project not detected.");

            else {
                updateProjectName(project, formData.projectName)
                .then(() => {
                    props.closePopup();
                    window.location.href = '/' + (project ? 'project/' + project.id : '');
                })
                .catch(err => {
                    setErrorValue(err);
                    setErrorDisplay(true);
                })
            }
        }
        catch (error) {
            // @ts-ignore
            setErrorValue(error);
            setErrorDisplay(true);
        }
    }
    return (
        <Modal className={props.color + "-color white"}>
            <ErrorDisplay error={errorValue} isDarkTheme={props.isDarkTheme} display={errorDisplay} toggleDisplay={setErrorDisplay} />
            { project ?
            <Popup onSubmit={formAction} className={darkTheme}>
                {/* <Text className={props.color + "-color"}>Current: <Link to={'/project/' + project.id}><span className={props.color + "-color underline"}>{project.name}</span></Link></Text> */}
                <TextBox id="projectName" className={props.color + "-color grow"} placeholder={project.name}/>
                <Button
                    color={props.color}
                    border="no"
                    text={<FontAwesomeIcon 
                        icon={faPen}
                    />}
                />
                <Button
                    color={props.color}
                    onClick={props.closePopup}
                    border="no"
                    text={<FontAwesomeIcon 
                        icon={faTrash}
                    />}
                />
            </Popup>
            : null}
        </Modal>
    )
}

export default RenameProject;