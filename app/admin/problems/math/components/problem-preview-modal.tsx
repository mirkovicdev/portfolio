'use client'

import { X, Trophy, Lightbulb, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { InlineMath, BlockMath } from 'react-katex'
import 'katex/dist/katex.min.css'

interface MathProblem {
  id: string
  title?: string
  problem: string
  hint: string
  solution: string
  answer: string
  category: string
  category_name?: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  xp: number
  question_type?: 'free_text' | 'multiple_choice'
  options?: string[]
  correct_option_index?: number
}

interface ProblemPreviewModalProps {
  problem: MathProblem | null
  onClose: () => void
}

const difficultyColors = {
  beginner: 'bg-green-500/10 text-green-400 border-green-500/20',
  intermediate: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  advanced: 'bg-red-500/10 text-red-400 border-red-500/20'
}

// Same renderLatex function used in math-card.tsx
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
          const elements: React.ReactNode[] = []
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

export function ProblemPreviewModal({ problem, onClose }: ProblemPreviewModalProps) {
  if (!problem) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-4 z-50 flex items-start justify-center overflow-y-auto py-8">
        <div className="w-full max-w-3xl bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl animate-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-zinc-800">
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Preview Mode</p>
              <h2 className="text-xl font-bold text-white">
                {problem.title || 'Math Problem'}
              </h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Content - Renders exactly like math-card.tsx */}
          <div className="p-6">
            {/* Badges */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex gap-2">
                <Badge variant="outline" className={difficultyColors[problem.difficulty]}>
                  {problem.difficulty}
                </Badge>
                <Badge variant="outline" className="bg-zinc-800/50 text-zinc-400 border-zinc-700">
                  {problem.category_name || problem.category}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-zinc-400">
                <Trophy className="w-4 h-4" />
                <span className="text-sm font-medium">{problem.xp} XP</span>
              </div>
            </div>

            {/* Problem Statement */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-white">Problem</h3>
              <div className="text-zinc-300">
                {renderLatex(problem.problem)}
              </div>
            </div>

            {/* Answer Input Preview */}
            <div className="mb-6 p-4 bg-zinc-800/30 border border-zinc-700 rounded-lg">
              <h3 className="text-sm font-semibold mb-3 text-white">Your Answer</h3>

              {problem.question_type === 'multiple_choice' && problem.options && problem.options.length > 0 ? (
                // Multiple Choice Preview
                <div className="space-y-2">
                  {problem.options.map((option, index) => {
                    const isCorrect = index === problem.correct_option_index
                    return (
                      <div
                        key={index}
                        className={`px-4 py-3 rounded-lg border ${
                          isCorrect
                            ? 'bg-green-500/10 border-green-500/40'
                            : 'bg-zinc-900/50 border-zinc-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            isCorrect ? 'border-green-500 bg-green-500' : 'border-zinc-600'
                          }`}>
                            {isCorrect && <div className="w-2 h-2 rounded-full bg-white" />}
                          </div>
                          <span className={`text-sm ${isCorrect ? 'text-green-400' : 'text-zinc-400'}`}>
                            {option}
                          </span>
                          {isCorrect && (
                            <span className="ml-auto text-xs text-green-400 font-medium">✓ Correct</span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                  <Button disabled className="w-full mt-3 bg-gradient-to-r from-phthalo-600 to-phthalo-800 opacity-50">
                    Submit
                  </Button>
                </div>
              ) : (
                // Free Text Preview
                <>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      placeholder="Enter answer"
                      disabled
                      className="flex-1 px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 opacity-50"
                    />
                    <Button disabled className="bg-gradient-to-r from-phthalo-600 to-phthalo-800 opacity-50">
                      Submit
                    </Button>
                  </div>
                  <p className="text-xs text-zinc-500 mt-2">
                    Expected answer: <code className="bg-zinc-800 px-2 py-0.5 rounded">{problem.answer}</code>
                  </p>
                </>
              )}
            </div>

            {/* Hint */}
            {problem.hint && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-4 h-4 text-phthalo-400" />
                  <h3 className="text-sm font-semibold text-white">Hint</h3>
                </div>
                <div className="p-4 bg-zinc-800/50 border border-zinc-700 rounded-lg">
                  <div className="text-zinc-300 text-sm">
                    {renderLatex(problem.hint)}
                  </div>
                </div>
              </div>
            )}

            {/* Solution */}
            <div className="border-t border-zinc-800 pt-4">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4 text-phthalo-400" />
                <h3 className="text-sm font-semibold text-white">Solution</h3>
              </div>
              <div className="p-4 bg-gradient-to-br from-phthalo-900/20 to-zinc-900/20 border border-phthalo-500/20 rounded-lg">
                <div className="text-zinc-300 text-sm">
                  {renderLatex(problem.solution)}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-zinc-800">
            <Button
              variant="outline"
              onClick={onClose}
              className="bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white"
            >
              Close Preview
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
