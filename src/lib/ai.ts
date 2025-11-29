import { db } from './db'

const AI_API_KEY = process.env.AI_API_KEY || ''
const AI_BASE_URL = process.env.AI_BASE_URL || 'https://openrouter.ai/api/v1'
const AI_MODEL = process.env.AI_MODEL || 'anthropic/claude-3.5-sonnet'

interface AIResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
  usage?: {
    total_tokens: number
  }
}

async function callAI(prompt: string, workspaceId?: string): Promise<string> {
  try {
    const response = await fetch(`${AI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    })

    if (!response.ok) {
      throw new Error(`AI API error: ${response.statusText}`)
    }

    const data: AIResponse = await response.json()
    const content = data.choices[0]?.message?.content || ''

    // Log AI request
    if (workspaceId) {
      await db.aIRequestLog.create({
        data: {
          workspaceId,
          type: 'general',
          model: AI_MODEL,
          tokensUsed: data.usage?.total_tokens || 0,
          success: true,
        },
      }).catch(() => {}) // Silent fail for logging
    }

    return content
  } catch (error) {
    console.error('AI API Error:', error)
    
    if (workspaceId) {
      await db.aIRequestLog.create({
        data: {
          workspaceId,
          type: 'general',
          model: AI_MODEL,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      }).catch(() => {})
    }

    throw error
  }
}

export async function analyzeSentiment(text: string, workspaceId?: string): Promise<{
  sentiment: 'positive' | 'neutral' | 'negative'
  score: number
  reasoning: string
}> {
  const prompt = `Analyze the sentiment of the following text and respond ONLY with a JSON object in this exact format:
{
  "sentiment": "positive" | "neutral" | "negative",
  "score": <number between -1 and 1>,
  "reasoning": "<brief explanation>"
}

Text to analyze:
"""
${text}
"""

Respond with ONLY the JSON object, no other text.`

  const response = await callAI(prompt, workspaceId)
  
  try {
    // Extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in response')
    }
    
    const result = JSON.parse(jsonMatch[0])
    return {
      sentiment: result.sentiment || 'neutral',
      score: result.score || 0,
      reasoning: result.reasoning || '',
    }
  } catch (error) {
    console.error('Failed to parse sentiment response:', error)
    return {
      sentiment: 'neutral',
      score: 0,
      reasoning: 'Failed to analyze sentiment',
    }
  }
}

export async function generateSummary(texts: string[], workspaceId?: string): Promise<string> {
  const prompt = `Summarize the following client feedback and interactions into a concise summary highlighting key themes, concerns, and positive points:

${texts.map((t, i) => `${i + 1}. ${t}`).join('\n\n')}

Provide a clear, actionable summary in 2-3 sentences.`

  return await callAI(prompt, workspaceId)
}

export async function generateRetentionAction(
  clientName: string,
  riskFactors: string[],
  recentInteractions: string[],
  workspaceId?: string
): Promise<{
  reasoning: string
  suggestedActions: string[]
  messageTemplate: string
}> {
  const prompt = `You are a client success expert. A client named "${clientName}" is at risk of churning.

Risk Factors:
${riskFactors.map((f, i) => `${i + 1}. ${f}`).join('\n')}

Recent Interactions:
${recentInteractions.map((i, idx) => `${idx + 1}. ${i}`).join('\n')}

Provide a JSON response with:
{
  "reasoning": "<why they're at risk>",
  "suggestedActions": ["<action 1>", "<action 2>", "<action 3>"],
  "messageTemplate": "<personalized email template to re-engage them>"
}

Respond with ONLY the JSON object.`

  const response = await callAI(prompt, workspaceId)
  
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in response')
    }
    
    const result = JSON.parse(jsonMatch[0])
    return {
      reasoning: result.reasoning || 'Client engagement has declined',
      suggestedActions: result.suggestedActions || ['Schedule a check-in call', 'Send personalized email', 'Offer additional support'],
      messageTemplate: result.messageTemplate || `Hi ${clientName},\n\nI wanted to reach out and see how things are going...`,
    }
  } catch (error) {
    console.error('Failed to parse retention action response:', error)
    return {
      reasoning: 'Client engagement has declined',
      suggestedActions: ['Schedule a check-in call', 'Send personalized email', 'Offer additional support'],
      messageTemplate: `Hi ${clientName},\n\nI wanted to reach out and see how things are going. I'd love to hear your feedback and see how we can better support you.`,
    }
  }
}
