import { getDialecticModel, getSynthesisModel } from './gemini-client'
import { Fighter } from '@/types/database'

interface GenerateDialecticOptions {
  fighter1: Fighter
  fighter2: Fighter
  thesis: string
  roundCount: number
  onRoundStart: (roundNumber: number) => void
  onFighter1Chunk: (chunk: string) => void
  onFighter2Chunk: (chunk: string) => void
  onRoundComplete: (
    roundNumber: number,
    fighter1Response: string,
    fighter2Response: string
  ) => Promise<void>
  onSynthesisStart: () => void
  onSynthesisComplete: (syntheses: any[]) => Promise<void>
}

export async function generateDialectic(options: GenerateDialecticOptions) {
  const {
    fighter1,
    fighter2,
    thesis,
    roundCount,
    onRoundStart,
    onFighter1Chunk,
    onFighter2Chunk,
    onRoundComplete,
    onSynthesisStart,
    onSynthesisComplete,
  } = options

  const conversationHistory: string[] = []

  // Generate each round with ascending dialectical spiral
  for (let roundNum = 1; roundNum <= roundCount; roundNum++) {
    onRoundStart(roundNum)

    // Determine dialectical move for each fighter in this round
    const { fighter1Move, fighter2Move } = getDialecticalMoves(roundNum)

    // Fighter 1 response
    const fighter1Response = await generateFighterResponse({
      fighter: fighter1,
      opponentName: fighter2.name,
      originalThesis: thesis,
      conversationHistory,
      roundNumber: roundNum,
      totalRounds: roundCount,
      dialecticalMove: fighter1Move,
      onChunk: onFighter1Chunk,
    })

    conversationHistory.push(`${fighter1.name}: ${fighter1Response}`)

    // Fighter 2 response
    const fighter2Response = await generateFighterResponse({
      fighter: fighter2,
      opponentName: fighter1.name,
      originalThesis: thesis,
      conversationHistory,
      roundNumber: roundNum,
      totalRounds: roundCount,
      dialecticalMove: fighter2Move,
      onChunk: onFighter2Chunk,
    })

    conversationHistory.push(`${fighter2.name}: ${fighter2Response}`)

    // Save round
    await onRoundComplete(roundNum, fighter1Response, fighter2Response)
  }

  // Generate final syntheses
  onSynthesisStart()
  const syntheses = await generateSyntheses({
    thesis,
    fighter1,
    fighter2,
    conversationHistory,
  })

  await onSynthesisComplete(syntheses)
}

type DialecticalMove = 
  | 'initial-thesis' 
  | 'expose-contradictions' 
  | 'synthesis-response'
  | 'new-thesis'
  | 'final-position'

// Determine dialectical moves for the round
function getDialecticalMoves(roundNum: number): {
  fighter1Move: DialecticalMove
  fighter2Move: DialecticalMove
} {
  if (roundNum === 1) {
    return {
      fighter1Move: 'initial-thesis',
      fighter2Move: 'expose-contradictions',
    }
  }
  
  // Alternate the thesis-proposer role
  // Odd rounds: Fighter 1 synthesizes/proposes, Fighter 2 critiques
  // Even rounds: Fighter 2 synthesizes/proposes, Fighter 1 critiques
  const isOddRound = roundNum % 2 === 1
  
  return {
    fighter1Move: isOddRound ? 'synthesis-response' : 'expose-contradictions',
    fighter2Move: isOddRound ? 'expose-contradictions' : 'new-thesis',
  }
}

interface GenerateFighterResponseOptions {
  fighter: Fighter
  opponentName: string
  originalThesis: string
  conversationHistory: string[]
  roundNumber: number
  totalRounds: number
  dialecticalMove: DialecticalMove
  onChunk: (chunk: string) => void
}

