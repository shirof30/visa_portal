import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const messagesDir = join(__dirname, "..", "messages");

// Minimal Python-dict → JSON converter for gen-messages.py
function pyDictToJson(text) {
  return text
    .replace(/\bTrue\b/g, "true")
    .replace(/\bFalse\b/g, "false")
    .replace(/\bNone\b/g, "null")
    .replace(/,\s*([\]}])/g, "$1")
    ;
}

const py = readFileSync(join(__dirname, "gen-messages.py"), "utf8");

function extractDict(name) {
  const start = py.indexOf(`${name} = {`);
  if (start === -1) throw new Error(`Missing ${name}`);
  let depth = 0;
  let i = start + name.length + 2;
  for (; i < py.length; i++) {
    const ch = py[i];
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        const raw = py.slice(start + name.length + 2, i + 1);
        return JSON.parse(pyDictToJson(raw));
      }
    }
  }
  throw new Error(`Unclosed dict ${name}`);
}

mkdirSync(messagesDir, { recursive: true });
const en = extractDict("en");
const id = extractDict("id");

writeFileSync(join(messagesDir, "en.json"), JSON.stringify(en, null, 2) + "\n", "utf8");
writeFileSync(join(messagesDir, "id.json"), JSON.stringify(id, null, 2) + "\n", "utf8");

console.log("Wrote messages/en.json and messages/id.json");
