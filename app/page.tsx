'use client'

import { useEffect, useState, useCallback, useRef } from 'react'

const lines = [
  'One year ago my heart failed.',
  '',
  'At the same time, I blew up my trading account.',
  '',
  'One was medical.',
  '',
  'One was my fault.',
  '',
  'Both exposed the same thing.',
  '',
  'I was operating without control.',
  '',
  'After the diagnosis, my heart was misfiring roughly 25% of the time.',
  '',
  'The next available cardiology follow-up was months away.',
  '',
  'Months.',
  '',
  'No continuous monitoring.',
  '',
  'No real-time answers.',
  '',
  'Just medication and uncertainty.',
  '',
  'Everytime I left my house I was in constant fear.',
  '',
  'I did not want to wait months to understand what my heart was doing in real time.',
  '',
  'So I built the monitoring system myself.',
  '',
  'A real-time ECG platform connected to a chest strap.',
  '',
  'Live PVC detection.',
  '',
  'Continuous arrhythmia burden estimation.',
  '',
  'Signal processing pipeline.',
  '',
  'Time-series modeling.',
  '',
  'Neural network classification.',
  '',
  'Workout session tracking.',
  '',
  'Alerts when abnormal patterns spike.',
  '',
  'I built it because the alternative was guessing for months.',
  '',
  'It turned fear into telemetry.',
  '',
  'It gave me continuous feedback where the medical system could only give me appointments.',
  '',
  'Around the same time, trading exposed a different weakness.',
  '',
  'I was not bad at math.',
  '',
  'I was bad at structure.',
  '',
  'No position sizing discipline.',
  '',
  'No probabilistic framework.',
  '',
  'No formal constraints.',
  '',
  'Just reactions.',
  '',
  'Mathematics was the one advantage I actually had.',
  '',
  'So I stopped trying to predict.',
  '',
  'I started modeling.',
  '',
  'Risk first.',
  '',
  'Optimization under constraints.',
  '',
  'Transaction costs.',
  '',
  'Regime shifts.',
  '',
  'Execution assumptions.',
  '',
  'I implemented cardinality-constrained portfolio optimization.',
  '',
  'I reproduced Wasserstein-based market regime clustering from research literature.',
  '',
  'I built systematic strategies with explicit slippage and volatility-adjusted exits.',
  '',
  'The goal was not to win trades.',
  '',
  'It was to remove randomness from my own behavior.',
  '',
  'While doing this, I moved onto an accelerated academic path, taking extra courses each semester and completing advanced third-year mathematics early.',
  '',
  'Functional analysis.',
  '',
  'Abstract algebra.',
  '',
  'Complex analysis.',
  '',
  'Not to collect courses.',
  '',
  'To strengthen the only tool that consistently worked for me.',
  '',
  'Then I built distribution.',
  '',
  'QuantFrame.',
  '',
  'A platform built to train real quantitative thinking, not surface-level trading tactics.',
  '',
  'Four thousand users in three weeks.',
  '',
  'Built on credibility, not hype.',
  '',
  'In parallel, I documented the process publicly.',
  '',
  'That archive became a community of over 100,000 people focused on quantitative finance and mathematics.',
  '',
  'Tens of millions of views.',
  '',
  'Not influence.',
  '',
  'Leverage.',
  '',
  'The pattern is simple.',
  '',
  'When I lose control, I build systems.',
  '',
  'When I face uncertainty, I formalize it.',
  '',
  'When something takes months to access, I instrument it myself.',
  '',
  'This is not a pivot story.',
  '',
  'It is a systems response to constraint.',
]

