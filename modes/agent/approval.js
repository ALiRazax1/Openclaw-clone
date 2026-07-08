import { ActionTracker } from "./action-tracker.js";
import { select, isCancel } from "@clack/prompts";
import chalk from "chalk";
import { composeBeforeAfter, formatPatch } from "./diff-view.js";
import { renderTerminalMarkdown } from "../../tui/terminal-md.js";
function groupPending(pending) {
  const byPath = new Map();
  const shells = [];

  for (const a of pending) {
    if (a.type === "tool_execute") {
      shells.push(a);
      continue;
    }
    const key = a.path;
    if (!byPath.has(key)) byPath.set(key, []);
    byPath.get(key).push(a);
  }

  const groups = [];

  const pathEntries = [...byPath.entries()].sort(([a], [b]) =>
    a.localeCompare(b),
  );
  for (const [p, acts] of pathEntries) {
    const sorted = acts.sort(
      (x, y) => x.timestamp.getTime() - y.timestamp.getTime(),
    );
    const ids = sorted.map((x) => x.id);

    if (sorted.every((x) => x.type === "folder_create")) {
      groups.push({
        label: `Create folder: ${p}`,
        actionIds: ids,
        patch: null,
      });
      continue;
    }

    const { before, after } = composeBeforeAfter(sorted);
    const patch = formatPatch(p, before, after);
    const kinds = [...new Set(sorted.map((x) => x.type))].join(", ");
    groups.push({ label: `${p} (${kinds})`, actionIds: ids, patch });
  }

  for (const s of shells) {
    groups.push({
      label: `Shell: ${s.details.command ?? "(no command)"}`,
      actionIds: [s.id],
      patch: null,
    });
  }

  return groups;
}

export async function runApprovalFlow(tracker) {
  const pending = tracker.getPendingMutations();
  if (pending.length === 0) {
    console.log(chalk.yellow("No staged file, folder or shell changes to review"));
    return false;
  }
  const choice = await select({
    message: "Do you want to approve the changes?",
    options: [
      { value: "all", label: "Approve changes" },
      { value: "partial", label: "Approve some changes" },
      { value: "cancel", label: "Reject changes" },
    ],
  });
  if (isCancel(choice) || choice === "cancel") {
    for (const a of pending) {
      tracker.updateStatus(a.id, "rejected", false);
    }
    return false;
  }
  if (choice === "all") {
    for (const a of pending) {
      tracker.updateStatus(a.id, "approved", true);
    }
    return true;
  }
  for (const g of groupPending(pending)) {
    while (true) {
      const opt = await select({
        message: g.label,
        options: [
          { value: "accept", label: "Accept" },
          { value: "diff", label: "Show diff", hint: g.patch ? "" : "N/A" },
          { value: "reject", label: "Reject" },
        ],
      });
      if (isCancel(opt)) {
        for (const g of pending) tracker.updateStatus(g.id, "rejected", false);
        return false;
      }
      if (opt === "diff") {
        if (g.path) {
          console.log(
            `\n ${renderTerminalMarkdown("```dif\n" + g.patch + "\n```'\n")} \n`,
          );
        }
        continue;
      }
      for (const id of g.actionIds) {
        tracker.updateStatus(
          id,
          opt === "accept" ? "approved" : "rejected",
          opt === "accept",
        );
      }
      break;
    }
  }
  return tracker.getActions().some((a)=> a.status === "approved")
}
