import { Worker, Queue } from 'bullmq'
import { redis } from '../lib/redis'
import { db } from '../lib/db'
import { updateClientHealthScore } from '../lib/health-score'
import { analyzeSentiment } from '../lib/ai'

// Create queues
export const healthScoreQueue = new Queue('health-score', { connection: redis })
export const sentimentQueue = new Queue('sentiment-analysis', { connection: redis })
export const alertQueue = new Queue('alerts', { connection: redis })

// Health Score Worker
const healthScoreWorker = new Worker(
  'health-score',
  async (job) => {
    const { clientId } = job.data
    console.log(`Processing health score for client: ${clientId}`)
    
    try {
      await updateClientHealthScore(clientId)
      return { success: true, clientId }
    } catch (error) {
      console.error(`Failed to update health score for ${clientId}:`, error)
      throw error
    }
  },
  { connection: redis }
)

// Sentiment Analysis Worker
const sentimentWorker = new Worker(
  'sentiment-analysis',
  async (job) => {
    const { interactionId, text, workspaceId } = job.data
    console.log(`Analyzing sentiment for interaction: ${interactionId}`)
    
    try {
      const result = await analyzeSentiment(text, workspaceId)
      
      await db.clientInteraction.update({
        where: { id: interactionId },
        data: {
          sentiment: result.sentiment,
          sentimentScore: result.score,
        },
      })
      
      return { success: true, interactionId, sentiment: result.sentiment }
    } catch (error) {
      console.error(`Failed to analyze sentiment for ${interactionId}:`, error)
      throw error
    }
  },
  { connection: redis }
)

// Alert Worker
const alertWorker = new Worker(
  'alerts',
  async (job) => {
    const { type, data } = job.data
    console.log(`Processing alert: ${type}`)
    
    try {
      // Here you would send emails, push notifications, etc.
      // For now, we just log
      console.log('Alert data:', data)
      return { success: true, type }
    } catch (error) {
      console.error(`Failed to process alert ${type}:`, error)
      throw error
    }
  },
  { connection: redis }
)

// Daily health score recalculation job
async function scheduleDailyHealthScoreUpdate() {
  const clients = await db.client.findMany({
    where: { status: 'active' },
    select: { id: true },
  })

  console.log(`Scheduling health score updates for ${clients.length} clients`)

  for (const client of clients) {
    await healthScoreQueue.add(
      'daily-update',
      { clientId: client.id },
      { delay: Math.random() * 60000 } // Spread over 1 minute
    )
  }
}

// Schedule daily job (runs every 24 hours)
setInterval(scheduleDailyHealthScoreUpdate, 24 * 60 * 60 * 1000)

// Run once on startup
scheduleDailyHealthScoreUpdate()

// Worker event handlers
healthScoreWorker.on('completed', (job) => {
  console.log(`✓ Health score job ${job.id} completed`)
})

healthScoreWorker.on('failed', (job, err) => {
  console.error(`✗ Health score job ${job?.id} failed:`, err)
})

sentimentWorker.on('completed', (job) => {
  console.log(`✓ Sentiment job ${job.id} completed`)
})

sentimentWorker.on('failed', (job, err) => {
  console.error(`✗ Sentiment job ${job?.id} failed:`, err)
})

alertWorker.on('completed', (job) => {
  console.log(`✓ Alert job ${job.id} completed`)
})

alertWorker.on('failed', (job, err) => {
  console.error(`✗ Alert job ${job?.id} failed:`, err)
})

console.log('🚀 Workers started successfully')
console.log('- Health Score Worker')
console.log('- Sentiment Analysis Worker')
console.log('- Alert Worker')

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing workers...')
  await healthScoreWorker.close()
  await sentimentWorker.close()
  await alertWorker.close()
  process.exit(0)
})
