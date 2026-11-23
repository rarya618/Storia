import { Link } from "react-router-dom";
import "../screenplay/world.css";

type LoadErrorProps = {
  message: string,
  title?: string,
  notFound?: boolean,
}

// shown when data can't be loaded, instead of spinning forever
const LoadError = ({message, title, notFound}: LoadErrorProps) => {
  return (
    <div role="alert" className="sw m-auto flex max-w-sm flex-col items-center px-6 py-16 text-center">
      <p className="text-sm font-semibold tracking-tight">{title ?? "Couldn't load this page"}</p>
      <p className="mb-5 mt-1 text-sm text-[color:var(--muted)]">{message}</p>
      <div className="flex gap-2">
        {notFound
          ? <Link to="/home" className="sw-button sw-button-soft">Go home</Link>
          : <>
            <button type="button" className="sw-button sw-button-soft" onClick={() => window.location.reload()}>Try again</button>
            <Link to="/account/logout" className="sw-button">Log out</Link>
          </>}
      </div>
    </div>
  )
}

export default LoadError;
