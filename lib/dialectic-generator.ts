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

  // Handle truncated JSON - if it ends abruptly, try to close it properly
  if (repaired.endsWith('...')) {
    repaired = repaired.slice(0, -3)
  }

  // If the content ends mid-string, close the string and structure
  if (repaired.match(/"content":\s*"[^"]*$/)) {
    repaired += '"'
  }

  // Ensure the structure is complete
  if (!repaired.includes('"syntheses"')) {
    // If no syntheses array found, wrap content in proper structure
    repaired = `{"syntheses": [${repaired}]}`
  }

  // Try to repair incomplete JSON by adding missing closing braces/brackets
  const openBraces = (repaired.match(/{/g) || []).length
  let closeBraces = (repaired.match(/}/g) || []).length
  const openBrackets = (repaired.match(/\[/g) || []).length
  let closeBrackets = (repaired.match(/]/g) || []).length

  // Add missing closing braces for objects
  while (closeBraces < openBraces) {
    repaired += '}'
    closeBraces++
  }

  // Add missing closing brackets for arrays
  while (closeBrackets < openBrackets) {
    repaired += ']'
    closeBrackets++
  }

  // Fix incomplete strings by closing them
  const unclosedStrings = repaired.match(/"[^"]*$/g)
  if (unclosedStrings) {
    repaired += '"'
  }

  // Add missing commas between objects in arrays
  repaired = repaired.replace(/}\s*{/g, '}, {')

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
  const analysis = analyzeConversationForSynthesis(conversationHistory, fighter1, fighter2)

  // Extract actual content from the conversation
  const fighter1Content = analysis.fighter1Quotes.join(' ')
  const fighter2Content = analysis.fighter2Quotes.join(' ')
  const themes = analysis.conversationThemes

  // Generate insights based on actual conversation content
  const resolutionTitle = `${fighter1.name.split(' ').pop()} and ${fighter2.name.split(' ').pop()}: Complementary insights on ${themes[0] || 'philosophical truth'}`
  const transcendenceTitle = `Beyond the debate: What ${fighter1.name.split(' ').pop()} and ${fighter2.name.split(' ').pop()} revealed together`
  const paradoxTitle = `The productive tension between ${fighter1.name.split(' ').pop()}'s and ${fighter2.name.split(' ').pop()}'s approaches`

  return [
    {
      title: resolutionTitle,
      type: 'resolution',
      content: `In their exchange about "${thesis}", ${fighter1.name} and ${fighter2.name} approached the question from notably different angles. ${fighter1.name} emphasized ${getApproachFromContent(fighter1Content, fighter1)}, while ${fighter2.name} focused on ${getApproachFromContent(fighter2Content, fighter2)}.\n\nWhat became clear through their dialogue is that these approaches actually complement each other rather than conflict. ${fighter1.name}'s perspective provides ${getStrengthFromContent(fighter1Content)}, while ${fighter2.name}'s viewpoint offers ${getStrengthFromContent(fighter2Content)}.\n\nThe synthesis that emerges is richer than either position alone: ${generateInsightFromThemes(themes, thesis)}. This shows how philosophical truth often requires multiple perspectives working in tension with each other.`,
      concept_tags: themes.concat(['complementary-perspectives', 'dialectical-synthesis', 'philosophical-dialogue']),
    },
    {
      title: transcendenceTitle,
      type: 'transcendence',
      content: `The conversation between ${fighter1.name} and ${fighter2.name} about "${thesis}" opened up questions that go beyond their initial disagreement. What started as a debate about specific philosophical positions evolved into an exploration of ${themes[0] || 'fundamental philosophical questions'}.\n\nThe deeper framework that emerged from their exchange suggests that the original thesis needs to be understood within a broader context of ${themes.join(' and ')}. Their dialogue revealed that the question isn't just about choosing between their positions, but about understanding how different philosophical approaches can illuminate different aspects of complex problems.\n\nThis conversation points toward a more sophisticated understanding of ${getMetaInsight(themes, thesis)}, one that recognizes the value of intellectual tension and the limitations of any single perspective.`,
      concept_tags: themes.concat(['meta-philosophy', 'framework-thinking', 'transcendent-understanding']),
    },
    {
      title: paradoxTitle,
      type: 'paradox',
      content: `One of the most interesting aspects of this exchange is how ${fighter1.name} and ${fighter2.name} needed their disagreement to discover what they actually had in common. Their initial positions seemed incompatible, but the process of engaging with each other revealed deeper shared concerns.\n\n${fighter1.name}'s arguments pushed ${fighter2.name} to clarify and strengthen their position, while ${fighter2.name}'s challenges forced ${fighter1.name} to address blind spots in their reasoning. This created a productive paradox: the more vigorously they disagreed, the more they contributed to a shared understanding.\n\nThis illustrates something important about philosophical dialogue - that genuine disagreement can be more valuable than superficial agreement. The tension between their positions generated insights that neither could have reached alone, showing how conflict can be a form of collaboration.`,
      concept_tags: themes.concat(['productive-conflict', 'philosophical-method', 'necessary-tension', 'collaborative-disagreement']),
    }
  ]
}

