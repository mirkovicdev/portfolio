// app/quantframe/programs/[program]/modules/[module]/page.tsx
import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, CheckCircle2, Circle, Trophy, Lock, FolderKanban, Clock } from 'lucide-react'
import { getProjectByModuleId } from '@/lib/projects/loader'
import { getProjectProgress } from '@/lib/projects/supabaseProgress'

interface Lesson {
  id: string
  slug: string
  title: string
  subtitle: string | null
  order_index: number
  estimated_minutes: number | null
  completed: boolean
}

interface ModuleExam {
  id: string
  title: string
  description: string
  passing_score: number
  total_questions: number
  user_passed: boolean | null
  best_score: number | null
  in_progress_count: number | null
}

export default async function ModulePage({
  params
}: {
  params: { program: string; module: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch program
  const { data: program } = await supabase
    .from('programs')
    .select('*')
    .eq('slug', params.program)
    .eq('is_published', true)
    .single()

  if (!program) {
    notFound()
  }

  // Fetch module
  const { data: module } = await supabase
    .from('modules')
    .select('*')
    .eq('program_id', program.id)
    .eq('slug', params.module)
    .eq('is_published', true)
    .single()

  if (!module) {
    notFound()
  }

  // Fetch lessons
  const { data: lessons } = await supabase
    .from('lessons')
    .select('*')
    .eq('module_id', module.id)
    .eq('is_published', true)
    .order('order_index')

  // Get user progress for each lesson
  let lessonsWithProgress: Lesson[] = []
  if (lessons) {
    lessonsWithProgress = await Promise.all(
      lessons.map(async (lesson) => {
        let completed = false
        if (user) {
          const { data: progress } = await supabase
            .from('user_lesson_progress')
            .select('completed')
            .eq('user_id', user.id)
            .eq('lesson_id', lesson.id)
            .maybeSingle()

          completed = progress?.completed || false
        }

        return {
          ...lesson,
          completed
        }
      })
    )
  }

  const completedCount = lessonsWithProgress.filter(l => l.completed).length
  const totalCount = lessonsWithProgress.length
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
  const allLessonsCompleted = totalCount > 0 && completedCount === totalCount

  // Fetch module exam
  const { data: exam } = await supabase
    .from('module_exams')
    .select('*')
    .eq('module_id', module.id)
    .eq('is_published', true)
    .maybeSingle()

  // Get exam question count and user's best attempt
  let examData: ModuleExam | null = null
  if (exam) {
    const { count: questionCount } = await supabase
      .from('module_exam_questions')
      .select('*', { count: 'exact', head: true })
      .eq('exam_id', exam.id)

    let userPassed: boolean | null = null
    let bestScore: number | null = null
    let inProgressCount: number | null = null

    if (user) {
      const { data: attempts } = await supabase
        .from('user_module_exam_attempts')
        .select('*')
        .eq('user_id', user.id)
        .eq('exam_id', exam.id)
        .order('score', { ascending: false })
        .limit(1)

      if (attempts && attempts.length > 0) {
        userPassed = attempts[0].passed
        bestScore = attempts[0].score
      }

      // Check for in-progress exam
      const { data: progress } = await supabase
        .from('user_exam_progress')
        .select('answers')
        .eq('user_id', user.id)
        .eq('exam_id', exam.id)
        .maybeSingle()

      if (progress?.answers) {
        inProgressCount = Object.keys(progress.answers).length
      }
    }

    examData = {
      id: exam.id,
      title: exam.title,
      description: exam.description,
      passing_score: exam.passing_score,
      total_questions: questionCount || 0,
      user_passed: userPassed,
      best_score: bestScore,
      in_progress_count: inProgressCount
    }
  }

  // Fetch module project (if any)
  const moduleProject = await getProjectByModuleId(module.id)

  // Get project progress if user is logged in
  let projectProgress = null
  if (moduleProject && user) {
    projectProgress = await getProjectProgress(user.id, moduleProject.slug)
  }

  // Check if exam is passed (for showing "next module unlocked" message)
  const examPassed = examData?.user_passed === true

  return (
    <div className="min-h-screen">
      {/* Module Hero */}
      <div className="relative overflow-hidden bg-gradient-to-b from-zinc-900 to-black border-b border-zinc-800">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-phthalo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-16">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-zinc-500 mb-4">
            <Link href="/quantframe/programs" className="hover:text-white transition-colors">
              Programs
            </Link>
            <span>/</span>
            <Link href={`/quantframe/programs/${params.program}`} className="hover:text-white transition-colors">
              {program.title}
            </Link>
            <span>/</span>
            <span className="text-zinc-400">{module.short_title || module.title}</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-phthalo-400 to-phthalo-600">
            {module.title}
          </h1>

          {module.description && (
            <p className="text-lg text-zinc-400 max-w-3xl mb-6">
              {module.description}
            </p>
          )}

          {/* Progress */}
          {user && totalCount > 0 && (
            <div className="flex items-center gap-4">
              <div className="flex-1 max-w-md">
                <div className="flex items-center justify-between text-sm text-zinc-400 mb-2">
                  <span>Progress</span>
                  <span>{completedCount} / {totalCount} lessons</span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-phthalo-500 to-phthalo-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
              <Badge variant="outline" className="bg-phthalo-500/10 text-phthalo-400 border-phthalo-500/20">
                {progressPercent}%
              </Badge>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* ============================================ */}
        {/* LEARNING PATH SECTION */}
        {/* ============================================ */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold text-white">Learning Path</h2>
            <Badge variant="outline" className="bg-phthalo-500/10 text-phthalo-400 border-phthalo-500/30 text-xs">
              Required for next module
            </Badge>
          </div>
          <p className="text-zinc-500 text-sm mb-8">
            Complete the lessons and pass the exam to unlock the next module
          </p>

          {/* Lessons */}
          {lessonsWithProgress && lessonsWithProgress.length > 0 ? (
            <div className="space-y-3">
              {lessonsWithProgress.map((lesson, index) => (
                <Link
                  key={lesson.id}
                  href={`/quantframe/programs/${params.program}/modules/${params.module}/lessons/${lesson.slug}`}
                >
                  <Card className="group bg-zinc-900/50 border-zinc-800 backdrop-blur-sm hover:border-phthalo-500/50 transition-all duration-300 cursor-pointer">
                    <div className="p-5">
                      <div className="flex items-center gap-5">
                        {/* Completion Icon */}
                        <div className="flex-shrink-0">
                          {lesson.completed ? (
                            <div className="w-9 h-9 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center">
                              <CheckCircle2 className="w-5 h-5 text-green-400" />
                            </div>
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center group-hover:border-phthalo-500 transition-colors">
                              <span className="text-sm font-bold text-zinc-500 group-hover:text-phthalo-400 transition-colors">
                                {index + 1}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Lesson Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="text-base font-semibold text-white group-hover:text-white transition-colors truncate">
                              {lesson.title}
                            </h3>
                            {lesson.estimated_minutes && (
                              <span className="text-xs text-zinc-500 flex items-center gap-1 flex-shrink-0">
                                <Clock className="w-3 h-3" />
                                {lesson.estimated_minutes}m
                              </span>
                            )}
                          </div>
                          {lesson.subtitle && (
                            <p className="text-sm text-zinc-500 truncate">
                              {lesson.subtitle}
                            </p>
                          )}
                        </div>

                        {/* Arrow */}
                        <div className="flex-shrink-0">
                          <ArrowRight className="w-5 h-5 text-zinc-600 group-hover:text-phthalo-500 group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-zinc-400">No lessons available yet.</p>
            </div>
          )}

          {/* Module Exam - Part of Learning Path */}
          {examData && (
            <div className="mt-4">
              {/* Connector line */}
              <div className="ml-[18px] h-4 w-0.5 bg-zinc-800" />

              {allLessonsCompleted ? (
                <Link href={`/quantframe/programs/${params.program}/modules/${params.module}/exam`}>
                  <Card className={`group backdrop-blur-sm transition-all duration-300 cursor-pointer ${
                    examData.user_passed
                      ? 'bg-green-500/5 border-2 border-green-500/30 hover:border-green-400/50'
                      : 'bg-zinc-900/50 border-zinc-800 hover:border-phthalo-500/50'
                  }`}>
                    <div className="p-5">
                      <div className="flex items-center gap-5">
                        {/* Icon */}
                        <div className="flex-shrink-0">
                          {examData.user_passed ? (
                            <div className="w-9 h-9 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center">
                              <Trophy className="w-5 h-5 text-green-400" />
                            </div>
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-amber-500/10 border-2 border-amber-500/50 flex items-center justify-center group-hover:border-amber-400 transition-colors">
                              <Trophy className="w-5 h-5 text-amber-400" />
                            </div>
                          )}
                        </div>

                        {/* Exam Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="text-base font-semibold text-white">
                              {examData.title}
                            </h3>
                            <Badge variant="outline" className="bg-zinc-800/50 text-zinc-400 border-zinc-700 text-xs">
                              {examData.total_questions} Questions
                            </Badge>
                            {examData.in_progress_count !== null && examData.in_progress_count > 0 && examData.user_passed === null && (
                              <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30 text-xs">
                                In Progress
                              </Badge>
                            )}
                            {examData.user_passed !== null && (
                              <Badge
                                variant="outline"
                                className={`text-xs ${examData.user_passed
                                  ? "bg-green-500/10 text-green-400 border-green-500/30"
                                  : "bg-red-500/10 text-red-400 border-red-500/30"
                                }`}
                              >
                                {examData.user_passed ? 'Passed' : 'Not Passed'}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-zinc-500">
                            {examData.user_passed
                              ? 'You passed! Next module unlocked.'
                              : `Score ${examData.passing_score}% or higher to unlock the next module`
                            }
                          </p>
                          {examData.best_score !== null && !examData.user_passed && (
                            <p className="text-xs text-zinc-600 mt-1">
                              Best attempt: {Math.round((examData.best_score / examData.total_questions) * 100)}%
                            </p>
                          )}
                        </div>

                        {/* Arrow */}
                        <div className="flex-shrink-0">
                          <ArrowRight className="w-5 h-5 text-zinc-600 group-hover:text-phthalo-500 group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ) : (
                <Card className="bg-zinc-900/30 border-zinc-800/50 backdrop-blur-sm">
                  <div className="p-5">
                    <div className="flex items-center gap-5">
                      {/* Locked Icon */}
                      <div className="flex-shrink-0">
                        <div className="w-9 h-9 rounded-full bg-zinc-800/50 border-2 border-zinc-700/50 flex items-center justify-center">
                          <Lock className="w-4 h-4 text-zinc-600" />
                        </div>
                      </div>

                      {/* Exam Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="text-base font-semibold text-zinc-500">
                            {examData.title}
                          </h3>
                          <Badge variant="outline" className="bg-zinc-800/30 text-zinc-600 border-zinc-700/50 text-xs">
                            Locked
                          </Badge>
                        </div>
                        <p className="text-sm text-zinc-600">
                          Complete all {totalCount} lessons to unlock
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>

        {/* ============================================ */}
        {/* MODULE PROJECT SECTION */}
        {/* ============================================ */}
        {moduleProject && (
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-white">Module Project</h2>
            </div>
            <p className="text-zinc-500 text-sm mb-6">
              Apply what you've learned by building a real project
            </p>

            <Link href={`/quantframe/projects/${moduleProject.slug}`}>
              <Card className={`group backdrop-blur-sm transition-all duration-300 cursor-pointer ${
                projectProgress?.completed
                  ? 'bg-green-500/5 border-2 border-green-500/30 hover:border-green-400/50'
                  : 'bg-zinc-900/50 border-zinc-800 hover:border-phthalo-500/50'
              }`}>
                <div className="p-6">
                  <div className="flex items-start gap-5">
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-1">
                      {projectProgress?.completed ? (
                        <div className="w-12 h-12 rounded-xl bg-green-500/20 border-2 border-green-500 flex items-center justify-center">
                          <FolderKanban className="w-6 h-6 text-green-400" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center group-hover:border-phthalo-500 transition-colors">
                          <FolderKanban className="w-6 h-6 text-zinc-500 group-hover:text-phthalo-400 transition-colors" />
                        </div>
                      )}
                    </div>

                    {/* Project Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Badge
                          variant="outline"
                          className={
                            moduleProject.difficulty === 'beginner'
                              ? 'bg-green-500/10 text-green-400 border-green-500/30'
                              : moduleProject.difficulty === 'intermediate'
                              ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                              : 'bg-red-500/10 text-red-400 border-red-500/30'
                          }
                        >
                          {moduleProject.difficulty}
                        </Badge>
                        <Badge variant="outline" className="bg-zinc-800 text-zinc-400 border-zinc-700">
                          <Clock className="w-3 h-3 mr-1" />
                          {moduleProject.estimatedMinutes} min
                        </Badge>
                        {projectProgress?.completed && (
                          <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Completed
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-white transition-colors">
                        {moduleProject.title}
                      </h3>
                      {moduleProject.description && (
                        <p className="text-sm text-zinc-400 line-clamp-2">
                          {moduleProject.description}
                        </p>
                      )}
                    </div>

                    {/* Arrow */}
                    <div className="flex-shrink-0 mt-1">
                      <ArrowRight className="w-5 h-5 text-zinc-600 group-hover:text-phthalo-500 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
