import { useEffect, useRef } from 'react'

export function useInteraction(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const offset = useRef({ x: 0, y: 0 })
  const scale = useRef(0.4)  // start zoomed out so you can see the grid
  const isPanning = useRef(false)
  const lastMouse = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const onMouseDown = (e: MouseEvent) => {
      isPanning.current = true
      lastMouse.current = { x: e.clientX, y: e.clientY }
      canvas.style.cursor = 'grabbing'
    }

    const onMouseMove = (e: MouseEvent) => {
      if (!isPanning.current) return
      offset.current.x += e.clientX - lastMouse.current.x
      offset.current.y += e.clientY - lastMouse.current.y
      lastMouse.current = { x: e.clientX, y: e.clientY }
    }

    const onMouseUp = () => {
      isPanning.current = false
      canvas.style.cursor = 'grab'
    }

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()

      const factor = e.deltaY < 0 ? 1.08 : 0.92
      const next = Math.min(Math.max(scale.current * factor, 0.05), 8)

      // zoom toward cursor
      const wx = (e.clientX - offset.current.x) / scale.current
      const wy = (e.clientY - offset.current.y) / scale.current
      offset.current.x = e.clientX - wx * next
      offset.current.y = e.clientY - wy * next

      scale.current = next
    }

    canvas.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    canvas.addEventListener('wheel', onWheel, { passive: false })

    return () => {
      canvas.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      canvas.removeEventListener('wheel', onWheel)
    }
  }, [canvasRef])

  return { offset, scale }
}