function getApproachFromContent(content: string, fighter: Fighter): string {
  // Analyze the actual content to determine the fighter's approach
  if (content.toLowerCase().includes('reason') || content.toLowerCase().includes('logic')) {
    return 'rational analysis and systematic reasoning'
  }
  if (content.toLowerCase().includes('experience') || content.toLowerCase().includes('practice')) {
    return 'experiential knowledge and practical wisdom'
  }
  if (content.toLowerCase().includes('power') || content.toLowerCase().includes('social')) {
    return 'social analysis and power dynamics'
  }
  if (content.toLowerCase().includes('individual') || content.toLowerCase().includes('freedom')) {
    return 'individual autonomy and personal freedom'
  }
  return `${fighter.name.split(' ').pop()}'s distinctive philosophical methodology`
}

function getStrengthFromContent(content: string): string {
  if (content.toLowerCase().includes('system') || content.toLowerCase().includes('structure')) {
    return 'systematic analysis and structural understanding'
  }
  if (content.toLowerCase().includes('concrete') || content.toLowerCase().includes('real')) {
    return 'grounding in concrete reality and practical concerns'
  }
  if (content.toLowerCase().includes('critical') || content.toLowerCase().includes('question')) {
    return 'critical questioning and intellectual rigor'
  }
  return 'important philosophical insights and methodological clarity'
}

function generateInsightFromThemes(themes: string[], thesis: string): string {
  const primaryTheme = themes[0] || 'philosophical inquiry'
  return `we need approaches that can integrate different ways of understanding ${primaryTheme} while remaining sensitive to the complexity of questions like "${thesis}"`
}

