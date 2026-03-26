import type { Tile } from '../types'

export function cullTiles(
  tiles: Tile[],
  offset: { x: number; y: number },
  scale: number,
  viewportX: number,
  viewportY: number,
  viewportW: number,
  viewportH: number,
  cols: number,
  rows: number,
  stride: number,
): Tile[] {
  const worldLeft   = (viewportX - offset.x) / scale
  const worldTop    = (viewportY - offset.y) / scale
  const worldRight  = (viewportX + viewportW - offset.x) / scale
  const worldBottom = (viewportY + viewportH - offset.y) / scale

  const minCol = Math.max(0, Math.floor(worldLeft / stride))
  const maxCol = Math.min(cols - 1, Math.floor(worldRight / stride))
  const minRow = Math.max(0, Math.floor(worldTop / stride))
  const maxRow = Math.min(rows - 1, Math.floor(worldBottom / stride))

  const visible: Tile[] = []
  for (let row = minRow; row <= maxRow; row++) {
    for (let col = minCol; col <= maxCol; col++) {
      const tile = tiles[row * cols + col]
      if (tile) visible.push(tile)
    }
  }
  return visible
}
