import { useState, useRef, useCallback } from 'react'

const SWIPE_THRESHOLD = 80
const MAX_DRAG = 120
const DIRECTION_LOCK_THRESHOLD = 20
const VERTICAL_ABORT_THRESHOLD = 25

export interface SwipeActions {
  dragX: number
  isDragging: boolean
  isPastEditThreshold: boolean
  isPastDeleteThreshold: boolean
  handlers: {
    onPointerDown: (e: React.PointerEvent) => void
  }
  reset: () => void
}

export function useSwipeAction(options: {
  onEdit: () => void
  onDelete: () => void
}): SwipeActions {
  const [dragX, setDragX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  const startXRef = useRef(0)
  const startYRef = useRef(0)
  const currentXRef = useRef(0)
  const trackingRef = useRef(false)
  const onEditRef = useRef(options.onEdit)
  const onDeleteRef = useRef(options.onDelete)

  onEditRef.current = options.onEdit
  onDeleteRef.current = options.onDelete

  const reset = useCallback(() => {
    trackingRef.current = false
    setIsDragging(false)
    setDragX(0)
    currentXRef.current = 0
  }, [])

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (window.innerWidth >= 768) return
    const el = e.currentTarget as HTMLDivElement
    el.setPointerCapture(e.pointerId)
    startXRef.current = e.clientX
    startYRef.current = e.clientY
    currentXRef.current = 0
    trackingRef.current = true
    setIsDragging(true)

    let directionLocked: 'horizontal' | 'vertical' | null = null

    const onPointerMove = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - startXRef.current
      const dy = moveEvent.clientY - startYRef.current
      const absDx = Math.abs(dx)
      const absDy = Math.abs(dy)

      if (directionLocked === null) {
        if (absDx > DIRECTION_LOCK_THRESHOLD || absDy > DIRECTION_LOCK_THRESHOLD) {
          directionLocked = absDx > absDy * 2 ? 'horizontal' : 'vertical'
          if (directionLocked === 'vertical') {
            el.removeEventListener('pointermove', onPointerMove)
            el.removeEventListener('pointerup', onPointerUp)
            trackingRef.current = false
            setIsDragging(false)
            setDragX(0)
            currentXRef.current = 0
            return
          }
        }
        return
      }

      if (directionLocked === 'vertical') {
        el.removeEventListener('pointermove', onPointerMove)
        el.removeEventListener('pointerup', onPointerUp)
        trackingRef.current = false
        setIsDragging(false)
        setDragX(0)
        currentXRef.current = 0
        return
      }

      if (absDy > VERTICAL_ABORT_THRESHOLD) {
        el.removeEventListener('pointermove', onPointerMove)
        el.removeEventListener('pointerup', onPointerUp)
        trackingRef.current = false
        setIsDragging(false)
        setDragX(0)
        currentXRef.current = 0
        return
      }

      currentXRef.current = Math.max(-MAX_DRAG, Math.min(MAX_DRAG, dx))
      setDragX(currentXRef.current)
    }

    const onPointerUp = () => {
      el.removeEventListener('pointermove', onPointerMove)
      el.removeEventListener('pointerup', onPointerUp)
      trackingRef.current = false
      setIsDragging(false)

      const dx = currentXRef.current
      if (Math.abs(dx) >= SWIPE_THRESHOLD) {
        if (dx > 0) onEditRef.current()
        else onDeleteRef.current()
      }

      setDragX(0)
      currentXRef.current = 0
    }

    el.addEventListener('pointermove', onPointerMove)
    el.addEventListener('pointerup', onPointerUp)
  }, [])

  return {
    dragX,
    isDragging,
    isPastEditThreshold: dragX >= SWIPE_THRESHOLD,
    isPastDeleteThreshold: dragX <= -SWIPE_THRESHOLD,
    handlers: { onPointerDown },
    reset,
  }
}
