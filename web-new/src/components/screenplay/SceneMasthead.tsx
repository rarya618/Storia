import { CodeColour, Scene, eighths, headingParts } from "../../screenplay/structure";
import { useCountTo } from "../../hooks/useCountTo";

// "ALLEY BEHIND THE CLUB" -> "Alley Behind The Club"; headings are stored in capitals
export const titleCase = (text: string) => text.toLowerCase().replace(/(^|[\s\-/'(])(\p{L})/gu, (_, gap, letter) => gap + letter.toUpperCase());

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
  const shown = useCountTo(scene?.number ?? 0);
  const numeral = String(shown).padStart(2, "0");
  // three-digit scene numbers step down so they still fit the column
  const numeralScale = numeral.length > 2 ? 0.7 : 1;
  const where = parts ? [parts.place, parts.time].filter(Boolean).map(titleCase).join(" · ") : "";
  const location = parts?.location ? titleCase(parts.location) : (scene?.number ? "Untitled scene" : "Opening");

  if (compact) {
    return (
      <div className="flex items-end gap-4 min-w-0">
        <p className="sw-numeral shrink-0" style={{fontSize: 32 * numeralScale}} aria-label={"Scene " + (scene?.number ?? 0)}>{numeral}</p>
        <div className="min-w-0 pb-1">
          <p className="line-clamp-2 break-words text-[14px] font-medium leading-5">{location}</p>
          <p className="sw-label text-[color:var(--muted)]">{where || (sceneCount + " scenes · " + pages + (pages === 1 ? " page" : " pages"))}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="sw-numeral" style={numeralScale < 1 ? {fontSize: 44 * numeralScale} : undefined} aria-label={"Scene " + (scene?.number ?? 0)}>{numeral}</p>

      <p className="mt-4 break-words text-[15px] font-medium leading-6">{location}</p>
      {where && <p className="sw-label mt-0.5 text-[color:var(--muted)]">{where}</p>}

      <div className="mt-8">
        <p className="sw-label sw-ruled">In this scene</p>
        {scene && scene.cast.length > 0 ? (
          <ul className="mt-3 flex flex-col gap-2">
            {scene.cast.map(name => (
              <li key={name} className="flex items-center gap-3">
                <CastCode code={codes.get(name)} />
                <span className="sw-label truncate">{titleCase(name)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-[13px] leading-5 text-[color:var(--muted)]">No one speaks yet. Press Tab on a new line to add a character.</p>
        )}
      </div>

      <dl className="sw-data mt-8">
        <div><dt className="sw-label">Page</dt><dd>{page} / {Math.max(pages, 1)}</dd></div>
        <div><dt className="sw-label">Length</dt><dd>{scene ? eighths(scene.lines) : "—"}</dd></div>
        <div><dt className="sw-label">Scenes</dt><dd>{sceneCount}</dd></div>
        <div><dt className="sw-label">Cast</dt><dd>{codes.size}</dd></div>
      </dl>
    </div>
  );
};

export default SceneMasthead;
