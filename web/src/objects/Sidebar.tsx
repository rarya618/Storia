import styled from "styled-components";

const standardSettings = `
    text-align: left;
    display: flex;
    flex-direction: row;
    align-items: center;
    border-radius: 3px;
    font-size: 14px !important;
    font-weight: 500;
    cursor: pointer;
`;

const sidebarItemSettings = `
    min-width: 200px;
    margin: 0 8px 2px 8px;
`

export const SidebarTop = styled.div`
    position: sticky;
    display: flex;
    align-items: center;
    top: 0;
    height: 36px;
    padding: 7px 0;
    margin: 3px 0 2px 0;
`;

const vPadding = 11;
const hPadding = 10;
const offset = 9;

export const SidebarItem = styled.div`
    ${standardSettings}
    ${sidebarItemSettings}
    padding: ${hPadding}px ${vPadding}px;
`;

export const ViewAll = styled.div`
    ${standardSettings}
    margin: 0 10px;
    height: 12px;
    padding: ${hPadding}px ${vPadding - 3}px;
`;

export const SidebarItemAlt = styled.div`
    ${standardSettings}
    ${sidebarItemSettings}
    padding: ${hPadding - offset}px 0 ${hPadding - offset}px ${vPadding}px;
`;