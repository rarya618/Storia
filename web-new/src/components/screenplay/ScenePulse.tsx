import { Scene, pulsePath } from "../../screenplay/structure";

// one scene's hairline: its length follows the scene's length, its peaks the dialogue
const ScenePulse = ({scene, maxLines, width, amplitude, current, onAccent}: {scene: Scene, maxLines: number, width: number, amplitude: number, current?: boolean, onAccent?: boolean}) => {
  const {points} = pulsePath(scene, maxLines, width, amplitude, scene.id);
  const height = amplitude + 3;
  const d = points.map(([x, y], i) => (i === 0 ? "M" : "L") + x.toFixed(1) + "," + (height - 1.5 + y).toFixed(1)).join("");
  return (
    <svg className="sw-shape block overflow-visible" width={width} height={height} aria-hidden="true">
      <path d={d} fill="none" stroke={onAccent ? "rgb(255 255 255 / 0.9)" : current ? "var(--accent)" : "var(--pulse)"} strokeWidth={current ? 1.4 : 1} />
    </svg>
  );
};

export default ScenePulse;
