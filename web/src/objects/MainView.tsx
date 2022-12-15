import styled from "styled-components";
import { faAngleDoubleLeft as closeSidebar, faBars as openSidebar} from '@fortawesome/free-solid-svg-icons';

const hPadding = 4;

export const MainView = styled.div`
    margin: 0 !important;
    padding: 0;
    overflow: scroll;
    width: 100% !important;
`;

export const MainViewTop = styled.div`
    height: 44px;
    top: 0px;
    padding: 2px ${hPadding}px 0 ${hPadding}px;
    margin: 4px 0 1px 0;
    display: flex;
    position: sticky;
    left: 0;
    flex-direction: row;
    align-items: center;
    z-index: 100;
    // box-shadow: 0 5px 5px rgba(0, 0, 0, 0.04);
`;

export const MainViewContent = styled.div`
    padding: 0 ${hPadding}px;
    max-width: 1200px;
    margin: 0 auto;
`;

export const Title = styled.h1`
    font-size: 16px;
    font-weight: 300;
    margin: 0 0 0 8px;
`;

export const sidebarIcon = (display: boolean) => {
    if (display)
        return closeSidebar;
    
    else 
        return openSidebar;
}