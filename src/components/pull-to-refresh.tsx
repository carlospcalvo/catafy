import { useState, useRef, useCallback, type ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

const THRESHOLD = 60

interface PullToRefreshProps {
  onRefresh: () => Promise<unknown>
  children: ReactNode
}

export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [pulling, setPulling] = useState(false)
  const [pullDist, setPullDist] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const startY = useRef(0)
  const pullingRef = useRef(false)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (window.scrollY > 0) return
    startY.current = e.touches[0].clientY
    pullingRef.current = false
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (window.scrollY > 0) return
    const dist = e.touches[0].clientY - startY.current
    if (dist <= 0) return
    e.preventDefault()
    pullingRef.current = true
    setPulling(true)
    setPullDist(Math.min(dist * 0.5, 120))
  }, [])

  const handleTouchEnd = useCallback(async () => {
    if (!pullingRef.current) return
    setPulling(false)
    if (pullDist >= THRESHOLD) {
      setRefreshing(true)
      try {
        await onRefresh()
      } finally {
        setRefreshing(false)
        setPullDist(0)
      }
    } else {
      setPullDist(0)
    }
    pullingRef.current = false
  }, [pullDist, onRefresh])

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ touchAction: refreshing ? 'auto' : 'pan-x' }}
    >
      <div
        className="flex items-center justify-center overflow-hidden transition-[height] duration-300"
        style={{ height: refreshing ? 48 : pulling ? pullDist : 0 }}
      >
        <Loader2
          className={`h-6 w-6 text-(--lagoon) ${refreshing || pullDist >= THRESHOLD ? 'animate-spin' : ''}`}
          style={{
            opacity: refreshing ? 1 : Math.min(pullDist / THRESHOLD, 1),
          }}
        />
      </div>
      {children}
    </div>
  )
}
