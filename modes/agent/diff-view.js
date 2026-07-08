import { createTwoFilesPatch } from "diff";

export function formatPatch(filePath, before, after) {
  return createTwoFilesPatch(filePath, filePath, before, after, "", "", {context: 3});
}
export function composeBeforeAfter(sorted) {
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    if (last.type === "file-delete") {
      return { before: first.details.before ?? "", after: "" };
    }
    const before = 
        first.type === "file-create" ? "" : (first.details.before ?? "");
    const after = last.details.after ?? "";
    return { before, after };
}