import { useRef, useState } from 'react'
import { useCanvasSetup } from './hooks/useCanvasSetup';
import { useTiles, COLS, ROWS, TILE_SIZE, GAP } from './hooks/useTiles';
import { useInteraction } from './hooks/useInteraction';
import { cullTiles } from './hooks/useFrustumCulling';
import { LOD_LEVELS, DEFAULT_LOD_INDEX } from './lod';

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tilesRef = useTiles();
  const { offset, scale } = useInteraction(canvasRef)

  const [cullingEnabled, setCullingEnabled] = useState(true)
  const cullingRef = useRef(cullingEnabled)
  cullingRef.current = cullingEnabled

  const [lodEnabled, setLodEnabled] = useState(true)
  const lodRef = useRef(lodEnabled)
  lodRef.current = lodEnabled

  // FPS — all refs, no re-renders
  const frameTimes = useRef<number[]>([])
  const lastLevelIndex = useRef(-1)
  const fpsDisplayRef = useRef<HTMLDivElement>(null)
  const tileCountRef = useRef<HTMLDivElement>(null)
  const resolutionRef = useRef<HTMLDivElement>(null)

  useCanvasSetup(canvasRef, (ctx, w, h) => {
    // FPS
    const now = performance.now()
    frameTimes.current.push(now)
    while (frameTimes.current.length > 0 && now - frameTimes.current[0] > 1000) {
      frameTimes.current.shift()
    }
    if (fpsDisplayRef.current) {
      fpsDisplayRef.current.textContent = `${frameTimes.current.length} FPS`
    }

    // cull or use all
    const all = tilesRef.current
    const visible = cullingRef.current
      ? cullTiles(all, offset.current, scale.current, w, h, COLS, ROWS, TILE_SIZE + GAP)
      : all

    if (tileCountRef.current) {
      tileCountRef.current.textContent = `${visible.length} / ${all.length} tiles`
    }

    // draw
    ctx.clearRect(0, 0, w, h)
    ctx.save()
    ctx.translate(offset.current.x, offset.current.y)
    ctx.scale(scale.current, scale.current)

    // pick highest level this scale qualifies for (or max if LOD off) — same for all tiles this frame
    const levelIndex = lodRef.current
      ? LOD_LEVELS.findLastIndex(l => scale.current >= l.threshold)
      : DEFAULT_LOD_INDEX

    if (levelIndex !== lastLevelIndex.current) {
      lastLevelIndex.current = levelIndex
      console.log(`LOD level ${levelIndex} — threshold: ${LOD_LEVELS[levelIndex].threshold}, size: ${LOD_LEVELS[levelIndex].size}, scale: ${scale.current.toFixed(2)}`)
    }

    if (resolutionRef.current) {
      const size = LOD_LEVELS[levelIndex].size
      resolutionRef.current.textContent = `${size}×${size}px`
    }

    for (const tile of visible) {

      // lazy-load this level
      const img = tile.imgs[levelIndex]
      if (!img.src) img.src = `https://picsum.photos/seed/${tile.id}/${LOD_LEVELS[levelIndex].size}/${LOD_LEVELS[levelIndex].size}`

      // fall back to nearest loaded level below
      let draw: HTMLImageElement | undefined
      for (let i = levelIndex; i >= 0; i--) {
        if (tile.imgs[i].complete) { draw = tile.imgs[i]; break }
      }
      if (!draw) continue
      ctx.drawImage(draw, tile.x, tile.y, tile.w, tile.h)
    }

    ctx.restore()
  })

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{ display: 'block', background: '#fff' }}
      />

      {/* HUD */}
      <div style={{
        position: 'fixed', bottom: 24, left: 24,
        display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 12,
        fontFamily: 'monospace',
        userSelect: 'none',
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(8px)',
        borderRadius: 12,
        padding: '16px 20px',
      }}>
        <div ref={fpsDisplayRef} style={{ fontSize: 28, fontWeight: 700, color: '#00ff88' }}>
          -- FPS
        </div>
        <div ref={tileCountRef} style={{ fontSize: 13, color: '#ccc' }}>
          -- / -- tiles
        </div>
        <div ref={resolutionRef} style={{ fontSize: 13, color: '#ccc' }}>
          --×--px
        </div>

        {/* Toggle rows */}
        {([
          { label: 'Level of Detail', enabled: lodEnabled, toggle: () => setLodEnabled(l => !l) },
          { label: 'Culling', enabled: cullingEnabled, toggle: () => setCullingEnabled(c => !c) },
        ] as const).map(({ label, enabled, toggle }) => (
          <div key={label} onClick={toggle} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            cursor: 'pointer', fontSize: 13, color: '#ccc',
          }}>
            {/* track */}
            <div style={{
              width: 36, height: 20, borderRadius: 10,
              background: enabled ? '#00ff88' : '#444',
              position: 'relative',
              transition: 'background 0.2s',
            }}>
              {/* thumb */}
              <div style={{
                position: 'absolute',
                top: 3, left: enabled ? 19 : 3,
                width: 14, height: 14, borderRadius: '50%',
                background: '#fff',
                transition: 'left 0.2s',
              }} />
            </div>
            <span>{label}</span>
          </div>
        ))}
      </div>
    </>
  )
}

export default App