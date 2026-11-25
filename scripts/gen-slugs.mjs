// Writes src/generated/slugs.json (list + guide slugs) so proxy.ts can return a real 404 for unknown slugs.
// Runs automatically before `npm run dev` and `npm run build`.
import fs from "node:fs";
import path from "node:path";
const read = (sub) => {
  const dir = path.join(process.cwd(), "content", sub);
  return fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith(".md") && !f.startsWith("_")).map((f) => f.replace(/\.md$/, "")) : [];
};
const slugs = [...new Set([...read("lists"), ...read("guides")])].sort();
fs.mkdirSync(path.join(process.cwd(), "src/generated"), { recursive: true });
fs.writeFileSync(path.join(process.cwd(), "src/generated/slugs.json"), JSON.stringify(slugs, null, 2) + "\n");
console.log(`slugs.json: ${slugs.length} pages (lists + guides)`);
