# Form UX — designing forms people can actually finish

Forms exist to receive data from users; they fail when they are designed from the
database's point of view instead of the human's ("database structure -> becomes
form" is the root mistake). Users abandon forms they do not understand — the
business pays for it. This file is the craft for layouts, validation, and inputs.

## The two laws everything else derives from

- **Proximity (the most important rule)**: elements near each other read as
  related; elements spaced apart read as separate groups. **Space is the most
  powerful separator** — group fields by meaning with whitespace before reaching
  for borders/cards. The most common error is having no space between logical
  groups (and cramming groups of inputs together while each input already carries
  label + hint + error).
- **Jakob's law**: users spend most of their time on other sites — they expect
  yours to work the same way. Put login top-right, make the hamburger open a
  menu, place elements where convention says. Proximity groups them; Jakob's law
  places them.

Vertical growth is fine — users scroll vertically all day. Horizontal confusion
is not.

## Layout rules

- **Top-aligned labels** are the default: single completion path top-to-bottom,
  labels easy to localize, label+hint+error+input travel as one brick.
  Left-aligned labels save vertical space but create Z-pattern eye travel and
  break with long/localized labels; right-aligned reads faster but scans worse.
- **Placeholders are NOT labels.** Placeholder-as-label makes users forget what
  the field was, kills error review, and burdens people with visual/cognitive
  impairments. Always render an explicit label; placeholder only as a format hint.
- **One column** — meaning: one clear completion path. Tightly-related pairs
  (first/last name, city/state, day-month-year) may share a line; that is one
  logical input split for convenience, not a second column.
- **Name the form** (title) and make the submit text agree with it ("Find
  tickets" -> button "Find tickets", not "Send"); no technical jargon on buttons.
- Long multi-step forms (10-15 min): add a welcome page saying what it is and how
  long it takes.

## Required vs optional, and asking less

- Ideal: **if a field is not required, do not ask for it**. When most fields are
  required, mark the exceptions "(optional)" or put the condition in the label
  ("Site, if you have one"); asterisks are convention — fine to keep, but login /
  card / single-field forms need no marking at all.
- A useful trick: separate required fields from optional ones with space, and
  explain WHY you ask for optional data ("we'll only call about delivery").
- **Progressive disclosure**: show the minimum; reveal extra fields behind an
  explicit choice ("I have special requirements", "I need delivery", "Show
  advanced options"). A checkbox that reveals a now-required field beats three
  always-visible optional fields.

## Validation

- **When**: *eager* mode wins — quiet while the user types the first time,
  validate on leaving the field, then re-validate instantly while they fix it so
  the error disappears the moment it is correct. Aggressive (on first keystroke)
  interrupts; lazy (only on blur) keeps stale errors while fixing; passive (only
  on submit) dumps all errors at once and maximizes memory load. (CSS
  `:user-valid/:user-invalid` behave eagerly for constraint checks — see
  CSS-FIRST-PATTERNS.)
- **Where**: next to the input, not in a summary block — the user is in that
  field's context and fixes it immediately. If the form is taller than the
  viewport, **animate-scroll to the first invalid field on submit** (instant
  jumps disorient) or name the offending fields near the button.
- **Error copy** — three rules with the same shape (say what is actually wrong,
  say what to do, write for humans):
  - explicit: "Password must be at least 8 characters", not "Password is wrong";
  - actionable: "Email is taken — log in instead?", not "Something went wrong";
  - human: "Something broke on our side, we're on it — support@x if urgent",
    never "server responded with 500".
- **Positive feedback too**: green ticks on availability/format checks reduce
  uncertainty on data-heavy forms.
- **Accessibility**: do not rely on red alone — pair error text with an icon
  (colorblind users), keep labels visible (seen), wired to inputs (heard by
  screen readers), with generous hit areas (interacted) and unambiguous wording
  (understood). Name your icons.
- **Reasonable rules only**: no minimum length for names/addresses (two-letter
  surnames exist), no "26 English letters" for humans with real names. When a
  format IS strict (phone), auto-format rather than reject.
- **Do not disable the submit button** to signal "form incomplete" — users cannot
  learn what is wrong, and disabled buttons have poor contrast. Exceptions where
  disabling is obvious and fine: N-digit code inputs, empty chat send, and
  "agree to terms" checkboxes placed right above the button.
- Client validation is UX; **the server re-validates everything** (see
  CSS-FIRST-PATTERNS: CSS is UX, never security).

## Reduce effort (the interaction-cost ledger)

Every click, keystroke, and eye-jump is a cost. Cheapest wins:

- Offer social/SSO auth (one click beats four fields).
- **3-5 options: radios/segmented control shown inline, not a dropdown** (saves
  the opening click and shows the choice space). Hundreds of options: searchable
  select. Year of birth: never a dropdown (endless scroll), never a calendar
  widget; date of birth = three inputs DD MM YYYY with auto-advance focus.
- **Pre-populate and auto-suggest**: geolocate the country/code, carry a failed
  login email into "forgot password", mirror email into username, remember
  frequent picks and float them to the top.
- **Masks and auto-format**: group card numbers, insert phone dashes — the user
  never types formatting. Watch locale traps: a US-only phone mask blocks
  international users; Russia has no State — adapt address fields per country
  (postal code vs zip).
- **Input width hints content** (zip is short, message is long); correct
  `type=`/`inputmode` gives mobile users the right keyboard (email keyboard has
  @, numeric pad for codes).
- Autofocus the first field (especially in modals); on payment forms, order
  fields so fixed-length fields chain focus automatically (name first if it's
  the variable-length one), and put the exact price ON the pay button
  ("Pay $120.00").
- Break big forms into spaced groups with headings; wizard/steps for genuinely
  long flows.

## Feedback and state (forms are conversations)

- **Autosave** anything long (comments, articles, settings drafts) and show the
  state ("Saving... / Saved"). User data is priceless; never lose it to a crash
  — and **never clear fields on a failed submit** (wrong password must not wipe
  the email).
- **Inline editing** beats a separate edit page: the user edits the field they
  are looking at instead of hunting for it in a form of twenty inputs.
- **Optimistic UI** for frequent, low-risk, undoable actions (check a todo):
  confirm instantly, reconcile in the background, and on rare failure notify +
  roll back visibly. Critical actions (loans, payments) still wait for the
  server.
- Loaders: **wait ~0.1-0.2s before showing any spinner** (avoid flash-of-loader
  on fast responses); if a request runs long, say so ("taking longer than
  usual — still working"). Send verification codes immediately on reaching the
  code screen — do not make the user press "send code" first, and give a
  "didn't receive it?" escape hatch with instructions.
- Show hints inline in the layout, not hidden behind hover-only icons (hover
  does not exist on touch; hidden hints cost an extra action). Long
  explanations: a button that opens a modal is fine. But avoid wordiness —
  "Your email/Your username" columns of redundant words slow scanning.
- Checkbox quality ladder: bare icon (bad hit area) -> label included in hit
  area -> card-style checkbox with border/padding/description (best when options
  deserve explanation). Same thinking for any small control: grow the target.
- Limit choices where precision is not needed (a palette of 12 swatches beats a
  color wheel). Less choice = faster decision.

## Password fields (a special case worth memorizing)

- Always provide **show/hide** (eye icon or "Show" text); leave room for
  password-manager icons (keep the toggle from colliding with them).
- **Do not ask to type the password twice** — unmasking + a working
  restore-password flow covers mistakes; confirmation is a relic (keep it only
  for audiences unlikely to manage either).
- Show requirements upfront near the field (on focus is ideal — progressive
  disclosure), as a checklist that ticks green as each rule is met; do not
  reveal rules one-by-one through validation errors. Skip "strength meters"
  unless you can explain what they demand; prefer fewer, clearer rules —
  usability vs security is a deliberate trade-off per product.

## The honest caveats

- These are best practices, not laws — for any of them a successful product
  exists that violates it. The aesthetic-usability effect is real: interfaces
  that look good get forgiven. Context (audience, device, market) outranks any
  rule; when you deviate, know why.
