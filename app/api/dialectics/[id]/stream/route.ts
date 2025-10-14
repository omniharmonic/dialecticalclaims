import { createServerClient } from '@/lib/supabase/server'
import { generateDialectic } from '@/lib/dialectic-generator'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const dialecticId = params.id

  const supabase = createServerClient()

  // Fetch dialectic with fighters
  const { data: dialectic, error } = await supabase
    .from('dialectics')
    .select(
      `
      *,
      fighter1:fighters!fighter1_id(*),
      fighter2:fighters!fighter2_id(*)
    `
    )
    .eq('id', dialecticId)
    .single()

  if (error || !dialectic) {
    return new Response('Dialectic not found', { status: 404 })
  }

  // Create SSE stream
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (event: string, data: any) => {
        const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
        controller.enqueue(encoder.encode(message))
      }

      try {
        // Update status to generating
        await supabase.from('dialectics').update({ status: 'generating' }).eq('id', dialecticId)

        sendEvent('status', { status: 'generating' })

        // Generate dialectic
        await generateDialectic({
          fighter1: dialectic.fighter1,
          fighter2: dialectic.fighter2,
          thesis: dialectic.thesis,
          roundCount: dialectic.round_count,
          onRoundStart: (roundNumber) => {
            sendEvent('round-start', { roundNumber })
          },
          onFighter1Chunk: (chunk) => {
            sendEvent('fighter1-chunk', { chunk })
          },
          onFighter2Chunk: (chunk) => {
            sendEvent('fighter2-chunk', { chunk })
          },
          onRoundComplete: async (roundNumber, fighter1Response, fighter2Response) => {
            // Save round to database
            await supabase.from('rounds').insert({
              dialectic_id: dialecticId,
              round_number: roundNumber,
              fighter1_response: fighter1Response,
              fighter2_response: fighter2Response,
            })

            sendEvent('round-complete', { roundNumber })
          },
          onSynthesisStart: () => {
            sendEvent('synthesis-start', {})
          },
          onSynthesisComplete: async (syntheses) => {
            // Save syntheses to database
            const synthesisRecords = syntheses.map((s) => ({
              dialectic_id: dialecticId,
              ...s,
            }))

            await supabase.from('syntheses').insert(synthesisRecords)

            sendEvent('synthesis-complete', { syntheses })
          },
        })

        // Update status to complete
        await supabase
          .from('dialectics')
          .update({
            status: 'complete',
            completed_at: new Date().toISOString(),
          })
          .eq('id', dialecticId)

        sendEvent('complete', { status: 'complete' })
        controller.close()
      } catch (error) {
        console.error('Error generating dialectic:', error)

        await supabase.from('dialectics').update({ status: 'failed' }).eq('id', dialecticId)

        sendEvent('error', {
          error: error instanceof Error ? error.message : 'Unknown error',
        })
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}

