// =========================
// Agent Mode Flow
// =========================
import {isCancel, text} from "@clack/prompts"
import chalk from "chalk"
import { ToolLoopAgent } from "ai";
import { defaultAgentConfig } from "./constant.js";
import { ActionTracker } from "./action-tracker.js";
import { getAgentModel } from "../../ai/ai.config.js";
import { ToolExecutor } from "./tool-executor.js";
import { createAgentTools } from "./agent-tool.js";
import { stepCountIs } from "ai";
import { renderTerminalMarkdown } from "../../tui/terminal-md.js";
import { runApprovalFlow } from "./approval.js";

export async function runAgentMode (){
console.log(chalk.blue("Agent Mode"));
    const goal = await text(
     {
      message: "What would you like the agen do",
      placeholder:"Write the research paper about internation affairs"  
     }   
    )
    if (isCancel(goal) || !goal.trim()) return
    const config = defaultAgentConfig()
    const tracker = new ActionTracker()
    const executor = new ToolExecutor(tracker, config)
    const tools = createAgentTools(executor)

    const agent = new ToolLoopAgent({
        model: getAgentModel(),
        stopWhen: stepCountIs(40),
        intructions: [`Workspace root: ${config.codebasePath}`,
            `All mutations are staged and require user approval before being applied.`,
        ].join("\n"),
        tools,
    });

    const result = await agent.generate({
        prompt:goal.trim(),
        onStepFinish: ({toolCalls})=>{
            for (const tc of toolCalls) {
            const preview = JSON.stringify(tc.input).slice(0, 160);
            console.log(chalk.cyan(`Completed ${String(tc.toolName)} ${preview} ${preview.length>= 160?"...":""}`));
            
            }
        }
    })
    if(result.text?.trim()) console.log(renderTerminalMarkdown(result.text));
    const ok = await runApprovalFlow(tracker) 
    if(!ok) return executor.clearStaging()      
    const {errors} = executor.applyApprovedFromTracker()
    if(errors.length){
        console.log(chalk.red("Some operations reported errors:"));
        for (const e of errors) console.log(chalk.red(`  • ${e}`));
        
    }
    else{
   console.log(chalk.green('\n✓ Applied.\n'));
  }

  executor.clearStaging()
}