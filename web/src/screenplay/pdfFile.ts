import { ScriptBlock } from "@storia/core/screenplay/types";

import regular from "./fonts/CourierPrime_400Regular.ttf?url";
import bold from "./fonts/CourierPrime_700Bold.ttf?url";
import italic from "./fonts/CourierPrime_400Regular_Italic.ttf?url";
import boldItalic from "./fonts/CourierPrime_700Bold_Italic.ttf?url";

const load = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Couldn't load the script's font (" + response.status + ")");
  return response.arrayBuffer();
};

// the script as a PDF file. The PDF code and the fonts load only when one is
// made, so the editor doesn't carry them
export const makePdf = async (script: {blocks: ScriptBlock[], title: string, author?: string}) => {
  const [{scriptPdf}, ...files] = await Promise.all([import("./pdf"), load(regular), load(bold), load(italic), load(boldItalic)]);
  const bytes = await scriptPdf(script, {regular: files[0], bold: files[1], italic: files[2], boldItalic: files[3]});
  return new Blob([bytes as BlobPart], {type: "application/pdf"});
};
