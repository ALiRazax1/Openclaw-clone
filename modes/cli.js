import {select, cancel, isCancel} from "@clack/prompts";
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
            console.log("agent");
            
        }
        else if (mode === "ask"){console.log("ask");
        }
        else if (mode === "plan"){console.log("plan");
        }

    }   

}

export { runCliMode }