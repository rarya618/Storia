import React, { FormEvent, useState } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen } from '@fortawesome/free-solid-svg-icons';

import { getClassCode } from '../../../App';
import ErrorDisplay from '../../../objects/ErrorDisplay';

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
    z-index: 100;
`;

const Popup = styled.form`
    display: flex;
    flex-direction: column;
    padding: 12px 12px 14px 12px;
    min-width: 320px;
    border-radius: 5px;
    background: linear-gradient(0deg, rgba(97, 102, 179, 0.1), rgba(97, 102, 179, 0.1)), #FFFFFF;
`;

const Text = styled.textarea`
    font-size: 18px;
    border: none;
    margin: 4px 0;
    min-height: 300px;
    resize: none;
    background: transparent;
`;

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
                        <button className={"button no-fill-space " + props.color + " white-color standard round-5px"}>
                            <FontAwesomeIcon icon={faPen} />
                        </button>
                        <button onClick={props.closePopup} className={"button no-fill-space " + props.color + " white-color standard round-5px"}>Close</button>
                    </div>
                </Popup>
            </div>
        </Modal>
    )
}

export default UpdateBlock;