// hands the writer a file to save, named for what it holds
export const download = (file: Blob, name: string) => {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(file);
  link.download = name;
  link.click();
  // let go of it later, not at once: Safari can still be reading it after the click
  setTimeout(() => URL.revokeObjectURL(link.href), 60_000);
};

// a file name made from a document's name, without what a file system refuses
export const fileName = (name: string, extension: string) =>
  (name.trim().replace(/[^\w\- ]+/g, "").replace(/\s+/g, " ") || "screenplay") + "." + extension;
