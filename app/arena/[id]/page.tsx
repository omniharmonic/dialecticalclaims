import { createServerClient } from '@/lib/supabase/server'
import { ArenaView } from '@/components/arena/ArenaView'
import { notFound } from 'next/navigation'

export default async function ArenaPage({ params }: { params: { id: string } }) {
  const supabase = createServerClient()

  const { data: dialectic, error } = await supabase
    .from('dialectics')
    .select(
      `
      *,
      fighter1:fighters!fighter1_id(*),
      fighter2:fighters!fighter2_id(*)
    `
    )
    .eq('id', params.id)
    .single()

  if (error || !dialectic) {
    notFound()
  }

  // Force TypeScript to recognize the correct type with explicit type assertion
  const validDialectic = dialectic as any

  // For completed/archived dialectics, fetch the rounds and syntheses data
  let rounds: { round_number: number; fighter1_response: string; fighter2_response: string }[] = []
  let syntheses: any[] = []

  if (validDialectic.status === 'complete' || validDialectic.archived_at) {
    // Fetch rounds
    const { data: roundsData } = await supabase
      .from('rounds')
      .select('round_number, fighter1_response, fighter2_response')
      .eq('dialectic_id', params.id)
      .order('round_number', { ascending: true })

    // Fetch syntheses
    const { data: synthesesData } = await supabase
      .from('syntheses')
      .select('*')
      .eq('dialectic_id', params.id)

    rounds = roundsData || []
    syntheses = synthesesData || []
  }

  // Add the data to the dialectic object
  const dialecticWithData = {
    ...validDialectic,
    rounds,
    syntheses
  }

  return (
    <div className="arena-container min-h-screen">
      <ArenaView dialectic={dialecticWithData} />
    </div>
  )
}

