import {isCancel, text} from "@clack/prompts"
export async function runAgentMode (){
console.log("Agent Mode");
    const goal = await text(
     {
      message: "What would you like the agen do",
      placeholder:"Write the research paper about internation affairs"  
     }   
    )
    if (isCancel(goal) || !goal.trim()) return
}