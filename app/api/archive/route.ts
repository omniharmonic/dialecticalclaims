import { createServerClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)

    // Parse query parameters
    const search = searchParams.get('search') || ''
    const fighterFilter = searchParams.get('fighter') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    // Start building the query - simplify to avoid complex joins causing errors
    let query = supabase
      .from('dialectics')
      .select(`
        id,
        thesis,
        created_at,
        archived_at,
        fighter1_id,
        fighter2_id
      `)
      .not('archived_at', 'is', null)
      .order('archived_at', { ascending: false })

    // Apply search filter if provided
    if (search) {
      query = query.ilike('thesis', `%${search}%`)
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data: dialectics, error } = await query

    if (error) {
      console.error('Error fetching archived dialectics:', error)
      return Response.json(
        { error: 'Failed to fetch archived dialectics' },
        { status: 500 }
      )
    }

    if (!dialectics || dialectics.length === 0) {
      return Response.json({
        dialectics: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0
        }
      })
    }

    // Get fighter data separately
    const fighterIds = dialectics.flatMap((d: any) => [d.fighter1_id, d.fighter2_id])
    const { data: fighters } = await supabase
      .from('fighters')
      .select('id, name, fighter_name')
      .in('id', fighterIds)

    const fighterMap = new Map(fighters?.map((f: any) => [f.id, f]) || [])

    // Get synthesis data separately
    const dialecticIds = dialectics.map((d: any) => d.id)
    const { data: syntheses } = await supabase
      .from('syntheses')
      .select('dialectic_id, synthesis_claim')
      .in('dialectic_id', dialecticIds)

    // Get rounds data separately
    const { data: rounds } = await supabase
      .from('rounds')
      .select('dialectic_id, round_number, fighter1_response, fighter2_response')
      .in('dialectic_id', dialecticIds)
      .order('round_number', { ascending: true })

    const synthesisMap = new Map()
    syntheses?.forEach((s: any) => {
      if (!synthesisMap.has(s.dialectic_id)) {
        synthesisMap.set(s.dialectic_id, [])
      }
      synthesisMap.get(s.dialectic_id).push(s)
    })

    // Group rounds by dialectic_id
    const roundsMap = new Map()
    rounds?.forEach((r: any) => {
      if (!roundsMap.has(r.dialectic_id)) {
        roundsMap.set(r.dialectic_id, [])
      }
      roundsMap.get(r.dialectic_id).push(r)
    })

    // Process the results
    const processedDialectics = dialectics.map((dialectic: any) => {
      const fighter1 = fighterMap.get(dialectic.fighter1_id)
      const fighter2 = fighterMap.get(dialectic.fighter2_id)
      const dialecticSyntheses = synthesisMap.get(dialectic.id) || []
      const dialecticRounds = roundsMap.get(dialectic.id) || []
      const firstSynthesisClaim = dialecticSyntheses.find((s: any) => s.synthesis_claim)?.synthesis_claim

      return {
        id: dialectic.id,
        thesis: dialectic.thesis,
        created_at: dialectic.created_at,
        archived_at: dialectic.archived_at,
        status: dialectic.status,
        round_count: dialectic.round_count,
        fighter1: fighter1 || { id: dialectic.fighter1_id, name: 'Unknown', fighter_name: 'Unknown' },
        fighter2: fighter2 || { id: dialectic.fighter2_id, name: 'Unknown', fighter_name: 'Unknown' },
        synthesis_claim: firstSynthesisClaim || null,
        synthesis_count: dialecticSyntheses.length,
        rounds: dialecticRounds,
        syntheses: dialecticSyntheses
      }
    })

    // Get total count for pagination
    let countQuery = supabase
      .from('dialectics')
      .select('id', { count: 'exact' })
      .not('archived_at', 'is', null)

    if (search) {
      countQuery = countQuery.ilike('thesis', `%${search}%`)
    }

    const { count } = await countQuery

    return Response.json({
      dialectics: processedDialectics,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('Archive listing endpoint error:', error)
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}