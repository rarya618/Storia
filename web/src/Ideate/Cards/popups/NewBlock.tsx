import React, { FormEvent } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from '@fortawesome/free-solid-svg-icons';

import { getClassCode } from '../../../App';
import { db } from '../../../firebase/config';
import { Card } from '../Page';
import Button from '../../../objects/Button';
import { WSFile } from '../../../Recents/NewFile';

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

const Heading = styled.input`
    font-size: 24px;
    margin: 4px 0;
    border: none;
    background: transparent;
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
    id: string,
    file: WSFile,
    updateFile: () => void,
    isDarkTheme: boolean,
    closePopup: () => void
}

export async function updateContent(data: Card[], id: string) {
    await db.collection('files').doc(id).update({content: data});
}

const NewBlock = (props: Props) => {
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
                alert("Something went wrong...")
                console.log(err)
            })
        }
        catch (error) {
            alert(error)
        }
    }
    return (
        <Modal>
            <Popup onSubmit={addToFile} className={getClassCode("", props.isDarkTheme)}>
                <div className="row flex-space-between">
                    <Heading id="title" className={props.color + "-color"} placeholder="Heading" />
                    <Button
                        color={props.color}
                        onClick={props.closePopup}
                        border="no"
                        text={<FontAwesomeIcon 
                            icon={faTrash}
                        />}
                    />
                </div>
                <Text id="text" className={props.color + "-color"} placeholder="Text" />
                <div className="left">
                    <button className={"button no-fill-space " + props.color + " white-color standard round-5px"}>Add</button>
                </div>
            </Popup>
        </Modal>
    )
}

export default NewBlock;