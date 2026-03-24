import { useRef } from 'react'
import type { Tile } from '../types'
import { LOD_LEVELS } from '../lod'

export const TILE_SIZE = 400
export const GAP = 24
export const COLS = 40
export const ROWS = 40

export function useTiles() {
    return useRef<Tile[]>(
        Array.from({ length: COLS * ROWS }, (_, i) => ({
            id: i,
            x: (i % COLS) * (TILE_SIZE + GAP),
            y: Math.floor(i / COLS) * (TILE_SIZE + GAP),
            w: TILE_SIZE,
            h: TILE_SIZE,
            imgs: LOD_LEVELS.map(() => new Image()),
        }))
    )
}