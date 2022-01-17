import SavedDocView from "./SavedDocView";

function Recents() {
    return (
        <div className="recents">
            <h1 className="heading align-left">Recents</h1>
            <div className="row">
                <SavedDocView />
            </div>
        </div>
    );
}

export default Recents;