// =========================
// Welcome / Splash Screen
// =========================
import { select, cancel, isCancel } from "@clack/prompts";
import chalk from "chalk";
import figlet from "figlet"; 
import { runCliMode } from "../modes/cli.js";
const BANNER_FONT = "ANSI Shadow"
const SHADOW = chalk.hex("#fcfcfc")
const FACE = chalk.hex("#302ddb").bold;   

function printBannerWithShadow(ascii) {

  const bannerLines = ascii.replace(/\s+$/, '').split('\n');
  const maxLen = Math.max(...bannerLines.map((l) => l.length), 0);
  const rowWidth = maxLen + 2;

  for (const line of bannerLines) {
    console.log(SHADOW(('  ' + line).padEnd(rowWidth)));
  }
  process.stdout.write(`\x1b[${bannerLines.length}A`);
  for (const line of bannerLines) {
    console.log(FACE(line.padEnd(rowWidth)));
  }
}




export async function wakeup() {
    let ascii;
    try {
         ascii = figlet.textSync("Cloneclaw", {font: BANNER_FONT})
    } catch (error) {
        let ascii = figlet.textSync("Cloneclaw", {font: "Standard"})
    }
printBannerWithShadow(ascii);
const mode = await select({
    message: "Select a mode to start Cloneclaw:",
    options: [
        { value: "cli", label: "CLI" },
        { value: "telegram", label: "Telegram" },
        { value: "exit", label: "Exit" }
    ]
});

    if (isCancel(mode) || mode === "exit") {
        console.log(chalk.green("Goodbye"));
        console.log(chalk.yellow("Exiting Cloneclaw"));
        return
    }    

    if (mode === "cli") {
        console.log(chalk.cyan("Starting CLI mode"));
        await runCliMode();
    }
    else if (mode === "telegram") {
        console.log(chalk.red("Telegram is not implemented yet. Please use CLI"));
        
    }
}