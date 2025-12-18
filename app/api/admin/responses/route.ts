import { NextResponse } from 'next/server'
import { getSession } from '@/lib/admin-auth'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const session = await getSession()
  console.log('Session:', session)

  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    console.log('Querying Supabase...')

    // First get the total count
    const { count } = await supabase
      .from('quiz_responses')
      .select('*', { count: 'exact', head: true })

    console.log('Total count:', count)

    // Supabase has a 1000 row limit per request, so we need to paginate
    const PAGE_SIZE = 1000
    const totalCount = count || 0
    const allData: any[] = []

    // Fetch all records in chunks of 1000
    for (let offset = 0; offset < totalCount; offset += PAGE_SIZE) {
      const { data: chunk, error } = await supabase
        .from('quiz_responses')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + PAGE_SIZE - 1)

      if (error) throw error
      if (chunk) allData.push(...chunk)

      console.log(`Fetched rows ${offset} to ${offset + (chunk?.length || 0)}`)
    }

    console.log('Total records fetched:', allData.length)

    return NextResponse.json({ data: allData })
  } catch (error) {
    console.error('Error fetching responses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch responses' },
      { status: 500 }
    )
  }
}