import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerClient()

    const { data: fighter, error } = await supabase
      .from('fighters')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      // Error fetching fighter
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    return NextResponse.json({ fighter })
  } catch (error) {
    // Error in fighter API
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

