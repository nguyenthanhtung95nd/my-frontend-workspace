# Semantic HTML

Semantic markup communicates *meaning*, not just appearance. It is the backbone of
accessibility, SEO, and maintainability — and it's the same whether you write JSX, Vue
templates, Blazor `.razor`, or plain HTML. Build the meaning first; style it later.

## Landmarks & document structure

- One `<header>`, `<nav aria-label="Primary">`, `<main>` (exactly one), `<footer>` per page.
- `<section>` for thematic groups (needs a heading), `<article>` for self-contained items
  (a card, a post), `<aside>` for tangential content.
- A grid of products is a **list of articles**: `<ul>` → `<li>` → `<article>`, not `<div>`
  soup.
- Provide a "skip to content" link as the first focusable element.

## Heading hierarchy

- Exactly one `<h1>` per page; don't skip levels (`h2` → `h4`). Headings form the outline
  screen-reader users navigate by — never pick a level for its font size (that's CSS).

## Buttons vs links

- `<a href>` navigates to a URL. `<button>` performs an action. Never a clickable `<div>`
  — you lose keyboard, focus, and role for free with the real element.

## Accessible forms (the highest-value semantic win)

- Every input has a `<label for>` (or wraps it). Group related fields in
  `<fieldset><legend>`.
- Mark required fields and describe hints/errors with `aria-describedby`.
- Use the right `type`/`inputmode`/`autocomplete` (`email`, `tel`, `given-name`…).
- Errors: an `role="alert"` message per field, and an error-summary (`role="alert"`,
  focusable) at the top that links to each invalid field.
- Async status via a live region: `<div role="status" aria-live="polite">`.

```html
<form aria-labelledby="contact-title">
  <h1 id="contact-title">Contact us</h1>
  <fieldset>
    <legend>Your details</legend>
    <div class="field">
      <label for="email">Email <span aria-hidden="true">*</span></label>
      <input id="email" name="email" type="email" inputmode="email" autocomplete="email"
             required aria-describedby="email-hint email-error" />
      <p id="email-hint" class="hint">We'll only use this to reply.</p>
      <p id="email-error" class="error" role="alert" hidden>Enter a valid email.</p>
    </div>
  </fieldset>
  <div role="status" aria-live="polite"></div>
  <button type="submit">Send</button>
</form>
```

## Tables

- Data tables only (never for layout): `<caption>`, `<thead>`/`<tbody>`, `<th scope="col">`
  / `<th scope="row">`. This is what makes a table navigable to a screen reader.

## In a component framework

The element still matters inside JSX/Vue/Blazor — render real `<button>`, `<nav>`,
`<label>`, `<fieldset>`. A framework doesn't excuse `<div onClick>`. Keep the semantic
element; let the framework handle state around it.
