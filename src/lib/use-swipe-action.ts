import { useState, useRef, useCallback } from 'react'

const SWIPE_THRESHOLD = 80
const MAX_DRAG = 120

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
    currentXRef.current = 0
    trackingRef.current = true
    setIsDragging(true)

    const onPointerMove = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - startXRef.current
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
