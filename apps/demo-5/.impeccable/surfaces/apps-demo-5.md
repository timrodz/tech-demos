---
version: 1
slug: "apps-demo-5"
primary_target: "apps/demo-5"
related_targets: []
---

# Surface: demo-5 Progressive Structured Object Streaming

Mode: Experience (itinerary card canvas) + Operate (controls).
Audience: developers learning `streamObject` / `useObject` without an LLM.
Job: watch a Zod-shaped object hydrate a typed UI as partial JSON arrives.

## Direction contract

THESIS: The boarding pass is the object under construction. Fields materialize as keys arrive; the page is not a dashboard of chips around a JSON dump, and not a chat transcript.

OWN-WORLD: Cream chrome `#fdfcfa`, teal operate controls `#0f766e` / `#0d9488`, orange `#fb923c` for confirmation and price. Canvas is a deep-teal boarding pass with cream type, a perforated stub, Mona Sans for the pass, JetBrains Mono for JSON and the confirmation code.

STORY: A visitor understands progressive structured streaming: a partial object is enough to render a typed card, with reserved slots for keys not yet received.

FIRST VIEWPORT: Quiet header. Operate strip with three native controls (speed, start/replay, key-vs-character). The pass dominates; raw partial JSON sits beside it. Every schema field has a labeled slot from the start; pending values are an em dash; arrived values fade/slide in once.

FORM: Boarding-pass artifact inside Demo Lab tokens. Precisely specified request; concept-seed skipped. Code-led. Seed: brief-pinned.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
