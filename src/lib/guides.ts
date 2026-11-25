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

const QuizSchema = z
  .object({
    q: z.string().min(1),
    options: z.array(z.string().min(1)).min(2).max(5),
    answer: z.number().int().min(0),
    why: z.string().min(1),
  })
  .refine((q) => q.answer < q.options.length, { message: "quiz answer index out of range" });

/** A course chapter: prose (markdown + $math$), key equations, an interactive, a worked example, code, a quiz and further reading. */
const ChapterSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  short: z.string().optional(),
  phase: z.string().min(1),
  minutes: z.number().int().positive().default(15),
  summary: z.string().min(1),
  body: z.string().min(1),
  equations: z.array(FormulaSchema.omit({ code: true, lang: true, bot: true })).default([]),
  interactive: z.object({ name: z.string().regex(/^[A-Z][A-Za-z0-9]+$/), title: z.string().min(1), caption: z.string().default("") }).optional(),
  example: z.object({ title: z.string().min(1), body: z.string().min(1) }).optional(),
  code: z.object({ title: z.string().default("Try it in code"), lang: z.string().default("python"), code: z.string().min(1) }).optional(),
  quiz: z.array(QuizSchema).default([]),
  deeper: z.array(z.string()).default([]),
  build: z.string().optional(),
});

const GuideSchema = z.object({
  layout: z.enum(["formulas", "course"]).default("formulas"),
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
  sections: z.array(SectionSchema).default([]),
  chapters: z.array(ChapterSchema).default([]),
  resources: z.array(ItemSchema).default([]),
}).refine((g) => (g.layout === "course" ? g.chapters.length > 0 : g.sections.length > 0), { message: "a formulas guide needs sections; a course needs chapters" });

export type Formula = z.infer<typeof FormulaSchema> & { html: string; meansHtml: string; botHtml?: string; exampleHtml?: string; number: string };
export type Section = Omit<z.infer<typeof SectionSchema>, "formulas"> & { number: string; introHtml: string; formulas: Formula[] };
export type QuizQ = { qHtml: string; options: string[]; answer: number; whyHtml: string };
export type Chapter = {
  id: string;
  number: string;
  title: string;
  short: string;
  phase: string;
  minutes: number;
  summaryHtml: string;
  summary: string;
  bodyHtml: string;
  equations: Formula[];
  interactive?: { name: string; title: string; captionHtml: string };
  example?: { title: string; bodyHtml: string };
  code?: { title: string; lang: string; code: string };
  quiz: QuizQ[];
  deeper: Item[];
  buildHtml?: string;
  build?: string;
};
export type Guide = Omit<z.infer<typeof GuideSchema>, "sections" | "resources" | "chapters"> & {
  kind: "guide";
  /** e.g. "70 formulas" or "16 chapters, 16 interactives": used in titles, feeds and llms.txt */
  countLabel: string;
  chapters: Chapter[];
  interactiveCount: number;
  quizCount: number;
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

/**
 * Markdown with math: $$display$$ and $inline$ are rendered by KaTeX at build time, `code` is protected,
 * and \$ is a literal dollar sign. Everything else goes through marked.
 */
function mdMath(src: string, where: string) {
  const stash: string[] = [];
  const keep = (html: string, tag = "M") => `@@${tag}${stash.push(html) - 1}@@`;
  let s = src.replace(/\\\$/g, () => keep("&#36;"));
  s = s.replace(/`[^`\n]+`/g, (m) => keep(`<code>${esc(m.slice(1, -1))}</code>`));
  s = s.replace(/\$\$([\s\S]+?)\$\$/g, (_, t: string) => `\n\n${keep(`<div class="math-block my-4 overflow-x-auto rounded-xl border border-line bg-bg/70 px-3 py-3 sm:px-5">${tex(t.trim(), true, where)}</div>`, "D")}\n\n`);
  s = s.replace(/\$([^$\n]+?)\$/g, (_, t: string) => keep(tex(t, false, where)));
  const html = (marked.parse(s, { async: false }) as string)
    .replace(/<p>\s*@@D(\d+)@@\s*<\/p>/g, (_, i: string) => stash[+i])
    .replace(/@@[MD](\d+)@@/g, (_, i: string) => stash[+i])
    .replace(/<a href="(https?:\/\/)/g, '<a target="_blank" rel="noopener" href="$1');
  if (/@@[MD]\d+@@/.test(html)) throw new Error(`Unresolved math placeholder in ${where}`);
  return html;
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
  const byName = new Map(resources.map((r) => [r.name, r]));
  for (const r of resources) ids.add(r.id);
  const chapters: Chapter[] = d.chapters.map((c, ci) => {
    const where = `${file} → chapter ${c.id}`;
    for (const id of [c.id, ...c.equations.map((e) => e.id)]) {
      if (ids.has(id)) throw new Error(`Duplicate id "${id}" in content/guides/${file}`);
      ids.add(id);
    }
    return {
      id: c.id,
      number: String(ci + 1).padStart(2, "0"),
      title: c.title,
      short: c.short ?? c.title,
      phase: c.phase,
      minutes: c.minutes,
      summary: c.summary,
      summaryHtml: inline(c.summary, where),
      bodyHtml: mdMath(c.body, where),
      equations: c.equations.map((f, fi) => ({
        ...f,
        lang: "python",
        number: `${ci + 1}.${fi + 1}`,
        html: tex(f.tex, true, `${where} → ${f.id}`),
        meansHtml: inline(f.means, `${where} → ${f.id}`),
        exampleHtml: f.example ? inline(f.example, `${where} → ${f.id}`) : undefined,
      })),
      interactive: c.interactive ? { name: c.interactive.name, title: c.interactive.title, captionHtml: inline(c.interactive.caption, where) } : undefined,
      example: c.example ? { title: c.example.title, bodyHtml: mdMath(c.example.body, `${where} (example)`) } : undefined,
      code: c.code,
      quiz: c.quiz.map((q, qi) => ({
        qHtml: inline(q.q, `${where} quiz ${qi + 1}`),
        options: q.options.map((o) => inline(o, `${where} quiz ${qi + 1}`)),
        answer: q.answer,
        whyHtml: inline(q.why, `${where} quiz ${qi + 1}`),
      })),
      deeper: c.deeper.map((n) => {
        const r = byName.get(n);
        if (!r) throw new Error(`Chapter "${c.id}" in content/guides/${file} references unknown resource "${n}"`);
        return r;
      }),
      build: c.build,
      buildHtml: c.build ? inline(c.build, where) : undefined,
    };
  });
  // Course chapters double as "sections" (with their key equations) so search, llms.txt, cards and JSON-LD keep working.
  const allSections: Section[] =
    d.layout === "course"
      ? chapters.map((c) => ({ id: c.id, title: c.title, kicker: c.phase, intro: c.summary, number: c.number, introHtml: c.summaryHtml, formulas: c.equations }))
      : sections;
  const interactiveCount = chapters.filter((c) => c.interactive).length;
  const count = d.layout === "course" ? chapters.length : sections.reduce((n, s) => n + s.formulas.length, 0);
  const unit = d.layout === "course" ? "chapters" : d.unit;
  return {
    ...d,
    kind: "guide",
    slug,
    shortTitle: d.shortTitle ?? d.title,
    verified,
    count,
    unit,
    countLabel: d.layout === "course" ? `${chapters.length} chapters, ${interactiveCount} interactives` : `${count} ${unit}`,
    chapters,
    interactiveCount,
    quizCount: chapters.reduce((n, c) => n + c.quiz.length, 0),
    sections: allSections,
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
