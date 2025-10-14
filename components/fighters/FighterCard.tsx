'use client'

import { Fighter } from '@/types/database'
import { cn } from '@/lib/utils'
import Image from 'next/image'

interface FighterCardProps {
  fighter: Fighter
  selected?: boolean
  disabled?: boolean
  onClick?: () => void
}

export function FighterCard({ fighter, selected, disabled, onClick }: FighterCardProps) {
  return (
    <div
      onClick={disabled ? undefined : onClick}
      className={cn(
        'fighter-card cursor-pointer',
        selected && 'selected',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {/* Fighter Portrait - placeholder for now */}
      <div className="w-full aspect-[3/4] bg-muted rounded-md mb-3 overflow-hidden relative">
        {fighter.portrait_url ? (
          <Image 
            src={fighter.portrait_url}
            alt={fighter.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 25vw, 20vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-muted-foreground">
            {fighter.name.charAt(0)}
          </div>
        )}
        {selected && (
          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
            <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center">
              ✓
            </div>
          </div>
        )}
      </div>

      {/* Fighter Info */}
      <div className="space-y-1">
        <h3 className="font-semibold text-sm truncate">{fighter.name}</h3>
        <p className="text-xs text-muted-foreground truncate">{fighter.fighter_name}</p>
        <p className="text-xs text-accent truncate">{fighter.era}</p>
      </div>
    </div>
  )
}

