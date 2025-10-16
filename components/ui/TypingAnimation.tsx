'use client'

import { useState, useEffect, useRef } from 'react'

interface TypingAnimationProps {
  text: string
  speed?: number // Characters per second
  onComplete?: () => void
  isVisible?: boolean // Whether this component should be animating
  className?: string
  showCursor?: boolean
}

export function TypingAnimation({
  text,
  speed = 50, // Default 50 characters per second
  onComplete,
  isVisible = true,
  className = '',
  showCursor = true
}: TypingAnimationProps) {
  const [displayedText, setDisplayedText] = useState('')
  const [isComplete, setIsComplete] = useState(false)
  const animationRef = useRef<number>()
  const startTimeRef = useRef<number>()

  useEffect(() => {
    if (!isVisible || !text) {
      setDisplayedText(text)
      setIsComplete(true)
      onComplete?.()
      return
    }

    // Reset state
    setDisplayedText('')
    setIsComplete(false)
    startTimeRef.current = Date.now()

    const animate = () => {
      const now = Date.now()
      const elapsed = now - (startTimeRef.current || now)

      // Calculate how many characters should be displayed based on elapsed time
      const charactersToShow = Math.floor((elapsed / 1000) * speed)

      if (charactersToShow >= text.length) {
        // Animation complete
        setDisplayedText(text)
        setIsComplete(true)
        onComplete?.()
      } else {
        // Continue animation
        setDisplayedText(text.substring(0, charactersToShow))
        animationRef.current = requestAnimationFrame(animate)
      }
    }

    // Start animation
    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [text, speed, isVisible, onComplete])

  return (
    <span className={className}>
      {displayedText}
      {showCursor && !isComplete && isVisible && (
        <span className="inline-block w-2 h-5 bg-current animate-pulse ml-1" />
      )}
    </span>
  )
}