function NewProject() {
    return (
      <div className="container row spaced no-select">
        <div className="text-box round-5px white flat-spaced">
          <input className="inner-text-box absolute push-left transparent left" type="text" placeholder="Project Name"/>
          <span className={"label round-5px white-color absolute right green"}>Film</span>
        </div>
        <button className="button green white-color green-border round-5px small-spaced">Create</button>
      </div>
    );
}

export default NewProject;