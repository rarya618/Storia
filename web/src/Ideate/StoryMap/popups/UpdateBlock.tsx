import React, { FormEvent, useState } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen } from '@fortawesome/free-solid-svg-icons';

import { getClassCode } from '../../../App';
import ErrorDisplay from '../../../objects/ErrorDisplay';
import { Modal, Popup, Text } from '../../Cards/popups/NewBlock';
import Button from '../../../objects/Button';

type Props = {
    color: string,
    isDarkTheme: boolean,
    text: string,
    updateFile: (text: string) => void,
    closePopup: () => void
}

const UpdateBlock = (props: Props) => {
    const [errorValue, setError] = useState("");
    const [errorDisplay, setErrorDisplay] = useState(false);

    const updateBlock = (event: FormEvent) => {
        event.preventDefault();   
        console.log("Starting update...") 
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
            props.updateFile(formData.text);
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
                
                <Popup onSubmit={updateBlock} className={getClassCode("", props.isDarkTheme)}>
                    <Text id="text" className={props.color + "-color"}>{props.text}</Text>
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
                            text="Discard"
                        />
                    </div>
                </Popup>
            </div>
        </Modal>
    )
}

export default UpdateBlock;