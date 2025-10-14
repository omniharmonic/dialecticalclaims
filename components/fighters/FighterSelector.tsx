'use client'

import { useState } from 'react'
import { Fighter } from '@/types/database'
import { FighterCard } from './FighterCard'
import { Button } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'

interface FighterSelectorProps {
  fighters: Fighter[]
}

export function FighterSelector({ fighters }: FighterSelectorProps) {
  const router = useRouter()
  const [fighter1, setFighter1] = useState<Fighter | null>(null)
  const [fighter2, setFighter2] = useState<Fighter | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEra, setSelectedEra] = useState<string>('')
  const [selectedTradition, setSelectedTradition] = useState<string>('')

  // Safety check for fighters array
  const safeFighters = fighters || []

  // Get unique eras and traditions
  const eras = Array.from(new Set(safeFighters.map((f) => f.era))).sort()
  const traditions = Array.from(
    new Set(safeFighters.flatMap((f) => f.tradition))
  ).sort()

  // Filter fighters
  const filteredFighters = safeFighters.filter((fighter) => {
    const matchesSearch = fighter.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
    const matchesEra = !selectedEra || fighter.era === selectedEra
    const matchesTradition =
      !selectedTradition || fighter.tradition.includes(selectedTradition)
    return matchesSearch && matchesEra && matchesTradition
  })

  const handleFighterClick = (fighter: Fighter) => {
    if (!fighter1) {
      setFighter1(fighter)
    } else if (!fighter2 && fighter.id !== fighter1.id) {
      setFighter2(fighter)
    } else if (fighter1 && fighter.id === fighter1.id) {
      setFighter1(null)
      if (fighter2) {
        setFighter1(fighter2)
        setFighter2(null)
      }
    } else if (fighter2 && fighter.id === fighter2.id) {
      setFighter2(null)
    }
  }

  const canProceed = fighter1 && fighter2

  const handleProceed = () => {
    if (fighter1 && fighter2) {
      // Store selection in sessionStorage for the thesis page
      sessionStorage.setItem(
        'selectedFighters',
        JSON.stringify({
          fighter1: fighter1.id,
          fighter2: fighter2.id,
        })
      )
      router.push('/thesis')
    }
  }

  // Show loading state if no fighters yet
  if (safeFighters.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading fighters...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Selected Fighters Display */}
      <div className="flex items-center justify-center gap-4 md:gap-8">
        <div className="w-32 md:w-48">
          {fighter1 ? (
            <div className="relative">
              <FighterCard
                fighter={fighter1}
                selected
                onClick={() => setFighter1(null)}
              />
              <div className="mt-2 text-center">
                <span className="text-xs font-semibold text-primary">
                  FIGHTER 1
                </span>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-border rounded-lg p-4 h-48 md:h-64 flex flex-col items-center justify-center text-center">
              <span className="text-sm text-muted-foreground">
                Select Fighter 1
              </span>
            </div>
          )}
        </div>

        <div className="text-3xl md:text-4xl font-bold text-primary">VS</div>

        <div className="w-32 md:w-48">
          {fighter2 ? (
            <div className="relative">
              <FighterCard
                fighter={fighter2}
                selected
                onClick={() => setFighter2(null)}
              />
              <div className="mt-2 text-center">
                <span className="text-xs font-semibold text-primary">
                  FIGHTER 2
                </span>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-border rounded-lg p-4 h-48 md:h-64 flex flex-col items-center justify-center text-center">
              <span className="text-sm text-muted-foreground">
                Select Fighter 2
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Proceed Button */}
      {canProceed && (
        <div className="flex justify-center py-4">
          <Button size="lg" onClick={handleProceed} className="px-8">
            Choose Thesis →
          </Button>
        </div>
      )}

      {/* Filters */}
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Search fighters by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />

        <div className="flex flex-wrap gap-2">
          <select
            value={selectedEra}
            onChange={(e) => setSelectedEra(e.target.value)}
            className="px-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Eras</option>
            {eras.map((era) => (
              <option key={era} value={era}>
                {era}
              </option>
            ))}
          </select>

          <select
            value={selectedTradition}
            onChange={(e) => setSelectedTradition(e.target.value)}
            className="px-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Traditions</option>
            {traditions.map((tradition) => (
              <option key={tradition} value={tradition}>
                {tradition}
              </option>
            ))}
          </select>

          {(searchTerm || selectedEra || selectedTradition) && (
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedEra('')
                setSelectedTradition('')
              }}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
            >
              Clear Filters
            </button>
          )}
        </div>

        <p className="text-sm text-muted-foreground">
          Showing {filteredFighters.length} of {safeFighters.length} fighters
        </p>
      </div>

      {/* Fighter Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
        {filteredFighters.map((fighter) => (
          <FighterCard
            key={fighter.id}
            fighter={fighter}
            selected={
              fighter.id === fighter1?.id || fighter.id === fighter2?.id
            }
            disabled={
              !!(fighter1 &&
              fighter2 &&
              fighter.id !== fighter1.id &&
              fighter.id !== fighter2.id)
            }
            onClick={() => handleFighterClick(fighter)}
          />
        ))}
      </div>

      {filteredFighters.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No fighters found matching your criteria.
          </p>
        </div>
      )}
    </div>
  )
}