function Line({
  children,
  isTyping = false
}: {
  children: React.ReactNode
  isTyping?: boolean
}) {
  const ref = useRef<HTMLParagraphElement>(null)
  const [opacity, setOpacity] = useState(isTyping ? 1 : 0.15)

  useEffect(() => {
    if (isTyping) {
      setOpacity(1)
      return
    }

    const updateOpacity = () => {
      if (!ref.current) return

      const rect = ref.current.getBoundingClientRect()
      const lineCenter = rect.top + rect.height / 2
      const viewportCenter = window.innerHeight / 2
      const distance = Math.abs(lineCenter - viewportCenter)
      const maxDistance = window.innerHeight / 2

      // Calculate opacity: 1 at center, fading to 0.1 at edges
      const normalizedDistance = Math.min(distance / maxDistance, 1)
      const newOpacity = 1 - (normalizedDistance * 0.85)

      setOpacity(Math.max(0.1, newOpacity))
    }

    updateOpacity()
    window.addEventListener('scroll', updateOpacity, { passive: true })
    return () => window.removeEventListener('scroll', updateOpacity)
  }, [isTyping])

  return (
    <p
      ref={ref}
      className="text-base md:text-lg leading-relaxed min-h-[1.75em] transition-opacity duration-150"
      style={{ opacity }}
    >
      {children}
    </p>
  )
}

