'use client'

import { useState, useEffect } from 'react'
import { Loader2, Wand2, Plus, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { LatexPreview } from '../../components/latex-preview'

interface Category {
  id: string
  name: string
  description: string
  type: 'math' | 'coding'
}

interface MathProblem {
  id: string
  title?: string
  problem: string
  hint: string
  solution: string
  answer: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  xp: number
  question_type?: 'free_text' | 'multiple_choice'
  options?: string[]
  correct_option_index?: number
}

interface AddProblemFormProps {
  onProblemAdded: () => void
  editProblem?: MathProblem | null
  onCancelEdit?: () => void
}

export function AddProblemForm({ onProblemAdded, editProblem, onCancelEdit }: AddProblemFormProps) {
  const isEditMode = !!editProblem
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFormattingProblem, setIsFormattingProblem] = useState(false)
  const [isFormattingHint, setIsFormattingHint] = useState(false)
  const [isFormattingSolution, setIsFormattingSolution] = useState(false)
  const [isFormattingOptions, setIsFormattingOptions] = useState<boolean[]>([false, false, false, false])
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [checkingDuplicate, setCheckingDuplicate] = useState(false)
  const [duplicateFound, setDuplicateFound] = useState(false)

  // Question type state
  const [questionType, setQuestionType] = useState<'free_text' | 'multiple_choice'>('free_text')
  const [options, setOptions] = useState(['', '', '', ''])
  const [correctOptionIndex, setCorrectOptionIndex] = useState<number>(0)

  const [formData, setFormData] = useState({
    title: '',
    problem: '',
    hint: '',
    solution: '',
    answer: '',
    category: '',
    difficulty: 'beginner',
    xp: '10',
    lesson_id: ''
  })

  // Populate form when editing
  useEffect(() => {
    if (editProblem) {
      setFormData({
        title: editProblem.title || '',
        problem: editProblem.problem || '',
        hint: editProblem.hint || '',
        solution: editProblem.solution || '',
        answer: editProblem.answer || '',
        category: editProblem.category || '',
        difficulty: editProblem.difficulty || 'beginner',
        xp: String(editProblem.xp || 10),
        lesson_id: ''
      })
      setQuestionType(editProblem.question_type || 'free_text')
      if (editProblem.question_type === 'multiple_choice' && editProblem.options) {
        // Pad options array to always have 4 slots
        const paddedOptions = [...editProblem.options]
        while (paddedOptions.length < 4) {
          paddedOptions.push('')
        }
        setOptions(paddedOptions)
        setCorrectOptionIndex(editProblem.correct_option_index ?? 0)
      } else {
        setOptions(['', '', '', ''])
        setCorrectOptionIndex(0)
      }
      setDuplicateFound(false)
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
          .eq('type', 'math')
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

  // Check for duplicate title (debounced)
  useEffect(() => {
    if (!formData.title.trim()) {
      setDuplicateFound(false)
      return
    }

    const checkDuplicate = async () => {
      setCheckingDuplicate(true)
      try {
        const supabase = createClient()
        const normalizedTitle = formData.title.toLowerCase().replace(/\s+/g, '')

        const { data: problems, error } = await supabase
          .from('math_problems')
          .select('id, title')

        if (error) throw error

        // When editing, exclude the current problem from duplicate check
        const isDuplicate = problems?.some(p => {
          const isSameTitle = p.title?.toLowerCase().replace(/\s+/g, '') === normalizedTitle
          const isSameProblem = isEditMode && p.id === editProblem?.id
          return isSameTitle && !isSameProblem
        }) || false

        setDuplicateFound(isDuplicate)
      } catch (error) {
        console.error('Error checking for duplicate:', error)
      } finally {
        setCheckingDuplicate(false)
      }
    }

    const timeoutId = setTimeout(checkDuplicate, 500)
    return () => clearTimeout(timeoutId)
  }, [formData.title, isEditMode, editProblem?.id])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFormatText = async (field: 'problem' | 'hint' | 'solution') => {
    const text = formData[field]

    if (!text) {
      toast.error('Please enter some text before formatting')
      return
    }

    const setLoading = field === 'problem' ? setIsFormattingProblem : field === 'hint' ? setIsFormattingHint : setIsFormattingSolution
    setLoading(true)

    try {
      const res = await fetch('/api/admin/format-math', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to format text')
      }

      const result = await res.json()
      handleInputChange(field, result.formattedText)
      const fieldName = field === 'problem' ? 'Problem' : field === 'hint' ? 'Hint' : 'Solution'
      toast.success(`${fieldName} formatted successfully!`)

    } catch (error) {
      console.error('Error formatting text:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to format text')
    } finally {
      setLoading(false)
    }
  }

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  const handleFormatOption = async (index: number) => {
    const text = options[index]

    if (!text) {
      toast.error('Please enter some text before formatting')
      return
    }

    const newFormatting = [...isFormattingOptions]
    newFormatting[index] = true
    setIsFormattingOptions(newFormatting)

    try {
      const res = await fetch('/api/admin/format-math', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to format text')
      }

      const result = await res.json()
      handleOptionChange(index, result.formattedText)
      toast.success(`Option ${index + 1} formatted!`)

    } catch (error) {
      console.error('Error formatting option:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to format option')
    } finally {
      const resetFormatting = [...isFormattingOptions]
      resetFormatting[index] = false
      setIsFormattingOptions(resetFormatting)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (duplicateFound) {
      toast.error('A problem with this title already exists.')
      return
    }

    // Validate multiple choice options
    if (questionType === 'multiple_choice') {
      const filledOptions = options.filter(opt => opt.trim() !== '')
      if (filledOptions.length < 2) {
        toast.error('Please provide at least 2 options for multiple choice')
        return
      }
      if (!options[correctOptionIndex]?.trim()) {
        toast.error('The selected correct option cannot be empty')
        return
      }
    }

    setIsSubmitting(true)

    try {
      // Build request body based on question type
      const requestBody: Record<string, any> = {
        problemType: 'math',
        ...formData,
        question_type: questionType
      }

      if (questionType === 'multiple_choice') {
        // Filter out empty options and adjust correct index if needed
        const filledOptions = options.filter(opt => opt.trim() !== '')
        const originalCorrectOption = options[correctOptionIndex]
        const newCorrectIndex = filledOptions.indexOf(originalCorrectOption)

        requestBody.options = filledOptions
        requestBody.correct_option_index = newCorrectIndex
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
          answer: '',
          category: '',
          difficulty: 'beginner',
          xp: '10',
          lesson_id: ''
        })
        setQuestionType('free_text')
        setOptions(['', '', '', ''])
        setCorrectOptionIndex(0)
        setDuplicateFound(false)
      }

      // Notify parent to refresh list
      onProblemAdded()

      // If editing, go back to list view
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
          {isEditMode ? 'Edit Math Problem' : 'Add New Math Problem'}
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
          <div className="relative">
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="e.g., Polynomial Limit, Derivative at a Point"
              className={`bg-zinc-800 border-zinc-700 text-white ${
                duplicateFound ? 'border-red-500 focus:ring-red-500' : ''
              }`}
            />
            {checkingDuplicate && formData.title.trim() && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="w-4 h-4 text-zinc-400 animate-spin" />
              </div>
            )}
          </div>
          {duplicateFound && (
            <div className="flex items-center gap-2 mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded-md">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-xs text-red-400">
                A problem with this title already exists.
              </p>
            </div>
          )}
        </div>

        {/* Problem Statement */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="problem" className="text-white">
              Problem Statement *
            </Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleFormatText('problem')}
              disabled={isFormattingProblem || !formData.problem}
              className="border-zinc-700 bg-zinc-800 text-zinc-300 hover:text-phthalo-400 hover:border-zinc-600 hover:bg-zinc-700"
            >
              {isFormattingProblem ? (
                <>
                  <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                  Formatting...
                </>
              ) : (
                <>
                  <Wand2 className="w-3 h-3 mr-2" />
                  Format
                </>
              )}
            </Button>
          </div>
          <Textarea
            id="problem"
            required
            value={formData.problem}
            onChange={(e) => handleInputChange('problem', e.target.value)}
            placeholder="Enter the problem description. Use $...$ for inline math and $$...$$ for block math."
            className="min-h-[120px] bg-zinc-800 border-zinc-700 text-white"
          />
          <LatexPreview text={formData.problem} />
        </div>

        {/* Hint */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="hint" className="text-white">
              Hint *
            </Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleFormatText('hint')}
              disabled={isFormattingHint || !formData.hint}
              className="border-zinc-700 bg-zinc-800 text-zinc-300 hover:text-phthalo-400 hover:border-zinc-600 hover:bg-zinc-700"
            >
              {isFormattingHint ? (
                <>
                  <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                  Formatting...
                </>
              ) : (
                <>
                  <Wand2 className="w-3 h-3 mr-2" />
                  Format
                </>
              )}
            </Button>
          </div>
          <Textarea
            id="hint"
            required
            value={formData.hint}
            onChange={(e) => handleInputChange('hint', e.target.value)}
            placeholder="Enter a helpful hint"
            className="min-h-[80px] bg-zinc-800 border-zinc-700 text-white"
          />
          <LatexPreview text={formData.hint} />
        </div>

        {/* Solution */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="solution" className="text-white">
              Solution *
            </Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleFormatText('solution')}
              disabled={isFormattingSolution || !formData.solution}
              className="border-zinc-700 bg-zinc-800 text-zinc-300 hover:text-phthalo-400 hover:border-zinc-600 hover:bg-zinc-700"
            >
              {isFormattingSolution ? (
                <>
                  <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                  Formatting...
                </>
              ) : (
                <>
                  <Wand2 className="w-3 h-3 mr-2" />
                  Format
                </>
              )}
            </Button>
          </div>
          <Textarea
            id="solution"
            required
            value={formData.solution}
            onChange={(e) => handleInputChange('solution', e.target.value)}
            placeholder="Enter the complete solution with steps"
            className="min-h-[120px] bg-zinc-800 border-zinc-700 text-white"
          />
          <LatexPreview text={formData.solution} />
        </div>

        {/* Question Type Toggle */}
        <div>
          <Label className="text-white mb-2 block">Question Type *</Label>
          <div className="flex rounded-lg overflow-hidden border border-zinc-700 w-fit">
            <button
              type="button"
              onClick={() => setQuestionType('free_text')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                questionType === 'free_text'
                  ? 'bg-phthalo-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
              }`}
            >
              Free Text
            </button>
            <button
              type="button"
              onClick={() => setQuestionType('multiple_choice')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                questionType === 'multiple_choice'
                  ? 'bg-blue-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
              }`}
            >
              Multiple Choice
            </button>
          </div>
        </div>

        {/* Answer (Free Text) or Options (Multiple Choice) */}
        {questionType === 'free_text' ? (
          <div>
            <Label htmlFor="answer" className="text-white mb-2 block">
              Answer *
            </Label>
            <Input
              id="answer"
              required
              value={formData.answer}
              onChange={(e) => handleInputChange('answer', e.target.value)}
              placeholder="e.g., 42, x^2 + 3x, does not exist"
              className="bg-zinc-800 border-zinc-700 text-white"
            />
          </div>
        ) : (
          <div className="space-y-4">
            <Label className="text-white block">
              Answer Options * <span className="text-zinc-500 text-xs font-normal">(Select the correct one)</span>
            </Label>
            <div className="space-y-3">
              {options.map((option, index) => (
                <div key={index} className="flex items-start gap-3">
                  {/* Radio button to select correct answer */}
                  <button
                    type="button"
                    onClick={() => setCorrectOptionIndex(index)}
                    className={`mt-2 w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      correctOptionIndex === index
                        ? 'border-green-500 bg-green-500'
                        : 'border-zinc-600 hover:border-zinc-500'
                    }`}
                  >
                    {correctOptionIndex === index && (
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    )}
                  </button>

                  {/* Option input */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Input
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        placeholder={`Option ${index + 1}${index < 2 ? ' *' : ' (optional)'}`}
                        className={`bg-zinc-800 border-zinc-700 text-white ${
                          correctOptionIndex === index ? 'border-green-500/50' : ''
                        }`}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleFormatOption(index)}
                        disabled={isFormattingOptions[index] || !option}
                        className="border-zinc-700 bg-zinc-800 text-zinc-300 hover:text-phthalo-400 hover:border-zinc-600 hover:bg-zinc-700 flex-shrink-0"
                      >
                        {isFormattingOptions[index] ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Wand2 className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                    {option && <LatexPreview text={option} />}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-zinc-500">
              Click the circle to mark the correct answer. At least 2 options required.
            </p>
          </div>
        )}

        {/* Category & Difficulty Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                className="w-full px-4 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-phthalo-500"
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
              className="w-full px-4 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-phthalo-500"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        {/* XP */}
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

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting || duplicateFound}
          className="w-full bg-gradient-to-r from-phthalo-600 to-phthalo-800 hover:from-phthalo-700 hover:to-phthalo-900 disabled:opacity-50"
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
