import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import katex from "katex";
import { marked } from "marked";
import { z } from "zod";
import { dateish, extractFaq, ItemSchema, slugify, type Item } from "./content";

/**
 * Guides live in /content/guides/<slug>.md: long-form explainers (sections → formula cards → references).
 * Same URL space as lists (/<slug>). Math is rendered to HTML with KaTeX at build time (no client JS);
 * a malformed formula fails the build instead of shipping broken math.
 */

const FormulaSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  tex: z.string().min(1),
  means: z.string().min(1),
  bot: z.string().optional(),
  example: z.string().optional(),
  code: z.string().optional(),
  lang: z.string().default("python"),
});

const SectionSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  kicker: z.string().optional(),
  intro: z.string().default(""),
  formulas: z.array(FormulaSchema).min(1),
});

const GuideSchema = z.object({
  title: z.string().min(1),
  shortTitle: z.string().optional(),
  hook: z.string().optional(),
  description: z.string().min(1),
  lede: z.string().optional(),
  category: z.string().default("Guides"),
  tags: z.array(z.string()).default([]),
  icon: z.string().default("∑"),
  accent: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#c6ff3d"),
  updated: dateish,
  verified: dateish.optional(),
  featured: z.boolean().default(false),
  draft: z.boolean().default(false),
  unit: z.string().default("formulas"),
  disclaimer: z.string().optional(),
  stats: z.array(z.object({ value: z.string(), label: z.string(), note: z.string().optional() })).default([]),
  sections: z.array(SectionSchema).min(1),
  resources: z.array(ItemSchema).default([]),
});

export type Formula = z.infer<typeof FormulaSchema> & { html: string; meansHtml: string; botHtml?: string; exampleHtml?: string; number: string };
export type Section = Omit<z.infer<typeof SectionSchema>, "formulas"> & { number: string; introHtml: string; formulas: Formula[] };
export type Guide = Omit<z.infer<typeof GuideSchema>, "sections" | "resources"> & {
  kind: "guide";
  slug: string;
  shortTitle: string;
  verified: string;
  count: number;
  sections: Section[];
  resources: Item[];
  resourceCategories: { name: string; count: number }[];
  resourceTags: { name: string; count: number }[];
  bodyHtml: string;
  faq: { q: string; a: string }[];
};

const DIR = path.join(process.cwd(), "content", "guides");

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function tex(src: string, displayMode: boolean, where: string) {
  try {
    return katex.renderToString(src, { displayMode, throwOnError: true, strict: "ignore", output: "html" });
  } catch (e) {
    throw new Error(`KaTeX error in ${where}: ${(e as Error).message}`);
  }
}

/** Tiny inline formatter: $math$, `code`, **bold**. Everything else is escaped text. */
function inline(s: string, where: string) {
  return s
    .split(/(\$[^$]+\$|`[^`]+`|\*\*[^*]+\*\*)/g)
    .map((part) => {
      if (part.startsWith("$") && part.endsWith("$") && part.length > 2) return tex(part.slice(1, -1), false, where);
      if (part.startsWith("`") && part.endsWith("`") && part.length > 2) return `<code>${esc(part.slice(1, -1))}</code>`;
      if (part.startsWith("**") && part.endsWith("**") && part.length > 4) return `<strong>${esc(part.slice(2, -2))}</strong>`;
      return esc(part);
    })
    .join("");
}

function tally(values: string[]) {
  const m = new Map<string, number>();
  for (const v of values) m.set(v, (m.get(v) ?? 0) + 1);
  return [...m].map(([name, count]) => ({ name, count }));
}

function load(file: string): Guide {
  const slug = file.replace(/\.md$/, "");
  const { data, content } = matter(fs.readFileSync(path.join(DIR, file), "utf8"));
  const parsed = GuideSchema.safeParse(data);
  if (!parsed.success) throw new Error(`Invalid frontmatter in content/guides/${file}:\n${z.prettifyError(parsed.error)}`);
  const d = parsed.data;
  const verified = d.verified ?? d.updated;
  const ids = new Set<string>();
  const sections: Section[] = d.sections.map((s, si) => {
    const sn = String(si + 1).padStart(2, "0");
    if (ids.has(s.id)) throw new Error(`Duplicate id "${s.id}" in content/guides/${file}`);
    ids.add(s.id);
    return {
      ...s,
      number: sn,
      introHtml: inline(s.intro, `${file} § ${s.id}`),
      formulas: s.formulas.map((f, fi) => {
        if (ids.has(f.id)) throw new Error(`Duplicate id "${f.id}" in content/guides/${file}`);
        ids.add(f.id);
        const where = `${file} → ${f.id}`;
        return {
          ...f,
          number: `${si + 1}.${fi + 1}`,
          html: tex(f.tex, true, where),
          meansHtml: inline(f.means, where),
          botHtml: f.bot ? inline(f.bot, where) : undefined,
          exampleHtml: f.example ? inline(f.example, where) : undefined,
        };
      }),
    };
  });
  const seen = new Set<string>();
  const resources: Item[] = d.resources.map((it) => {
    let id = slugify(it.name) || "item";
    while (seen.has(id) || ids.has(id)) id += "-x";
    seen.add(id);
    return { ...it, id, verified: it.verified ?? verified };
  });
  return {
    ...d,
    kind: "guide",
    slug,
    shortTitle: d.shortTitle ?? d.title,
    verified,
    count: sections.reduce((n, s) => n + s.formulas.length, 0),
    sections,
    resources,
    resourceCategories: tally(resources.map((r) => r.category)),
    resourceTags: tally(resources.flatMap((r) => r.tags)).sort((a, b) => b.count - a.count),
    bodyHtml: content.trim() ? (marked.parse(content, { async: false }) as string).replace(/<a href="(https?:\/\/)/g, '<a target="_blank" rel="noopener" href="$1') : "",
    faq: extractFaq(content),
  };
}

let cache: Guide[] | null = null;

export function getAllGuides(): Guide[] {
  if (cache && process.env.NODE_ENV === "production") return cache;
  const files = fs.existsSync(DIR) ? fs.readdirSync(DIR).filter((f) => f.endsWith(".md") && !f.startsWith("_")) : [];
  cache = files
    .map(load)
    .filter((g) => !g.draft || process.env.NODE_ENV !== "production")
    .sort((a, b) => Number(b.featured) - Number(a.featured) || b.updated.localeCompare(a.updated));
  return cache;
}

export function getGuide(slug: string): Guide | undefined {
  return getAllGuides().find((g) => g.slug === slug);
}

/** Plain-text version of a formula for llms.txt / feeds. */
export function formulaText(f: Formula) {
  return `${f.name}: ${f.tex.replace(/\s+/g, " ")}`;
}
