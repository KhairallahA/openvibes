import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";
import { z } from "zod";

/**
 * Content lives in /content/lists/<slug>.md.
 * Frontmatter = list metadata + `items` array. Markdown body = notes / how-to / FAQ shown under the list.
 * Everything is read synchronously at build time, so every page is fully static (SSG).
 */

const dateish = z.union([z.string(), z.date()]).transform((v) => (v instanceof Date ? v.toISOString().slice(0, 10) : String(v)));

const ItemSchema = z.object({
  name: z.string().min(1),
  url: z.url(),
  source: z.url().optional(),
  category: z.string().default("other"),
  badge: z.string().optional(),
  description: z.string().default(""),
  tags: z.array(z.string()).default([]),
  command: z.string().optional(),
  verified: dateish.optional(),
});

const ListSchema = z.object({
  title: z.string().min(1),
  shortTitle: z.string().optional(),
  hook: z.string().optional(),
  description: z.string().min(1),
  lede: z.string().optional(),
  category: z.string().default("Lists"),
  tags: z.array(z.string()).default([]),
  icon: z.string().default("✦"),
  accent: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#c6ff3d"),
  updated: dateish,
  verified: dateish.optional(),
  featured: z.boolean().default(false),
  draft: z.boolean().default(false),
  stats: z.array(z.object({ value: z.string(), label: z.string(), note: z.string().optional() })).default([]),
  items: z.array(ItemSchema).min(1),
});

export type Item = z.infer<typeof ItemSchema> & { id: string; verified: string };
export type List = Omit<z.infer<typeof ListSchema>, "items"> & {
  slug: string;
  shortTitle: string;
  verified: string;
  count: number;
  items: Item[];
  categories: { name: string; count: number }[];
  itemTags: { name: string; count: number }[];
  bodyHtml: string;
};

const DIR = path.join(process.cwd(), "content", "lists");

export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}

function tally(values: string[]) {
  const m = new Map<string, number>();
  for (const v of values) m.set(v, (m.get(v) ?? 0) + 1);
  return [...m].map(([name, count]) => ({ name, count }));
}

function load(file: string): List {
  const slug = file.replace(/\.md$/, "");
  const raw = fs.readFileSync(path.join(DIR, file), "utf8");
  const { data, content } = matter(raw);
  const parsed = ListSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(`Invalid frontmatter in content/lists/${file}:\n${z.prettifyError(parsed.error)}`);
  }
  const d = parsed.data;
  const verified = d.verified ?? d.updated;
  const seen = new Set<string>();
  const items: Item[] = d.items.map((it) => {
    let id = slugify(it.name) || "item";
    while (seen.has(id)) id += "-x";
    seen.add(id);
    return { ...it, id, verified: it.verified ?? verified };
  });
  return {
    ...d,
    slug,
    shortTitle: d.shortTitle ?? d.title,
    verified,
    count: items.length,
    items,
    categories: tally(items.map((i) => i.category)),
    itemTags: tally(items.flatMap((i) => i.tags)).sort((a, b) => b.count - a.count),
    bodyHtml: content.trim() ? (marked.parse(content, { async: false }) as string) : "",
  };
}

let cache: List[] | null = null;

export function getAllLists(): List[] {
  if (cache && process.env.NODE_ENV === "production") return cache;
  const files = fs.existsSync(DIR) ? fs.readdirSync(DIR).filter((f) => f.endsWith(".md") && !f.startsWith("_")) : [];
  cache = files
    .map(load)
    .filter((l) => !l.draft || process.env.NODE_ENV !== "production")
    .sort((a, b) => Number(b.featured) - Number(a.featured) || b.updated.localeCompare(a.updated) || b.count - a.count);
  return cache;
}

export function getList(slug: string): List | undefined {
  return getAllLists().find((l) => l.slug === slug);
}

export function totalItems() {
  return getAllLists().reduce((n, l) => n + l.count, 0);
}

/** Compact index used by the ⌘K search palette and the /saved page. */
export type SearchEntry = {
  t: "list" | "item";
  slug: string;
  id?: string;
  name: string;
  desc: string;
  list: string;
  accent: string;
  url?: string;
  badge?: string;
  count?: number;
  k: string; // lowercase keywords
};

export function searchIndex(): SearchEntry[] {
  const out: SearchEntry[] = [];
  for (const l of getAllLists()) {
    out.push({
      t: "list",
      slug: l.slug,
      name: l.title,
      desc: l.description,
      list: l.shortTitle,
      accent: l.accent,
      count: l.count,
      k: [l.title, l.shortTitle, l.description, l.category, ...l.tags].join(" ").toLowerCase(),
    });
    for (const i of l.items) {
      out.push({
        t: "item",
        slug: l.slug,
        id: i.id,
        name: i.name,
        desc: i.description,
        list: l.shortTitle,
        accent: l.accent,
        url: i.url,
        badge: i.badge,
        k: [i.name, i.description, i.category, i.badge ?? "", ...i.tags, l.shortTitle].join(" ").toLowerCase(),
      });
    }
  }
  return out;
}

export function formatDate(iso: string) {
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

export function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
