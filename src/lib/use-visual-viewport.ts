import { useState, useEffect } from 'react'

interface ViewportState {
  height: number
  offsetTop: number
  keyboardHeight: number
  isKeyboardOpen: boolean
}

export function useVisualViewport(): ViewportState {
  const [state, setState] = useState<ViewportState>({
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
    offsetTop: 0,
    keyboardHeight: 0,
    isKeyboardOpen: false,
  })

  useEffect(() => {
    const viewport = window.visualViewport
    if (!viewport) return

    const updateState = () => {
      const height = viewport.height
      const offsetTop = viewport.offsetTop
      const windowHeight = window.innerHeight
      const keyboardHeight = windowHeight - height - offsetTop
      const isKeyboardOpen = keyboardHeight > 50

      setState({
        height,
        offsetTop,
        keyboardHeight: Math.max(0, keyboardHeight),
        isKeyboardOpen,
      })
    }

    viewport.addEventListener('resize', updateState)
    viewport.addEventListener('scroll', updateState)
    updateState()

    return () => {
      viewport.removeEventListener('resize', updateState)
      viewport.removeEventListener('scroll', updateState)
    }
  }, [])

  return state
}
