import { useRef, useEffect } from 'react'
import type { Tile } from '../types'
import { LOD_LEVELS } from '../lod'

export const TILE_SIZE = 400
export const GAP = 24
// export const COLS = 80
// export const ROWS = 80

export function useTiles(cols: number, rows: number) {
    const tilesRef = useRef<Tile[]>([])
    useEffect(() => {
        tilesRef.current = Array.from({ length: cols * rows }, (_, i) => ({
            id: i,
            x: (i % cols) * (TILE_SIZE + GAP),
            y: Math.floor(i / cols) * (TILE_SIZE + GAP),
            w: TILE_SIZE,
            h: TILE_SIZE,
            // Lazy Load:
            imgs: LOD_LEVELS.map(() => new Image()),
            // Eager Load:
            // imgs: LOD_LEVELS.map((level, li) => {
            //     const img = new Image()
            //     img.src = `https://picsum.photos/seed/${i}/${level.size}/${level.size}`
            //     return img
            // }),
        }))
    }, [cols, rows])
    return tilesRef
}
