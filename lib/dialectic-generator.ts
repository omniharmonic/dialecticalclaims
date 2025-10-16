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

  // console.log('🔧 Attempting JSON repair on:', repaired.substring(0, 200) + '...')

  // Handle truncated JSON - if it ends abruptly, try to close it properly
  if (repaired.endsWith('...')) {
    repaired = repaired.slice(0, -3)
  }

  // Remove any trailing incomplete words or characters
  repaired = repaired.replace(/[^}\]"]*$/, '')

  // If the content ends mid-string, close the string and structure
  if (repaired.match(/"content":\s*"[^"]*$/)) {
    repaired += '"'
  }

  // Fix common truncation patterns
  if (repaired.match(/"title":\s*"[^"]*$/)) {
    repaired += '"'
  }
  if (repaired.match(/"concept_tags":\s*\["[^"]*$/)) {
    repaired += '"]'
  }
  if (repaired.match(/"concept_tags":\s*\[[^\]]*$/)) {
    repaired += ']'
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

  // console.log(`🔧 Brace/bracket count: open braces=${openBraces}, close braces=${closeBraces}, open brackets=${openBrackets}, close brackets=${closeBrackets}`)

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
    // console.log('🔧 Found unclosed string, adding closing quote')
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

  // Handle case where response starts mid-object (no opening brace)
  if (!repaired.trim().startsWith('{') && repaired.includes('"syntheses"')) {
    repaired = '{' + repaired
  }

  // Last resort: if we have synthesis data but malformed structure, try to extract and reconstruct
  if (repaired.includes('"title"') && repaired.includes('"content"') && !repaired.includes('"syntheses"')) {
    // console.log('🔧 Attempting structural reconstruction')

    // Try to find synthesis objects and wrap them properly
    const titleMatches = repaired.match(/"title":\s*"[^"]+"/g) || []
    const contentMatches = repaired.match(/"content":\s*"[^"]+"/g) || []

    if (titleMatches.length > 0 && contentMatches.length > 0) {
      const syntheses = []
      const types = ['resolution', 'transcendence', 'paradox']

      for (let i = 0; i < Math.min(titleMatches.length, contentMatches.length, 3); i++) {
        syntheses.push(`{${titleMatches[i]}, "type": "${types[i] || 'resolution'}", ${contentMatches[i]}, "concept_tags": ["philosophical-analysis"]}`)
      }

      repaired = `{"syntheses": [${syntheses.join(', ')}]}`
    }
  }

  // console.log('🔧 JSON repair complete, result length:', repaired.length)
  return repaired
}

