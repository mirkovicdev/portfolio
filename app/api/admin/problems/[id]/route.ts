import { NextResponse } from 'next/server'
import { getSession } from '@/lib/admin-auth'
import { createClient } from '@supabase/supabase-js'

// Get Supabase admin client
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()

  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const { id } = await params
    const supabase = getSupabaseAdmin()

    // Try to delete from math_problems first
    const { error: mathError } = await supabase
      .from('math_problems')
      .delete()
      .eq('id', id)

    if (mathError) {
      // If not found in math_problems, try coding_problems
      const { error: codingError } = await supabase
        .from('coding_problems')
        .delete()
        .eq('id', id)

      if (codingError) {
        throw new Error('Problem not found or could not be deleted')
      }
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting problem:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete problem' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()

  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const { id } = await params
    const body = await request.json()
    const { problemType, ...problemData } = body

    const supabase = getSupabaseAdmin()

    if (problemType === 'math') {
      // Build the update object
      const updateData: Record<string, any> = {
        title: problemData.title || null,
        problem: problemData.problem,
        hint: problemData.hint,
        solution: problemData.solution,
        category: problemData.category,
        difficulty: problemData.difficulty,
        xp: parseInt(problemData.xp),
        question_type: problemData.question_type || 'free_text',
        updated_at: new Date().toISOString()
      }

      // Handle multiple choice vs free text
      if (problemData.question_type === 'multiple_choice') {
        let options = problemData.options
        if (typeof options === 'string') {
          options = JSON.parse(options)
        }
        updateData.options = options
        updateData.correct_option_index = parseInt(problemData.correct_option_index)
        updateData.answer = options[updateData.correct_option_index]
      } else {
        updateData.answer = problemData.answer
        updateData.options = null
        updateData.correct_option_index = null
      }

      const { data, error } = await supabase
        .from('math_problems')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return NextResponse.json({ data, success: true })

    } else if (problemType === 'coding') {
      let testCases = problemData.test_cases
      if (typeof testCases === 'string') {
        testCases = JSON.parse(testCases)
      }

      const { data, error } = await supabase
        .from('coding_problems')
        .update({
          title: problemData.title || null,
          problem: problemData.problem,
          hint: problemData.hint,
          solution: problemData.solution,
          starter_code: problemData.starter_code,
          test_cases: testCases,
          category: problemData.category,
          difficulty: problemData.difficulty,
          xp: parseInt(problemData.xp),
          problem_number: problemData.problem_number ? parseInt(problemData.problem_number) : null,
          language: problemData.language || 'python'
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return NextResponse.json({ data, success: true })

    } else {
      return NextResponse.json(
        { error: 'Invalid problem type' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error updating problem:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update problem' },
      { status: 500 }
    )
  }
}
