import { Link } from "react-router-dom";
import StrokeIcon from "./screenplay/StrokeIcon";

// what a screen's bar starts with while its left rail is hidden: the button that
// brings the rail back, at the far left, then the wordmark, so it stays on
// screen with the rail away (the rail's own header has the wordmark first and
// its hide button at the right)
const ShowRail = ({label, onShow}: {label: string, onShow: () => void}) => <>
  <button type="button" className="sw-icon shrink-0" onClick={onShow} aria-label={label} title={label}>
    <StrokeIcon name="panelLeft" />
  </button>
  <Link to="/home" className="logo shrink-0 text-xl leading-none hover:opacity-80">Storia</Link>
</>;

export default ShowRail;
