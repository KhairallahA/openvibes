// Writes src/generated/slugs.json (list slugs) so proxy.ts can return a real 404 for unknown slugs.
// Runs automatically before `npm run dev` and `npm run build`.
import fs from "node:fs";
import path from "node:path";
const dir = path.join(process.cwd(), "content/lists");
const slugs = fs.readdirSync(dir).filter((f) => f.endsWith(".md") && !f.startsWith("_")).map((f) => f.replace(/\.md$/, "")).sort();
fs.mkdirSync(path.join(process.cwd(), "src/generated"), { recursive: true });
fs.writeFileSync(path.join(process.cwd(), "src/generated/slugs.json"), JSON.stringify(slugs, null, 2) + "\n");
console.log(`slugs.json: ${slugs.length} lists`);
