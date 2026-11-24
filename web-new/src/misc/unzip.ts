// read one file out of a ZIP archive, using the browser's own inflate; returns undefined if it isn't there
export const readZipEntry = async (zip: ArrayBuffer, name: string): Promise<Uint8Array | undefined> => {
  const view = new DataView(zip);

  // the end-of-central-directory record sits in the last 64KB (it may be followed by a comment)
  let end = -1;
  for (let at = zip.byteLength - 22; at >= Math.max(0, zip.byteLength - 65557); at--) {
    if (view.getUint32(at, true) === 0x06054b50) { end = at; break; }
  }
  if (end < 0) throw new Error("not a zip archive");

  const count = view.getUint16(end + 10, true);
  let at = view.getUint32(end + 16, true);
  const decoder = new TextDecoder();

  for (let index = 0; index < count; index++) {
    if (view.getUint32(at, true) !== 0x02014b50) throw new Error("damaged zip archive");
    const method = view.getUint16(at + 10, true);
    const compressedSize = view.getUint32(at + 20, true);
    const nameLength = view.getUint16(at + 28, true);
    const extraLength = view.getUint16(at + 30, true);
    const commentLength = view.getUint16(at + 32, true);
    const localHeader = view.getUint32(at + 42, true);
    const entryName = decoder.decode(new Uint8Array(zip, at + 46, nameLength));
    at += 46 + nameLength + extraLength + commentLength;
    if (entryName !== name) continue;

    // the data follows the local header, whose name and extra field can differ in length from the central copy
    const start = localHeader + 30 + view.getUint16(localHeader + 26, true) + view.getUint16(localHeader + 28, true);
    const data = new Uint8Array(zip, start, compressedSize);
    if (method === 0) return data;
    if (method !== 8) throw new Error("unsupported zip compression");
    const inflated = new Blob([data]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
    return new Uint8Array(await new Response(inflated).arrayBuffer());
  }
  return undefined;
};
