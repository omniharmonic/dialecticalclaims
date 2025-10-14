import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { z } from 'zod'

const createDialecticSchema = z.object({
  fighter1_id: z.string().uuid(),
  fighter2_id: z.string().uuid(),
  thesis: z.string().min(10).max(1000),
  round_count: z.number().int().min(2).max(8),
  parent_synthesis_id: z.string().uuid().optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate request body
    const validation = createDialecticSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.issues },
        { status: 400 }
      )
    }

    const { fighter1_id, fighter2_id, thesis, round_count, parent_synthesis_id } =
      validation.data

    // Ensure fighters are different
    if (fighter1_id === fighter2_id) {
      return NextResponse.json({ error: 'Fighters must be different' }, { status: 400 })
    }

    const supabase = createServerClient()

    // Create dialectic record
    const { data: dialectic, error } = await supabase
      .from('dialectics')
      // @ts-expect-error - Supabase type inference issue
      .insert({
        fighter1_id,
        fighter2_id,
        thesis,
        round_count,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      // Error creating dialectic
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // If spawned from synthesis, update usage count and create lineage
    if (parent_synthesis_id) {
      await Promise.all([
        supabase.rpc('increment_synthesis_usage', {
          synthesis_uuid: parent_synthesis_id,
        }),
        supabase.from('dialectic_lineage').insert({
          parent_synthesis_id,
          child_dialectic_id: dialectic.id,
        }),
      ])
    }

    return NextResponse.json({
      dialectic_id: dialectic.id,
      status: 'pending',
    })
  } catch (error) {
    // Error in dialectics API
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const perPage = Math.min(parseInt(searchParams.get('per_page') || '20'), 100)
    const fighter1Id = searchParams.get('fighter1_id')
    const fighter2Id = searchParams.get('fighter2_id')
    const sort = searchParams.get('sort') || 'recent'

    const supabase = createServerClient()

    let query = supabase
      .from('dialectics')
      .select(
        `
        *,
        fighter1:fighters!fighter1_id(id, name, fighter_name),
        fighter2:fighters!fighter2_id(id, name, fighter_name)
      `,
        { count: 'exact' }
      )

    if (fighter1Id) {
      query = query.eq('fighter1_id', fighter1Id)
    }
    if (fighter2Id) {
      query = query.eq('fighter2_id', fighter2Id)
    }

    // Apply sorting
    if (sort === 'viewed') {
      query = query.order('view_count', { ascending: false })
    } else if (sort === 'oldest') {
      query = query.order('created_at', { ascending: true })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    const from = (page - 1) * perPage
    const to = from + perPage - 1
    query = query.range(from, to)

    const { data: dialectics, error, count } = await query

    if (error) {
      // Error fetching dialectics
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      dialectics: dialectics || [],
      total: count || 0,
      page,
      per_page: perPage,
    })
  } catch (error) {
    // Error in dialectics list API
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

