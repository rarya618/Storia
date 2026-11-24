import { memo } from "react";

import { ScriptBlock, closesAct, prints } from "../../screenplay/types";

// static copy of the script used only when printing (see screenplay.css)
const PrintScriptView = ({blocks, title, author}: {blocks: ScriptBlock[], title: string, author?: string}) => {
  const written = blocks.filter(block => block.text.trim() !== "" && prints(block.type));

  return (
    <div className="sp-print" aria-hidden="true">
      <div className="sp-title-page">
        <p className="uppercase">{title}</p>
        {author && <>
          <p style={{marginTop: "2em"}}>Written by</p>
          <p style={{marginTop: "1em"}}>{author}</p>
        </>}
      </div>
      <div className="sp-script">
        {written.map(block => (
          // an act break starts a new page, unless it's the END OF ACT that closes one
          <p key={block.id} className={"sp-" + block.type + (closesAct(block) ? " sp-act-end" : "")}>{block.text}</p>
        ))}
      </div>
    </div>
  );
};

// memoised: the editor redraws on every keystroke, this only when its input changes
const PrintScript = memo(PrintScriptView);
export default PrintScript;
