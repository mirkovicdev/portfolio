// app/quantframe/practice/coding/components/code-editor.tsx
'use client'

import { useEffect, useState } from 'react'
import Editor from '@monaco-editor/react'
import { usePyodide } from '@/lib/pyodide'
import { Button } from '@/components/ui/button'
import { Play, RotateCcw, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import confetti from 'canvas-confetti'

interface TestCase {
  input: any
  expected: any
  hidden: boolean
  description?: string
  tolerance?: number
}

interface TestResult {
  passed: boolean
  description: string
  input: any
  expected: any
  actual: any
  error?: string
}

interface CodeEditorProps {
  starterCode: string
  testCases: TestCase[]
  onSuccess: () => void
  disabled: boolean
  xpValue: number
  xpForfeited: boolean
  isCompleted?: boolean
}

// Helper to process text with proper newlines and code blocks
const formatText = (text: string) => {
  if (!text) return ''

  // Replace literal \n with actual newlines
  return text.replace(/\\n/g, '\n')
}

export function CodeEditor({ starterCode, testCases, onSuccess, disabled, xpValue, xpForfeited, isCompleted }: CodeEditorProps) {
  const { pyodide, isReady: pyodideReady } = usePyodide()
  const [code, setCode] = useState(formatText(starterCode))
  const [running, setRunning] = useState(false)
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [allTestsPassed, setAllTestsPassed] = useState(false)

  // Reset state when problem is reset (isCompleted changes from true to false)
  useEffect(() => {
    if (isCompleted === false) {
      setCode(formatText(starterCode))
      setTestResults([])
      setAllTestsPassed(false)
    } else if (isCompleted === true) {
      setAllTestsPassed(true)
    }
  }, [isCompleted, starterCode])

  const runTests = async () => {
    if (!pyodide || disabled) return

    setRunning(true)
    setTestResults([])

    const results: TestResult[] = []
    let allPassed = true

    try {
      console.log('🔍 Executing user code...')

      try {
        // Pre-import common modules and typing utilities
        await pyodide.runPythonAsync(`
from typing import List, Dict, Tuple, Optional, Any, Union, Set
import numpy as np
import pandas as pd
`)
        // Execute user code
        await pyodide.runPythonAsync(code)
      } catch (error: any) {
        // Syntax or execution error in user code - catch silently
        const errorMessage = error.message || String(error)
        setTestResults([{
          passed: false,
          description: 'Code execution failed',
          input: null,
          expected: null,
          actual: null,
          error: errorMessage
        }])
        return // Exit early
      }
      
      // Extract the function name from the code (user's defined function)
      const functionMatch = code.match(/def\s+(\w+)\s*\(/)
      const functionName = functionMatch ? functionMatch[1] : null
      
      console.log('📝 Found function:', functionName)
      
      if (!functionName) {
        setTestResults([{
          passed: false,
          description: 'No function found',
          input: null,
          expected: null,
          actual: null,
          error: 'No function definition found in code'
        }])
        setRunning(false)
        return
      }
      
      // Run each test case
      for (const testCase of testCases) {
        console.log('🧪 Running test:', testCase.description)
        console.log('   Input:', testCase.input)
        console.log('   Expected:', testCase.expected)
        
        try {
          let result: any
          const func = pyodide.globals.get(functionName)
          
          if (!func) {
            throw new Error(`Function ${functionName} not found`)
          }
          
          // Parse input if it's a JSON string
          let parsedInput = testCase.input
          if (typeof testCase.input === 'string') {
            try {
              parsedInput = JSON.parse(testCase.input)
            } catch {
              // Not JSON, use as-is (e.g. plain string like "hello")
              parsedInput = testCase.input
            }
          }
          
          // Handle different input types
          if (typeof parsedInput === 'object' && !Array.isArray(parsedInput) && parsedInput !== null) {
            // Object with named parameters: {a: [...], b: [...]}
            const args = Object.values(parsedInput)
            console.log('   Calling with args:', args)
            result = func(...args)
          } else if (Array.isArray(parsedInput)) {
            // Direct array input
            console.log('   Calling with array:', parsedInput)
            result = func(parsedInput)
          } else {
            // Single primitive value (string, number, etc)
            console.log('   Calling with primitive:', parsedInput)
            result = func(parsedInput)
          }
          
          console.log('   Raw result:', result)
          
          // For NumPy/scalar results, convert via Python first
          // Create a temporary variable in Python scope with the result
          pyodide.globals.set('_test_result', result)
          
          // Check if it's a numpy type and convert to native Python
          result = await pyodide.runPythonAsync(`
import numpy as np

def convert_result(val):
    if isinstance(val, (np.integer, np.floating)):
        return float(val)
    elif isinstance(val, np.ndarray):
        return val.tolist()
    else:
        return val

convert_result(_test_result)
`)
          
          console.log('   Converted result:', result)
          console.log('   Final result:', result, typeof result)
          console.log('   Expected:', testCase.expected, typeof testCase.expected)
          
          // Compare with expected (with tolerance for floats)
          let passed = false
          
          if (testCase.tolerance !== undefined) {
            // Numeric comparison with tolerance
            if (typeof testCase.expected === 'number' && typeof result === 'number') {
              passed = Math.abs(result - testCase.expected) <= testCase.tolerance
            } else if (Array.isArray(testCase.expected) && Array.isArray(result)) {
              // Array comparison with tolerance
              if (result.length === testCase.expected.length) {
                passed = result.every((val: any, idx: number) => {
                  const exp = testCase.expected[idx]
                  if (val === null && exp === null) return true
                  if (typeof exp === 'number' && typeof val === 'number') {
                    return Math.abs(val - exp) <= testCase.tolerance!
                  }
                  return val === exp
                })
              }
            }
          } else {
            // Exact comparison
            if (Array.isArray(testCase.expected) && Array.isArray(result)) {
              passed = result.length === testCase.expected.length &&
                       result.every((val: any, idx: number) => val === testCase.expected[idx])
            } else {
              passed = result === testCase.expected
            }
          }
          
          console.log('   Passed?', passed)
          
          if (!passed) allPassed = false
          
          results.push({
            passed,
            description: testCase.description || 'Test case',
            input: testCase.input,
            expected: testCase.expected,
            actual: result
          })
          
        } catch (error: any) {
          console.error('❌ Test error:', error)
          allPassed = false
          results.push({
            passed: false,
            description: testCase.description || 'Test case',
            input: testCase.input,
            expected: testCase.expected,
            actual: null,
            error: error.message
          })
        }
      }
      
      setTestResults(results)
      
      // If all visible tests passed, trigger success
      if (allPassed) {
        console.log('✅ All tests passed!')
        setAllTestsPassed(true)
        
        // Confetti!
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#26804a', '#2d9659', '#34ac68']
        })
        
        onSuccess()
      }
      
    } catch (error: any) {
      // Catch any unexpected errors to prevent Next.js error overlay
      console.log('⚠️ Unexpected error:', error.message)
      setTestResults([{
        passed: false,
        description: 'Unexpected error',
        input: null,
        expected: null,
        actual: null,
        error: error.message || 'An unexpected error occurred'
      }])
    } finally {
      setRunning(false)
    }
  }

  const resetCode = () => {
    setCode(formatText(starterCode))
    setTestResults([])
    setAllTestsPassed(false)
  }

  return (
    <div className="space-y-4">
      {/* Editor */}
      <div className="border border-zinc-800 rounded-lg overflow-hidden">
        <Editor
          height="400px"
          defaultLanguage="python"
          theme="vs-dark"
          value={code}
          onChange={(value) => setCode(value || '')}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            readOnly: disabled,
            padding: { top: 16, bottom: 16 },
            scrollbar: {
              alwaysConsumeMouseWheel: false // Allow page scroll when hovering editor
            }
          }}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={runTests}
          disabled={running || !pyodideReady || disabled || allTestsPassed}
          className="flex-1 bg-gradient-to-r from-phthalo-600 to-phthalo-800 hover:from-phthalo-700 hover:to-phthalo-900 disabled:opacity-50"
        >
          {running ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Running Tests...
            </>
          ) : !pyodideReady ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Loading Python...
            </>
          ) : allTestsPassed ? (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              All Tests Passed!
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Run Tests
            </>
          )}
        </Button>
        
        <Button
          onClick={resetCode}
          variant="outline"
          disabled={disabled}
          className="bg-zinc-800/50 border-phthalo-500/20 text-phthalo-400 hover:bg-phthalo-500/10 hover:border-phthalo-500/40 hover:text-phthalo-300"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>

      {/* Success Card (like math page) */}
      {allTestsPassed && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-3 mb-4">
          <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
          <div>
            <p className="font-semibold text-green-400">All tests passed!</p>
            <p className="text-sm text-zinc-400">
              {xpForfeited ? 'No XP earned (solution was viewed)' : `Great job! You earned ${xpValue} XP.`}
            </p>
          </div>
        </div>
      )}

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-zinc-300">Test Results:</h4>
          {testResults.map((result, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-lg border ${
                result.passed
                  ? 'bg-green-500/10 border-green-500/20'
                  : 'bg-red-500/10 border-red-500/20'
              }`}
            >
              <div className="flex items-start gap-3">
                {result.passed ? (
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                )}
                
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold ${result.passed ? 'text-green-400' : 'text-red-400'}`}>
                    {result.passed ? 'Passed' : 'Failed'}: {result.description}
                  </p>
                  
                  {!result.passed && (
                    <div className="mt-2 text-sm text-zinc-400 space-y-1">
                      {result.error ? (
                        <p className="text-red-400">Error: {result.error}</p>
                      ) : (
                        <>
                          <p>Expected: <code className="text-zinc-300">{JSON.stringify(result.expected)}</code></p>
                          <p>Got: <code className="text-zinc-300">{JSON.stringify(result.actual)}</code></p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}