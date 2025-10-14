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

  return (
    <div className="arena-container min-h-screen">
      <ArenaView dialectic={dialectic} />
    </div>
  )
}

