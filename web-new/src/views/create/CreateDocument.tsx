import { ChangeEvent, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import CreatePage from "../../components/CreatePage";
import { checkForName, generateDate } from "../../misc/forms";
import FormItem from "../../datatypes/FormItem";
import Document from "../../datatypes/Document";
import { CreateFormProps } from "./CreateProject";
import { writeDocumentData } from "../../firebase/database";
import { randomString } from "../../misc/randomString";
import { fromFinalDraft } from "../../screenplay/finalDraft";
import { fromWriterDuet } from "../../screenplay/writerDuet";
import { describe } from "../../screenplay/describe";
import { ScriptBlock } from "../../screenplay/types";
import StrokeIcon from "../../components/screenplay/StrokeIcon";
import { toMessage } from "../../misc/errors";

const formData: FormItem[] = [
  {id: "name", label: "Name", placeholder: "First draft", autoComplete: "off"},
  {id: "description", label: "Description", placeholder: "What this document is for", type: "textarea", optional: true}
];

const plural = (count: number, noun: string) => count + " " + noun + (count === 1 ? "" : "s");

// "12 scenes · about 9 pages", so the writer can see the file came in whole
const importSummary = (blocks: ScriptBlock[]) => {
  const {scenes, pages} = describe(blocks);
  return plural(scenes, "scene") + " · about " + plural(pages, "page");
};

interface CreateDocumentProps extends CreateFormProps {
  projectId: string
}

const CreateDocument = (props: CreateDocumentProps) => {
  const userId = sessionStorage.getItem('User ID') ?? "";
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [imported, setImported] = useState<{fileName: string, blocks: ScriptBlock[]}>();

  // read a Final Draft or WriterDuet file into the new document, naming it after the file if it has no name yet
  const importFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const blocks = /\.wdz$/i.test(file.name) ? await fromWriterDuet(await file.arrayBuffer()) : fromFinalDraft(await file.text());
      setImported({fileName: file.name, blocks});
      props.setErrorDisplay(false);
      const name = document.getElementById("create-name");
      if (name instanceof HTMLInputElement && name.value.trim() === "") name.value = file.name.replace(/\.(fdx|wdz)$/i, "");
    } catch (error) {
      setImported(undefined);
      props.setError(toMessage(error));
      props.setErrorDisplay(true);
    }
  };

  const create = async (data: Record<string, string>) => {
    checkForName(data);

    // add Document to database, starting with the imported script or an empty scene heading
    const doc: Document = {
      id: randomString(10),
      name: data.name.trim(),
      description: data.description.trim(),
      isPublic: false,
      projectId: props.projectId,
      owner: userId,
      createdOn: generateDate(),
      content: imported?.blocks ?? [{id: randomString(8), type: "heading", text: ""}]
    }
    await writeDocumentData(doc, props.projectId);
    props.setErrorDisplay(false);
    navigate('/document/' + doc.id);
  }

  return (
    <CreatePage
      title="Document"
      toggleShow={props.toggleShow}
      formData={formData}
      onSubmit={create}
      errorValue={props.errorValue}
      setError={props.setError}
      errorDisplay={props.errorDisplay}
      setErrorDisplay={props.setErrorDisplay}
    >
      <div>
        <p className="sw-label mb-1.5">
          Import a script<span className="font-normal text-[color:var(--muted)]"> (optional)</span>
        </p>
        {/* no name, so the file stays out of the submitted form data */}
        <input ref={fileRef} type="file" accept=".fdx,.wdz" className="sr-only" tabIndex={-1} aria-hidden="true" onChange={importFile} />
        {imported ? (
          <div className="flex min-h-[40px] items-center gap-2 rounded-[8px] border border-[color:var(--hair-strong)] py-1 pl-3 pr-1">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">{imported.fileName}</p>
              <p className="text-sm text-[color:var(--muted)]">{importSummary(imported.blocks)}</p>
            </div>
            <button type="button" className="sw-icon" onClick={() => setImported(undefined)} aria-label="Remove file" title="Remove file">
              <StrokeIcon name="close" size={16} />
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <button type="button" className="sw-button" onClick={() => fileRef.current?.click()}>
              Choose a file
            </button>
            <span className="text-sm text-[color:var(--muted)]">Final Draft (.fdx) or WriterDuet (.wdz)</span>
          </div>
        )}
      </div>
    </CreatePage>
  )
}

export default CreateDocument;
