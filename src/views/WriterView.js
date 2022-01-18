import { Link } from "react-router-dom";

function WriterView() {
    return (
        <>
        <div className="title-bar menu no-select drag white">
        </div>
        <div className="container">
            <h1>Writer View</h1>
            <Link to="/">Home</Link>
        </div>
        </>
    )
}

export default WriterView;