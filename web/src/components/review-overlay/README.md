# Review Overlay MVP

Reusable overlay for in-browser review across landing pages and apps.

## Goals

- Keep feedback collection separate from page-specific content
- Support two modes:
  - `comment`: attach notes to arbitrary UI blocks
  - `edit`: change text nodes locally without editing source code
- Persist locally first, replaceable later with API storage

## Public API

```tsx
<ReviewOverlayProvider storageKey="my-site-review">
  <ReviewTarget id="hero" label="Hero Section">
    <section>...</section>
  </ReviewTarget>

  <EditableText
    id="hero-title"
    label="Hero Title"
    text="Original title"
    as="h1"
  />
</ReviewOverlayProvider>
```

## Current MVP Scope

- Local persistence via `localStorage`
- Floating control panel
- Comment modal
- Text-edit modal
- Visual outlines for interactive targets

## Next Steps

- Export/import JSON
- Image replacement targets
- Style tokens editing
- Server persistence
- Pins anchored to exact coordinates
