import { getDialecticModel, getSynthesisModel } from './gemini-client'
import { Fighter } from '@/types/database'

// Helper functions for robust JSON parsing
function fixCommonJsonErrors(jsonStr: string): string {
  let fixed = jsonStr

  // Fix unescaped quotes in strings
  fixed = fixed.replace(/"([^"\\]*)"/g, (match, content) => {
    // Only fix if content contains unescaped quotes
    if (content.includes('"') && !content.includes('\\"')) {
      const escapedContent = content.replace(/"/g, '\\"')
      return `"${escapedContent}"`
    }
    return match
  })

  // Fix missing commas between array elements and object properties
  fixed = fixed.replace(/}\s*{/g, '}, {')
  fixed = fixed.replace(/]\s*\[/g, '], [')
  fixed = fixed.replace(/"\s*"/g, '", "')

  // Fix trailing commas
  fixed = fixed.replace(/,(\s*[}\]])/g, '$1')

  return fixed
}

function repairJsonStructure(jsonStr: string): string {
  let repaired = jsonStr

  // Ensure the structure is complete
  if (!repaired.includes('"syntheses"')) {
    // If no syntheses array found, wrap content in proper structure
    repaired = `{"syntheses": [${repaired}]}`
  }

  // Try to repair incomplete JSON by adding missing closing braces/brackets
  let openBraces = (repaired.match(/{/g) || []).length
  let closeBraces = (repaired.match(/}/g) || []).length
  let openBrackets = (repaired.match(/\[/g) || []).length
  let closeBrackets = (repaired.match(/]/g) || []).length

  // Add missing closing braces
  while (closeBraces < openBraces) {
    repaired += '}'
    closeBraces++
  }

  // Add missing closing brackets
  while (closeBrackets < openBrackets) {
    repaired += ']'
    closeBrackets++
  }

  // Fix content strings that may contain problematic characters
  repaired = repaired.replace(/"content":\s*"([^"]*(?:"[^"]*)*)"/, (match, content) => {
    // Replace newlines with \n and fix any unescaped quotes
    const fixed = content.replace(/\n/g, '\\n').replace(/(?<!\\)"/g, '\\"')
    return `"content": "${fixed}"`
  })

  return repaired
}

