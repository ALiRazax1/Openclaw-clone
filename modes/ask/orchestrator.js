import chalk from "chalk";
import { confirm, isCancel, text } from "@clack/prompts";
import { ToolLoopAgent, stepCountIs, tool } from "ai";
import { z } from "zod";
import { getAgentModel } from "../../ai/ai.config.js";
import { ActionTracker } from "../agent/action-tracker.js";
import { ToolExecutor } from "../agent//tool-executor.js";
import { defaultAgentConfig } from "../agent/constant.js";
import { renderTerminalMarkdown } from "../../tui/terminal-md.js";
import { runApprovalFlow } from "../agent/approval.js";

function creatAskTools(executor) {
  return {
    read_file: tool({
      description:
        "Read a text file from the workspace. Use a path relative to the project root.",
      inputSchema: z.object({
        path: z.string().describe("Relative file path"),
      }),
      execute: async ({ path: p }) => executor.readFile(p),
    }),
    list_files: tool({
      description: "List files and directories under a path.",
      inputSchema: z.object({
        path: z.string(),
        recursive: z.boolean().optional().default(false),
      }),
      execute: async ({ path: p, recursive }) =>
        executor.listFiles(p, recursive),
    }),

    search_files: tool({
      description:
        'Find files matching a glob pattern (e.g. "*.ts", "**/*.md"). Optional content substring filter.',
      inputSchema: z.object({
        root: z.string().describe("Directory to search, relative to root"),
        pattern: z
          .string()
          .describe("Glob-like pattern using * and ** (forward slashes)"),
        content_contains: z.string().optional(),
      }),
      execute: async ({ root, pattern, content_contains }) =>
        executor.searchFiles(root, pattern, content_contains),
    }),

    analyze_codebase: tool({
      description:
        "Summarize structure: file counts, size, extensions. Read-only.",
      inputSchema: z.object({
        path: z.string().default("."),
      }),
      execute: async ({ path: p }) => executor.analyzeCodebase(p),
    }),
    list_skills: tool({
      description:
        "List absolute paths to SKILL.md files under configured skill directories (Cursor / Claude).",
      inputSchema: z.object({}),
      execute: async () => executor.listSkills(),
    }),

    read_skill: tool({
      description:
        "Read a SKILL.md file. Path must be absolute and under skill roots, or use a path returned by list_skills.",
      inputSchema: z.object({
        path: z.string(),
      }),
      execute: async ({ path: p }) => executor.readSkill(p),
    }),
  };
}

function asMD(question, answer){
    return `# Ask Mode \n\n ## Question\n\n ${question.trim()}\n\n ## Answer \n\n ${answer.trim()} \n`
}


export async function runAskMode() {
    console.log("\n ? Ask Mode"); //apply chalk bold
    
    const question = await text({message: "What do you want to ask?"})

    if(isCancel(question) || !question.trim()) return

    const config = defaultAgentConfig()
    config.tools.allowFileCreation = true
    config.tools.allowFileModification = false
    config.tools.allowFolderCreation = false
    config.tools.allowShellExecution - false

    const tracker = new ActionTracker();
    const executor = new ToolExecutor(tracker, config);

    //  Web Search Tool
    const tools = {
        ...creatAskTools(executor)
    }

    const agent = new ToolLoopAgent({
        model:getAgentModel(),
        stopWhen: stepCountIs(30),
        tools,
    });

    const result = await agent.generate({prompt: question.trim()})  
       
    const answer = result.text.trim() || result.steps[result.steps.length - 1]?.text?.trim() || "No answer"
    console.log("\n" + renderTerminalMarkdown(answer) + "\n");
    
    const wantSave = await confirm({
        message: "Save this answer to a .md file in the current directory ",
        initialValue: false
    })

    if(isCancel(wantSave) || !wantSave)  return
    const fileName = await text({
        message: "Filename",
        initialValue: "ask.md",
         validate: (v) => {
      const s = (v ?? '').trim();
      if (!s) return 'Required';
      if (s.includes('..') || s.includes('/') || s.includes('\\')) return 'No paths';
      if (!s.toLowerCase().endsWith('.md')) return 'Must end with .md';
    },
    })

    if (isCancel(fileName)) return
    executor.createFile(fileName, asMD(question, answer))
    const ok = await runApprovalFlow(tracker)
    if(!ok) return executor.clearStaging();

    executor.applyApprovedFromTracker();
    executor.clearStaging();
}