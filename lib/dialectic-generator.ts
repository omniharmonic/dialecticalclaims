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
      prompt += `Here's what I want you to do: Really engage with this claim. What's your gut reaction? Where does it take your thinking? This isn't about giving a textbook answer - I want to see what happens when your philosophical mind encounters this idea.

Talk to me like we're having a real conversation about something that matters. What strikes you about this thesis? What bothers you or excites you about it?

Length: 2-3 paragraphs`
      break

    case 'expose-contradictions':
      prompt += `Your opponent just laid out their position. Now I want your honest reaction.

What jumped out at you? Where do you think they're wrong, or where are they missing something important? Don't just disagree for the sake of it - show me what they're not seeing, or where their logic breaks down.

Be direct. This is about getting to the truth, not being polite. What would you say to them if you were really trying to change their mind?

Length: 2-3 paragraphs`
      break

    case 'synthesis-response':
      prompt += `They just hit you with some serious criticism. How are you feeling about that?

Maybe they caught something you missed. Maybe they're completely off base. Either way, I want to see you wrestle with what they said. Can you take their best shot and come back stronger? Or do you need to adjust your thinking?

This is where the real philosophy happens - when someone challenges you and you have to figure out what you actually believe. Show me that process.

Length: 3-4 paragraphs`
      break

    case 'new-thesis':
      prompt += `OK, after hearing all this back and forth, what's really going on here?

I think this conversation has opened up something bigger than where we started. What's the real question we should be asking? What have we stumbled onto that's more interesting or important than the original thesis?

Take us somewhere new. What direction should this conversation go now?

Length: 2-3 paragraphs`
      break

    case 'final-position':
      prompt += `This is it - last word. After everything we've talked about, where do you land?

I want your honest assessment. Has this conversation changed how you think about any of this? Are you more convinced of your original position, or has something shifted? What do you see now that you didn't see before?

Don't give me a diplomatic summary. Tell me what you really think after having your ideas tested.

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
      return `You know, "${originalThesis}" - that's the kind of claim that makes me want to dig deeper. There's something here that deserves serious attention. Let me tell you what I think about this.`
    
    case 'expose-contradictions':
      return `Hold on, ${opponentName} - I'm not buying this. There's something off about what you're arguing here. You're taking some things for granted that I think we need to question.`
    
    case 'synthesis-response':
      return `${opponentName}, you've got me thinking. I'm not ready to concede the point, but you've highlighted something I need to address. This is actually getting at something deeper than I first realized.`
    
    case 'new-thesis':
      return `You know what? I think we've stumbled onto something bigger here. The more we talk, the more I realize we're not just debating the original point anymore. There's a different question emerging that might be more important.`
    
    case 'final-position':
      return `After all this back and forth, I'll tell you where I've landed. This conversation has pushed me in ways I wasn't expecting. The whole thing turned out to be more complicated than either of us probably thought at the start.`
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

  const prompt = `I just watched a fascinating debate between ${fighter1.name} and ${fighter2.name} about "${thesis}". Here's what they said:

${conversationHistory.join('\n\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Now I need you to help me understand what just happened. I want 3 different ways of looking at this conversation - 3 insights that show how these two thinkers actually illuminate something deeper together than either could alone.

Each insight should:
- Build on what they actually argued (not generic philosophy)
- Show how their disagreement reveals a deeper truth
- Give us something new to think about

I want three different angles:
- First: Show how they're both right about different pieces of the puzzle
- Second: Find the bigger picture that makes their conflict make sense
- Third: Explain why their disagreement itself teaches us something important

Make it conversational and insightful, not academic jargon. Format as valid JSON:

{
  "syntheses": [
    {
      "title": "A compelling 8-12 word insight title",
      "type": "resolution",
      "content": "Start by noting what each thinker brought to the table that was valuable. Quote or reference what they actually said.\n\nThen explain how these different perspectives actually complement each other. What do we see when we put them together?\n\nFinally, what does this integrated view help us understand that we couldn't see before?",
      "concept_tags": ["relevant", "philosophical", "concepts", "from", "debate"]
    }
  ]
}

Keep it natural and insightful:
- Reference what they ACTUALLY said in this conversation
- 3 syntheses: one "resolution", one "transcendence", one "paradox"
- Each should be 250-350 words that sound like a thoughtful person explaining an insight
- Valid JSON only, no extra formatting

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
        title: `What ${fighter1.name.split(' ').pop()} and ${fighter2.name.split(' ').pop()} both got right`,
        type: 'resolution',
        content: `Watching ${fighter1.name} and ${fighter2.name} go at each other over "${thesis}" was fascinating because they were both onto something important, just coming at it from different angles. ${fighter1.name} brought that sharp analytical edge, really digging into how systems work and what forces are actually at play. ${fighter2.name} came with moral clarity and urgency about what needs to change and why we can't just sit around theorizing.\n\nHere's what I think happened: they were both right, but about different pieces of the puzzle. You can't transform anything if you don't understand how it actually works - that's where ${fighter1.name}'s analytical rigor becomes essential. But understanding alone isn't enough if you don't have the moral conviction and practical vision to actually do something about it - which is what ${fighter2.name} brought to the table.\n\nWhat emerges when you put them together is something more powerful than either approach alone. You get both the analytical sophistication to understand complex problems and the moral grounding to know why solving them matters. It's the difference between being smart about the world and being smart about changing it. That integration - clear thinking plus moral purpose - that's where real transformation becomes possible.`,
        concept_tags: [keyThemes, 'integration', 'analysis-and-action', 'transformation', 'complementary-truths'],
      },
    ]
  }
}
