# Mirror Academy: design notes

Notes for whoever touches the landing page next, so a later pass builds on these choices
instead of drifting back to a template.

## Subject

A coaching institute in Berhampore preparing students for WBPSC/WBCS, police, medical and
engineering entrance, and teaching exams. Most visitors are students on phones. The page has
one job: get an enquiry or a call.

## Tokens

| Name  | Hex       | Use |
|-------|-----------|-----|
| ink   | `#021B44` | Logo navy. Text on paper, the dark bands |
| ink-2 | `#0B2F6B` | One step up on navy: hover and pressed states |
| gold  | `#FFC501` | Logo gold. Primary action on navy, filled bubbles, the mirror line |
| paper | `#F5F7FB` | Cool exam-paper white, deliberately not cream |
| rule  | `#CBD4E4` | Answer-sheet blue for hairlines and field borders |
| muted | `#465470` | Secondary text on paper |

Type: one family, Anek Latin (Ek Type, an Indian foundry; Anek Bangla matches it if a Bengali
version follows). The width axis does the work of a second face: `wdth 125` for display, like
the logo's wide MIRROR; `100` for reading.

## Principles

- One bold move: the tagline set wide and heavy over a gold mirror line, with its reflection
  underneath. Everything else stays quiet.
- The subject's own vernacular: courses are picked on an answer sheet (a bubble per course),
  and marking a bubble fills the enquiry form. Lists are ruled like a notice, not boxed in cards.
- Structure means something: only the admission steps are numbered, because only they are a
  sequence.
- Motion: one page-load moment (the mirror line draws, the reflection rises). Nothing else
  moves unless the visitor acts. Reduced motion turns it off.
- Icons: Kubai Icons two-tone set (MIT), one family at even sizes, coloured from two CSS
  variables (`--ki-a`, `--ki-b`) so the same set works on paper and on navy.
- One focus ring everywhere (2px outline). Fields draw it over their border, so an invalid
  field never shows a border plus a ring.
- No gradient blobs, glass, glows, floating chips, all-caps eyebrows or arrows on buttons.

## Pending owner input

- Admission steps 2 and 3 wording, and the "Enquiry-led admission" point (marked TODO in code).
- Cloudflare Turnstile is not wired up on the client yet.
