import fs from "node:fs"
import path from "node:path"
import { homedir } from "node:os"
import { spawnSync } from "node:child_process"
import { ActionTracker } from "./action-tracker"

const TEXT_EXT = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".json",
  ".md",
  ".mdx",
  ".css",
  ".html",
  ".yml",
  ".yaml",
  ".toml",
  ".txt",
]); 

function isProbalyTextFile(filePath){
const ext =path.extname(filePath).toLocaleLowerCase()
return TEXT_EXT.has(ext) || ext === ""
}