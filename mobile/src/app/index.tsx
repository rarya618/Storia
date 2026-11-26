import { ScriptEditor } from "@/script/ScriptEditor";
import { sampleScript } from "@/script/sample";

// for now the app opens straight on the block editor spike, with a sample script
export default function Index() {
  return <ScriptEditor initial={sampleScript} title="Sample feature" />;
}
