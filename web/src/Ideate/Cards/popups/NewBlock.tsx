import React, { FormEvent, useState } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';

import { getClassCode } from '../../../App';
import { db } from '../../../firebase/config';
import Button from '../../../objects/Button';
import { Document } from '../../../dashboard/popups/NewFile';
import ErrorDisplay from '../../../objects/ErrorDisplay';
import { Card } from '../../../dataTypes/Block';

const paddingValue = 9;

export const Modal = styled.div`
    position: fixed;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
`;

export const Popup = styled.form`
    display: flex;
    flex-direction: column;
    padding: ${paddingValue}px;
    min-width: 320px;
    border-radius: 5px;
`;

export const Heading = styled.textarea`
    font-size: 20px;
    margin: 4px 1px 0 1px;
    font-weight: 600;
    border: none;
    resize: none;
    height: 26px;
    overflow: hidden;
    background: transparent;
`;

export const Text = styled.textarea`
    font-size: 16px;
    border: none;
    margin: 2px 1px;
    resize: none;
    min-height: 300px;
    background: transparent;
`;

type Props = {
    color: string,
    id: string,
    file: Document,
    updateFile: () => void,
    isDarkTheme: boolean,
    closePopup: () => void
}

export async function updateContent(data: Card[], id: string) {
    await db.collection('files').doc(id).update({content: data});
}

const NewBlock = (props: Props) => {
    const [errorValue, setError] = useState("");
    const [errorDisplay, setErrorDisplay] = useState(false);
    
    const addToFile = (event: FormEvent) => {
        event.preventDefault();

        // @ts-ignore
        const elementsArray = [...event.target.elements];

        const formData = elementsArray.reduce((acc, element) => {
            if (element.id) {
                acc[element.id] = element.value.trim();
            }

            return acc;
        }, {});

        const content = [...props.file.content, formData]

        try {
            if (formData.title === '') throw("Please enter a heading");
            if (formData.text === '') throw("Please enter some text");

            updateContent(content, props.id)
            .then(() => {
                props.updateFile();
                props.closePopup();
            })
            .catch(err => {
                setError(err);
                setErrorDisplay(true);
            })
        }
        catch (error) {
            // @ts-ignore
            setError(error);
            setErrorDisplay(true);
        }
    }
    return (
        <Modal onClick={props.closePopup}>
            <div onClick={(e) => e.stopPropagation()}>
            <ErrorDisplay error={errorValue} isDarkTheme={props.isDarkTheme} display={errorDisplay} toggleDisplay={setErrorDisplay} />
            <Popup onSubmit={addToFile} className={getClassCode("", props.isDarkTheme)}>
                <div className="row flex-space-between">
                    <Heading id="title" className={props.color + "-color"} placeholder="Heading" />
                </div>
                <Text id="text" className={props.color + "-color"} placeholder="Text" />
                
                <div className="row flex-space-between">
                    <Button
                        color={props.color}
                        border="no"
                        text={<FontAwesomeIcon 
                            icon={faPlus}
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
            </div>
        </Modal>
    )
}

export default NewBlock;