import type { Metadata } from "next";
import type { List } from "./content";
import type { Guide } from "./guides";
import { abs, site, verification } from "./site";

/** ONE universal share cover for every page (public/og.png, 1200×630). */
export const ogImage = {
  url: abs("/og.png"),
  width: 1200,
  height: 630,
  alt: `${site.name} · ${site.shortTagline} · ${site.url.replace(/^https?:\/\//, "")}`,
  type: "image/png",
};

type PageMetaInput = {
  title?: string; // page title (template adds " · OpenVibes")
  absoluteTitle?: string; // full title, bypasses template
  description: string;
  path: string; // "/" or "/slug"
  type?: "website" | "article";
  noindex?: boolean;
};

/**
 * Essential per-page meta: title, description, canonical, robots, OG/Twitter title + description + url.
 * The image is always the same universal cover. It is repeated here only because Next.js merges
 * metadata shallowly (a page-level `openGraph` object would otherwise drop the root image).
 */
export function pageMetadata(i: PageMetaInput): Metadata {
  const url = abs(i.path);
  const socialTitle = i.absoluteTitle ?? (i.title ? `${i.title} · ${site.name}` : `${site.name} · ${site.shortTagline}`);
  return {
    title: i.absoluteTitle ? { absolute: i.absoluteTitle } : i.title,
    description: i.description,
    alternates: { canonical: url, types: rssAlternate },
    ...(i.noindex ? { robots: { index: false, follow: true } } : {}),
    openGraph: { ...baseOpenGraph, type: i.type ?? "website", url, title: socialTitle, description: i.description },
    twitter: { ...baseTwitter, title: socialTitle, description: i.description },
  };
}

const rssAlternate = { "application/rss+xml": [{ url: abs("/feed.xml"), title: `${site.name} — new lists` }] };

const baseOpenGraph = {
  siteName: site.name,
  locale: site.locale,
  images: [ogImage],
};

const baseTwitter = {
  card: "summary_large_image" as const,
  site: `@${site.x}`,
  creator: `@${site.x}`,
  images: [{ url: ogImage.url, alt: ogImage.alt, width: ogImage.width, height: ogImage.height }],
};

/** Site-wide defaults (root layout). Every page inherits the universal cover from here. */
export const rootMetadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} · ${site.shortTagline}`, template: `%s · ${site.name}` },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.author, url: site.xUrl }],
  creator: site.author,
  keywords: [...site.keywords],
  manifest: "/manifest.webmanifest",
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
  alternates: { canonical: site.url, types: rssAlternate },
  openGraph: { ...baseOpenGraph, type: "website", url: site.url, title: `${site.name} · ${site.shortTagline}`, description: site.description },
  twitter: { ...baseTwitter, title: `${site.name} · ${site.shortTagline}`, description: site.description },
  verification: {
    google: verification.google,
    yandex: verification.yandex,
    other: verification.bing ? { "msvalidate.01": verification.bing } : undefined,
  },
};

/* ---------------- JSON-LD ---------------- */

const personId = `${site.url}/#person`;
const orgId = `${site.url}/#organization`;
const websiteId = `${site.url}/#website`;

export function personLd() {
  return {
    "@type": "Person",
    "@id": personId,
    name: site.author,
    url: site.xUrl,
    sameAs: [site.xUrl],
  };
}

export function organizationLd() {
  return {
    "@type": "Organization",
    "@id": orgId,
    name: site.name,
    url: site.url,
    logo: { "@type": "ImageObject", url: abs("/icon-512.png"), width: 512, height: 512 },
    founder: { "@id": personId },
    sameAs: [site.xUrl],
  };
}

export function websiteLd() {
  return {
    "@type": "WebSite",
    "@id": websiteId,
    name: site.name,
    url: site.url,
    description: site.description,
    inLanguage: site.language,
    publisher: { "@id": orgId },
    author: { "@id": personId },
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${site.url}/search?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbLd(crumbs: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: abs(c.path) })),
  };
}

export function homeLd(lists: (List | Guide)[]) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      websiteLd(),
      organizationLd(),
      personLd(),
      {
        "@type": "CollectionPage",
        "@id": `${site.url}/#home`,
        url: site.url,
        name: `${site.name} · ${site.shortTagline}`,
        description: site.description,
        isPartOf: { "@id": websiteId },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: lists.length,
          itemListElement: lists.map((l, i) => ({ "@type": "ListItem", position: i + 1, name: l.title, url: abs(`/${l.slug}`) })),
        },
      },
    ],
  };
}

