import { ScriptBlock } from "../../screenplay/types";

type SceneNavigatorProps = {
  blocks: ScriptBlock[],
  activeId?: string,
  onSelect: (id: string) => void,
};

// list of scene headings for jumping around the script
const SceneNavigator = ({blocks, activeId, onSelect}: SceneNavigatorProps) => {
  const scenes = blocks.filter(block => block.type === "heading");

  // the scene the caret is currently in
  const activeIndex = blocks.findIndex(block => block.id === activeId);
  const currentScene = activeIndex < 0 ? undefined
    : blocks.slice(0, activeIndex + 1).reverse().find(block => block.type === "heading")?.id;

  return (
    <nav aria-label="Scenes" className="h-full overflow-y-auto px-2 py-4">
      <h2 className="ml-3 mb-1 text-xs font-bold text-purple dark:text-neutral-900">Scenes</h2>
      {scenes.length === 0 ? (
        <p className="mx-3 text-sm text-purple/80 dark:text-neutral-900/70">Scene headings you write will appear here.</p>
      ) : (
        <ol className="flex flex-col gap-0.5">
          {scenes.map((scene, index) => {
            const isCurrent = scene.id === currentScene;
            return (
              <li key={scene.id}>
                <button
                  type="button"
                  onClick={() => onSelect(scene.id)}
                  aria-current={isCurrent ? "location" : undefined}
                  className={
                    "flex w-full items-baseline gap-2 rounded px-3 py-1.5 text-left text-sm transition-colors " +
                    (isCurrent
                      ? "bg-purple text-white dark:bg-neutral-800 dark:text-purple"
                      : "text-purple hover:bg-purple-tint-hover dark:text-neutral-900 dark:hover:bg-neutral-900/10")
                  }
                >
                  <span className="w-5 shrink-0 text-right text-xs tabular-nums opacity-70">{index + 1}</span>
                  <span className="min-w-0 truncate uppercase">{scene.text.trim() || "Untitled scene"}</span>
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </nav>
  );
};

export default SceneNavigator;
