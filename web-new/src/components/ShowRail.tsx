import { Link } from "react-router-dom";
import StrokeIcon from "./screenplay/StrokeIcon";

// what a screen's bar starts with while its left rail is hidden: the wordmark,
// where the rail showed it, so it stays put as the rail closes, then the button
// that brings the rail back
const ShowRail = ({label, onShow}: {label: string, onShow: () => void}) => <>
  <Link to="/home" className="logo shrink-0 text-2xl leading-none hover:opacity-80">Storia</Link>
  <button type="button" className="sw-icon shrink-0" onClick={onShow} aria-label={label} title={label}>
    <StrokeIcon name="panelLeft" />
  </button>
</>;

export default ShowRail;
