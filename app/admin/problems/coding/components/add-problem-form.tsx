'use client'

import { useState, useEffect } from 'react'
import { Loader2, Plus, Trash2, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

interface Category {
  id: string
  name: string
  description: string
  type: 'math' | 'coding'
}

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
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  xp: number
  problem_number?: number
  language: string
  created_at: string
}

interface AddCodingProblemFormProps {
  onProblemAdded: () => void
  editProblem?: CodingProblem | null
  onCancelEdit?: () => void
}

const emptyTestCase: TestCase = {
  input: '',
  expected: '',
  hidden: false,
  description: ''
}

export function AddCodingProblemForm({ onProblemAdded, editProblem, onCancelEdit }: AddCodingProblemFormProps) {
  const isEditMode = !!editProblem
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)

  const [formData, setFormData] = useState({
    title: '',
    problem: '',
    hint: '',
    solution: '',
    starter_code: '',
    category: '',
    difficulty: 'beginner',
    xp: '10',
    problem_number: '',
    language: 'python'
  })

  const [testCases, setTestCases] = useState<TestCase[]>([{ ...emptyTestCase }])

  // Populate form when editing
  useEffect(() => {
    if (editProblem) {
      setFormData({
        title: editProblem.title || '',
        problem: editProblem.problem || '',
        hint: editProblem.hint || '',
        solution: editProblem.solution || '',
        starter_code: editProblem.starter_code || '',
        category: editProblem.category || '',
        difficulty: editProblem.difficulty || 'beginner',
        xp: String(editProblem.xp || 10),
        problem_number: editProblem.problem_number ? String(editProblem.problem_number) : '',
        language: editProblem.language || 'python'
      })
      // Convert test cases - stringify input/expected for editing
      const editTestCases = editProblem.test_cases?.map(tc => ({
        ...tc,
        input: typeof tc.input === 'string' ? tc.input : JSON.stringify(tc.input),
        expected: typeof tc.expected === 'string' ? tc.expected : JSON.stringify(tc.expected)
      })) || [{ ...emptyTestCase }]
      setTestCases(editTestCases)
    }
  }, [editProblem])

  // Load categories on mount
  useEffect(() => {
    async function loadCategories() {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('problem_categories')
          .select('*')
          .eq('type', 'coding')
          .order('name', { ascending: true })

        if (error) throw error
        setCategories(data || [])
      } catch (error) {
        console.error('Error loading categories:', error)
        toast.error('Failed to load categories')
      } finally {
        setLoadingCategories(false)
      }
    }

    loadCategories()
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleTestCaseChange = (index: number, field: keyof TestCase, value: any) => {
    const newTestCases = [...testCases]
    newTestCases[index] = { ...newTestCases[index], [field]: value }
    setTestCases(newTestCases)
  }

  const addTestCase = () => {
    setTestCases([...testCases, { ...emptyTestCase }])
  }

  const removeTestCase = (index: number) => {
    if (testCases.length <= 1) {
      toast.error('At least one test case is required')
      return
    }
    setTestCases(testCases.filter((_, i) => i !== index))
  }

  const parseJsonValue = (value: string): any => {
    const trimmed = value.trim()
    // Try to parse as JSON first
    try {
      return JSON.parse(trimmed)
    } catch {
      // If it fails, return as string
      return trimmed
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate test cases
    const validTestCases = testCases.filter(tc =>
      tc.description.trim() !== '' ||
      String(tc.input).trim() !== '' ||
      String(tc.expected).trim() !== ''
    )

    if (validTestCases.length === 0) {
      toast.error('Please add at least one test case')
      return
    }

    setIsSubmitting(true)

    try {
      // Parse test case values
      const parsedTestCases = validTestCases.map(tc => ({
        input: parseJsonValue(String(tc.input)),
        expected: parseJsonValue(String(tc.expected)),
        hidden: tc.hidden,
        description: tc.description,
        ...(tc.tolerance !== undefined && tc.tolerance !== null ? { tolerance: tc.tolerance } : {})
      }))

      const requestBody = {
        problemType: 'coding',
        ...formData,
        test_cases: parsedTestCases,
        xp: parseInt(formData.xp),
        problem_number: formData.problem_number ? parseInt(formData.problem_number) : null
      }

      // Use PUT for edit, POST for create
      const url = isEditMode
        ? `/api/admin/problems/${editProblem!.id}`
        : '/api/admin/problems'

      const res = await fetch(url, {
        method: isEditMode ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || `Failed to ${isEditMode ? 'update' : 'create'} problem`)
      }

      toast.success(`Problem ${isEditMode ? 'updated' : 'created'} successfully!`)

      // Reset form only if not editing
      if (!isEditMode) {
        setFormData({
          title: '',
          problem: '',
          hint: '',
          solution: '',
          starter_code: '',
          category: '',
          difficulty: 'beginner',
          xp: '10',
          problem_number: '',
          language: 'python'
        })
        setTestCases([{ ...emptyTestCase }])
      }

      onProblemAdded()

      if (isEditMode && onCancelEdit) {
        onCancelEdit()
      }

    } catch (error) {
      console.error('Error creating problem:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create problem')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="bg-zinc-900/50 border-zinc-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">
          {isEditMode ? 'Edit Coding Problem' : 'Add New Coding Problem'}
        </h2>
        {isEditMode && onCancelEdit && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancelEdit}
            className="bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white"
          >
            Cancel
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <div>
          <Label htmlFor="title" className="text-white mb-2 block">
            Title (Optional)
          </Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="e.g., Reverse String, Calculate Returns"
            className="bg-zinc-800 border-zinc-700 text-white"
          />
        </div>

        {/* Problem Statement */}
        <div>
          <Label htmlFor="problem" className="text-white mb-2 block">
            Problem Statement *
          </Label>
          <Textarea
            id="problem"
            required
            value={formData.problem}
            onChange={(e) => handleInputChange('problem', e.target.value)}
            placeholder="Describe the problem. Use \\n for line breaks and backticks for code."
            className="min-h-[120px] bg-zinc-800 border-zinc-700 text-white font-mono text-sm"
          />
        </div>

        {/* Starter Code */}
        <div>
          <Label htmlFor="starter_code" className="text-white mb-2 block">
            Starter Code *
          </Label>
          <Textarea
            id="starter_code"
            required
            value={formData.starter_code}
            onChange={(e) => handleInputChange('starter_code', e.target.value)}
            placeholder="def function_name(param):\n    # TODO: implement\n    return ______"
            className="min-h-[150px] bg-zinc-800 border-zinc-700 text-white font-mono text-sm"
          />
          <p className="text-xs text-zinc-500 mt-1">
            Use \\n for line breaks. Include TODO comments and placeholder returns.
          </p>
        </div>

        {/* Hint */}
        <div>
          <Label htmlFor="hint" className="text-white mb-2 block">
            Hint
          </Label>
          <Textarea
            id="hint"
            value={formData.hint}
            onChange={(e) => handleInputChange('hint', e.target.value)}
            placeholder="Enter a helpful hint for solving the problem"
            className="min-h-[80px] bg-zinc-800 border-zinc-700 text-white"
          />
        </div>

        {/* Solution */}
        <div>
          <Label htmlFor="solution" className="text-white mb-2 block">
            Solution
          </Label>
          <Textarea
            id="solution"
            value={formData.solution}
            onChange={(e) => handleInputChange('solution', e.target.value)}
            placeholder="```python\ndef function_name(param):\n    return result\n```\n\n**Explanation:**\n- Point 1\n- Point 2"
            className="min-h-[150px] bg-zinc-800 border-zinc-700 text-white font-mono text-sm"
          />
        </div>

        {/* Test Cases */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label className="text-white">Test Cases *</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addTestCase}
              className="border-zinc-700 bg-zinc-800 text-zinc-300 hover:text-blue-400"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Test
            </Button>
          </div>

          <div className="space-y-4">
            {testCases.map((tc, index) => (
              <div key={index} className="p-4 bg-zinc-800/50 border border-zinc-700 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-zinc-400">Test Case {index + 1}</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleTestCaseChange(index, 'hidden', !tc.hidden)}
                      className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${
                        tc.hidden
                          ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                          : 'bg-zinc-700 text-zinc-400 border border-zinc-600'
                      }`}
                    >
                      {tc.hidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      {tc.hidden ? 'Hidden' : 'Visible'}
                    </button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTestCase(index)}
                      className="text-zinc-400 hover:text-red-400 h-6 w-6 p-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-zinc-400 text-xs mb-1 block">Input (JSON or string)</Label>
                    <Input
                      value={String(tc.input)}
                      onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)}
                      placeholder='"hello" or [1, 2, 3]'
                      className="bg-zinc-700 border-zinc-600 text-white font-mono text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-zinc-400 text-xs mb-1 block">Expected Output</Label>
                    <Input
                      value={String(tc.expected)}
                      onChange={(e) => handleTestCaseChange(index, 'expected', e.target.value)}
                      placeholder='"olleh" or [3, 2, 1]'
                      className="bg-zinc-700 border-zinc-600 text-white font-mono text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  <div>
                    <Label className="text-zinc-400 text-xs mb-1 block">Description</Label>
                    <Input
                      value={tc.description}
                      onChange={(e) => handleTestCaseChange(index, 'description', e.target.value)}
                      placeholder="Basic test case"
                      className="bg-zinc-700 border-zinc-600 text-white text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-zinc-400 text-xs mb-1 block">Tolerance (for floats)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={tc.tolerance || ''}
                      onChange={(e) => handleTestCaseChange(index, 'tolerance', e.target.value ? parseFloat(e.target.value) : undefined)}
                      placeholder="0.1"
                      className="bg-zinc-700 border-zinc-600 text-white text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category, Difficulty, Language Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Category */}
          <div>
            <Label htmlFor="category" className="text-white mb-2 block">
              Category *
            </Label>
            {loadingCategories ? (
              <div className="flex items-center gap-2 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading...
              </div>
            ) : (
              <select
                id="category"
                required
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-4 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select category...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Difficulty */}
          <div>
            <Label htmlFor="difficulty" className="text-white mb-2 block">
              Difficulty *
            </Label>
            <select
              id="difficulty"
              required
              value={formData.difficulty}
              onChange={(e) => handleInputChange('difficulty', e.target.value)}
              className="w-full px-4 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          {/* Language */}
          <div>
            <Label htmlFor="language" className="text-white mb-2 block">
              Language
            </Label>
            <select
              id="language"
              value={formData.language}
              onChange={(e) => handleInputChange('language', e.target.value)}
              className="w-full px-4 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="python">Python</option>
            </select>
          </div>
        </div>

        {/* XP and Problem Number Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="xp" className="text-white mb-2 block">
              XP Reward *
            </Label>
            <Input
              id="xp"
              type="number"
              required
              min="1"
              value={formData.xp}
              onChange={(e) => handleInputChange('xp', e.target.value)}
              placeholder="e.g., 10, 20, 50"
              className="bg-zinc-800 border-zinc-700 text-white"
            />
          </div>

          <div>
            <Label htmlFor="problem_number" className="text-white mb-2 block">
              Problem Number (Optional)
            </Label>
            <Input
              id="problem_number"
              type="number"
              min="1"
              value={formData.problem_number}
              onChange={(e) => handleInputChange('problem_number', e.target.value)}
              placeholder="e.g., 1, 2, 3"
              className="bg-zinc-800 border-zinc-700 text-white"
            />
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {isEditMode ? 'Saving...' : 'Creating...'}
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              {isEditMode ? 'Save Changes' : 'Create Problem'}
            </>
          )}
        </Button>
      </form>
    </Card>
  )
}
