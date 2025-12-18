// app/quantframe/daily/components/math-card.tsx
'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Trophy, Lightbulb, AlertCircle, RotateCcw } from 'lucide-react'
import { InlineMath, BlockMath } from 'react-katex'
import 'katex/dist/katex.min.css'
import confetti from 'canvas-confetti'

interface MathProblem {
  id: string
  problem: string
  hint: string
  solution: string
  answer: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  xp: number
  problem_number?: number
  question_type?: 'free_text' | 'multiple_choice'
  options?: string[]
  correct_option_index?: number
}

interface MathCardProps {
  problem: MathProblem
  completed: boolean
  onComplete: () => void
  onReset?: () => void  // Optional reset callback
}

const difficultyColors = {
  beginner: 'bg-green-500/10 text-green-400 border-green-500/20',
  intermediate: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  advanced: 'bg-red-500/10 text-red-400 border-red-500/20'
}

// Helper to render LaTeX
const renderLatex = (text: string) => {
  if (!text) return null
  
  const processedText = text.replace(/\\n/g, '\n')
  const blockParts = processedText.split(/(\$\$[^$]+\$\$)/g)
  
  return (
    <div className="space-y-4">
      {blockParts.map((part, blockIdx) => {
        if (part.startsWith('$$') && part.endsWith('$$')) {
          const latex = part.slice(2, -2)
          return (
            <div key={blockIdx} className="flex justify-center my-4">
              <BlockMath math={latex} />
            </div>
          )
        }
        
        const paragraphs = part.split('\n\n').filter(p => p.trim())
        
        return paragraphs.map((paragraph, paraIdx) => {
          const elements = []
          let remaining = paragraph
          let elementKey = 0
          
          while (remaining) {
            const mathMatch = remaining.match(/\$([^$]+)\$/)
            const boldMatch = remaining.match(/\*\*([^*]+)\*\*/)
            
            const mathIndex = mathMatch ? remaining.indexOf(mathMatch[0]) : Infinity
            const boldIndex = boldMatch ? remaining.indexOf(boldMatch[0]) : Infinity
            
            if (mathIndex === Infinity && boldIndex === Infinity) {
              if (remaining.trim()) {
                elements.push(<span key={elementKey++}>{remaining}</span>)
              }
              break
            }
            
            if (mathIndex < boldIndex) {
              if (mathIndex > 0) {
                elements.push(<span key={elementKey++}>{remaining.slice(0, mathIndex)}</span>)
              }
              elements.push(<InlineMath key={elementKey++} math={mathMatch![1]} />)
              remaining = remaining.slice(mathIndex + mathMatch![0].length)
            } else {
              if (boldIndex > 0) {
                elements.push(<span key={elementKey++}>{remaining.slice(0, boldIndex)}</span>)
              }
              elements.push(
                <strong key={elementKey++} className="font-bold text-white">
                  {boldMatch![1]}
                </strong>
              )
              remaining = remaining.slice(boldIndex + boldMatch![0].length)
            }
          }
          
          return (
            <p key={`${blockIdx}-${paraIdx}`} className="my-2">
              {elements}
            </p>
          )
        })
      })}
    </div>
  )
}

// Answer checking logic
const checkAnswerMatch = (userInput: string, correctAnswer: string): boolean => {
  const gcd = (a: number, b: number): number => {
    a = Math.abs(a)
    b = Math.abs(b)
    while (b !== 0) {
      const temp = b
      b = a % b
      a = temp
    }
    return a
  }

  const simplifyFraction = (numerator: number, denominator: number): string => {
    if (denominator === 0) return 'invalid'
    const divisor = gcd(numerator, denominator)
    const simpNum = numerator / divisor
    const simpDenom = denominator / divisor
    if (simpDenom === 1) return simpNum.toString()
    return `${simpNum}/${simpDenom}`
  }

  const decimalToFraction = (decimal: number, tolerance: number = 0.0001): string => {
    if (Number.isInteger(decimal)) return decimal.toString()
    for (let d = 1; d <= 10000; d++) {
      const n = Math.round(decimal * d)
      if (Math.abs((n / d) - decimal) < tolerance) {
        return simplifyFraction(n, d)
      }
    }
    return decimal.toString()
  }

  const parseAnswer = (input: string): string => {
    const trimmed = input.trim()
    if (trimmed.includes('/')) {
      const parts = trimmed.split('/')
      if (parts.length !== 2) return 'invalid'
      const num = parseFloat(parts[0].trim())
      const denom = parseFloat(parts[1].trim())
      if (isNaN(num) || isNaN(denom)) return 'invalid'
      return simplifyFraction(num, denom)
    }
    const value = parseFloat(trimmed)
    if (isNaN(value)) return 'invalid'
    if (Number.isInteger(value)) return value.toString()
    return decimalToFraction(value)
  }

  const userParsed = parseAnswer(userInput)
  const correctParsed = parseAnswer(correctAnswer)
  
  if (userParsed === 'invalid' || correctParsed === 'invalid') return false
  return userParsed === correctParsed
}