function getMetaInsight(themes: string[], thesis: string): string {
  if (themes.includes('ethics')) {
    return 'moral reasoning and ethical decision-making'
  }
  if (themes.includes('political-philosophy')) {
    return 'political life and social organization'
  }
  if (themes.includes('epistemology')) {
    return 'knowledge and truth'
  }
  return 'philosophical understanding more generally'
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

function analyzeConversationForSynthesis(conversationHistory: string[], fighter1: Fighter, fighter2: Fighter) {
  // Extract key quotes and arguments from each fighter
  const fighter1Exchanges = conversationHistory.filter(exchange => exchange.startsWith(fighter1.name))
  const fighter2Exchanges = conversationHistory.filter(exchange => exchange.startsWith(fighter2.name))

  // Get substantive quotes (not just the name prefix)
  const fighter1Quotes = fighter1Exchanges.map(exchange =>
    exchange.replace(`${fighter1.name}: `, '').substring(0, 200) + '...'
  ).filter(quote => quote.length > 50)

  const fighter2Quotes = fighter2Exchanges.map(exchange =>
    exchange.replace(`${fighter2.name}: `, '').substring(0, 200) + '...'
  ).filter(quote => quote.length > 50)

  // Find moments of direct engagement
  const engagements = conversationHistory.filter(exchange =>
    exchange.toLowerCase().includes('disagree') ||
    exchange.toLowerCase().includes('however') ||
    exchange.toLowerCase().includes('but ') ||
    exchange.toLowerCase().includes('response') ||
    exchange.toLowerCase().includes('challenge')
  )

  return {
    fighter1Quotes: fighter1Quotes.slice(0, 3), // Top 3 substantive quotes
    fighter2Quotes: fighter2Quotes.slice(0, 3),
    engagements: engagements.slice(0, 3),
    totalExchanges: conversationHistory.length,
    conversationThemes: extractConversationThemes(conversationHistory)
  }
}

function extractConversationThemes(conversationHistory: string[]): string[] {
  const fullText = conversationHistory.join(' ').toLowerCase()
  const themes: string[] = []

  // Philosophy themes
  if (fullText.includes('truth') || fullText.includes('knowledge')) themes.push('epistemology')
  if (fullText.includes('justice') || fullText.includes('moral') || fullText.includes('ethical')) themes.push('ethics')
  if (fullText.includes('freedom') || fullText.includes('liberty')) themes.push('political-philosophy')
  if (fullText.includes('reality') || fullText.includes('being') || fullText.includes('existence')) themes.push('metaphysics')
  if (fullText.includes('reason') || fullText.includes('logic')) themes.push('rationality')
  if (fullText.includes('experience') || fullText.includes('empirical')) themes.push('empiricism')
  if (fullText.includes('power') || fullText.includes('authority')) themes.push('power-dynamics')
  if (fullText.includes('meaning') || fullText.includes('purpose')) themes.push('existentialism')

  return themes.length > 0 ? themes : ['philosophical-inquiry']
}

async function generateSyntheses(options: GenerateSynthesesOptions): Promise<any[]> {
  const { thesis, fighter1, fighter2, conversationHistory } = options

  // Extract actual quotes and key moments from the conversation
  const conversationAnalysis = analyzeConversationForSynthesis(conversationHistory, fighter1, fighter2)

  const prompt = `You are analyzing a philosophical debate between ${fighter1.name} and ${fighter2.name} about the thesis: "${thesis}"

CONVERSATION TRANSCRIPT:
${conversationHistory.join('\n\n')}

Your task: Generate exactly 3 syntheses analyzing their actual exchange. Each synthesis must reference specific arguments they made.

CRITICAL: You must respond with ONLY a JSON object. No explanatory text before or after. No markdown formatting. Just pure JSON.

Required JSON format:
{
  "syntheses": [
    {
      "title": "Title describing how their specific approaches complement each other",
      "type": "resolution",
      "content": "Analysis of how their actual arguments work together, referencing specific points they made",
      "concept_tags": ["philosophical-concepts", "from-actual-conversation"]
    },
    {
      "title": "Title about the deeper framework that emerged from their exchange",
      "type": "transcendence",
      "content": "What larger insights emerged from their specific disagreement",
      "concept_tags": ["meta-concepts", "transcendent-insights"]
    },
    {
      "title": "Title explaining why their particular disagreement was philosophically valuable",
      "type": "paradox",
      "content": "How their specific conflict generated insights neither could reach alone",
      "concept_tags": ["productive-tension", "dialectical-insights"]
    }
  ]
}

Requirements:
- Each content must be 200-300 words
- Reference specific arguments they actually made
- Use actual quotes or paraphrases from the conversation
- Make the insights specific to THIS exchange, not general philosophy
- Return ONLY the JSON object with no additional text`

  // Try multiple approaches to get high-quality syntheses
  const strategies = [
    // Strategy 1: Direct JSON request
    async () => {
      const model = getSynthesisModel()
      const result = await model.generateContent(prompt)
      return result.response.text()
    },

    // Strategy 2: Simpler prompt if the first fails
    async () => {
      const model = getSynthesisModel()
      const simplePrompt = `Analyze the debate between ${fighter1.name} and ${fighter2.name} about "${thesis}". Return JSON with 3 syntheses: resolution, transcendence, paradox. Each needs title, type, content (200+ words), concept_tags array.`
      const result = await model.generateContent(simplePrompt)
      return result.response.text()
    },

    // Strategy 3: Very explicit JSON request
    async () => {
      const model = getSynthesisModel()
      const explicitPrompt = `Generate a JSON response about the debate between ${fighter1.name} and ${fighter2.name}.

Start your response with { and end with }

Format:
{
  "syntheses": [
    {"title": "Title 1", "type": "resolution", "content": "Content 1", "concept_tags": ["tag1", "tag2"]},
    {"title": "Title 2", "type": "transcendence", "content": "Content 2", "concept_tags": ["tag3", "tag4"]},
    {"title": "Title 3", "type": "paradox", "content": "Content 3", "concept_tags": ["tag5", "tag6"]}
  ]
}`
      const result = await model.generateContent(explicitPrompt)
      return result.response.text()
    },

    // Strategy 4: Give up on JSON and construct it programmatically
    async () => {
      const model = getSynthesisModel()
      const textPrompt = `Analyze the debate between ${fighter1.name} and ${fighter2.name} about "${thesis}".

Write exactly 3 analyses:

1. RESOLUTION: How their approaches complement each other
2. TRANSCENDENCE: What deeper framework emerged
3. PARADOX: Why their disagreement was productive

Each analysis should be 200-300 words and reference specific things they said.`

      const result = await model.generateContent(textPrompt)
      const text = result.response.text()

      console.log('Strategy 4 text response:', text.substring(0, 300))

      // Parse the text response and construct JSON manually
      // Try multiple parsing approaches
      let sections: string[] = []

      // Approach 1: Split by numbered sections
      sections = text.split(/(?:^|\n)\s*[123]\.\s*/m)
        .filter(s => s.trim().length > 50)
        .slice(1, 4) // Skip first empty element

      // Approach 2: Split by keywords if numbered approach didn't work
      if (sections.length < 3) {
        sections = text.split(/(?:RESOLUTION|TRANSCENDENCE|PARADOX):\s*/i)
          .filter(s => s.trim().length > 50)
          .slice(1, 4) // Skip first element which is usually intro text
      }

      // Approach 3: Split by paragraphs if we still don't have enough
      if (sections.length < 3) {
        const paragraphs = text.split(/\n\s*\n/)
          .filter(p => p.trim().length > 100)

        if (paragraphs.length >= 3) {
          sections = paragraphs.slice(0, 3)
        }
      }

      console.log(`Strategy 4 found ${sections.length} sections`)

      if (sections.length >= 3) {
        return JSON.stringify({
          syntheses: [
            {
              title: `${fighter1.name.split(' ').pop()} and ${fighter2.name.split(' ').pop()}: Complementary approaches`,
              type: "resolution",
              content: sections[0].trim(),
              concept_tags: extractConversationThemes(conversationHistory)
            },
            {
              title: `Beyond the debate: Deeper framework revealed`,
              type: "transcendence",
              content: sections[1].trim(),
              concept_tags: ["meta-philosophy", "framework-thinking"]
            },
            {
              title: `The productive tension in their disagreement`,
              type: "paradox",
              content: sections[2].trim(),
              concept_tags: ["productive-conflict", "dialectical-method"]
            }
          ]
        })
      }

      throw new Error(`Could not parse text response into sections (found ${sections.length})`)
    }
  ]

  for (let i = 0; i < strategies.length; i++) {
    try {
      console.log(`🎯 Attempting synthesis generation strategy ${i + 1}`)
      const response = await strategies[i]()

      console.log('Raw synthesis response:', response.substring(0, 500) + (response.length > 500 ? '...' : ''))
      console.log('Full response length:', response.length)

      // Clean and parse JSON response
      let cleaned = response.trim()

      // Remove any markdown code blocks or explanatory text
      cleaned = cleaned.replace(/```json\s*/gi, '')
      cleaned = cleaned.replace(/```\s*/g, '')
      cleaned = cleaned.replace(/^[^{]*({[\s\S]*})[^}]*$/, '$1') // Extract JSON object with regex

      // Try multiple approaches to find JSON
      let jsonFound = false;

      // Approach 1: Look for complete JSON object
      let jsonMatch = cleaned.match(/{[\s\S]*}/);
      if (jsonMatch) {
        cleaned = jsonMatch[0];
        jsonFound = true;
      }

      // Approach 2: Look for partial JSON and try to reconstruct
      if (!jsonFound) {
        const synthesesMatch = cleaned.match(/"syntheses"\s*:\s*\[[\s\S]*\]/);
        if (synthesesMatch) {
          cleaned = `{${synthesesMatch[0]}}`;
          jsonFound = true;
        }
      }

      // Approach 3: Check if response looks like JSON but is missing braces
      if (!jsonFound && (cleaned.includes('"syntheses"') || cleaned.includes('"title"'))) {
        // Try wrapping in braces
        if (!cleaned.startsWith('{')) cleaned = '{' + cleaned;
        if (!cleaned.endsWith('}')) cleaned = cleaned + '}';
        jsonFound = true;
      }

      if (!jsonFound) {
        console.log(`❌ Strategy ${i + 1}: No JSON pattern found in response`);
        console.log('Cleaned response:', cleaned.substring(0, 200));
        continue; // Try next strategy
      }

      // Fix common JSON syntax errors
      cleaned = fixCommonJsonErrors(cleaned)

      let parsed: any
      try {
        parsed = JSON.parse(cleaned)
      } catch (parseError) {
        console.log(`JSON parse error in strategy ${i + 1}:`, parseError, 'Cleaned text length:', cleaned.length)

        // Try aggressive repair for truncated JSON
        try {
          cleaned = repairJsonStructure(cleaned)
          parsed = JSON.parse(cleaned)
        } catch (repairError) {
          console.log(`❌ Strategy ${i + 1}: Standard JSON repair failed, trying truncation recovery`)

          // If it's likely a truncation issue, try to salvage what we can
          try {
            // Look for complete synthesis objects and extract them
            const synthesesMatch = cleaned.match(/"syntheses":\s*\[([\s\S]*)/)
            if (synthesesMatch) {
              let synthesesContent = synthesesMatch[1]

              // Find complete synthesis objects (those ending with })
              const objects = []
              let currentObj = ''
              let braceCount = 0
              let inString = false
              let escaped = false

              for (let j = 0; j < synthesesContent.length; j++) {
                const char = synthesesContent[j]
                currentObj += char

                if (escaped) {
                  escaped = false
                  continue
                }

                if (char === '\\') {
                  escaped = true
                  continue
                }

                if (char === '"') {
                  inString = !inString
                  continue
                }

                if (!inString) {
                  if (char === '{') braceCount++
                  if (char === '}') {
                    braceCount--
                    if (braceCount === 0) {
                      objects.push(currentObj.trim().replace(/,$/, ''))
                      currentObj = ''
                    }
                  }
                }
              }

              if (objects.length > 0) {
                const validJson = `{"syntheses": [${objects.join(', ')}]}`
                parsed = JSON.parse(validJson)
                console.log(`✅ Strategy ${i + 1}: Recovered ${objects.length} syntheses from truncated JSON`)
              } else {
                throw new Error('No complete synthesis objects found')
              }
            } else {
              throw new Error('No syntheses array found in truncated JSON')
            }
          } catch (truncationError) {
            console.log(`❌ Strategy ${i + 1}: Truncation recovery failed`)
            continue; // Try next strategy
          }
        }
      }

      const syntheses = parsed.syntheses || []

      // Validate synthesis quality
      if (syntheses.length >= 3 &&
          syntheses.every((s: any) =>
            s.title && s.content && s.type && s.concept_tags &&
            s.title.length > 10 &&
            s.content.length > 100 &&
            !s.title.includes('placeholder') &&
            !s.title.includes('example') &&
            ['resolution', 'transcendence', 'paradox'].includes(s.type)
          )) {
        console.log(`✅ Strategy ${i + 1}: High-quality syntheses generated successfully`)
        return syntheses
      }

      console.log(`⚠️ Strategy ${i + 1}: Generated syntheses failed quality check`)

    } catch (error) {
      console.log(`❌ Strategy ${i + 1} failed:`, error)
      continue; // Try next strategy
    }
  }

  // All strategies failed, use enhanced analytical fallback
  console.log('🔄 All synthesis generation strategies failed, using enhanced analytical fallback')
  return generateAnalyticalFallbackSyntheses(conversationHistory, thesis, fighter1, fighter2)
}
