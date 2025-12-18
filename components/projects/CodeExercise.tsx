'use client';

import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { useProject } from '@/lib/projects/context';
import { usePyodide } from '@/lib/pyodide';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Loader2,
  Code2,
  Eye,
  EyeOff,
  Lightbulb,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TestCase } from '@/lib/projects/types';

interface TestResult {
  passed: boolean;
  description: string;
  input: any;
  expected: any;
  actual: any;
  error?: string;
}

interface CodeExerciseProps {
  id: string;
  starterCode: string;
  solution: string;
  tests: TestCase[];
  hint?: string;
  language?: 'python' | 'typescript' | 'javascript';
}

export function CodeExercise({
  id,
  starterCode,
  solution,
  tests,
  hint,
  language = 'python',
}: CodeExerciseProps) {
  const { isBlockCompleted, markBlockCompleted, getBlockAttempt } = useProject();
  const { pyodide, isReady: pyodideReady } = usePyodide();
  const isCompleted = isBlockCompleted(id);
  const savedCode = getBlockAttempt(id);

  const [code, setCode] = useState(savedCode || starterCode);
  const [running, setRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [allTestsPassed, setAllTestsPassed] = useState(isCompleted);
  const [showSolution, setShowSolution] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showSolutionDialog, setShowSolutionDialog] = useState(false);

  const runTests = async () => {
    if (!pyodide || allTestsPassed) return;

    setRunning(true);
    setTestResults([]);

    const results: TestResult[] = [];
    let allPassed = true;

    try {

      // Execute user code
      try {
        await pyodide.runPythonAsync(code);
      } catch (error: any) {
        setTestResults([
          {
            passed: false,
            description: 'Code execution failed',
            input: null,
            expected: null,
            actual: null,
            error: error.message || String(error),
          },
        ]);
        setRunning(false);
        return;
      }

      // Extract function name
      const functionMatch = code.match(/def\s+(\w+)\s*\(/);
      const functionName = functionMatch ? functionMatch[1] : null;

      if (!functionName) {
        setTestResults([
          {
            passed: false,
            description: 'No function found',
            input: null,
            expected: null,
            actual: null,
            error: 'No function definition found in code',
          },
        ]);
        setRunning(false);
        return;
      }

      // Run each test case
      for (const testCase of tests) {
        try {
          let testCode = `
import numpy as np
import pandas as pd
import json

def convert_to_json(val):
    if isinstance(val, (np.integer, np.floating)):
        return float(val)
    elif isinstance(val, np.ndarray):
        return val.tolist()
    elif isinstance(val, (list, tuple)):
        return [convert_to_json(v) for v in val]
    else:
        return val

`;

          // Handle test inputs
          if (Array.isArray(testCase.input)) {
            const args = testCase.input
              .map((inp, idx) => {
                if (typeof inp === 'string' && (inp.includes('np.') || inp.includes('pd.'))) {
                  return `arg_${idx} = ${inp}`;
                } else {
                  return `arg_${idx} = ${JSON.stringify(inp)}`;
                }
              })
              .join('\n');

            testCode += args + '\n';
            const argNames = testCase.input.map((_, idx) => `arg_${idx}`).join(', ');
            testCode += `result = ${functionName}(${argNames})\n`;
          } else if (typeof testCase.input === 'number' || typeof testCase.input === 'string') {
            testCode += `result = ${functionName}(${JSON.stringify(testCase.input)})\n`;
          } else {
            testCode += `result = ${functionName}(${JSON.stringify(testCase.input)})\n`;
          }

          testCode += `
converted_result = convert_to_json(result)
json.dumps(converted_result)
`;

          const resultJson = await pyodide.runPythonAsync(testCode);
          const result = JSON.parse(resultJson);

          // Recursive comparison function that handles nested arrays with tolerance
          const compareWithTolerance = (actual: any, expected: any, tolerance?: number): boolean => {
            // Both are numbers - compare with tolerance
            if (typeof actual === 'number' && typeof expected === 'number') {
              if (tolerance !== undefined) {
                return Math.abs(actual - expected) <= tolerance;
              }
              return actual === expected;
            }

            // Both are arrays - recursively compare each element
            if (Array.isArray(actual) && Array.isArray(expected)) {
              if (actual.length !== expected.length) return false;
              return actual.every((val, idx) => compareWithTolerance(val, expected[idx], tolerance));
            }

            // Both are objects - recursively compare each property
            if (typeof actual === 'object' && actual !== null &&
                typeof expected === 'object' && expected !== null &&
                !Array.isArray(actual) && !Array.isArray(expected)) {
              const actualKeys = Object.keys(actual);
              const expectedKeys = Object.keys(expected);
              if (actualKeys.length !== expectedKeys.length) return false;
              return expectedKeys.every(key => compareWithTolerance(actual[key], expected[key], tolerance));
            }

            // Fallback to strict equality
            return actual === expected;
          };

          const passed = compareWithTolerance(result, testCase.expected, testCase.tolerance);

          if (!passed) allPassed = false;

          results.push({
            passed,
            description: testCase.description || 'Test case',
            input: testCase.input,
            expected: testCase.expected,
            actual: result,
          });
        } catch (error: any) {
          allPassed = false;
          results.push({
            passed: false,
            description: testCase.description || 'Test case',
            input: testCase.input,
            expected: testCase.expected,
            actual: null,
            error: error.message || String(error),
          });
        }
      }

      setTestResults(results);

      if (allPassed) {
        setAllTestsPassed(true);

        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#26804a', '#2d9659', '#34ac68'],
        });

        markBlockCompleted(id, code);
      }
    } catch (error: any) {
      setTestResults([
        {
          passed: false,
          description: 'Unexpected error',
          input: null,
          expected: null,
          actual: null,
          error: error.message || 'An unexpected error occurred',
        },
      ]);
    } finally {
      setRunning(false);
    }
  };

  const resetCode = () => {
    setCode(starterCode);
    setTestResults([]);
    setAllTestsPassed(false);
    setShowSolution(false);
  };

  const handleRevealSolution = () => {
    setShowSolution(true);
    setShowSolutionDialog(false);
  };

  const loadSolution = () => {
    setCode(solution);
    setShowSolution(true);
  };

  return (
    <>
      <div
        className={`my-8 bg-white/5 backdrop-blur-sm border rounded-xl p-6 md:p-8 ${
          allTestsPassed ? 'border-green-500/30' : 'border-white/10'
        }`}
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <Code2 className="w-5 h-5 text-phthalo-400" />
          <span className="text-sm font-semibold text-phthalo-400 uppercase tracking-wide">
            Coding Exercise
          </span>
          {allTestsPassed && (
            <div className="ml-auto flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span className="text-sm font-semibold text-green-400">Completed</span>
            </div>
          )}
        </div>

        {/* Hint */}
        {hint && (
          <div className="mb-6">
            <Button
              onClick={() => setShowHint(!showHint)}
              variant="ghost"
              size="sm"
              className="text-phthalo-400 hover:text-phthalo-300 hover:bg-phthalo-500/10"
            >
              <Lightbulb className="w-4 h-4 mr-2" />
              {showHint ? 'Hide Hint' : 'Show Hint'}
            </Button>
            {showHint && (
              <div className="mt-3 p-4 bg-phthalo-500/10 border border-phthalo-500/20 rounded-lg text-sm text-zinc-300">
                {hint}
              </div>
            )}
          </div>
        )}

        {/* Monaco Editor */}
        <div className="border border-zinc-800 rounded-lg overflow-hidden mb-4">
          <Editor
            height="400px"
            defaultLanguage={language}
            theme="vs-dark"
            value={code}
            onChange={(value) => setCode(value || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              roundedSelection: false,
              scrollBeyondLastLine: false,
              readOnly: allTestsPassed,
              padding: { top: 16, bottom: 16 },
              scrollbar: {
                alwaysConsumeMouseWheel: false,
              },
            }}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-6">
          <Button
            onClick={runTests}
            disabled={running || !pyodideReady || allTestsPassed}
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
            disabled={allTestsPassed}
            className="bg-zinc-900/50 border-phthalo-500/30 text-phthalo-400 hover:bg-phthalo-500/10 hover:border-phthalo-500/50 disabled:opacity-30"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>

          {!showSolution ? (
            <Button
              onClick={() => setShowSolutionDialog(true)}
              variant="outline"
              className="bg-zinc-900/50 border-phthalo-500/30 text-phthalo-400 hover:bg-phthalo-500/10 hover:border-phthalo-500/50"
            >
              <Eye className="w-4 h-4 mr-2" />
              Reveal Solution
            </Button>
          ) : (
            <Button
              onClick={() => setShowSolution(false)}
              variant="outline"
              className="bg-zinc-900/50 border-phthalo-500/30 text-phthalo-400 hover:bg-phthalo-500/10 hover:border-phthalo-500/50"
            >
              <EyeOff className="w-4 h-4 mr-2" />
              Hide Solution
            </Button>
          )}
        </div>

        {/* Success Message */}
        {allTestsPassed && (
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-3 mb-6">
            <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
            <div>
              <p className="font-semibold text-green-400">All tests passed!</p>
              <p className="text-sm text-zinc-400">Great job! Block marked as complete.</p>
            </div>
          </div>
        )}

        {/* Solution */}
        {showSolution && (
          <div className="mb-6 p-6 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-5 h-5 text-phthalo-400" />
              <span className="font-semibold text-white">Solution</span>
            </div>
            <pre className="overflow-x-auto">
              <code className="text-sm text-zinc-300 font-mono leading-relaxed">{solution}</code>
            </pre>
            <Button
              onClick={loadSolution}
              variant="ghost"
              size="sm"
              className="mt-4 text-phthalo-400 hover:text-phthalo-300"
            >
              Load solution into editor
            </Button>
          </div>
        )}

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-zinc-300 mb-3">Test Results:</h4>
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
                    <p
                      className={`font-semibold ${
                        result.passed ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {result.passed ? 'Passed' : 'Failed'}: {result.description}
                    </p>

                    {!result.passed && (
                      <div className="mt-2 text-sm text-zinc-400 space-y-1">
                        {result.error ? (
                          <p className="text-red-400">Error: {result.error}</p>
                        ) : (
                          <>
                            <p>
                              Expected:{' '}
                              <code className="text-zinc-300">
                                {JSON.stringify(result.expected)}
                              </code>
                            </p>
                            <p>
                              Got:{' '}
                              <code className="text-zinc-300">{JSON.stringify(result.actual)}</code>
                            </p>
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

      {/* Confirmation Dialog */}
      <AlertDialog open={showSolutionDialog} onOpenChange={setShowSolutionDialog}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Reveal Solution?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Viewing the solution code will show you the answer. Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevealSolution}
              className="bg-gradient-to-r from-phthalo-600 to-phthalo-800 hover:from-phthalo-700 hover:to-phthalo-900"
            >
              Reveal Solution
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
