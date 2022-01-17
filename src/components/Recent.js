import RecentFile from "./objects/RecentFile";

function Recent() {
    return (
      <div className="container">
          <h1 className="heading left top-heading green-color">Recents</h1>
          <div className="row">
            <RecentFile name="Jack with Barista" type="Film" />
            <RecentFile name="Jack's Adventures" type="Series" />
          </div>
      </div>
    );
}

export default Recent;