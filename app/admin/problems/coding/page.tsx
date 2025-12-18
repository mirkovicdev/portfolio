'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, RefreshCw, Plus, List, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { CodingProblemsList } from './components/problems-list'
import { AddCodingProblemForm } from './components/add-problem-form'
import { CodingProblemPreviewModal } from './components/problem-preview-modal'

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

interface Category {
  id: string
  name: string
  description: string
}

type ViewMode = 'list' | 'add'

export default function CodingProblemsPage() {
  const [problems, setProblems] = useState<CodingProblem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [previewProblem, setPreviewProblem] = useState<CodingProblem | null>(null)
  const [editProblem, setEditProblem] = useState<CodingProblem | null>(null)

  const fetchData = async () => {
    try {
      const supabase = createClient()

      // Fetch problems and categories in parallel
      const [problemsRes, categoriesRes] = await Promise.all([
        supabase
          .from('coding_problems')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('problem_categories')
          .select('*')
          .eq('type', 'coding')
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

  const handleEdit = (problem: CodingProblem) => {
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
            <Button variant="ghost" size="sm" className="mb-4 text-zinc-400 hover:text-blue-400">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Problems
            </Button>
          </Link>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">
                  Coding
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
                      ? 'bg-blue-600 text-white'
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
                      ? 'bg-blue-600 text-white'
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
                className="border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-blue-400 hover:border-zinc-600 hover:bg-zinc-800"
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
            <CodingProblemsList
              problems={problems}
              categories={categories}
              onPreview={setPreviewProblem}
              onRefresh={fetchData}
              onEdit={handleEdit}
            />
          ) : (
            <div className="max-w-4xl">
              <AddCodingProblemForm
                onProblemAdded={handleProblemAdded}
                editProblem={editProblem}
                onCancelEdit={handleCancelEdit}
              />
            </div>
          )}
        </motion.div>
      </div>

      {/* Preview Modal */}
      <CodingProblemPreviewModal
        problem={previewProblem}
        onClose={() => setPreviewProblem(null)}
      />
    </div>
  )
}