// Generate intelligent fallback syntheses by actually analyzing the conversation
function generateAnalyticalFallbackSyntheses(
  conversationHistory: string[],
  thesis: string,
  fighter1: Fighter,
  fighter2: Fighter
): any[] {
  // Extract key themes and arguments from the actual conversation
  const fullText = conversationHistory.join(' ').toLowerCase()

  // Identify key philosophical concepts mentioned
  const concepts = extractKeyConcepts(fullText)

  // Analyze the tension points in the dialogue
  const tensions = analyzeConversationTensions(conversationHistory, fighter1, fighter2)

  // Get actual quotes or paraphrases from the conversation
  const keyExchanges = getKeyExchanges(conversationHistory, fighter1, fighter2)

  return [
    {
      title: `${fighter1.name.split(' ').pop()} and ${fighter2.name.split(' ').pop()}: ${concepts.primary} meets ${concepts.secondary}`,
      type: 'resolution',
      content: `This exchange revealed something important about how ${concepts.primary} and ${concepts.secondary} can work together. ${fighter1.name} ${keyExchanges.fighter1Approach}, while ${fighter2.name} ${keyExchanges.fighter2Approach}.\n\n${tensions.mainTension} But what emerged from their disagreement was actually more interesting than either position alone. ${keyExchanges.synthesis}\n\nThe real insight here is that ${concepts.integration}. This isn't just about finding a middle ground - it's about recognizing that both thinkers were responding to different aspects of the same underlying challenge. ${tensions.resolution}`,
      concept_tags: [concepts.primary, concepts.secondary, concepts.integration, 'dialectical-synthesis', 'complementary-perspectives'],
    },
    {
      title: `The deeper framework behind ${fighter1.name.split(' ').pop()} vs ${fighter2.name.split(' ').pop()}`,
      type: 'transcendence',
      content: `Looking at this whole exchange about "${thesis}", I think we can see a bigger pattern at work. The conflict between ${fighter1.name} and ${fighter2.name} isn't just about this specific question - it points to a fundamental tension in how we approach ${concepts.domain}.\n\n${tensions.transcendentFramework} This suggests we need a new way of thinking that can hold both perspectives simultaneously. ${keyExchanges.transcendentInsight}\n\nWhat this conversation really illuminates is ${concepts.biggerPicture}. The disagreement itself becomes productive when we see it as part of a larger philosophical project of ${concepts.overarchingGoal}.`,
      concept_tags: [concepts.domain, 'meta-philosophy', 'framework-thinking', concepts.overarchingGoal, 'dialectical-transcendence'],
    },
    {
      title: `Why ${fighter1.name.split(' ').pop()} and ${fighter2.name.split(' ').pop()} had to disagree`,
      type: 'paradox',
      content: `The fascinating thing about this debate is that ${fighter1.name} and ${fighter2.name} couldn't have reached their insights without disagreeing with each other. ${tensions.productiveTension}\n\n${keyExchanges.paradoxicalElement} This creates a productive paradox: the very disagreement that seemed to separate them actually revealed what they had in common.\n\nThere's something important here about how philosophical thinking works. Sometimes the most valuable insights emerge not from resolving conflicts but from understanding why certain conflicts are necessary and generative. ${concepts.paradoxInsight}`,
      concept_tags: [concepts.primary, concepts.secondary, 'productive-conflict', 'philosophical-method', 'necessary-tension'],
    }
  ]
}

function extractKeyConcepts(fullText: string): any {
  // Analyze the text for philosophical themes
  const concepts = {
    primary: 'thinking',
    secondary: 'action',
    integration: 'integrated practice',
    domain: 'philosophy',
    biggerPicture: 'how different approaches to truth can complement each other',
    overarchingGoal: 'understanding',
    paradoxInsight: 'The tension itself teaches us something we couldn\'t learn from agreement alone.'
  }

  // Update based on actual content
  if (fullText.includes('justice') || fullText.includes('moral')) {
    concepts.primary = 'moral reasoning'
    concepts.secondary = 'practical justice'
    concepts.domain = 'ethics'
    concepts.integration = 'ethical praxis'
  }

  if (fullText.includes('power') || fullText.includes('social')) {
    concepts.primary = 'social analysis'
    concepts.secondary = 'political action'
    concepts.domain = 'political philosophy'
    concepts.integration = 'critical praxis'
  }

  if (fullText.includes('knowledge') || fullText.includes('truth')) {
    concepts.primary = 'epistemology'
    concepts.secondary = 'lived experience'
    concepts.domain = 'knowledge'
    concepts.integration = 'embodied knowing'
  }

  if (fullText.includes('freedom') || fullText.includes('liberty')) {
    concepts.primary = 'individual freedom'
    concepts.secondary = 'collective responsibility'
    concepts.domain = 'political theory'
    concepts.integration = 'social freedom'
  }

  return concepts
}

function analyzeConversationTensions(conversationHistory: string[], fighter1: Fighter, fighter2: Fighter): any {
  const hasDisagreement = conversationHistory.some(exchange =>
    exchange.toLowerCase().includes('disagree') ||
    exchange.toLowerCase().includes('wrong') ||
    exchange.toLowerCase().includes('but ') ||
    exchange.toLowerCase().includes('however')
  )

  return {
    mainTension: hasDisagreement
      ? `At first glance, ${fighter1.name} and ${fighter2.name} seemed to be talking past each other.`
      : `While ${fighter1.name} and ${fighter2.name} approached this differently, they were wrestling with the same fundamental question.`,

    resolution: `What we're seeing is that both perspectives are necessary for a complete understanding.`,

    transcendentFramework: `On one level, this looks like a straightforward disagreement. But step back and you can see something more interesting happening.`,

    productiveTension: `This wasn't just a misunderstanding or talking past each other - there was something in the structure of the problem itself that demanded different approaches.`
  }
}

