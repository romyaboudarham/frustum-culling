import { useRef, useEffect } from 'react'

export function useCanvasSetup(
    canvasRef: React.RefObject<HTMLCanvasElement | null>,
    onFrame: (ctx: CanvasRenderingContext2D, w: number, h: number) => void
) {
    const onFrameRef = useRef(onFrame);
    onFrameRef.current = onFrame; // always use latest without restarting loop

    useEffect(() => {
        const canvas = canvasRef?.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d')!; // trust it won't be null
        let dpr = window.devicePixelRatio || 1
        const resize = () => {
            dpr = window.devicePixelRatio || 1
            canvas.width = window.innerWidth * dpr
            canvas.height = window.innerHeight * dpr
            canvas.style.width = `${window.innerWidth}px`
            canvas.style.height = `${window.innerHeight}px`
        }
        resize();
        window.addEventListener('resize', resize);

        // rAF loop - requestAnimationFrame
        let rafId: number;
        const loop = () => {
            ctx.save()
            ctx.scale(dpr, dpr)
            onFrameRef.current(ctx, canvas.width / dpr, canvas.height / dpr) // pass CSS pixels
            ctx.restore()
            rafId = requestAnimationFrame(loop);
        }
        rafId = requestAnimationFrame(loop);

        return () => {
            // called automatically when component unmounts to prevent memory leak
            cancelAnimationFrame(rafId)
            window.removeEventListener('resize', resize)
        }

    }, [canvasRef])
} 