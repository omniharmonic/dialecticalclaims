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

  // Build dialectically-structured prompt
  let prompt = `${fighter.system_prompt}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DIALECTICAL COMBAT: ROUND ${roundNumber} OF ${totalRounds}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ORIGINAL THESIS: "${originalThesis}"
YOUR OPPONENT: ${opponentName}
YOUR DIALECTICAL ROLE THIS ROUND: ${dialecticalMove.toUpperCase().replace(/-/g, ' ')}

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

  // Generate move-specific instructions
  switch (dialecticalMove) {
    case 'initial-thesis':
      prompt += `━━━ YOUR TASK: ESTABLISH INITIAL THESIS ━━━

You are presenting the OPENING POSITION in this dialectical exchange.

YOUR MANDATE:
1. Take a clear, definitive stance on the original thesis
2. State whether you AFFIRM, DENY, or COMPLICATE it
3. Ground your position in your philosophical framework
4. Articulate the key principles at stake
5. Provide compelling reasons for your position

CRITICAL: Be bold and clear. Your opponent will expose contradictions in what you say, so make your position coherent and defensible. This is the foundation upon which the entire dialectic will build.

Length: 2-3 substantial paragraphs
Tone: Assertive, philosophically rigorous, establishing your ground`
      break

    case 'expose-contradictions':
      prompt += `━━━ YOUR TASK: EXPOSE CONTRADICTIONS ━━━

Your opponent has just presented their position. Your role is to CRITICALLY ANALYZE it.

YOUR MANDATE:
1. Identify INTERNAL CONTRADICTIONS in their argument
2. Reveal UNEXAMINED ASSUMPTIONS they're making
3. Show where their reasoning BREAKS DOWN
4. Point to IMPLICATIONS they haven't considered
5. Expose the LIMITS of their framework

IMPORTANT: You're not just disagreeing - you're showing where their own logic undermines itself, where they've smuggled in premises, where contradictions lurk. This is philosophical surgery: precise, revealing, devastating.

Don't offer your own complete alternative yet - focus on exposing the problems in what they've said. The contradictions you reveal will set up the next move in the dialectic.

Length: 2-3 substantial paragraphs
Tone: Incisive, analytical, revealing hidden tensions`
      break

    case 'synthesis-response':
      prompt += `━━━ YOUR TASK: SYNTHESIS & RESPONSE ━━━

Your opponent has exposed contradictions in the previous position. You must now RESPOND to these contradictions through SYNTHESIS.

YOUR MANDATE:
1. ACKNOWLEDGE the contradictions your opponent identified
2. Show how these contradictions point to DEEPER TRUTHS
3. INTEGRATE the valid insights from both positions
4. Propose a HIGHER-LEVEL understanding that resolves or transforms the contradiction
5. Establish a NEW POSITION that builds upon what came before

This is Hegelian Aufhebung: you PRESERVE what was true in both thesis and critique, NEGATE what was limited or false, and ELEVATE to a higher level of understanding. Your synthesis becomes the new thesis for the next round.

CRITICAL: Don't just defend yourself - transcend the opposition by showing how the contradiction itself reveals something important. Move the conversation forward and upward.

Length: 3-4 substantial paragraphs
Tone: Integrative yet advancing, philosophically sophisticated`
      break

    case 'new-thesis':
      prompt += `━━━ YOUR TASK: PROPOSE NEW THESIS ━━━

Building on your opponent's synthesis, you must now propose a NEW THESIS that advances the dialectic.

YOUR MANDATE:
1. ACCEPT the synthesis as a genuine advance in understanding
2. But identify NEW QUESTIONS or PROBLEMS that emerge at this higher level
3. Propose a TRANSFORMED VERSION of the original thesis
4. Show how the dialectical process has REFINED our understanding
5. Establish NEW GROUND for the next phase of the dialectic

You're not going back to your original position - you're proposing something NEW that incorporates what we've learned but pushes beyond it. The dialectic spirals upward, and you're opening the next turn of the spiral.

Think: "Yes, AND..." or "Precisely because of this synthesis, we must now consider..."

Length: 2-3 substantial paragraphs
Tone: Advancing, building upon progress, opening new territory`
      break

    case 'final-position':
      prompt += `━━━ YOUR TASK: ARTICULATE FINAL POSITION ━━━

This is the final round. Bring the dialectical process to its culmination.

YOUR MANDATE:
1. Survey the ENTIRE DIALECTICAL JOURNEY
2. Articulate your FINAL POSITION after this process of negation and synthesis
3. Show what we've LEARNED through the dialectical process
4. Identify remaining TENSIONS or QUESTIONS
5. Point toward what ULTIMATE SYNTHESIS might look like

You're not "winning" the argument - you're showing how the dialectical process has transformed understanding. Acknowledge the power of what your opponent has contributed. Show how the original thesis has been sublated into something richer.

Length: 3-4 substantial paragraphs
Tone: Culminating, reflective, philosophically mature`
      break
  }

  if (roundNumber === totalRounds) {
    prompt += `

━━━ FINAL ROUND REMINDER ━━━
This is the last exchange. Make your ultimate contribution to the dialectic. What has this process revealed? Where does it point?`
  }

  prompt += `

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RESPOND NOW AS ${fighter.name.toUpperCase()}:
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
      console.log('Safety filter triggered, generating alternate response...')
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
      return `As ${fighter.name}, I must establish my position on "${originalThesis}". My philosophical framework approaches this question through careful analysis of its underlying assumptions and implications. I believe we must examine this claim rigorously.`
    
    case 'expose-contradictions':
      return `${opponentName}'s position, while compelling, contains certain tensions that bear examination. The framework they've established makes assumptions that may not withstand scrutiny. We must probe these foundational commitments more carefully.`
    
    case 'synthesis-response':
      return `The contradictions ${opponentName} has identified are indeed significant. However, I believe these tensions point toward a deeper understanding. By integrating both perspectives, we can arrive at a more comprehensive view that preserves what is valuable in each position while transcending their limitations.`
    
    case 'new-thesis':
      return `Building upon this synthesis, I propose we must now consider how this transformed understanding opens new questions. The dialectical process has refined our grasp of the original thesis, revealing dimensions we hadn't initially considered.`
    
    case 'final-position':
      return `Through this dialectical exchange, we have traced a path from the original thesis through critique and synthesis. What emerges is a richer understanding that incorporates the insights each position has contributed to the dialogue.`
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
    console.error('Failed to parse synthesis JSON:', error)
    console.error('Response was:', cleaned)

    // Fallback synthesis reflecting the dialectical process
    return [
      {
        title: 'The Dialectical Unfolding of Truth',
        type: 'resolution',
        content: `Through their exchange on "${originalThesis}", ${fighter1.name} and ${fighter2.name} have enacted a genuine dialectical process. Each moment of negation revealed new dimensions of the question, and each synthesis opened new ground for inquiry.

What emerges is not a simple compromise but a transformed understanding that incorporates the insights of both traditions while transcending their original limitations. The process itself demonstrates how philosophical truth emerges through opposition, negation, and synthesis—through the very structure of dialectical combat.`,
        concept_tags: ['dialectic', 'negation', 'synthesis', 'aufhebung', 'philosophical-combat'],
      },
    ]
  }
}
