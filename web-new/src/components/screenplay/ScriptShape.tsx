import { Scene, eighths, pulsePath } from "../../screenplay/structure";

type ScriptShapeProps = {
  scenes: Scene[],
  currentId?: string,
  onSelect: (sceneId: string) => void,
};

const label = (scene: Scene) =>
  "Scene " + scene.number + (scene.heading ? ": " + scene.heading : "") + ", " + eighths(scene.lines) + " pages";

// phones: the whole script as one continuous hairline, each scene a stretch
// proportional to its length, peaks where people talk; tap a stretch to go there
const ScriptShape = ({scenes, currentId, onSelect}: ScriptShapeProps) => {
  const total = scenes.reduce((sum, scene) => sum + scene.lines, 0) || 1;
  const UNITS = 1000;
  const HEIGHT = 28;
  let offset = 0;
  const segments = scenes.map(scene => {
    const width = (scene.lines / total) * UNITS;
    const {points} = pulsePath(scene, scene.lines, width, 16, scene.id);
    const segment = {scene, x: offset, width, points};
    offset += width;
    return segment;
  });

  return (
    <div className="relative h-[28px] w-full">
      <svg className="sw-shape absolute inset-0 h-full w-full" viewBox={"0 0 " + UNITS + " " + HEIGHT} preserveAspectRatio="none" aria-hidden="true">
        {segments.map(({scene, x, points}) => {
          const isCurrent = scene.id === currentId;
          const d = points.map(([px, py], i) => (i === 0 ? "M" : "L") + (x + px).toFixed(1) + "," + (HEIGHT - 2 + py).toFixed(1)).join("");
          return (
            <g key={scene.id}>
              <path d={"M" + x.toFixed(1) + "," + (HEIGHT - 6) + "V" + HEIGHT} stroke="var(--hair-strong)" strokeWidth="1" />
              <path d={d} fill="none" stroke={isCurrent ? "var(--signal)" : "var(--pulse)"} strokeWidth={isCurrent ? 1.5 : 1} />
            </g>
          );
        })}
      </svg>
      <div className="absolute inset-0 flex" role="group" aria-label="Scenes">
        {segments.map(({scene, width}) => (
          <button
            key={scene.id}
            type="button"
            onClick={() => onSelect(scene.id)}
            aria-label={label(scene)}
            aria-current={scene.id === currentId ? "location" : undefined}
            className="h-full min-w-[12px]"
            style={{flexBasis: (width / UNITS * 100) + "%", flexGrow: 0, flexShrink: 1}}
          />
        ))}
      </div>
    </div>
  );
};

export default ScriptShape;
