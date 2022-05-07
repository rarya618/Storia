import React, { useState } from "react";
import { Link } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisV as dotsIcon } from '@fortawesome/free-solid-svg-icons';

import Button from "../objects/Button";
import { ProjectWithId } from "./popups/NewProject";
import { RecentBlock, Heading } from "./RecentFile";
import { DropdownGen } from "../objects/Dropdown";
import { projectDotDropdown } from "../resources/dropdowns";

type Props = {
    file: ProjectWithId,
    classCode: string,
    isDarkTheme: boolean
}

const RecentProject = (props: Props) => {
    const [showDropdown, toggleDropdown] = useState(false);

    var classCode = props.classCode;

    const file = props.file;

    const timeStamp = file.time ? file.time.seconds * 1000 : Date.now();
    const time = new Intl.DateTimeFormat('en-US', {year: 'numeric', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'}).format(timeStamp);
    
    return (
        <RecentBlock className={"no-select " + classCode + "-view " + classCode + "-color recent-block"}>
            <div className="row">
                <Link className={classCode + "-color grow"} to={"/project/" + file.id}>
                    <Heading>{file.name}</Heading>
                </Link>
                <Button 
                    id="" 
                    text={<FontAwesomeIcon icon={dotsIcon} />} 
                    color={classCode} 
                    border="no" 
                    onClick={(e) => {
                        e.stopPropagation()
                        toggleDropdown(!showDropdown)
                    }}
                />
                {
                    showDropdown 
                    ? DropdownGen(
                        classCode, 
                        props.isDarkTheme, 
                        projectDotDropdown()
                    ) : null
                }
            </div>
            <p className={"heading left " + classCode + "-color"}>Last modified: {time}</p>
        </RecentBlock>
    );
}

export default RecentProject;