// Generate intelligent fallback syntheses by actually analyzing the conversation
function generateAnalyticalFallbackSyntheses(
  conversationHistory: string[],
  thesis: string,
  fighter1: Fighter,
  fighter2: Fighter
): any[] {
  // console.log('🔄 Generating enhanced analytical fallback syntheses')

  const analysis = analyzeConversationForSynthesis(conversationHistory, fighter1, fighter2)

  // Extract actual content from the conversation with more sophisticated analysis
  const fighter1Content = analysis.fighter1Quotes.join(' ')
  const fighter2Content = analysis.fighter2Quotes.join(' ')
  const themes = analysis.conversationThemes

  // Extract key phrases and concepts from the actual conversation
  const fullConversation = conversationHistory.join(' ').toLowerCase()
  const keyTerms = extractKeyTermsFromConversation(fullConversation)
  const centralConcepts = extractCentralConcepts(conversationHistory, themes)

  // Generate more sophisticated titles based on actual content
  const resolutionTitle = `How ${fighter1.name.split(' ').pop()} and ${fighter2.name.split(' ').pop()} reveal complementary truths about ${keyTerms[0] || themes[0] || 'the human condition'}`
  const transcendenceTitle = `The deeper question: What emerges beyond ${fighter1.name.split(' ').pop()}'s and ${fighter2.name.split(' ').pop()}'s debate about ${centralConcepts[0] || 'fundamental truth'}`
  const paradoxTitle = `Why ${fighter1.name.split(' ').pop()} and ${fighter2.name.split(' ').pop()} needed their disagreement to discover shared wisdom`

  // Generate sophisticated content based on actual conversation analysis
  const resolutionContent = generateResolutionContent(fighter1, fighter2, thesis, themes, fighter1Content, fighter2Content, keyTerms)
  const transcendenceContent = generateTranscendenceContent(fighter1, fighter2, thesis, themes, centralConcepts, analysis.engagements)
  const paradoxContent = generateParadoxContent(fighter1, fighter2, thesis, themes, analysis.totalExchanges)

  // Generate synthesis claim
  const synthesisClaimOptions = [
    `${fighter1.name} and ${fighter2.name} show that ${keyTerms[0] || 'truth'} emerges through thoughtful disagreement.`,
    `True philosophical progress requires both ${fighter1.name.split(' ').pop()}'s ${themes[0] || 'insights'} and ${fighter2.name.split(' ').pop()}'s challenges.`,
    `The tension between ${fighter1.name.split(' ').pop()}'s and ${fighter2.name.split(' ').pop()}'s views reveals deeper wisdom about ${centralConcepts[0] || 'human understanding'}.`
  ]

  const synthesisClaimData = {
    synthesis_claim: synthesisClaimOptions[0].length <= 150 ? synthesisClaimOptions[0] :
                    synthesisClaimOptions[1].length <= 150 ? synthesisClaimOptions[1] :
                    synthesisClaimOptions[2].substring(0, 147) + '...',
    syntheses: [
      {
        title: resolutionTitle,
        type: 'resolution',
        content: resolutionContent,
        synthesis_claim: synthesisClaimOptions[0].length <= 150 ? synthesisClaimOptions[0] :
                        synthesisClaimOptions[1].length <= 150 ? synthesisClaimOptions[1] :
                        synthesisClaimOptions[2].substring(0, 147) + '...',
        concept_tags: themes.concat(['complementary-perspectives', 'dialectical-synthesis', 'philosophical-dialogue']),
      },
      {
        title: transcendenceTitle,
        type: 'transcendence',
        content: transcendenceContent,
        synthesis_claim: synthesisClaimOptions[0].length <= 150 ? synthesisClaimOptions[0] :
                        synthesisClaimOptions[1].length <= 150 ? synthesisClaimOptions[1] :
                        synthesisClaimOptions[2].substring(0, 147) + '...',
        concept_tags: themes.concat(['meta-philosophy', 'framework-thinking', 'transcendent-understanding']),
      },
      {
        title: paradoxTitle,
        type: 'paradox',
        content: paradoxContent,
        synthesis_claim: synthesisClaimOptions[0].length <= 150 ? synthesisClaimOptions[0] :
                        synthesisClaimOptions[1].length <= 150 ? synthesisClaimOptions[1] :
                        synthesisClaimOptions[2].substring(0, 147) + '...',
        concept_tags: themes.concat(['productive-conflict', 'philosophical-method', 'necessary-tension', 'collaborative-disagreement']),
      }
    ]
  }

  return synthesisClaimData.syntheses
}

function generateResolutionContent(fighter1: Fighter, fighter2: Fighter, thesis: string, themes: string[], fighter1Content: string, fighter2Content: string, keyTerms: string[]): string {
  const approach1 = getApproachFromContent(fighter1Content, fighter1)
  const approach2 = getApproachFromContent(fighter2Content, fighter2)
  const strength1 = getStrengthFromContent(fighter1Content)
  const strength2 = getStrengthFromContent(fighter2Content)
  const insight = generateInsightFromThemes(themes, thesis)
  const keyTerm = keyTerms[0] || themes[0] || 'philosophical understanding'

  return `In their exchange about "${thesis}", ${fighter1.name} and ${fighter2.name} approached the question from notably different angles that ultimately proved complementary. ${fighter1.name} emphasized ${approach1}, bringing ${strength1} to the discussion. Meanwhile, ${fighter2.name} focused on ${approach2}, offering ${strength2} that illuminated different aspects of the problem.

What became clear through their dialogue is that these approaches don't merely coexist—they actively strengthen each other. ${fighter1.name}'s perspective on ${keyTerm} provided necessary grounding for ${fighter2.name}'s insights, while ${fighter2.name}'s analysis challenged ${fighter1.name} to examine assumptions that might otherwise have remained unquestioned.

The synthesis that emerges is far richer than either position alone: ${insight}. This demonstrates how philosophical truth often requires multiple perspectives working in dynamic tension, each exposing what the other cannot see on its own.`
}

