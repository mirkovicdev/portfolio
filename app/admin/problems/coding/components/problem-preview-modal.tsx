'use client'

import { useState } from 'react'
import { X, Eye, EyeOff, Code, ChevronDown, ChevronUp, FlaskConical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CodeEditor } from '@/app/quantframe/practice/coding/components/code-editor'
import { PyodideProvider } from '@/lib/pyodide/PyodideProvider'

interface TestCase {
  input: any
  expected: any
  hidden: boolean
  description: string
  tolerance?: number
}

interface CodingProblem {
  id: string
  title?: string
  problem: string
  hint: string
  solution: string
  starter_code: string
  test_cases: TestCase[]
  category: string
  category_name?: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  xp: number
  problem_number?: number
  language: string
  created_at: string
}

interface CodingProblemPreviewModalProps {
  problem: CodingProblem | null
  onClose: () => void
}

const difficultyColors = {
  beginner: 'bg-green-500/10 text-green-400 border-green-500/20',
  intermediate: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  advanced: 'bg-red-500/10 text-red-400 border-red-500/20'
}

export function CodingProblemPreviewModal({ problem, onClose }: CodingProblemPreviewModalProps) {
  const [showDetails, setShowDetails] = useState(false)

  if (!problem) return null

  const formatValue = (value: any): string => {
    if (typeof value === 'string') return `"${value}"`
    if (Array.isArray(value)) return JSON.stringify(value)
    if (typeof value === 'object') return JSON.stringify(value)
    return String(value)
  }

  // No-op success handler - testing mode doesn't save progress
  const handleTestSuccess = () => {
    console.log('[Admin Test Mode] Problem completed - not saving to database')
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-5xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
              <Code className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {problem.title || 'Untitled Problem'}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className={`${difficultyColors[problem.difficulty]} text-xs`}>
                  {problem.difficulty}
                </Badge>
                <span className="text-xs text-zinc-500">{problem.xp} XP</span>
                {problem.problem_number && (
                  <span className="text-xs text-zinc-500">#{problem.problem_number}</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Testing Mode Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-500/10 border border-orange-500/30 rounded-full">
              <FlaskConical className="w-4 h-4 text-orange-400" />
              <span className="text-xs font-medium text-orange-400">Testing Mode</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Problem Statement */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-2">
              Problem Statement
            </h3>
            <div className="p-4 bg-zinc-800/50 rounded-lg">
              <p className="text-white whitespace-pre-wrap text-sm">
                {problem.problem.replace(/\\n/g, '\n')}
              </p>
            </div>
          </div>

          {/* Interactive Code Editor */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-2">
              Test Your Solution
            </h3>
            <PyodideProvider>
              <CodeEditor
                starterCode={problem.starter_code}
                testCases={problem.test_cases}
                onSuccess={handleTestSuccess}
                disabled={false}
                xpValue={problem.xp}
                xpForfeited={true}
                isCompleted={false}
              />
            </PyodideProvider>
          </div>

          {/* Collapsible Details Section */}
          <div className="border border-zinc-800 rounded-lg overflow-hidden">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full flex items-center justify-between p-4 bg-zinc-800/30 hover:bg-zinc-800/50 transition-colors"
            >
              <span className="text-sm font-semibold text-zinc-400 uppercase tracking-wide">
                Problem Details (Hint, Solution, Test Cases)
              </span>
              {showDetails ? (
                <ChevronUp className="w-5 h-5 text-zinc-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-zinc-400" />
              )}
            </button>

            {showDetails && (
              <div className="p-4 space-y-6 border-t border-zinc-800">
                {/* Test Cases */}
                <div>
                  <h4 className="text-sm font-medium text-zinc-300 mb-2">
                    Test Cases ({problem.test_cases?.length || 0})
                  </h4>
                  <div className="space-y-3">
                    {problem.test_cases?.map((tc, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border ${
                          tc.hidden
                            ? 'bg-orange-500/5 border-orange-500/20'
                            : 'bg-zinc-800/50 border-zinc-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-zinc-300">
                            Test {index + 1}: {tc.description || 'No description'}
                          </span>
                          <div className="flex items-center gap-2">
                            {tc.tolerance && (
                              <span className="text-xs text-zinc-500">
                                tolerance: {tc.tolerance}
                              </span>
                            )}
                            {tc.hidden ? (
                              <span className="flex items-center gap-1 text-xs text-orange-400">
                                <EyeOff className="w-3 h-3" /> Hidden
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-xs text-zinc-400">
                                <Eye className="w-3 h-3" /> Visible
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-zinc-500 text-xs">Input:</span>
                            <code className="block mt-1 p-2 bg-zinc-900 rounded text-blue-400 font-mono text-xs">
                              {formatValue(tc.input)}
                            </code>
                          </div>
                          <div>
                            <span className="text-zinc-500 text-xs">Expected:</span>
                            <code className="block mt-1 p-2 bg-zinc-900 rounded text-green-400 font-mono text-xs">
                              {formatValue(tc.expected)}
                            </code>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hint */}
                {problem.hint && (
                  <div>
                    <h4 className="text-sm font-medium text-zinc-300 mb-2">Hint</h4>
                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <p className="text-yellow-200 text-sm whitespace-pre-wrap">
                        {problem.hint.replace(/\\n/g, '\n')}
                      </p>
                    </div>
                  </div>
                )}

                {/* Solution */}
                {problem.solution && (
                  <div>
                    <h4 className="text-sm font-medium text-zinc-300 mb-2">Solution</h4>
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <pre className="text-green-200 text-sm font-mono whitespace-pre-wrap overflow-x-auto">
                        {problem.solution.replace(/\\n/g, '\n')}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Metadata */}
                <div className="pt-4 border-t border-zinc-800">
                  <div className="flex flex-wrap gap-4 text-xs text-zinc-500">
                    <span>Category: <span className="text-zinc-400">{problem.category_name || problem.category}</span></span>
                    <span>Language: <span className="text-zinc-400">{problem.language}</span></span>
                    <span>Created: <span className="text-zinc-400">{new Date(problem.created_at).toLocaleString()}</span></span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 flex justify-end">
          <Button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
