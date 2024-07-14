import { Link } from "react-router-dom";

// if there is no existing page
function PageNotFound() {
  return (
    <div className="flex w-screen">
      <div className="m-auto px-8 py-8 rounded border border-purple border-dashed">
        <h2 className="text-xl font-light text-purple mr-10 mb-1">Error 404: Page not found!</h2>
        <p className="text-sm">
          Go to the <Link className="text-sm underline text-purple" to="/">home</Link> page
        </p>
      </div>
    </div>
  );
}

export default PageNotFound;