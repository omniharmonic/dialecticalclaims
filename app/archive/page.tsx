import { createServerClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

export default async function ArchivePage() {
  const supabase = createServerClient()

  const { data: dialectics, error } = await supabase
    .from('dialectics')
    .select(
      `
      *,
      fighter1:fighters!fighter1_id(id, name, fighter_name),
      fighter2:fighters!fighter2_id(id, name, fighter_name)
    `
    )
    .eq('status', 'complete')
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    // Error fetching dialectics
  }

  return (
    <div className="arena-container min-h-screen">
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-4xl md:text-5xl font-bold font-serif mb-4">Dialectic Archive</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Browse past philosophical duels and explore the syntheses that emerged from dialectical
            combat.
          </p>
        </div>

        {dialectics && dialectics.length > 0 ? (
          <div className="grid gap-6 max-w-4xl mx-auto">
            {dialectics.map((dialectic) => (
              <Link key={dialectic.id} href={`/arena/${dialectic.id}`}>
                <Card className="hover:border-primary/50 transition-all cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="text-sm font-semibold text-muted-foreground whitespace-nowrap">
                          {dialectic.fighter1.name}
                        </div>
                        <div className="text-primary font-bold">VS</div>
                        <div className="text-sm font-semibold text-muted-foreground whitespace-nowrap">
                          {dialectic.fighter2.name}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{dialectic.round_count} rounds</span>
                        <span>•</span>
                        <span>{dialectic.view_count} views</span>
                        <span>•</span>
                        <span>{new Date(dialectic.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="philosophical-text italic line-clamp-2">&ldquo;{dialectic.thesis}&rdquo;</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-6">No dialectics in the archive yet.</p>
            <Link href="/fighters" className="btn btn-primary">
              Create First Dialectic
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