function generateTranscendenceContent(fighter1: Fighter, fighter2: Fighter, thesis: string, themes: string[], centralConcepts: string[], engagements: string[]): string {
  const primaryConcept = centralConcepts[0] || themes[0] || 'fundamental philosophical questions'
  const metaInsight = getMetaInsight(themes, thesis)
  const themeList = themes.length > 1 ? themes.slice(0, 2).join(' and ') : themes[0] || 'philosophical inquiry'

  return `The conversation between ${fighter1.name} and ${fighter2.name} about "${thesis}" opened up questions that transcend their initial disagreement, revealing deeper structures of thought and inquiry. What began as a focused debate evolved into an exploration of ${primaryConcept}, uncovering layers of complexity that neither anticipated.

The deeper framework that emerged from their exchange suggests that the original thesis was actually a gateway to more fundamental questions about ${themeList}. Their dialogue revealed that the real issue isn't simply choosing between their positions, but understanding how different philosophical approaches can illuminate distinct dimensions of complex human problems.

This conversation points toward a more sophisticated understanding of ${metaInsight}—one that recognizes both the necessity of intellectual disagreement and the provisional nature of any single perspective. The transcendent insight is that philosophical progress often happens not through resolution, but through the cultivation of productive tension between competing insights.`
}

function generateParadoxContent(fighter1: Fighter, fighter2: Fighter, thesis: string, themes: string[], totalExchanges: number): string {
  const exchangeIntensity = totalExchanges > 6 ? 'sustained and intensive' : totalExchanges > 4 ? 'thorough' : 'focused'

  return `One of the most striking aspects of this ${exchangeIntensity} exchange is how ${fighter1.name} and ${fighter2.name} needed their disagreement to discover what they actually shared. Their initial positions appeared fundamentally incompatible, yet the very process of defending these positions against each other's challenges revealed unexpected common ground.

${fighter1.name}'s vigorous arguments didn't just oppose ${fighter2.name}'s position—they forced ${fighter2.name} to articulate nuances and depths that might never have emerged otherwise. Similarly, ${fighter2.name}'s challenges pushed ${fighter1.name} to confront limitations and blind spots that strengthened rather than weakened their core insights. This created a philosophical paradox: the more authentically they disagreed, the more they contributed to a shared understanding that belonged fully to neither.

This illustrates something profound about philosophical dialogue—that genuine opposition can be the highest form of collaboration. The creative tension between their positions generated insights that neither could have reached in isolation, demonstrating how intellectual conflict, when pursued with rigor and good faith, becomes a form of joint inquiry into truth.`
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

function extractKeyTermsFromConversation(fullText: string): string[] {
  const keyTerms: string[] = []

  // Extract important philosophical terms and concepts
  const importantTerms = [
    'justice', 'truth', 'freedom', 'power', 'knowledge', 'reality', 'existence',
    'meaning', 'purpose', 'ethics', 'morality', 'reason', 'experience',
    'consciousness', 'society', 'individual', 'nature', 'culture', 'progress',
    'tradition', 'revolution', 'reform', 'virtue', 'duty', 'rights'
  ]

  importantTerms.forEach(term => {
    if (fullText.includes(term)) {
      keyTerms.push(term)
    }
  })

  return keyTerms.slice(0, 3) // Return top 3 key terms
}

function extractCentralConcepts(conversationHistory: string[], themes: string[]): string[] {
  const concepts: string[] = []

  // Extract concepts based on conversation themes and content
  const fullText = conversationHistory.join(' ').toLowerCase()

  if (themes.includes('ethics')) {
    if (fullText.includes('good') || fullText.includes('right')) concepts.push('moral goodness')
    if (fullText.includes('duty') || fullText.includes('obligation')) concepts.push('moral duty')
  }

  if (themes.includes('political-philosophy')) {
    if (fullText.includes('state') || fullText.includes('government')) concepts.push('political authority')
    if (fullText.includes('citizen') || fullText.includes('society')) concepts.push('social contract')
  }

  if (themes.includes('epistemology')) {
    if (fullText.includes('certainty') || fullText.includes('doubt')) concepts.push('the nature of certainty')
    if (fullText.includes('belief') || fullText.includes('faith')) concepts.push('belief and knowledge')
  }

  // Fallback to more general concepts
  if (concepts.length === 0) {
    if (fullText.includes('human')) concepts.push('human nature')
    if (fullText.includes('world') || fullText.includes('reality')) concepts.push('the nature of reality')
    if (fullText.includes('life') || fullText.includes('living')) concepts.push('the meaning of life')
  }

  return concepts.length > 0 ? concepts : ['fundamental philosophical questions']
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

Your task: Generate exactly 3 syntheses analyzing their actual exchange PLUS a single overarching synthesis claim. Each synthesis must reference specific arguments they made.

CRITICAL: You must respond with ONLY a JSON object. No explanatory text before or after. No markdown formatting. Just pure JSON.

Required JSON format:
{
  "synthesis_claim": "A single, powerful sentence that captures the core insight emerging from this specific dialectical exchange between ${fighter1.name} and ${fighter2.name}",
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
- synthesis_claim must be ONE sentence, maximum 150 characters, capturing the essence of what emerged
- Each synthesis content must be 200-300 words
- Reference specific arguments they actually made
- Use actual quotes or paraphrases from the conversation
- Make the insights specific to THIS exchange, not general philosophy
- Return ONLY the JSON object with no additional text`

  // Helper function for robust API calls with retries
  const callGeminiWithRetry = async (model: any, prompt: string, maxRetries = 3): Promise<string> => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // console.log(`🔄 Gemini API attempt ${attempt}/${maxRetries}`)

        // Add timeout to the API call
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), 45000) // 45 second timeout
        })

        const apiCall = model.generateContent(prompt)
        const result = await Promise.race([apiCall, timeoutPromise])

        const text = result.response.text()
        // console.log(`✅ Gemini API success on attempt ${attempt}, response length: ${text.length}`)
        return text

      } catch (error: any) {
        // console.log(`❌ Gemini API attempt ${attempt} failed:`, error.message)

        if (attempt === maxRetries) {
          throw error
        }

        // Exponential backoff: wait 2^attempt seconds
        const delay = Math.pow(2, attempt) * 1000
        // console.log(`⏳ Waiting ${delay}ms before retry...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
    throw new Error('All retry attempts failed')
  }

  // Try multiple approaches to get high-quality syntheses
  const strategies = [
    // Strategy 1: Direct JSON request with retries
    async () => {
      const model = getSynthesisModel()
      return await callGeminiWithRetry(model, prompt, 3)
    },

    // Strategy 2: Simpler prompt with retries
    async () => {
      const model = getSynthesisModel()
      const simplePrompt = `Analyze the debate between ${fighter1.name} and ${fighter2.name} about "${thesis}". Return JSON with 3 syntheses: resolution, transcendence, paradox. Each needs title, type, content (200+ words), concept_tags array.`
      return await callGeminiWithRetry(model, simplePrompt, 2)
    },

    // Strategy 3: Very explicit JSON request with retries
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
      return await callGeminiWithRetry(model, explicitPrompt, 2)
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

      // console.log('Strategy 4 text response:', text.substring(0, 300))

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

      // console.log(`Strategy 4 found ${sections.length} sections`)

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
    },

    // Strategy 5: Single synthesis approach when all else fails
    async () => {
      const model = getSynthesisModel()
      const singlePrompt = `Analyze the philosophical debate between ${fighter1.name} and ${fighter2.name} about "${thesis}".

Write one insightful analysis (200+ words) of how their conversation reveals something important about philosophical dialogue and truth-seeking.

Focus on what actually happened in their exchange, not general philosophy.`

      const result = await callGeminiWithRetry(model, singlePrompt, 1)
      const content = result.trim()

      if (content.length > 100) {
        // Create a single synthesis and replicate it with variations
        return JSON.stringify({
          syntheses: [
            {
              title: `${fighter1.name.split(' ').pop()} and ${fighter2.name.split(' ').pop()}: Finding common ground through disagreement`,
              type: "resolution",
              content: content,
              concept_tags: ["philosophical-dialogue", "complementary-perspectives"]
            },
            {
              title: `Beyond the debate: What their exchange revealed`,
              type: "transcendence",
              content: `Building on their discussion of "${thesis}", this conversation revealed deeper questions about the nature of philosophical inquiry itself. ` + content.substring(0, Math.min(content.length, 250)),
              concept_tags: ["meta-philosophy", "transcendent-insights"]
            },
            {
              title: `The productive tension in their philosophical disagreement`,
              type: "paradox",
              content: `What makes this exchange particularly interesting is how their disagreement became collaborative. ` + content.substring(0, Math.min(content.length, 250)),
              concept_tags: ["productive-conflict", "dialectical-method"]
            }
          ]
        })
      }

      throw new Error('Strategy 5 failed to generate sufficient content')
    }
  ]

  for (let i = 0; i < strategies.length; i++) {
    try {
      // console.log(`🎯 Attempting synthesis generation strategy ${i + 1}`)
      const response = await strategies[i]()

      // console.log('Raw synthesis response:', response.substring(0, 500) + (response.length > 500 ? '...' : ''))
      // console.log('Full response length:', response.length)

      // Clean and parse JSON response
      let cleaned = response.trim()

      // Remove any markdown code blocks or explanatory text
      cleaned = cleaned.replace(/```json\s*/gi, '')
      cleaned = cleaned.replace(/```\s*/g, '')
      cleaned = cleaned.replace(/^[^{]*({[\s\S]*})[^}]*$/, '$1') // Extract JSON object with regex

      // Try multiple approaches to find JSON
      let jsonFound = false;

      // Approach 1: Look for complete JSON object
      const jsonMatch = cleaned.match(/{[\s\S]*}/);
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
        // console.log(`❌ Strategy ${i + 1}: No JSON pattern found in response`);
        // console.log('Cleaned response:', cleaned.substring(0, 200));
        continue; // Try next strategy
      }

      // Fix common JSON syntax errors
      cleaned = fixCommonJsonErrors(cleaned)

      let parsed: any
      try {
        parsed = JSON.parse(cleaned)
      } catch (parseError) {
        // console.log(`JSON parse error in strategy ${i + 1}:`, parseError, 'Cleaned text length:', cleaned.length)

        // Try aggressive repair for truncated JSON
        try {
          cleaned = repairJsonStructure(cleaned)
          parsed = JSON.parse(cleaned)
        } catch (repairError) {
          // console.log(`❌ Strategy ${i + 1}: Standard JSON repair failed, trying truncation recovery`)

          // If it's likely a truncation issue, try to salvage what we can
          try {
            // Look for complete synthesis objects and extract them
            const synthesesMatch = cleaned.match(/"syntheses":\s*\[([\s\S]*)/)
            if (synthesesMatch) {
              const synthesesContent = synthesesMatch[1]

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
                // console.log(`✅ Strategy ${i + 1}: Recovered ${objects.length} syntheses from truncated JSON`)
              } else {
                throw new Error('No complete synthesis objects found')
              }
            } else {
              throw new Error('No syntheses array found in truncated JSON')
            }
          } catch (truncationError) {
            // console.log(`❌ Strategy ${i + 1}: Truncation recovery failed`)
            continue; // Try next strategy
          }
        }
      }

      const syntheses = parsed.syntheses || []
      const synthesisClaimFromApi = parsed.synthesis_claim || null

      // Add synthesis_claim to each synthesis object if it exists
      if (synthesisClaimFromApi && syntheses.length > 0) {
        syntheses.forEach((synthesis: any) => {
          synthesis.synthesis_claim = synthesisClaimFromApi
        })
      }

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
        // console.log(`✅ Strategy ${i + 1}: High-quality syntheses generated successfully`)
        return syntheses
      }

      // console.log(`⚠️ Strategy ${i + 1}: Generated syntheses failed quality check`)

    } catch (error) {
      // console.log(`❌ Strategy ${i + 1} failed:`, error)
      continue; // Try next strategy
    }
  }

  // All strategies failed, use enhanced analytical fallback
  // console.log('🔄 All synthesis generation strategies failed, using enhanced analytical fallback')
  return generateAnalyticalFallbackSyntheses(conversationHistory, thesis, fighter1, fighter2)
}
