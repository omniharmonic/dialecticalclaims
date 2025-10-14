'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Fighter, ProvocationDeck } from '@/types/database'
import { useRouter } from 'next/navigation'

interface ThesisSelectorProps {
  fighter1: Fighter
  fighter2: Fighter
  provocationDeck: ProvocationDeck[]
}

export function ThesisSelector({ fighter1, fighter2, provocationDeck }: ThesisSelectorProps) {
  const router = useRouter()
  const [customThesis, setCustomThesis] = useState('')
  const [selectedProvocation, setSelectedProvocation] = useState<string | null>(null)
  const [roundCount, setRoundCount] = useState(5)
  const [isCreating, setIsCreating] = useState(false)

  const thesis = selectedProvocation || customThesis.trim()
  const canProceed = thesis.length >= 10

  const getRandomProvocation = () => {
    if (provocationDeck.length > 0) {
      const randomIndex = Math.floor(Math.random() * provocationDeck.length)
      const randomProv = provocationDeck[randomIndex]
      setSelectedProvocation(randomProv.thesis)
      setCustomThesis('')
    }
  }

  const handleCreateDialectic = async () => {
    if (!canProceed) return

    setIsCreating(true)

    try {
      const response = await fetch('/api/dialectics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fighter1_id: fighter1.id,
          fighter2_id: fighter2.id,
          thesis,
          round_count: roundCount,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create dialectic')
      }

      const data = await response.json()
      router.push(`/arena/${data.dialectic_id}`)
    } catch (error) {
      console.error('Error creating dialectic:', error)
      alert('Failed to create dialectic. Please try again.')
      setIsCreating(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Selected Fighters Summary */}
      <div className="flex items-center justify-center gap-4 p-6 bg-card border border-border rounded-lg">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-1">Fighter 1</p>
          <p className="font-semibold">{fighter1.name}</p>
          <p className="text-xs text-accent">{fighter1.fighter_name}</p>
        </div>
        <div className="text-2xl font-bold text-primary">VS</div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-1">Fighter 2</p>
          <p className="font-semibold">{fighter2.name}</p>
          <p className="text-xs text-accent">{fighter2.fighter_name}</p>
        </div>
      </div>

      {/* Custom Thesis */}
      <Card>
        <CardHeader>
          <CardTitle>Enter Your Own Thesis</CardTitle>
          <CardDescription>
            Craft a philosophical claim or question for the fighters to debate
          </CardDescription>
        </CardHeader>
        <CardContent>
          <textarea
            value={customThesis}
            onChange={(e) => {
              setCustomThesis(e.target.value)
              setSelectedProvocation(null)
            }}
            placeholder='e.g., "Consciousness is fundamentally social" or "Technology extends human capability"'
            className="w-full min-h-[120px] px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
          <p className="text-sm text-muted-foreground mt-2">
            Minimum 10 characters. {customThesis.length}/1000
          </p>
        </CardContent>
      </Card>

      {/* Provocation Deck - Random Generator */}
      <Card>
        <CardHeader>
          <CardTitle>Or Generate Random Thesis</CardTitle>
          <CardDescription>
            Get a philosophical provocation from our curated deck
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            variant="outline" 
            size="lg" 
            onClick={getRandomProvocation}
            className="w-full"
          >
            🎲 Generate Random Thesis
          </Button>
          
          {selectedProvocation && (
            <div className="p-4 rounded-lg border border-primary bg-primary/10">
              <p className="philosophical-text text-base">{selectedProvocation}</p>
              <button
                onClick={() => setSelectedProvocation(null)}
                className="text-xs text-muted-foreground hover:text-foreground mt-2"
              >
                Clear selection
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Round Count */}
      <Card>
        <CardHeader>
          <CardTitle>Number of Rounds</CardTitle>
          <CardDescription>
            More rounds allow for deeper exploration of the thesis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="2"
              max="8"
              value={roundCount}
              onChange={(e) => setRoundCount(parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="text-2xl font-bold w-12 text-center">{roundCount}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Each round consists of a response from both fighters
          </p>
        </CardContent>
      </Card>

      {/* Start Button */}
      <div className="flex justify-center pt-4">
        <Button
          size="lg"
          onClick={handleCreateDialectic}
          disabled={!canProceed || isCreating}
        >
          {isCreating ? 'Creating Dialectic...' : 'Start Duel →'}
        </Button>
      </div>
    </div>
  )
}

