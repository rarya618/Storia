import { CodeColour, Scene, eighths, headingParts } from "../../screenplay/structure";

type SceneMastheadProps = {
  scene?: Scene,
  codes: Map<string, [CodeColour, CodeColour]>,
  sceneCount: number,
  pages: number,
  page: number,
  compact?: boolean,
};

export const CastCode = ({code}: {code?: [CodeColour, CodeColour]}) => (
  <span className="sw-code" aria-hidden="true">
    <i className={code?.[0] ?? "white"} /><i className={code?.[1] ?? "white"} />
  </span>
);

// the current scene, catalogue style: its number as the headline, then who's in it and the facts
const SceneMasthead = ({scene, codes, sceneCount, pages, page, compact}: SceneMastheadProps) => {
  const parts = scene ? headingParts(scene.heading) : undefined;
  const numeral = String(scene?.number ?? 0).padStart(2, "0");
  const where = parts ? [parts.place, parts.time].filter(Boolean).join(" · ") : "";

  if (compact) {
    return (
      <div className="flex items-end gap-4 min-w-0">
        <p key={numeral} className="sw-numeral shrink-0" style={{fontSize: 56}} aria-label={"Scene " + (scene?.number ?? 0)}>{numeral}</p>
        <div className="min-w-0 pb-1">
          <p className="sw-caps line-clamp-2 break-words">{parts?.location || (scene?.number ? "Untitled scene" : "Opening")}</p>
          <p className="sw-caps text-[color:var(--muted)]">{where || (sceneCount + " scenes · " + pages + (pages === 1 ? " page" : " pages"))}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="sw-caps sw-ruled">Scene</p>
      <p key={numeral} className="sw-numeral mt-5" aria-label={"Scene " + (scene?.number ?? 0)}>{numeral}</p>

      <p className="sw-caps mt-6 break-words" style={{fontSize: 13, letterSpacing: "0.24em"}}>
        {parts?.location || (scene?.number ? "Untitled scene" : "Opening")}
      </p>
      {where && <p className="sw-caps mt-1 text-[color:var(--muted)]">{where}</p>}

      <div className="mt-8">
        <p className="sw-caps sw-ruled">In this scene</p>
        {scene && scene.cast.length > 0 ? (
          <ul className="mt-3 flex flex-col gap-2">
            {scene.cast.map(name => (
              <li key={name} className="flex items-center gap-3">
                <CastCode code={codes.get(name)} />
                <span className="sw-caps truncate">{name}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-[13px] leading-5 text-[color:var(--muted)]">No one speaks yet. Press Tab on a new line to add a character.</p>
        )}
      </div>

      <dl className="sw-data mt-8">
        <div><dt className="sw-caps">Page</dt><dd>{page} / {Math.max(pages, 1)}</dd></div>
        <div><dt className="sw-caps">Length</dt><dd>{scene ? eighths(scene.lines) : "—"}</dd></div>
        <div><dt className="sw-caps">Scenes</dt><dd>{sceneCount}</dd></div>
        <div><dt className="sw-caps">Cast</dt><dd>{codes.size}</dd></div>
      </dl>
    </div>
  );
};

export default SceneMasthead;
