import React from "react";
import { useNavigate } from "react-router-dom";
import { useTitle } from "../App";
import { Overlay } from "../login/SignUp";
import { setTitleForBrowser } from "../resources/title";

const SupplementaryPage = (props: {title: string, content: JSX.Element}) => {
    useTitle(setTitleForBrowser(props.title));

    let navigate = useNavigate();

    return (
        <Overlay>
            <div className="tos">
                <button 
                    className="button absolute push-right push-up purple small-spaced-none white-color standard round-5px"
                    onClick={() => {
                        navigate("/sign-up")
                    }}
                >
                    Sign up
                </button>
                {props.content}
            </div>
        </Overlay>
    )
}

export default SupplementaryPage;