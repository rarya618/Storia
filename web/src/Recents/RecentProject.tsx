import React, { useState } from "react";
import { Link } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisV as dotsIcon } from '@fortawesome/free-solid-svg-icons';

import Button from "../objects/Button";
import { ProjectWithId } from "./popups/NewProject";
import { RecentBlock, Heading, Text, BlockTop } from "./RecentFile";
import { DropdownGen } from "../objects/Dropdown";
import { projectDotDropdown } from "../resources/dropdowns";
import ProjectDropdown from "../projectView/popups/DotDropdown";

type Props = {
    file: ProjectWithId,
    classCode: string,
    isDarkTheme: boolean
}

const RecentProject = (props: Props) => {
    const [showDropdown, toggleDropdown] = useState(false);

    var classCode = props.classCode;

    const project = props.file;

    const timeStamp = project.time ? project.time.seconds * 1000 : Date.now();
    const time = new Intl.DateTimeFormat('en-US', {year: 'numeric', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'}).format(timeStamp);
    
    const filesCount = project.files.length;

    return (
        <RecentBlock className={"no-select " + classCode + "-view " + classCode + "-color recent-block"}>
            <BlockTop>
                <Link className={classCode + "-color grow"} to={"/project/" + project.id}>
                    <Heading>{project.name}</Heading>
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
                <ProjectDropdown 
                    showDropdown={showDropdown}
                    toggleDropdown={toggleDropdown}
                    classCode={classCode}
                    isDarkTheme={props.isDarkTheme}
                    project={project}
                />
            </BlockTop>
            <Text className={"heading left " + classCode + "-color-tint"}>Last modified: {time}</Text>
            {filesCount > 0 ? <Text className={"heading left " + classCode + "-color-tint"}>{filesCount} document{filesCount > 1 ? 's' : ''}</Text> : null}
        </RecentBlock>
    );
}

export default RecentProject;