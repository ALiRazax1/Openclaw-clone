// =========================
// Agent Mode Flow
// =========================
import {isCancel, text} from "@clack/prompts"
import chalk from "chalk"
import { defaultAgentConfig } from "./constant";
import { ActionTracker } from "./action-tracker";

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
    const excecutor = new ToolExecutor(tracker, config)
}