async function generateFighterResponse(
  options: GenerateFighterResponseOptions
): Promise<string> {
  const {
    fighter,
    opponentName,
    originalThesis,
    conversationHistory,
    roundNumber,
    totalRounds,
    dialecticalMove,
    onChunk,
  } = options

  // Build the prompt - keep it natural and conversational
  let prompt = `${fighter.system_prompt}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ROUND ${roundNumber} OF ${totalRounds}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

THESIS UNDER DEBATE: "${originalThesis}"
YOUR OPPONENT: ${opponentName}

`

  if (conversationHistory.length > 0) {
    const recentHistory = conversationHistory.slice(-4)
    prompt += `━━━ CONVERSATION SO FAR ━━━

${recentHistory.map((exchange, i) => {
  const exchangeNum = conversationHistory.length - recentHistory.length + i + 1
  return `[${exchangeNum}] ${exchange}`
}).join('\n\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

`
  }

  // Generate move-specific instructions that guide without being heavy-handed
  switch (dialecticalMove) {
    case 'initial-thesis':
      prompt += `This is the opening of the exchange. Stake your claim on this thesis clearly and passionately. What do you think about it? Why? Draw on your philosophical commitments and make your position compelling.

Respond as yourself - not as a narrator of the dialectic, but as a thinker engaging with this provocative claim.

Length: 2-3 paragraphs`
      break

    case 'expose-contradictions':
      prompt += `Your opponent just made their case. Now it's your turn to respond.

What's wrong with what they just said? Where do you disagree? What have they overlooked or assumed? What problems do you see in their reasoning? Be sharp and precise in your critique.

Don't hold back - this is philosophical combat. But engage with their actual arguments, not straw men.

Length: 2-3 paragraphs`
      break

    case 'synthesis-response':
      prompt += `Your opponent just challenged your position. How do you respond?

Maybe they have a point - or maybe they're revealing something deeper. Can you address their critique while advancing your own understanding? Push the conversation forward by engaging seriously with what they said.

Think deeply and respond authentically to where the conversation has gone.

Length: 3-4 paragraphs`
      break

    case 'new-thesis':
      prompt += `Building on what's been said, where do you think we should go from here?

Your opponent made some moves. What new questions or problems does this open up? How has the conversation evolved the original question? Take the discussion in a new direction.

Length: 2-3 paragraphs`
      break

    case 'final-position':
      prompt += `This is your final chance to speak. Looking back at this whole exchange, what's your considered position now?

The conversation has covered a lot of ground. Where has it taken you? What do you think after really wrestling with this question and your opponent's challenges?

Be honest about what you've learned and where you stand.

Length: 3-4 paragraphs`
      break
  }

  prompt += `

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
YOUR RESPONSE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`

  // Stream response
  const model = getDialecticModel()
  
  try {
    const result = await model.generateContentStream(prompt)

    let fullResponse = ''
    for await (const chunk of result.stream) {
      const chunkText = chunk.text()
      fullResponse += chunkText
      onChunk(chunkText)
    }

    return fullResponse
  } catch (error: any) {
    // Handle safety filter blocks
    if (error.message?.includes('SAFETY')) {
      // Safety filter triggered, generating alternate response
      const fallback = generateFallbackResponse(fighter, originalThesis, dialecticalMove, opponentName)
      onChunk(fallback)
      return fallback
    }
    throw error
  }
}

function generateFallbackResponse(
  fighter: Fighter,
  originalThesis: string,
  move: DialecticalMove,
  opponentName: string
): string {
  switch (move) {
    case 'initial-thesis':
      return `The question of "${originalThesis}" is fascinating. From my perspective, we need to carefully examine what this claim really means and what it assumes. Let me lay out where I stand on this.`
    
    case 'expose-contradictions':
      return `${opponentName}, I think there's a problem with your position. You're making some assumptions here that don't quite hold up. Let me push back on what you're saying.`
    
    case 'synthesis-response':
      return `You raise an important point, ${opponentName}. I don't think it undermines my position, but it does reveal something deeper at stake here. Let me address what you're getting at and explain why this actually moves us forward.`
    
    case 'new-thesis':
      return `Looking at where we've gone so far, I think we need to reconsider the question itself. The exchange has revealed new dimensions to this problem that weren't apparent at first. Here's what I think we should be asking now.`
    
    case 'final-position':
      return `After this whole exchange, here's where I stand. We've covered a lot of ground, and I think both of us have sharpened our positions. The question is richer and more complex than it first appeared.`
  }
}

interface GenerateSynthesesOptions {
  thesis: string
  fighter1: Fighter
  fighter2: Fighter
  conversationHistory: string[]
}

