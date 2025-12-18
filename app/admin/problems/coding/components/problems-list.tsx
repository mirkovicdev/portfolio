'use client'

import { useState } from 'react'
import { Eye, Search, ChevronLeft, ChevronRight, Trash2, Pencil, Code } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'

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
}

interface CodingProblemsListProps {
  problems: CodingProblem[]
  categories: Category[]
  onPreview: (problem: CodingProblem) => void
  onRefresh: () => void
  onEdit: (problem: CodingProblem) => void
}

const difficultyColors = {
  beginner: 'bg-green-500/10 text-green-400 border-green-500/20',
  intermediate: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  advanced: 'bg-red-500/10 text-red-400 border-red-500/20'
}

const ITEMS_PER_PAGE = 20

export function CodingProblemsList({ problems, categories, onPreview, onRefresh, onEdit }: CodingProblemsListProps) {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Filter problems
  const filteredProblems = problems.filter(problem => {
    const matchesSearch = search === '' ||
      problem.title?.toLowerCase().includes(search.toLowerCase()) ||
      problem.problem.toLowerCase().includes(search.toLowerCase())

    const matchesCategory = categoryFilter === '' || problem.category === categoryFilter
    const matchesDifficulty = difficultyFilter === '' || problem.difficulty === difficultyFilter

    return matchesSearch && matchesCategory && matchesDifficulty
  })

  // Pagination
  const totalPages = Math.ceil(filteredProblems.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedProblems = filteredProblems.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  // Reset to page 1 when filters change
  const handleFilterChange = (setter: (value: string) => void, value: string) => {
    setter(value)
    setCurrentPage(1)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this problem? This cannot be undone.')) {
      return
    }

    setDeletingId(id)
    try {
      const res = await fetch(`/api/admin/problems/${id}`, {
        method: 'DELETE'
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete problem')
      }

      toast.success('Problem deleted successfully')
      onRefresh()
    } catch (error) {
      console.error('Error deleting problem:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete problem')
    } finally {
      setDeletingId(null)
    }
  }

  // Get category name by id
  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || categoryId
  }

  // Truncate text for display
  const truncate = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + '...'
  }

  // Format relative time
  const timeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 30) return `${days}d ago`
    const months = Math.floor(days / 30)
    if (months < 12) return `${months}mo ago`
    const years = Math.floor(months / 12)
    return `${years}y ago`
  }

  return (
    <Card className="bg-zinc-900/50 border-zinc-800 p-6">
      {/* Header with filters */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">
            Coding Problems
            <span className="text-sm font-normal text-zinc-500 ml-2">
              ({filteredProblems.length} of {problems.length})
            </span>
          </h2>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              placeholder="Search by title or problem..."
              value={search}
              onChange={(e) => handleFilterChange(setSearch, e.target.value)}
              className="pl-10 bg-zinc-800 border-zinc-700 text-white"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => handleFilterChange(setCategoryFilter, e.target.value)}
            className="px-4 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <select
            value={difficultyFilter}
            onChange={(e) => handleFilterChange(setDifficultyFilter, e.target.value)}
            className="px-4 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Difficulties</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>

      {/* Problems Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left py-3 px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                Problem
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                Category
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                Difficulty
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                Tests
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                XP
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                Added
              </th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedProblems.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-zinc-500">
                  No problems found matching your filters.
                </td>
              </tr>
            ) : (
              paginatedProblems.map((problem) => (
                <tr
                  key={problem.id}
                  className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Code className="w-4 h-4 text-blue-400" />
                        {problem.title ? (
                          <p className="text-white font-medium text-sm">
                            {problem.title}
                          </p>
                        ) : (
                          <p className="text-zinc-400 text-sm italic">
                            No title
                          </p>
                        )}
                        {problem.problem_number && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-700 text-zinc-400">
                            #{problem.problem_number}
                          </span>
                        )}
                      </div>
                      <p className="text-zinc-400 text-xs">
                        {truncate(problem.problem.replace(/\\n/g, ' ').replace(/`/g, ''), 80)}
                      </p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="outline" className="bg-zinc-800/50 text-zinc-400 border-zinc-700 text-xs">
                      {getCategoryName(problem.category)}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="outline" className={`${difficultyColors[problem.difficulty]} text-xs`}>
                      {problem.difficulty}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-zinc-400 text-sm">
                      {problem.test_cases?.length || 0}
                      <span className="text-zinc-600 text-xs ml-1">
                        ({problem.test_cases?.filter(t => t.hidden).length || 0} hidden)
                      </span>
                    </span>
                  </td>
                  <td className="py-3 px-4 text-zinc-400 text-sm">
                    {problem.xp}
                  </td>
                  <td className="py-3 px-4 text-zinc-500 text-xs whitespace-nowrap">
                    {timeAgo(problem.created_at)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onPreview(problem)}
                        className="text-zinc-400 hover:text-blue-400"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(problem)}
                        className="text-zinc-400 hover:text-blue-400"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(problem.id)}
                        disabled={deletingId === problem.id}
                        className="text-zinc-400 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-zinc-800">
          <p className="text-sm text-zinc-500">
            Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredProblems.length)} of {filteredProblems.length}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className={currentPage === pageNum
                      ? "bg-blue-600 text-white"
                      : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white"
                    }
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}
