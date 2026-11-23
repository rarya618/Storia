import { ReactNode } from "react";
import { Link } from "react-router-dom";
import "../screenplay/world.css";

// the signed-out pages: one white card on the sidebar's grey, under the wordmark
export const AuthCard = ({title, children, footer}: {title: string, children: ReactNode, footer?: ReactNode}) => (
  <main className="sw flex min-h-screen w-full overflow-y-auto !bg-[color:var(--tint)] px-4 py-10">
    <div className="m-auto w-full max-w-[380px]">
      <Link to="/" className="logo mb-5 block text-center text-[28px] leading-none text-[color:var(--accent)] hover:opacity-80">Storia</Link>
      <div className="rounded-lg border border-[color:var(--hair)] bg-[color:var(--paper)] px-6 pb-6 pt-5 shadow-[0_1px_2px_rgb(0_0_0/0.04)]">
        <h1 className="mb-4 text-[16px] font-bold leading-[22px] tracking-tight">{title}</h1>
        {children}
      </div>
      {footer && <div className="mt-4 text-center text-[12.5px] leading-[18px] text-[color:var(--muted)]">{footer}</div>}
    </div>
  </main>
);

// a labelled text input in the world's form style, marked when its error is showing
export const Field = ({id, label, type = "text", placeholder, autoComplete, autoFocus, invalid, errorId}: {
  id: string, label: string, type?: string, placeholder?: string, autoComplete?: string, autoFocus?: boolean, invalid?: boolean, errorId?: string,
}) => (
  <div>
    <label htmlFor={id} className="sw-label mb-1.5 block">{label}</label>
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
  message ? <p id={id} role="alert" className="mt-3 text-[12.5px] leading-[18px] text-[color:var(--signal)]">{message}</p> : null;

// a text link in Storia purple, the one place purple stands for "go here"
export const TextLink = ({to, children}: {to: string, children: ReactNode}) => (
  <Link to={to} className="font-semibold text-[color:var(--on-select)] underline-offset-2 hover:underline">{children}</Link>
);
