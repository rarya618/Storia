import { faPen, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { getClassCode } from "../../App";
import { Project, ProjectWithId } from "../../dataTypes/Project";
import { db, getDoc } from "../../firebase/config";
import { Modal } from "../../Ideate/Cards/popups/NewBlock";
import Button from "../../objects/Button";
import ErrorDisplay from "../../objects/ErrorDisplay";
import Select, { ItemType } from "../../objects/Select";
import { GetProjects } from "../Projects";
import { Popup, PopupProps, TextBox, Title } from "./AddDocToProject";
import { randomString } from "./Create";
import { createProject } from "./NewProject";

const ProjectDetails = styled.div`
    border: solid 0.5px;
    border-radius: 2px;
    margin: 6px;
`;

const ProjectText = styled.p``;

async function updateProject(oldProject: ProjectWithId, newProject: ProjectWithId, docId: string) {
    var oldProjectFiles = [...oldProject.files];
    var newProjectFiles = [...newProject.files];

    await db.collection('files').doc(docId).update({project: newProject.id});

    // add file to new project
    newProjectFiles.push(docId);

    // remove file from old project
    for(var i = 0; i < oldProjectFiles.length; i++){      
        if (oldProjectFiles[i] === docId) { 
            oldProjectFiles.splice(i, 1); 
            i--;
        }
    }

    // Update new project
    await db.collection('projects').doc(newProject.id).update({files: newProjectFiles});

    // Update old project
    await db.collection('projects').doc(oldProject.id).update({files: oldProjectFiles});
}

const ChangeProject = (props: PopupProps) => {
	const userId = sessionStorage.getItem("userId");
	let projects: ProjectWithId[] = [];

    if (userId) {
    	projects = GetProjects(userId);
    }

    // initialise project data
    const [currentProject, setCurrentProject] = useState<string | ProjectWithId>("not-selected");
    const [oldProject, setOldProject] = useState<ProjectWithId>();

    async function getProjectData(projectId: string) {
        if (projectId !== "") {
            const docRef = db.collection('projects').doc(projectId);

            // @ts-ignore
            const tempDoc: ProjectWithId = {id: projectId, ...(await getDoc(docRef)).data()};
            
            if (tempDoc) {
                setOldProject(tempDoc);
            }
        }
    }

    // call function
    useEffect(() => {
        getProjectData(props.file.project ? props.file.project : "");
    }, [])

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
            else if (!oldProject) throw("Unexpected error: Old project not detected.");

            else if (typeof currentProject !== 'string') {
                if (currentProject.id === oldProject.id) throw("You selected the same project")
                else {
                    updateProject(oldProject, currentProject, props.file.id)
                    .then(() => {
                        props.closePopup();
                        window.location.href = '/';
                    })
                    .catch(err => {
                        setErrorValue(err);
                        setErrorDisplay(true);
                    })
                }
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
                    updateProject(oldProject, {id: id, ...content}, props.file.id)
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
                {oldProject ? 
                    <ProjectDetails className={props.color + "-color"}>
                        <ProjectText><Link to={`/project/${oldProject.id}`}><span className={props.color + "-color underline"}>{oldProject.name}</span></Link> ({oldProject.public ? "Public" : "Private"})</ProjectText>
                    </ProjectDetails> : null
                }
                <Select 
                    current={currentProject}
                    darkTheme={darkTheme} 
                    color={props.color}
                    // @ts-ignore
                    onChangeHandler={(e: string | ProjectWithId) => {
                        setCurrentProject(e);
                    }}
                    items={projects}
                />
                <p className={props.color + "-color uneven-spaced"}>or</p>
                <TextBox id="projectName" className={props.color + "-color"} placeholder="New project name" />
                <div className="row flex-space-between">
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
                </div>
            </Popup>
        </Modal>
    )
}

export default ChangeProject;