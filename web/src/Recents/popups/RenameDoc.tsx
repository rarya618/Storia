import { faPen, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { FormEvent, useState } from "react";
import styled from "styled-components";
import { getClassCode } from "../../App";
import { db } from "../../firebase/config";
import Button from "../../objects/Button";
import ErrorDisplay from "../../objects/ErrorDisplay";
import { Modal, Popup, TextBox } from "../../projectView/popups/Rename";
import { DocumentWithId } from "./NewFile";

type Props = {
    document: DocumentWithId | null,
    color: string,
    isDarkTheme: boolean,
    closePopup: () => void
}

// Update document name
async function updateDocumentName(document: DocumentWithId, newName: string) {
    await db.collection('files').doc(document.id).update({name: newName});
}

const RenameDocument = (props: Props) => {
	const userId = sessionStorage.getItem("userId");
    let document = props.document;

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
            if (formData.documentName === '') throw("Please enter new document name.");
            else if (!document) throw("Unexpected error: Document not detected.");

            else {
                updateDocumentName(document, formData.documentName)
                .then(() => {
                    props.closePopup();
                    window.location.href = '/' + (document ? document.type + '/' + document.id : '');
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
            { document ?
            <Popup onSubmit={formAction} className={darkTheme}>
                {/* <Text className={props.color + "-color"}>Current: <Link to={'/project/' + project.id}><span className={props.color + "-color underline"}>{project.name}</span></Link></Text> */}
                <TextBox id="documentName" className={props.color + "-color grow"} placeholder={document.name}/>
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

export default RenameDocument;