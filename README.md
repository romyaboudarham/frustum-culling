# Frustum Culling & LOD — Interactive Demo

An interactive canvas demo built with React + TypeScript that visualises two core rendering optimisation techniques: **frustum culling** and **level of detail (LOD)**. Built on a raw Canvas 2D API with a custom requestAnimationFrame loop — no WebGL, no Three.js — so every optimisation is transparent and measurable.

---

## What it demonstrates

### Frustum Culling

Only tiles that overlap the visible viewport are drawn. When culling is **off**, all 1,600 tiles receive a `drawImage` call every frame regardless of whether they are on screen. When culling is **on**, the visible set is computed in O(visible) time by converting viewport bounds to world space and directly indexing into the tile grid — no per-tile iteration needed.

```
worldLeft = -offset.x / scale
minCol    = floor(worldLeft / stride)   // jump straight to first visible column
```

This proves that the bottleneck at high tile counts is not the _draw_ calls themselves but the _evaluation_ cost of checking every tile. A spatial index eliminates that entirely.

### Level of Detail (LOD)

Each tile has four image resolutions loaded lazily:

| Level | Size    | Threshold (scale) |
| ----- | ------- | ----------------- |
| 0     | 64 px   | 0                 |
| 1     | 300 px  | 0.2               |
| 2     | 1024 px | 0.6               |
| 3     | 2048 px | 1.5               |

At default zoom (~0.4) tiles load at 300 px — above the 0.2 threshold for level 1 but below 0.6, so level 2 is not yet triggered. As you zoom in, higher-resolution images are triggered lazily — only for the tiles currently in view. If a higher-res image hasn't loaded yet, the nearest lower level is drawn as a fallback, so there are no blank tiles.

When LOD is **off**, all tiles use the 1024 px image regardless of zoom, demonstrating the memory and quality cost of a flat resolution strategy.

---

## Architecture

### `useCanvasSetup`

Owns the `requestAnimationFrame` loop and canvas sizing. Handles `devicePixelRatio` so the canvas renders at full physical resolution on Retina displays. Exposes an `onFrame(ctx, w, h)` callback that always works in CSS pixels.

### `useTiles`

Creates the flat tile array synchronously on mount (no `useEffect` delay). Each tile holds an array of `HTMLImageElement` objects — one per LOD level — with no `src` set until the tile becomes visible.

### `useFrustumCulling`

Takes viewport bounds and grid dimensions, converts to world space, and returns only the tiles in the visible row/column range. No `filter` over the full array — runs in O(visible) not O(total).

### `useInteraction`

Pan (mouse drag) and zoom (scroll wheel, zoom toward cursor) via refs — no React state, no re-renders.

### `lod.ts`

Single source of truth for LOD levels. Adding a new resolution tier is one line.

---

## Key findings

- **Culling reduces draw calls** but the real win at scale is eliminating the _evaluation_ of invisible tiles. A grid index is O(visible); a `filter` is always O(total).
- **LOD reduces network and GPU cost** by only loading and drawing the resolution that matches the current zoom level. At default zoom, a 64 px thumbnail is indistinguishable from a 1024 px image.
- **devicePixelRatio matters.** Without it, the canvas renders at half resolution on Retina displays, making images look soft regardless of their source size.
- **Canvas 2D is transparent.** Every draw call, every cull decision, every image load is explicit in the code — which makes it a better teaching tool than an abstracted WebGL renderer for this kind of demo.

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
