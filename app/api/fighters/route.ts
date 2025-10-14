import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

// Disable caching for this API route
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const supabase = createServerClient()

    const { data: fighters, error } = await supabase
      .from('fighters')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error fetching fighters:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ fighters })
  } catch (error) {
    console.error('Error in fighters API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

