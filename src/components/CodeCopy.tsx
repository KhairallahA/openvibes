"use client";

import { track } from "@/lib/track";
import { CopyButton } from "./CopyButton";

/** Copy button for guide code blocks (tracked as copy_code). */
export function CodeCopy({ code, slug, id }: { code: string; slug: string; id: string }) {
  return <CopyButton text={code} label="Copy" className="bg-surface-2" onCopy={() => track("copy_code", { list_slug: slug, item_id: id })} />;
}
