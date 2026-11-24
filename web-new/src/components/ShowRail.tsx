import { Link } from "react-router-dom";
import StrokeIcon from "./screenplay/StrokeIcon";

// what a screen's bar starts with while its left rail is hidden: the button that
// brings the rail back, then the wordmark, each where the rail's header has
// them, so neither moves as the rail opens and closes
const ShowRail = ({label, onShow}: {label: string, onShow: () => void}) => <>
  <button type="button" className="sw-icon shrink-0" onClick={onShow} aria-label={label} title={label}>
    <StrokeIcon name="panelLeft" />
  </button>
  <Link to="/home" className="logo shrink-0 text-xl leading-none hover:opacity-80">Storia</Link>
</>;

export default ShowRail;
