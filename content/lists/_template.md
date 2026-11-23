---
# Files starting with "_" are ignored. Copy this to content/lists/<slug>.md — the file name IS the URL (/<slug>).
title: Every free <thing> on the internet          # H1 + page title. The item count is appended automatically in <title>.
shortTitle: Free things                              # used in chips, footer, search
hook: f**king goldmine of free things                # pre-fills the "Share on X" button
description: One sentence for Google / X cards (max ~160 chars).
lede: Optional longer intro shown under the H1.
category: AI models                                  # groups lists, shown on cards
tags: [free, ai]
icon: "✦"                                            # 1-2 characters
accent: "#c6ff3d"                                    # 6-digit hex, colours the page + OG image
updated: "2026-11-23"
verified: "2026-11-23"                               # default "last verified" date for every item
featured: false                                      # featured lists sort first on the home page
draft: true                                          # drafts show in `npm run dev` only
stats:                                               # optional, up to 3 big numbers in the hero
  - value: "42"
    label: things
    note: optional small print
items:
  - name: Example tool
    url: https://example.com/                        # where "Open" goes (official page)
    source: https://example.com/pricing              # optional: page the facts were read from
    category: tools                                  # becomes a filter chip with a count
    badge: $300 free credit                          # the one-line proof, shown as a coloured pill
    description: What it is and why it is worth it.
    tags: [no card]                                  # extra filter chips
    command: npx example                             # optional: copyable command
    verified: "2026-11-23"                           # optional per-item override
---

## Optional markdown

Anything here renders under the list: how-to, notes, FAQ.
