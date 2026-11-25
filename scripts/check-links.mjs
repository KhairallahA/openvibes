// Usage: node scripts/check-links.mjs  -> HEAD/GET every item/resource url + source in content/lists and content/guides
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const urls = new Map();
for (const sub of ["lists", "guides"]) {
  const dir = path.join(process.cwd(), "content", sub);
  if (!fs.existsSync(dir)) continue;
  for (const f of fs.readdirSync(dir).filter((f) => f.endsWith(".md"))) {
    const { data } = matter(fs.readFileSync(path.join(dir, f), "utf8"));
    for (const it of [...(data.items ?? []), ...(data.resources ?? [])]) for (const u of [it.url, it.source]) if (u) urls.set(u, `${sub}/${f}`);
  }
}
let bad = 0;
await Promise.all(
  [...urls].map(async ([u, f]) => {
    try {
      const r = await fetch(u, { redirect: "follow", headers: { "user-agent": "Mozilla/5.0 (link-check)" }, signal: AbortSignal.timeout(20000) });
      const ok = r.status < 400 || r.status === 403 || r.status === 429;
      if (!ok) bad++;
      console.log(`${ok ? "ok " : "BAD"} ${r.status} ${u} (${f})`);
    } catch (e) {
      bad++;
      console.log(`ERR ${u} (${f}) ${e.message}`);
    }
  }),
);
console.log(`\n${urls.size} urls, ${bad} failing`);
process.exit(bad ? 1 : 0);
