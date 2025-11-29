import { db } from './db'
import { differenceInDays } from 'date-fns'

interface HealthFactors {
  communicationScore: number
  sentimentScore: number
  engagementScore: number
  feedbackScore: number
  timeScore: number
}

export async function calculateHealthScore(clientId: string): Promise<{
  score: number
  riskLevel: 'healthy' | 'at_risk' | 'critical'
  factors: HealthFactors
}> {
  const client = await db.client.findUnique({
    where: { id: clientId },
    include: {
      interactions: {
        orderBy: { occurredAt: 'desc' },
        take: 50,
      },
      surveyResponses: {
        orderBy: { submittedAt: 'desc' },
        take: 10,
      },
    },
  })

  if (!client) {
    throw new Error('Client not found')
  }

  const factors: HealthFactors = {
    communicationScore: 0,
    sentimentScore: 0,
    engagementScore: 0,
    feedbackScore: 0,
    timeScore: 0,
  }

  // 1. Communication Frequency Score (0-25 points)
  const recentInteractions = client.interactions.filter(i => {
    const daysSince = differenceInDays(new Date(), new Date(i.occurredAt))
    return daysSince <= 30
  })
  
  if (recentInteractions.length >= 10) {
    factors.communicationScore = 25
  } else if (recentInteractions.length >= 5) {
    factors.communicationScore = 20
  } else if (recentInteractions.length >= 2) {
    factors.communicationScore = 15
  } else if (recentInteractions.length >= 1) {
    factors.communicationScore = 10
  } else {
    factors.communicationScore = 0
  }

  // 2. Sentiment Score (0-30 points)
  const sentimentInteractions = client.interactions.filter(i => i.sentiment)
  if (sentimentInteractions.length > 0) {
    const avgSentiment = sentimentInteractions.reduce((sum, i) => {
      if (i.sentiment === 'positive') return sum + 1
      if (i.sentiment === 'neutral') return sum + 0.5
      return sum + 0
    }, 0) / sentimentInteractions.length

    factors.sentimentScore = avgSentiment * 30
  } else {
    factors.sentimentScore = 15 // Neutral default
  }

  // 3. Engagement Score (0-20 points)
  const last7Days = client.interactions.filter(i => {
    const daysSince = differenceInDays(new Date(), new Date(i.occurredAt))
    return daysSince <= 7
  })
  
  if (last7Days.length >= 3) {
    factors.engagementScore = 20
  } else if (last7Days.length >= 1) {
    factors.engagementScore = 15
  } else {
    const daysSinceLastContact = client.lastContactDate
      ? differenceInDays(new Date(), new Date(client.lastContactDate))
      : 999
    
    if (daysSinceLastContact <= 14) {
      factors.engagementScore = 10
    } else if (daysSinceLastContact <= 30) {
      factors.engagementScore = 5
    } else {
      factors.engagementScore = 0
    }
  }

  // 4. Feedback Score (0-15 points)
  if (client.surveyResponses.length > 0) {
    const recentSurveys = client.surveyResponses.slice(0, 3)
    const avgScore = recentSurveys.reduce((sum, r) => {
      if (r.score !== null) {
        // Normalize NPS (0-10) and CSAT (1-5) to 0-1 scale
        const normalized = r.score >= 5 ? r.score / 10 : r.score / 5
        return sum + normalized
      }
      return sum
    }, 0) / recentSurveys.length

    factors.feedbackScore = avgScore * 15
  } else {
    factors.feedbackScore = 7.5 // Neutral default
  }

  // 5. Time-based Score (0-10 points)
  const daysSinceCreated = differenceInDays(new Date(), new Date(client.createdAt))
  if (daysSinceCreated >= 90) {
    factors.timeScore = 10 // Long-term client bonus
  } else if (daysSinceCreated >= 30) {
    factors.timeScore = 7
  } else {
    factors.timeScore = 5 // New client
  }

  // Calculate total score
  const totalScore = Math.round(
    factors.communicationScore +
    factors.sentimentScore +
    factors.engagementScore +
    factors.feedbackScore +
    factors.timeScore
  )

  // Determine risk level
  let riskLevel: 'healthy' | 'at_risk' | 'critical'
  if (totalScore >= 70) {
    riskLevel = 'healthy'
  } else if (totalScore >= 40) {
    riskLevel = 'at_risk'
  } else {
    riskLevel = 'critical'
  }

  return {
    score: totalScore,
    riskLevel,
    factors,
  }
}

export async function updateClientHealthScore(clientId: string): Promise<void> {
  const { score, riskLevel, factors } = await calculateHealthScore(clientId)

  // Update client
  await db.client.update({
    where: { id: clientId },
    data: {
      healthScore: score,
      riskLevel,
    },
  })

  // Record history
  await db.healthScoreHistory.create({
    data: {
      clientId,
      score,
      riskLevel,
      factors: factors as any,
    },
  })

  // Check if we need to create an alert
  const previousHistory = await db.healthScoreHistory.findFirst({
    where: { clientId },
    orderBy: { calculatedAt: 'desc' },
    skip: 1,
  })

  if (previousHistory) {
    const scoreDrop = previousHistory.score - score
    const riskLevelChanged = previousHistory.riskLevel !== riskLevel

    if (scoreDrop >= 15 || (riskLevelChanged && riskLevel !== 'healthy')) {
      const client = await db.client.findUnique({
        where: { id: clientId },
        select: { name: true, workspaceId: true },
      })

      if (client) {
        await db.alert.create({
          data: {
            clientId,
            type: riskLevel === 'critical' ? 'churn_risk' : 'health_decline',
            severity: riskLevel === 'critical' ? 'critical' : 'high',
            title: `${client.name} health score declined`,
            message: `Health score dropped from ${previousHistory.score} to ${score}. Risk level: ${riskLevel}`,
            metadata: {
              previousScore: previousHistory.score,
              currentScore: score,
              scoreDrop,
              factors,
            },
          },
        })
      }
    }
  }
}