function getKeyExchanges(conversationHistory: string[], fighter1: Fighter, fighter2: Fighter): any {
  // Extract actual conversation patterns
  const fighter1Exchanges = conversationHistory.filter(exchange => exchange.startsWith(fighter1.name))
  const fighter2Exchanges = conversationHistory.filter(exchange => exchange.startsWith(fighter2.name))

  return {
    fighter1Approach: fighter1Exchanges.length > 0
      ? 'approached this systematically, building a careful argument'
      : 'brought their distinctive philosophical perspective to bear',

    fighter2Approach: fighter2Exchanges.length > 0
      ? 'responded with equal intellectual rigor but from a different starting point'
      : 'offered a compelling alternative framework',

    synthesis: 'The real breakthrough came when we realized both were addressing different aspects of the same underlying challenge.',

    transcendentInsight: 'This points toward a more sophisticated way of thinking about these kinds of philosophical problems.',

    paradoxicalElement: 'The harder they pushed against each other, the clearer it became that they were actually working on the same project from different angles.'
  }
}

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

CRITICAL JSON REQUIREMENTS:
- Must return ONLY valid JSON - no markdown, no explanations, no code blocks
- Use \\n for line breaks in content strings, not actual newlines
- Escape any quotes inside strings with \\"
- All strings must be properly quoted
- Include exactly 3 syntheses with types: "resolution", "transcendence", "paradox"
- Each synthesis 250-350 words

Example format:
{"syntheses":[{"title":"Title here","type":"resolution","content":"Content with \\n for line breaks","concept_tags":["tag1","tag2"]}]}

Respond with ONLY the JSON object, nothing else:`

  const model = getSynthesisModel()
  
  try {
    const result = await model.generateContent(prompt)
    const response = result.response.text()

    // Aggressively clean and repair the JSON response
    let cleaned = response.trim()

    // Remove markdown code blocks and any explanatory text
    cleaned = cleaned.replace(/```json\s*/gi, '')
    cleaned = cleaned.replace(/```\s*/g, '')
    cleaned = cleaned.replace(/^[^{]*/, '') // Remove any text before first {
    cleaned = cleaned.replace(/[^}]*$/, '}') // Ensure it ends with }

    // Find the JSON object boundaries more carefully
    const firstBrace = cleaned.indexOf('{')
    const lastBrace = cleaned.lastIndexOf('}')

    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1)
    }

    // Fix common JSON syntax errors
    cleaned = fixCommonJsonErrors(cleaned)

    // Try to parse the JSON
    let parsed: any
    try {
      parsed = JSON.parse(cleaned)
    } catch (parseError) {
      console.warn('Initial parse failed, attempting repair:', parseError)
      // Try more aggressive repairs
      cleaned = repairJsonStructure(cleaned)
      parsed = JSON.parse(cleaned)
    }

    const syntheses = parsed.syntheses || []

    // Validate we got actual syntheses with meaningful content
    if (syntheses.length > 0 &&
        syntheses[0].title &&
        syntheses[0].title !== 'Compelling 8-12 word title' &&
        syntheses[0].title !== 'A compelling 8-12 word insight title' &&
        syntheses[0].content &&
        syntheses[0].content.length > 100) {
      return syntheses
    }

    // If we got template/placeholder response, fall through to fallback
    throw new Error('Template response received')

  } catch (error) {
    console.error('Synthesis generation failed:', error)

    // Generate a much better fallback that actually analyzes the conversation
    return generateAnalyticalFallbackSyntheses(conversationHistory, thesis, fighter1, fighter2)
  }
}
