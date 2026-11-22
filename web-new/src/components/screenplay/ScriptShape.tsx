import { Scene, eighths, pulsePath } from "../../screenplay/structure";

type ScriptShapeProps = {
  scenes: Scene[],
  currentId?: string,
  onSelect: (sceneId: string) => void,
  compact?: boolean,
};

const ROW = 13;          // vertical distance between pulses
const AMPLITUDE = 15;    // tallest dialogue peak
const WIDTH = 236;       // longest scene's line length
const GUTTER = 30;       // scene numbers on the left

const label = (scene: Scene) =>
  "Scene " + scene.number + (scene.heading ? ": " + scene.heading : "") + ", " + eighths(scene.lines) + " pages";

// the whole script as stacked hairline pulses: one line per scene, its length
// following the scene's length and its peaks following the dialogue
const ScriptShape = ({scenes, currentId, onSelect, compact}: ScriptShapeProps) => {
  const maxLines = Math.max(...scenes.map(scene => scene.lines), 1);
  const currentIndex = scenes.findIndex(scene => scene.id === currentId);

  // phones and narrow windows: the whole script as one continuous pulse,
  // each scene a stretch proportional to its length
  if (compact) {
    const total = scenes.reduce((sum, scene) => sum + scene.lines, 0) || 1;
    const UNITS = 1000;
    const HEIGHT = 34;
    let offset = 0;
    const segments = scenes.map(scene => {
      const width = (scene.lines / total) * UNITS;
      const {points} = pulsePath(scene, scene.lines, width, 22, scene.id);
      const segment = {scene, x: offset, width, points};
      offset += width;
      return segment;
    });

    return (
      <div className="relative h-[34px] w-full">
        <svg className="sw-shape absolute inset-0 h-full w-full" viewBox={"0 0 " + UNITS + " " + HEIGHT} preserveAspectRatio="none" aria-hidden="true">
          {segments.map(({scene, x, points}) => {
            const isCurrent = scene.id === currentId;
            const d = points.map(([px, py], i) => (i === 0 ? "M" : "L") + (x + px).toFixed(1) + "," + (HEIGHT - 2 + py).toFixed(1)).join("");
            return (
              <g key={scene.id}>
                <path d={"M" + x.toFixed(1) + "," + (HEIGHT - 8) + "V" + HEIGHT} stroke="var(--ink)" strokeWidth="1" />
                <path d={d} fill="none" stroke={isCurrent ? "var(--signal)" : "var(--ink)"} strokeWidth={isCurrent ? 2 : 1} />
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
              title={scene.heading || "Untitled scene"}
              className="h-full min-w-[12px] hover:bg-[rgb(13_13_13/0.05)]"
              style={{flexBasis: (width / UNITS * 100) + "%", flexGrow: 0, flexShrink: 1}}
            />
          ))}
        </div>
      </div>
    );
  }

  const height = AMPLITUDE + 6 + scenes.length * ROW;

  return (
    <div className="relative" style={{width: GUTTER + WIDTH, height}}>
      <svg className="sw-shape absolute inset-0" width={GUTTER + WIDTH} height={height} aria-hidden="true">
        {scenes.map((scene, index) => {
          const baseline = AMPLITUDE + 4 + index * ROW;
          const {points} = pulsePath(scene, maxLines, WIDTH, AMPLITUDE, scene.id);
          const line = points.map(([x, y], i) => (i === 0 ? "M" : "L") + (GUTTER + x).toFixed(1) + "," + (baseline + y).toFixed(1)).join("");
          const last = points[points.length - 1][0];
          // fill under each pulse with paper so later lines hide the ones behind them
          const fill = line + "L" + (GUTTER + last).toFixed(1) + "," + (baseline + ROW) + "L" + GUTTER + "," + (baseline + ROW) + "Z";
          const isCurrent = index === currentIndex;
          return (
            <g key={scene.id}>
              <path d={fill} fill="var(--paper)" stroke="none" />
              <path d={line} fill="none" stroke={isCurrent ? "var(--signal)" : "var(--ink)"} strokeWidth={isCurrent ? 1.6 : 0.9} />
              {(isCurrent || scene.number % 5 === 0 || index === 0) && (
                <text
                  x={GUTTER - 10}
                  y={baseline + 3}
                  textAnchor="end"
                  fontSize="9"
                  letterSpacing="0.1em"
                  fill={isCurrent ? "var(--signal)" : "var(--muted)"}
                  style={{fontVariantNumeric: "tabular-nums", fontStretch: "112%"}}
                >
                  {String(scene.number).padStart(2, "0")}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* a red mark that travels to the current scene */}
      {currentIndex >= 0 && (
        <span
          className="sw-marker absolute left-0 block h-[3px] w-[6px]"
          style={{background: "var(--signal)", transform: "translateY(" + (AMPLITUDE + 3 + currentIndex * ROW) + "px)", top: 0}}
          aria-hidden="true"
        />
      )}

      {/* one real button per scene, laid over its line */}
      <div className="absolute inset-0" role="group" aria-label="Scenes">
        {scenes.map((scene, index) => (
          <button
            key={scene.id}
            type="button"
            title={scene.heading || "Untitled scene"}
            aria-label={label(scene)}
            aria-current={index === currentIndex ? "location" : undefined}
            onClick={() => onSelect(scene.id)}
            className="absolute left-0 right-0 block hover:bg-[rgb(13_13_13/0.05)]"
            style={{top: AMPLITUDE + 4 + index * ROW - ROW + 3, height: ROW}}
          />
        ))}
      </div>
    </div>
  );
};

export default ScriptShape;
