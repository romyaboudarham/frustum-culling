# Frustum Culling & LOD — Interactive Demo

Built to explore rendering optimisation techniques after a conversation with the Vizcom team. Covers frustum culling and level of detail (LOD) using a raw Canvas 2D API so every decision is visible and measurable.

---

## What I explored

- **Lazy loading** — each tile holds four image slots (64px, 300px, 1024px, 2048px). A slot's src is only set when the tile enters the viewport (or the prefetch buffer just outside it). Images are never loaded upfront.

- **LOD** — each frame, the current zoom level is mapped to a resolution tier. The correct slot is requested if not already loaded. While it loads, the nearest already-complete lower tier draws as a fallback — no blank tiles.

- **Frustum Culling** —
  Removing draw calls for off-screen tiles. Result: JavaScript loops 6 vs 1600 times.
  Performance result, not a dramatic change compared to no culling because the

Findings:

- at 1600 tiles, the difference is there, but not dramatic.
  -> Images are already loaded in memory
  -> GPU already clips pixels outside the viewport, so off-screen draw calls are cheap.
- at 10000 tiles

Each image is a tile on a regular grid, sitting in a predictable position

a naive `filter` over all tiles is O(n) even when 2 tiles are visible. Replaced it with a grid index that converts viewport bounds to world space and jumps directly to the visible row/column range — O(visible), zero wasted evaluations.

- **devicePixelRatio** — without it the canvas renders at half resolution on Retina displays, making images look soft regardless of source quality. Fixed by sizing the canvas in physical pixels and scaling the context to match.

- **Keeping the render loop outside React** — pan, zoom, tile state and draw calls all live in refs and a custom rAF loop. React only handles the two toggle switches. This avoids re-renders on every frame and keeps the hot path clean.

---

## Running locally

```bash
npm install
npm run dev
```

## Controls

| Action         | Input          |
| -------------- | -------------- |
| Pan            | Click and drag |
| Zoom           | Scroll wheel   |
| Toggle culling | HUD switch     |
| Toggle LOD     | HUD switch     |
