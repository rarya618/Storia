import { PurpleButton, WhiteButton } from "./Button";

type LoadErrorProps = {
  message: string,
  title?: string,
  notFound?: boolean,
}

// shown when data can't be loaded, instead of spinning forever
const LoadError = ({message, title, notFound}: LoadErrorProps) => {
  return (
    <div role="alert" className="m-auto flex flex-col items-center text-center px-6 py-16 max-w-sm">
      <p className="text-neutral-800 dark:text-neutral-200">{title ?? "Couldn't load this page"}</p>
      <p className="text-neutral-600 dark:text-neutral-400 text-sm mt-1 mb-6">{message}</p>
      <div className="flex gap-3">
        {notFound ? <PurpleButton text="Go home" link="/home" /> : <>
          <PurpleButton text="Try again" onClick={() => window.location.reload()} />
          <WhiteButton text="Log out" link="/account/logout" />
        </>}
      </div>
    </div>
  )
}

export default LoadError;
