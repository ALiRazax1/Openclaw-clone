#!/usr/bin/env node
import {Command} from "commander";
import  {wakeup}  from "./tui/wakeup.js";
const program = new Command();
program.name("cloneclaw").description("Cloneclaw CLI").version("1.0.0");

program.command("start").description("Start the Cloneclaw application")
.action(
    async()=>{
        await wakeup();
    }
)
await program.parseAsync(process.argv);
