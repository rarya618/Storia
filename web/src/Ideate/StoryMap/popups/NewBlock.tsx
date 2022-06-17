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
import { GroupLabel } from '../Block';

type Props = {
    color: string,
    id: string,
    isDarkTheme: boolean,
    content: StoryBlock[],
    updateFile: () => void,
    closePopup: () => void,
    currentGroup: string,
    currentGroupName: string
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

        try {
            if (formData.text === '') throw("Please enter some text");

            const block: StoryBlock = {
                text: formData.text,
                groups: [props.currentGroup]
            }
    
            const content = [...props.content, block];

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
                <div className="row align-center flex-space-between">
                    <Button
                        color={props.color}
                        border="no"
                        text={<FontAwesomeIcon 
                            icon={faPlus}
                        />}
                    />
                    {props.currentGroupName !== 'View All' ?
                        <GroupLabel className={props.color + " white-color"}
                            onClick={(e) => {
                                e.preventDefault()
                            }}
                        >
                            {props.currentGroupName}
                        </GroupLabel>
                    : null}
                    {/* </div> */}
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