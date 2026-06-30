// =========================
// CLI Mode Flow
// =========================
import {select, cancel, isCancel} from "@clack/prompts";
import chalk from "chalk";

async function runCliMode() {
    while(true) {
        const mode = await select({
            message: "Select a mode to start Cloneclaw:",
            options: [
                {value: "agent", label: "Agent Mode"},
                {value: "plan", label: "Plan MOde"},
                {value: "ask", label: "Ask Mode"},
                {value: "back", label: "Back to Main Menu"}
            ]
        })
        if(isCancel(mode) || mode === "back") {
            return
        }
        if(mode === "agent"){
            console.log(chalk.cyan("agent"));
            
        }
        else if (mode === "ask"){console.log(chalk.magenta("ask"));
        }
        else if (mode === "plan"){console.log(chalk.yellow("plan"));
        }

    }   

}

export { runCliMode }