export function listLd(list: List) {
  const url = abs(`/${list.slug}`);
  const graph: Record<string, unknown>[] = [
    {
      "@type": "CollectionPage",
      "@id": `${url}#page`,
      url,
      name: `${list.title} (${list.count})`,
      headline: list.title,
      description: list.description,
      inLanguage: site.language,
      isPartOf: { "@id": websiteId },
      author: { "@id": personId },
      publisher: { "@id": orgId },
      dateModified: list.updated,
      keywords: list.tags.join(", "),
      image: ogImage.url,
      breadcrumb: { "@id": `${url}#breadcrumb` },
      mainEntity: { "@id": `${url}#list` },
    },
    { ...breadcrumbLd([{ name: site.name, path: "/" }, { name: list.shortTitle, path: `/${list.slug}` }]), "@id": `${url}#breadcrumb` },
    {
      "@type": "ItemList",
      "@id": `${url}#list`,
      name: list.title,
      numberOfItems: list.count,
      itemListOrder: "https://schema.org/ItemListOrderAscending",
      itemListElement: list.items.map((it, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: it.name,
        url: it.url,
        ...(it.description ? { description: it.description } : {}),
      })),
    },
    websiteLd(),
    organizationLd(),
    personLd(),
  ];
  if (list.faq.length) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      mainEntity: list.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    });
  }
  return { "@context": "https://schema.org", "@graph": graph };
}

export function guideLd(guide: Guide) {
  const url = abs(`/${guide.slug}`);
  const isCourse = guide.layout === "course";
  const course: Record<string, unknown> = {
    "@type": ["Course", "LearningResource"],
    "@id": `${url}#course`,
    url,
    name: `${guide.title} (${guide.countLabel})`,
    description: guide.description,
    inLanguage: site.language,
    isAccessibleForFree: true,
    provider: { "@id": orgId },
    author: { "@id": personId },
    image: ogImage.url,
    dateModified: guide.updated,
    keywords: guide.tags.join(", "),
    educationalLevel: "Beginner to intermediate",
    learningResourceType: ["Interactive course", "Quiz", "Simulation"],
    interactivityType: "mixed",
    teaches: guide.chapters.map((c) => c.title),
    timeRequired: `PT${Math.round(guide.chapters.reduce((n, c) => n + c.minutes, 0) / 60)}H`,
    offers: [{ "@type": "Offer", category: "Free", price: 0, priceCurrency: "USD" }],
    hasCourseInstance: [{ "@type": "CourseInstance", courseMode: "Online", courseWorkload: `PT${Math.round(guide.chapters.reduce((n, c) => n + c.minutes, 0) / 60)}H` }],
    syllabusSections: guide.chapters.map((c) => ({ "@type": "Syllabus", name: `${c.number}. ${c.title}`, description: c.summary, url: `${url}#${c.id}`, timeRequired: `PT${c.minutes}M` })),
    hasPart: guide.chapters.map((c) => ({ "@type": "LearningResource", name: c.title, url: `${url}#${c.id}`, learningResourceType: c.interactive ? "Interactive lesson" : "Lesson" })),
    citation: guide.resources.map((r) => ({ "@type": "CreativeWork", name: r.name, url: r.url })),
    breadcrumb: { "@id": `${url}#breadcrumb` },
    isPartOf: { "@id": websiteId },
  };
  const graph: Record<string, unknown>[] = [
    ...(isCourse ? [course] : []),
    {
      "@type": "TechArticle",
      "@id": `${url}#article`,
      url,
      mainEntityOfPage: url,
      headline: guide.title,
      name: `${guide.title} (${guide.countLabel})`,
      description: guide.description,
      inLanguage: site.language,
      isPartOf: { "@id": websiteId },
      author: { "@id": personId },
      publisher: { "@id": orgId },
      dateModified: guide.updated,
      keywords: guide.tags.join(", "),
      image: ogImage.url,
      isAccessibleForFree: true,
      proficiencyLevel: "Beginner",
      ...(isCourse ? { about: { "@id": `${url}#course` } } : {}),
      breadcrumb: { "@id": `${url}#breadcrumb` },
      hasPart: guide.sections.map((s) => ({ "@type": "WebPageElement", name: s.title, url: `${url}#${s.id}` })),
      citation: guide.resources.map((r) => ({ "@type": "CreativeWork", name: r.name, url: r.url })),
    },
    { ...breadcrumbLd([{ name: site.name, path: "/" }, { name: guide.shortTitle, path: `/${guide.slug}` }]), "@id": `${url}#breadcrumb` },
    websiteLd(),
    organizationLd(),
    personLd(),
  ];
  if (guide.faq.length) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      mainEntity: guide.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    });
  }
  return { "@context": "https://schema.org", "@graph": graph };
}