export function MathCard({ problem, completed, onComplete }: MathCardProps) {
  const [answer, setAnswer] = useState('')
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [status, setStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle')
  const [submitting, setSubmitting] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [showSolution, setShowSolution] = useState(false)
  const [xpForfeited, setXpForfeited] = useState(false)
  const [showWarning, setShowWarning] = useState(false)

  const isMultipleChoice = problem.question_type === 'multiple_choice' && problem.options && problem.options.length > 0

  // Reset all state when problem is reset (completed changes from true to false)
  useEffect(() => {
    if (completed) {
      setStatus('correct')
    } else {
      // Reset all internal state when problem is reset
      setAnswer('')
      setSelectedOption(null)
      setStatus('idle')
      setShowHint(false)
      setShowSolution(false)
      setXpForfeited(false)
      setShowWarning(false)
    }
  }, [completed])

  const handleSubmit = async () => {
    // For multiple choice, check if an option is selected
    // For free text, check if answer is not empty
    if (isMultipleChoice) {
      if (selectedOption === null || completed) return
    } else {
      if (!answer.trim() || completed) return
    }

    setSubmitting(true)

    let isCorrect = false

    if (isMultipleChoice) {
      // Check if selected option matches correct_option_index
      isCorrect = selectedOption === problem.correct_option_index
    } else {
      // Use existing answer matching logic for free text
      isCorrect = checkAnswerMatch(answer, problem.answer)
    }

    if (isCorrect) {
      setStatus('correct')

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#26804a', '#2d9659', '#34ac68']
      })

      await onComplete()
    } else {
      setStatus('incorrect')
    }

    setSubmitting(false)
  }

  const handleShowSolution = () => {
    if (!showSolution && !xpForfeited && !completed) {
      setShowWarning(true)
    } else {
      setShowSolution(!showSolution)
    }
  }

  const handleConfirmSolution = () => {
    setXpForfeited(true)
    setShowSolution(true)
    setShowWarning(false)
  }

  return (
    <>
      <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Mathematics</h2>
          <div className="flex gap-2">
            <Badge variant="outline" className={difficultyColors[problem.difficulty]}>
              {problem.difficulty}
            </Badge>
            {completed && (
              <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Completed
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 text-zinc-400 mb-6">
          <Trophy className="w-4 h-4" />
          <span className={`text-sm font-medium ${xpForfeited ? 'text-zinc-600 line-through' : ''}`}>
            {xpForfeited ? '0 XP' : `${problem.xp} XP`}
          </span>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-white">Problem</h3>
          <div className="text-zinc-300">
            {renderLatex(problem.problem)}
          </div>
        </div>

        <div className="mb-6 p-4 bg-zinc-800/30 border border-zinc-700 rounded-lg">
          <h3 className="text-sm font-semibold mb-3 text-white">Your Answer</h3>

          {isMultipleChoice ? (
            // Multiple Choice UI
            <div className="space-y-2">
              {problem.options!.map((option, index) => {
                const isSelected = selectedOption === index
                const isCorrectOption = index === problem.correct_option_index
                const showCorrect = status === 'correct' || (status === 'incorrect' && isCorrectOption)

                return (
                  <button
                    key={index}
                    onClick={() => !completed && setSelectedOption(index)}
                    disabled={completed}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                      completed
                        ? isCorrectOption
                          ? 'bg-green-500/10 border-green-500/40 text-green-400'
                          : isSelected
                            ? 'bg-red-500/10 border-red-500/40 text-red-400'
                            : 'bg-zinc-900/50 border-zinc-700 text-zinc-500'
                        : isSelected
                          ? 'bg-phthalo-500/20 border-phthalo-500 text-white'
                          : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-800/50'
                    } disabled:cursor-not-allowed`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        completed
                          ? isCorrectOption
                            ? 'border-green-500 bg-green-500'
                            : isSelected
                              ? 'border-red-500 bg-red-500'
                              : 'border-zinc-600'
                          : isSelected
                            ? 'border-phthalo-500 bg-phthalo-500'
                            : 'border-zinc-600'
                      }`}>
                        {(isSelected || (completed && isCorrectOption)) && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                      <span className="text-sm">{option}</span>
                    </div>
                  </button>
                )
              })}

              <Button
                onClick={handleSubmit}
                disabled={selectedOption === null || submitting || completed}
                className="w-full mt-3 bg-gradient-to-r from-phthalo-600 to-phthalo-800 hover:from-phthalo-700 hover:to-phthalo-900 disabled:opacity-50"
              >
                {submitting ? 'Checking...' : 'Submit'}
              </Button>
            </div>
          ) : (
            // Free Text UI
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="Enter answer"
                disabled={completed}
                className="flex-1 px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-phthalo-500 disabled:opacity-50"
              />
              <Button
                onClick={handleSubmit}
                disabled={!answer.trim() || submitting || completed}
                className="bg-gradient-to-r from-phthalo-600 to-phthalo-800 hover:from-phthalo-700 hover:to-phthalo-900 disabled:opacity-50"
              >
                {submitting ? 'Checking...' : 'Submit'}
              </Button>
            </div>
          )}

          {status === 'correct' && (
            <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
              <div>
                <p className="font-semibold text-green-400">Correct!</p>
                <p className="text-sm text-zinc-400">
                  {xpForfeited ? 'No XP earned' : `You earned ${problem.xp} XP`}
                </p>
              </div>
            </div>
          )}

          {status === 'incorrect' && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="font-semibold text-red-400">Not quite right. Try again!</p>
            </div>
          )}
        </div>

        {problem.hint && (
          <div className="mb-4">
            <Button
              variant="outline"
              onClick={() => setShowHint(!showHint)}
              size="sm"
              className="bg-zinc-800/50 border-phthalo-500/20 text-phthalo-400 hover:bg-phthalo-500/10 hover:border-phthalo-500/40 hover:text-phthalo-300"
            >
              <Lightbulb className="w-4 h-4 mr-2" />
              {showHint ? 'Hide Hint' : 'Show Hint'}
            </Button>
            
            {showHint && (
              <div className="mt-3 p-4 bg-zinc-800/50 border border-zinc-700 rounded-lg">
                <div className="text-zinc-300 text-sm">
                  {renderLatex(problem.hint)}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="border-t border-zinc-800 pt-4">
          <Button
            onClick={handleShowSolution}
            variant="ghost"
            size="sm"
            className="text-zinc-400 hover:text-white hover:bg-zinc-800/50"
          >
            {showSolution ? 'Hide Solution' : 'Show Solution'}
          </Button>

          {showSolution && (
            <div className="mt-4 p-4 bg-gradient-to-br from-phthalo-900/20 to-zinc-900/20 border border-phthalo-500/20 rounded-lg">
              <h3 className="text-lg font-bold mb-3 text-phthalo-400">Solution</h3>
              <div className="text-zinc-300 text-sm">
                {renderLatex(problem.solution)}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Warning Modal */}
      {showWarning && (
        <>
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in duration-200"
            onClick={() => setShowWarning(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl pointer-events-auto animate-in zoom-in-95 duration-200">
              <div className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">View Solution?</h3>
                    <p className="text-zinc-400 text-sm">
                      Viewing the solution will forfeit all XP for this problem.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => setShowWarning(false)}
                    variant="outline"
                    className="flex-1 bg-zinc-800/50 border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleConfirmSolution}
                    className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white"
                  >
                    View Anyway
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}