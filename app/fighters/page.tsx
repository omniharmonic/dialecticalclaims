import { createServerClient } from '@/lib/supabase/server'
import { FighterSelector } from '@/components/fighters/FighterSelector'

// Disable caching for this page to always fetch fresh fighter data
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function FightersPage() {
  const supabase = createServerClient()

  const { data: fighters, error } = await supabase
    .from('fighters')
    .select('*')
    .order('name')

  if (error) {
    // Error fetching fighters
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Error Loading Fighters</h1>
          <p className="text-muted-foreground">
            Unable to load fighters. Please try again later.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="arena-container min-h-screen">
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 neon-header">
            Select Your Fighters
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose two philosophical fighters for a dialectical duel. Watch as AI-embodied
            thinkers engage in structured philosophical combat.
          </p>
        </div>

        <FighterSelector fighters={fighters || []} />
      </div>
    </div>
  )
}

