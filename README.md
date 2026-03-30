# Interactive Demo investigating how to design for optimal performance for large, 2D canvas web applications.

Built to explore rendering optimisation techniques after a conversation about performance with the Vizcom team. Covers frustum culling and level of detail (LOD) using a raw Canvas 2D API (instead of three.js or WebGL) so every decision is visible and measurable.

---

## What I explored

### Lazy loading 
each tile holds four image slots (64px, 300px, 1024px, 2048px). A slot's src is only set when the tile enters the viewport (or the prefetch buffer just outside it).

Developement pivot: Originally, all 4 images were fetched and loaded upfront, this caused a noticible lag on initial page load and a high consumtion of GPU. After analyzing other large canvas web-apps like Google Maps or Figma, I pivoted to lazy loading for better performance.

**Results (6400 tiles, at rest)**

|                 | Memory | CPU | Network   |
| --------------- | ------ | --- | --------- |
| Lazy loading    | 191 MB | 16% | 0         |
| Upfront loading | 1.0 GB | 61% | 13.1 MB/s |

The browser has to decode and hold all 25,600 bitmaps (6400 tiles × 4 LOD slots) in memory at once, which is why upfront loading hits 1 GB. Lazy loading keeps only viewed tiles decoded.

### Level of Detail (LOD)
the current zoom level of each frame is mapped to a resolution tier. The respective slot is requested if not already loaded. While it loads, the nearest already-complete lower tier draws as a fallback --> resulting in no blank tiles.

**Results (6400 tiles, culling OFF, panning)**

|                         | LOD ON | LOD OFF (always 2048px) |
| ----------------------- | ------ | ----------------------- |
| Zoomed out (64px tier)  | 60 FPS | 3–40 FPS (unstable)     |
| Zoomed in (2048px tier) | 60 FPS | 58–60 FPS               |

Zoomed out with LOD shows significant performance increase. With LOD OFF, the GPU decodes and draws 2048px bitmaps scaled down to tiny screen-size tiles, which dramatically decreases performance. With LOD ON, the 64px tier is served instead and the GPU barely notices. Zoomed in, both modes use 2048px images anyway, so performance is near-identical.

### Frustum Culling
Removing draw calls for off-screen tiles.

**Results (LOD ON, zoomed out, at rest)**

| | Culling ON | Culling OFF |
|---|---|---|
| 6400 tiles | 60 FPS | 60 FPS |
| 10,000 tiles | 60 FPS | 50 FPS |

No difference at 6400 tiles — the GPU clips off-screen draw calls cheaply enough that the overhead doesn't register. At 10,000 tiles the cost of issuing draw commands for every tile every frame starts to show, and culling recovers the lost frames by skipping tiles outside the viewport entirely.

Tile Data Structure
Each image is a tile on a regular grid, sitting in a predictable position. Using a grid index that converts viewport bounds to world space and jumps directly to the visible row/column range — O(visible), zero wasted evaluations. O(1) - O(n)

Future Research

- a 2D canvas like Figma or Viscom won't have content in a neat grid. Instead I want to use quadrant lookup.

### devicePixelRatio
without it the canvas renders at half resolution on Retina displays, making images look soft regardless of source quality. Fixed by sizing the canvas in physical pixels and scaling the context to match.

### Keeping the render loop outside React
pan, zoom, tile state and draw calls all live in refs and a custom rAF requestAnimationFrame (rAF) loop. React only handles the two toggle switches. This avoids re-renders on every frame and keeps the hot path clean.

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