async function generateSyntheses(options: GenerateSynthesesOptions): Promise<any[]> {
  const { thesis, fighter1, fighter2, conversationHistory } = options

  const prompt = `You are an expert at Hegelian dialectical synthesis. You have observed a rigorous philosophical dialectic between ${fighter1.name} and ${fighter2.name} on the thesis: "${thesis}"

The dialectic has followed the pattern of thesis → antithesis (exposing contradictions) → synthesis → new thesis, spiraling upward through multiple rounds.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMPLETE DIALECTICAL TRANSCRIPT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${conversationHistory.join('\n\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SYNTHESIS GENERATION TASK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Generate 3-4 DISTINCT final synthesis candidates that represent the ultimate Aufhebung of this entire dialectical process.

Each synthesis should employ a different integrative strategy:

1. **RESOLUTION**: Show how both positions were partial truths pointing toward a more comprehensive whole. The synthesis PRESERVES what was true in each, NEGATES what was limited, and ELEVATES to higher unity. Demonstrate how the contradictions were only apparent, revealing deeper consonance.

2. **SUBSUMPTION**: One philosophical framework actually CONTAINS the other when properly understood. Show how one position operates at a more fundamental level, and the apparent opposition is really a difference in scope or abstraction. The synthesis shows how one tradition subsumes the insights of the other.

3. **TRANSCENDENCE**: The entire thesis-antithesis framework itself must be transcended. The original question was ILL-FORMED or operated within a limited paradigm. Propose radically NEW GROUND that makes the original opposition obsolete. Move to a different conceptual level entirely where new questions emerge.

4. **PRODUCTIVE PARADOX**: The contradiction should be HELD IN TENSION rather than resolved. Show how the opposition itself is GENERATIVE and any premature resolution would lose something essential. Both-and rather than either-or. The dialectical tension itself IS the truth, not something to be overcome.

For each synthesis:
- **title**: Profound philosophical title (45-65 characters, e.g., "The Dialectic of Freedom and Necessity")
- **type**: Exactly one of: "resolution", "subsumption", "transcendence", "paradox" (lowercase)
- **content**: 2-3 rich paragraphs (250-400 words) that:
  * Acknowledge the full arc of the dialectical process
  * Show deep engagement with specific arguments from the exchange
  * Articulate the synthesis clearly and powerfully
  * Demonstrate philosophical sophistication
  * Explain WHY this synthesis is compelling and how it represents Aufhebung
- **concept_tags**: 4-7 philosophical concepts (lowercase, hyphenated, e.g., ["dialectical-materialism", "negation", "aufhebung", "totality", "mediation"])

CRITICAL REQUIREMENTS:
- Each synthesis must represent a GENUINELY DIFFERENT path to integration
- Reference SPECIFIC MOVES from the actual dialectical exchange
- Write at the highest philosophical level
- Show how each synthesis PRESERVES, NEGATES, and ELEVATES (Aufhebung)
- Make each synthesis substantive and insightful, not generic
- NO escape sequences in content (use actual paragraph breaks, not \\n)

Respond with ONLY valid JSON:

{
  "syntheses": [
    {
      "title": "Beyond the Subject-Object Dichotomy",
      "type": "transcendence",
      "content": "First substantial paragraph analyzing the dialectical process and what it revealed.

Second paragraph articulating the synthesis and why it transcends the original opposition.

Optional third paragraph showing implications and deeper significance.",
      "concept_tags": ["subject-object", "dialectical-negation", "transcendence", "mediation", "totality"]
    }
  ]
}

RESPOND WITH ONLY THE JSON. NO MARKDOWN. NO CODE BLOCKS. NO EXPLANATIONS. JUST THE JSON OBJECT.`

  const model = getSynthesisModel()
  const result = await model.generateContent(prompt)
  const response = result.response.text()

  // Aggressively clean the response
  let cleaned = response.trim()
  cleaned = cleaned.replace(/```json\s*/g, '')
  cleaned = cleaned.replace(/```\s*/g, '')
  cleaned = cleaned.replace(/^[^{]*/, '') // Remove anything before first {
  cleaned = cleaned.replace(/[^}]*$/, '') // Remove anything after last }
  
  // Fix common JSON issues
  cleaned = cleaned.replace(/\\n/g, '\n')
  cleaned = cleaned.replace(/\n\s*\n/g, '\n\n')

  try {
    const parsed = JSON.parse(cleaned)
    return parsed.syntheses || []
  } catch (error) {
    // Failed to parse synthesis JSON
    // Response was: [cleaned]

    // Fallback synthesis reflecting the dialectical process
    return [
      {
        title: 'The Dialectical Unfolding of Truth',
        type: 'resolution',
        content: `Through their exchange on "${thesis}", ${fighter1.name} and ${fighter2.name} have enacted a genuine dialectical process. Each moment of negation revealed new dimensions of the question, and each synthesis opened new ground for inquiry.

What emerges is not a simple compromise but a transformed understanding that incorporates the insights of both traditions while transcending their original limitations. The process itself demonstrates how philosophical truth emerges through opposition, negation, and synthesis—through the very structure of dialectical combat.`,
        concept_tags: ['dialectic', 'negation', 'synthesis', 'aufhebung', 'philosophical-combat'],
      },
    ]
  }
}
