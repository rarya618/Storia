import React, { FormEvent, useState } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';

import { getClassCode } from '../../../App';
import { db } from '../../../firebase/config';
import Button from '../../../objects/Button';
import ErrorDisplay from '../../../objects/ErrorDisplay';
import { Modal, Popup, Text } from '../../Cards/popups/NewBlock';
import { StoryBlock } from '../../../dataTypes/Block';

type Props = {
    color: string,
    id: string,
    isDarkTheme: boolean,
    content: StoryBlock[],
    updateFile: () => void,
    closePopup: () => void
}

export async function updateContent(data: StoryBlock[], id: string) {
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

        const content = [...props.content, formData]

        try {
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
                <Text id="text" className={props.color + "-color"} placeholder="Text" />
                <div className="row flex-space-between">
                    
                    {/* <button className={"button no-fill-space " + props.color + " white-color standard round-5px"}><FontAwesomeIcon icon={faPlus}/></button> */}
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