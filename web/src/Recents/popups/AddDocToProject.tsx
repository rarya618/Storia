import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { FormEvent, useState } from "react";
import styled from "styled-components";
import { getClassCode } from "../../App";
import { db } from "../../firebase/config";
import { Modal } from "../../Ideate/Cards/popups/NewBlock";
import Button from "../../objects/Button";
import ErrorDisplay from "../../objects/ErrorDisplay";
import Select, { ItemType } from "../../objects/Select";
import { GetProjects } from "../Projects";
import { randomString } from "./Create";
import { DocumentWithId } from "./NewFile";
import { createProject, Project, ProjectWithId } from "./NewProject";

const Popup = styled.form`
    display: flex;
    flex-direction: column;
    padding: 6px 5px;
    min-width: 320px;
    border-radius: 5px;
`;

const Title = styled.h1`
    padding: 10px;
    font-size: 28px;
    font-weight: 400;
    margin: 5px;
`;

const TextBox = styled.input`
    padding: 10px;
    background: transparent;
    border: solid 0.5px;
    border-radius: 5px;
    margin: 5px;
`;

type Props = {
    color: string,
    file: DocumentWithId,
    // updateFile: () => void,
    isDarkTheme: boolean,
    closePopup: () => void
}

async function updateProject(project: ProjectWithId, docId: string) {
    var projectFiles = [...project.files];

    await db.collection('files').doc(docId).update({project: project.id});

    projectFiles.push(docId);
    await db.collection('projects').doc(project.id).update({files: projectFiles});
}

const AddDocToProject = (props: Props) => {
	const userId = sessionStorage.getItem("userId");
	let projects: ProjectWithId[] = [];

    if (userId) {
    	projects = GetProjects(userId);
    }

    const [currentProject, setCurrentProject] = useState<ItemType>("not-selected")
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
            if (formData.projectName === '' && currentProject === "not-selected") throw("Please select or create a project.");
            else if (formData.projectName !== '' && currentProject !== "not-selected") throw("You can either select or create a project.");

            else if (typeof currentProject !== 'string') {
                updateProject(currentProject, props.file.id)
                .then(() => {
                    props.closePopup();
                    window.location.href = '/';
                })
                .catch(err => {
                    setErrorValue(err);
                    setErrorDisplay(true);
                })
            } else {
                const content: Project = {
                    name: formData.projectName,
                    public: false,
                    files: [],
                    users: [(userId ? userId : "Guest")]
                }
    
                const id = randomString(12);

                createProject(content, id)
                .then(() => {
                    updateProject({id: id, ...content}, props.file.id)
                    .then(() => {
                        props.closePopup();
                        window.location.href = '/';
                    })
                    .catch(err => {
                        setErrorValue(err);
                        setErrorDisplay(true);
                    })
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
        <Modal>
            <ErrorDisplay error={errorValue} isDarkTheme={props.isDarkTheme} display={errorDisplay} toggleDisplay={setErrorDisplay} />
            <Popup onSubmit={formAction} className={darkTheme}>
                <Title className={props.color + "-color"}>{props.file.name}</Title>
                <Select 
                    current={currentProject}
                    darkTheme={darkTheme} 
                    color={props.color}
                    onChangeHandler={e => {
                        setCurrentProject(e);
                    }}
                    items={projects}
                />
                <p className={props.color + "-color small-spaced"}>or</p>
                <TextBox id="projectName" className={props.color + "-color"} placeholder="New project name" />
                <div className="row small-spaced flex-space-between">
                    <button className={"button " + props.color + " white-color standard round-5px"}>Update</button>
                    <Button
                        color={props.color}
                        onClick={props.closePopup}
                        border="no"
                        text={<FontAwesomeIcon 
                            icon={faTrash}
                        />}
                    />
                </div>
            </Popup>
        </Modal>
    )
}

export default AddDocToProject;