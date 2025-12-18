'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, RefreshCw, Plus, List, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { ProblemsList } from './components/problems-list'
import { AddProblemForm } from './components/add-problem-form'
import { ProblemPreviewModal } from './components/problem-preview-modal'

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
  created_at: string
  question_type?: 'free_text' | 'multiple_choice'
  options?: string[]
  correct_option_index?: number
}

interface Category {
  id: string
  name: string
  description: string
}

type ViewMode = 'list' | 'add'

export default function MathProblemsPage() {
  const [problems, setProblems] = useState<MathProblem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [previewProblem, setPreviewProblem] = useState<MathProblem | null>(null)
  const [editProblem, setEditProblem] = useState<MathProblem | null>(null)

  const fetchData = async () => {
    try {
      const supabase = createClient()

      // Fetch problems and categories in parallel
      const [problemsRes, categoriesRes] = await Promise.all([
        supabase
          .from('math_problems')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('problem_categories')
          .select('*')
          .eq('type', 'math')
          .order('name', { ascending: true })
      ])

      if (problemsRes.error) throw problemsRes.error
      if (categoriesRes.error) throw categoriesRes.error

      // Map category names to problems
      const categoryMap = new Map(categoriesRes.data?.map(c => [c.id, c.name]))
      const problemsWithCategoryNames = (problemsRes.data || []).map(p => ({
        ...p,
        category_name: categoryMap.get(p.category) || p.category
      }))

      setProblems(problemsWithCategoryNames)
      setCategories(categoriesRes.data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load problems')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchData()
    toast.success('Data refreshed')
  }

  const handleProblemAdded = () => {
    fetchData()
    setViewMode('list')
    setEditProblem(null)
  }

  const handleEdit = (problem: MathProblem) => {
    setEditProblem(problem)
    setViewMode('add')
  }

  const handleCancelEdit = () => {
    setEditProblem(null)
    setViewMode('list')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-900 to-black flex items-center justify-center">
        <div className="flex items-center gap-3 text-white">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-xl">Loading problems...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-900 to-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link href="/admin/problems">
            <Button variant="ghost" size="sm" className="mb-4 text-zinc-400 hover:text-phthalo-400">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Problems
            </Button>
          </Link>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-phthalo-400 to-phthalo-600">
                  Math
                </span>{' '}
                Problems
              </h1>
              <p className="text-zinc-400">
                {problems.length} problems across {categories.length} categories
              </p>
            </div>

            <div className="flex gap-3">
              {/* View Mode Toggle */}
              <div className="flex rounded-lg overflow-hidden border border-zinc-700">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditProblem(null)
                    setViewMode('list')
                  }}
                  className={`rounded-none ${
                    viewMode === 'list'
                      ? 'bg-phthalo-600 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <List className="w-4 h-4 mr-2" />
                  View All
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditProblem(null)
                    setViewMode('add')
                  }}
                  className={`rounded-none ${
                    viewMode === 'add'
                      ? 'bg-phthalo-600 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New
                </Button>
              </div>

              <Button
                onClick={handleRefresh}
                disabled={isRefreshing}
                variant="outline"
                className="border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-phthalo-400 hover:border-zinc-600 hover:bg-zinc-800"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {viewMode === 'list' ? (
            <ProblemsList
              problems={problems}
              categories={categories}
              onPreview={setPreviewProblem}
              onRefresh={fetchData}
              onEdit={handleEdit}
            />
          ) : (
            <div className="max-w-3xl">
              <AddProblemForm
                onProblemAdded={handleProblemAdded}
                editProblem={editProblem}
                onCancelEdit={handleCancelEdit}
              />
            </div>
          )}
        </motion.div>
      </div>

      {/* Preview Modal */}
      <ProblemPreviewModal
        problem={previewProblem}
        onClose={() => setPreviewProblem(null)}
      />
    </div>
  )
}
