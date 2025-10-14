'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Fighter, ProvocationDeck } from '@/types/database'
import { ThesisSelector } from '@/components/thesis/ThesisSelector'

export default function ThesisPage() {
  const router = useRouter()
  const [fighter1, setFighter1] = useState<Fighter | null>(null)
  const [fighter2, setFighter2] = useState<Fighter | null>(null)
  const [provocationDeck, setProvocationDeck] = useState<ProvocationDeck[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      // Get selected fighters from sessionStorage
      const selectedFightersStr = sessionStorage.getItem('selectedFighters')
      if (!selectedFightersStr) {
        router.push('/fighters')
        return
      }

      const { fighter1: f1Id, fighter2: f2Id } = JSON.parse(selectedFightersStr)

      try {
        // Fetch both fighters
        const [f1Response, f2Response, provResponse] = await Promise.all([
          fetch(`/api/fighters/${f1Id}`),
          fetch(`/api/fighters/${f2Id}`),
          fetch('/api/provocation-deck'),
        ])

        const f1Data = await f1Response.json()
        const f2Data = await f2Response.json()
        const provData = await provResponse.json()

        setFighter1(f1Data.fighter)
        setFighter2(f2Data.fighter)
        setProvocationDeck(provData.provocations || [])
      } catch (error) {
        // Error loading data
        router.push('/fighters')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [router])

  if (isLoading) {
    return (
      <div className="arena-container min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!fighter1 || !fighter2) {
    return null
  }

  return (
    <div className="arena-container min-h-screen">
      <div className="container mx-auto px-4 py-8 md:py-16 max-w-4xl">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-4xl md:text-5xl font-bold font-serif mb-4">Choose Your Thesis</h1>
          <p className="text-lg text-muted-foreground">
            Define the philosophical claim that will spark the dialectical duel
          </p>
        </div>

        <ThesisSelector
          fighter1={fighter1}
          fighter2={fighter2}
          provocationDeck={provocationDeck}
        />
      </div>
    </div>
  )
}

