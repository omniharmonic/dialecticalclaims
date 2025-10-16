import { createServerClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const dialecticId = params.id

  try {
    const supabase = createServerClient()

    // Check if dialectic exists and is complete
    const { data: dialectic, error: fetchError } = await supabase
      .from('dialectics')
      .select('id, status, archived_at')
      .eq('id', dialecticId)
      .single()

    if (fetchError || !dialectic) {
      return Response.json(
        { error: 'Dialectic not found' },
        { status: 404 }
      )
    }

    const dialecticData = dialectic as any

    if (dialecticData.status !== 'complete') {
      return Response.json(
        { error: 'Cannot archive incomplete dialectic' },
        { status: 400 }
      )
    }

    if (dialecticData.archived_at) {
      return Response.json(
        { error: 'Dialectic is already archived' },
        { status: 409 }
      )
    }

    // Archive the dialectic
    const { error: updateError } = await (supabase as any)
      .from('dialectics')
      .update({ archived_at: new Date().toISOString() })
      .eq('id', dialecticId)

    if (updateError) {
      console.error('Error archiving dialectic:', updateError)
      return Response.json(
        { error: 'Failed to archive dialectic' },
        { status: 500 }
      )
    }

    return Response.json({
      success: true,
      message: 'Dialectic archived successfully'
    })

  } catch (error) {
    console.error('Archive endpoint error:', error)
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const dialecticId = params.id

  try {
    const supabase = createServerClient()

    // Unarchive the dialectic
    const { error: updateError } = await (supabase as any)
      .from('dialectics')
      .update({ archived_at: null })
      .eq('id', dialecticId)

    if (updateError) {
      console.error('Error unarchiving dialectic:', updateError)
      return Response.json(
        { error: 'Failed to unarchive dialectic' },
        { status: 500 }
      )
    }

    return Response.json({
      success: true,
      message: 'Dialectic unarchived successfully'
    })

  } catch (error) {
    console.error('Unarchive endpoint error:', error)
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}