export default function Manifesto() {
  const [currentLineIndex, setCurrentLineIndex] = useState(0)
  const [currentCharIndex, setCurrentCharIndex] = useState(0)
  const [completedLines, setCompletedLines] = useState<string[]>([])
  const [isComplete, setIsComplete] = useState(false)
  const typingRef = useRef<HTMLParagraphElement>(null)

  const currentLine = lines[currentLineIndex] || ''
  const displayedCurrentLine = currentLine.slice(0, currentCharIndex)

  const advanceToNextLine = useCallback(() => {
    if (currentLineIndex >= lines.length - 1) {
      setCompletedLines((prev) => [...prev, currentLine])
      setIsComplete(true)
      return
    }

    setCompletedLines((prev) => [...prev, currentLine])
    setCurrentLineIndex((prev) => prev + 1)
    setCurrentCharIndex(0)
  }, [currentLineIndex, currentLine])

  const skipCurrentLine = useCallback(() => {
    if (isComplete) return

    setCompletedLines((prev) => [...prev, currentLine])

    if (currentLineIndex >= lines.length - 1) {
      setIsComplete(true)
    } else {
      setCurrentLineIndex((prev) => prev + 1)
      setCurrentCharIndex(0)
    }
  }, [currentLine, currentLineIndex, isComplete])

  // Typing effect
  useEffect(() => {
    if (isComplete) return
    if (currentCharIndex >= currentLine.length) {
      const timeout = setTimeout(() => {
        advanceToNextLine()
      }, currentLine === '' ? 80 : 300)
      return () => clearTimeout(timeout)
    }

    const timeout = setTimeout(() => {
      setCurrentCharIndex((prev) => prev + 1)
    }, 45)

    return () => clearTimeout(timeout)
  }, [currentCharIndex, currentLine, advanceToNextLine, isComplete])

  // Keyboard listener for Enter and Space
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        skipCurrentLine()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [skipCurrentLine])

  // Touch listener for mobile
  useEffect(() => {
    const handleTouchStart = () => {
      if (!isComplete) {
        skipCurrentLine()
      }
    }

    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    return () => window.removeEventListener('touchstart', handleTouchStart)
  }, [skipCurrentLine, isComplete])

  // Click listener for PC
  useEffect(() => {
    const handleClick = () => {
      if (!isComplete) {
        skipCurrentLine()
      }
    }

    window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
  }, [skipCurrentLine, isComplete])

  // Keep typing line in view
  useEffect(() => {
    if (typingRef.current && !isComplete) {
      typingRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [completedLines, isComplete])

  return (
    <main className="min-h-screen bg-black hide-scrollbar overflow-y-auto">
      <div className="max-w-2xl mx-auto px-6 md:px-12 lg:px-24">
        {/* Top padding to start typing in center */}
        <div className="h-[50vh]" />

        {/* Completed lines */}
        {completedLines.map((line, i) => (
          <Line key={i}>{line}</Line>
        ))}

        {/* Current typing line */}
        {!isComplete && (
          <p
            ref={typingRef}
            className="text-base md:text-lg leading-relaxed min-h-[1.75em]"
          >
            {displayedCurrentLine}
            <span className="cursor" />
          </p>
        )}

        {/* Scroll indicator */}
        <div className="h-[50vh] flex items-end justify-center pb-8">
          {isComplete && (
            <div className="animate-bounce flex flex-col items-center gap-2 text-white/40">
              <span className="text-sm tracking-wide">scroll</span>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M7 13l5 5 5-5" />
                <path d="M7 6l5 5 5-5" />
              </svg>
            </div>
          )}
        </div>

        {/* Portfolio Section */}
        {isComplete && (
          <>
            <section className="py-24 border-t border-white/10">
              <h2 className="text-sm text-white/40 tracking-wide mb-12">Work</h2>

              <div className="space-y-8">
                <a
                  href="https://github.com/mirkovicdev/Polar-H10-ECG-IOS-app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group"
                >
                  <h3 className="text-lg md:text-xl text-white/90 group-hover:text-white transition-colors">
                    Real-time ECG Arrhythmia Detector
                  </h3>
                  <p className="text-sm text-white/40 mt-1">
                    Live PVC detection, neural network classification, workout tracking
                  </p>
                </a>

                <a
                  href="https://github.com/mirkovicdev/Cardinality-Constrained-Portfolio-Optimization"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group"
                >
                  <h3 className="text-lg md:text-xl text-white/90 group-hover:text-white transition-colors">
                    Cardinality-Constrained Portfolio Optimization
                  </h3>
                  <p className="text-sm text-white/40 mt-1">
                    Integer programming, Markowitz optimization under constraints
                  </p>
                </a>

                <a
                  href="https://github.com/mirkovicdev/CLUSTERING-MARKET-REGIMES"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group"
                >
                  <h3 className="text-lg md:text-xl text-white/90 group-hover:text-white transition-colors">
                    Wasserstein K-Means Market Regime Clustering
                  </h3>
                  <p className="text-sm text-white/40 mt-1">
                    Clustering distributions via Wasserstein distance, regime-switching GBM, jump diffusion
                  </p>
                </a>

                <div className="block">
                  <h3 className="text-lg md:text-xl text-white/90">
                    SOLUSDT Signal Bot
                  </h3>
                  <p className="text-sm text-white/40 mt-1">
                    Algorithmic trading, ATR-based exits, slippage modeling
                  </p>
                </div>

                <a
                  href="https://quantframe.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group"
                >
                  <h3 className="text-lg md:text-xl text-white/90 group-hover:text-white transition-colors">
                    QuantFrame
                  </h3>
                  <p className="text-sm text-white/40 mt-1">
                    Educational platform for quantitative finance
                  </p>
                </a>
              </div>
            </section>

            {/* Contact Section */}
            <section className="py-24 border-t border-white/10">
              <h2 className="text-sm text-white/40 tracking-wide mb-12">Contact</h2>

              <div className="space-y-4">
                <a
                  href="mailto:contact@mirkovic.dev"
                  className="block text-lg md:text-xl text-white/90 hover:text-white transition-colors"
                >
                  contact@mirkovic.dev
                </a>

                <a
                  href="https://github.com/mirkovicdev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-lg md:text-xl text-white/90 hover:text-white transition-colors"
                >
                  github
                </a>

                <a
                  href="https://linkedin.com/in/amirkovic"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-lg md:text-xl text-white/90 hover:text-white transition-colors"
                >
                  linkedin
                </a>

                <a
                  href="https://instagram.com/mirkovicdev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-lg md:text-xl text-white/90 hover:text-white transition-colors"
                >
                  instagram
                </a>
              </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-white/10 text-sm text-white/30">
              Antonije Mirkovic
            </footer>
          </>
        )}
      </div>
    </main>
  )
}
