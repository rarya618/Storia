import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { REVISIONS, revisionStyle } from "../screenplay/revisions";
import "../screenplay/world.css";

// the signed-out pages: one white page on the paper rail's tint, the next
// revisions (blue, pink) fanned beneath it, under the wordmark
export const AuthCard = ({title, children, footer}: {title: string, children: ReactNode, footer?: ReactNode}) => (
  <main className="sw sw-rev flex min-h-screen w-full overflow-y-auto !bg-[color:var(--rail)] px-4 py-12">
    <div className="sw-enter m-auto w-full max-w-[420px]">
      <a href="/" className="logo mb-8 block text-center text-4xl leading-none hover:opacity-80">Storia</a>
      <div className="sw-stack sw-auth-stack">
        <span className="sw-stack-under" style={revisionStyle(REVISIONS[2])} aria-hidden="true" />
        <span className="sw-stack-under" style={revisionStyle(REVISIONS[1])} aria-hidden="true" />
        <div className="relative rounded-[12px] border border-[color:var(--hair-strong)] bg-[color:var(--paper)] px-6 pb-7 pt-6 shadow-[0_1px_3px_rgb(27_27_31/0.08)] sm:px-8">
          <h1 className="mb-6 text-2xl font-bold tracking-tight">{title}</h1>
          {children}
        </div>
      </div>
      {footer && <div className="mt-10 text-center text-sm text-[color:var(--muted)]">{footer}</div>}
    </div>
  </main>
);

// a labelled text input in the world's form style, marked when its error is
// showing; aside sits at the label's end, as Forgot your password? does
export const Field = ({id, label, type = "text", placeholder, autoComplete, autoFocus, invalid, errorId, aside}: {
  id: string, label: string, type?: string, placeholder?: string, autoComplete?: string, autoFocus?: boolean, invalid?: boolean, errorId?: string,
  aside?: ReactNode,
}) => (
  <div>
    <div className="mb-1.5 flex items-baseline justify-between gap-3">
      <label htmlFor={id} className="sw-label block">{label}</label>
      {aside && <span className="text-sm">{aside}</span>}
    </div>
    <input
      id={id}
      name={id}
      type={type}
      placeholder={placeholder}
      autoComplete={autoComplete}
      autoFocus={autoFocus}
      aria-invalid={invalid || undefined}
      aria-describedby={invalid ? errorId : undefined}
      className="sw-input"
    />
  </div>
);

// the inline error under a form, in Signal Red
export const FormError = ({id, message}: {id: string, message?: string}) =>
  message ? <p id={id} role="alert" className="mt-3 text-sm text-[color:var(--signal)]">{message}</p> : null;

// a text link in ink, always underlined so it reads as a link without colour
export const TextLink = ({to, children}: {to: string, children: ReactNode}) => (
  <Link to={to} className="font-bold text-[color:var(--ui)] underline decoration-[color:var(--hair-strong)] decoration-2 underline-offset-4 hover:decoration-[color:var(--ui)]">{children}</Link>
);
