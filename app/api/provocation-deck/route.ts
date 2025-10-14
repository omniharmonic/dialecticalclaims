import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createServerClient()

    const { data: provocations, error } = await supabase
      .from('provocation_deck')
      .select('*')
      .order('domain')
      .order('thesis')

    if (error) {
      // Error fetching provocation deck
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ provocations: provocations || [] })
  } catch (error) {
    // Error in provocation deck API
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

