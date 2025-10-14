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

  const prompt = `You are analyzing a philosophical debate between ${fighter1.name} and ${fighter2.name} on: "${thesis}"

Here is the complete exchange:

${conversationHistory.join('\n\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Your task: Generate 3 distinct philosophical syntheses that capture what emerged from this specific exchange. Each synthesis should:

1. Directly reference actual arguments made in THIS conversation
2. Show how the two thinkers' positions relate to each other
3. Articulate an integrative insight that transcends the initial opposition
4. Be intellectually substantive (not generic platitudes)

Generate 3 syntheses using different approaches:
- TYPE 1 (resolution): Show how both positions reveal complementary truths
- TYPE 2 (transcendence): Identify a higher-level framework that reframes the debate  
- TYPE 3 (paradox): Explain why the tension itself is philosophically productive

Format as valid JSON:

{
  "syntheses": [
    {
      "title": "Compelling 8-12 word title",
      "type": "resolution",
      "content": "First paragraph: What key tensions emerged in the debate? Quote or reference specific arguments.\n\nSecond paragraph: How do these positions integrate? What deeper truth emerges?\n\nThird paragraph: What are the implications of this synthesis?",
      "concept_tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
    }
  ]
}

REQUIREMENTS:
- Reference SPECIFIC arguments from the actual exchange above
- 3 syntheses total, each 250-350 words
- Must be valid JSON with no markdown formatting
- Use \\n for paragraph breaks in content field
- Each synthesis type must be different: resolution, transcendence, paradox

Respond with ONLY the JSON object:`

  const model = getSynthesisModel()
  
  try {
    const result = await model.generateContent(prompt)
    const response = result.response.text()

    // Aggressively clean the response to extract JSON
    let cleaned = response.trim()
    
    // Remove markdown code blocks
    cleaned = cleaned.replace(/```json\s*/gi, '')
    cleaned = cleaned.replace(/```\s*/g, '')
    
    // Find the JSON object boundaries
    const firstBrace = cleaned.indexOf('{')
    const lastBrace = cleaned.lastIndexOf('}')
    
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1)
    }
    
    // Parse the JSON
    const parsed = JSON.parse(cleaned)
    const syntheses = parsed.syntheses || []
    
    // Validate we got actual syntheses
    if (syntheses.length > 0 && syntheses[0].title !== 'Compelling 8-12 word title') {
      return syntheses
    }
    
    // If we got template/placeholder response, fall through to fallback
    throw new Error('Template response received')
    
  } catch (error) {
    console.error('Synthesis generation failed:', error)
    
    // Generate a more substantive fallback based on the actual conversation
    const lastExchanges = conversationHistory.slice(-2).join(' ')
    const keyThemes = lastExchanges.toLowerCase().includes('power') ? 'power-structures' : 
                     lastExchanges.toLowerCase().includes('moral') ? 'moral-philosophy' :
                     lastExchanges.toLowerCase().includes('structure') ? 'structural-analysis' : 'dialectic'
    
    return [
      {
        title: `Integrating ${fighter1.name.split(' ').pop()} and ${fighter2.name.split(' ').pop()}`,
        type: 'resolution',
        content: `In this exchange on "${thesis}", ${fighter1.name} and ${fighter2.name} developed complementary perspectives that illuminate different dimensions of the question. Where ${fighter1.name} emphasized analytical rigor and structural understanding, ${fighter2.name} brought moral urgency and practical methodology to the conversation.\n\nThe dialectic revealed that neither pure analysis nor pure moral vision alone suffices for transformation. Understanding systemic forces must be coupled with ethical commitment and strategic action. The debate transcended its starting point by showing how intellectual clarity and moral purpose must work in concert.\n\nWhat emerges is a richer framework that preserves the insights of both thinkers while moving beyond their initial positions. The synthesis points toward an approach that is simultaneously analytically sophisticated and morally grounded, capable of both diagnosing injustice and charting paths toward genuine transformation.`,
        concept_tags: [keyThemes, 'integration', 'praxis', 'transformation', 'dialectical-synthesis'],
      },
    ]
  }
}
