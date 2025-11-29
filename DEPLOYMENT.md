# Deployment Guide

This guide walks you through deploying ClientPulse AI to production.

## Prerequisites

- GitHub account
- Vercel account
- Railway account (for Redis + Worker)
- Supabase account (for PostgreSQL)
- Stripe account
- OpenRouter or OpenAI API key

## Step 1: Database Setup (Supabase)

1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Wait for the database to be provisioned
4. Go to Settings → Database
5. Copy the connection string (URI format)
6. Save as `DATABASE_URL`

## Step 2: Redis Setup (Railway)

1. Go to [Railway](https://railway.app)
2. Create a new project
3. Add a Redis service
4. Copy the Redis URL
5. Save as `REDIS_URL`

## Step 3: Stripe Setup

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Get your API keys from Developers → API keys
3. Create products and prices:
   - Starter: $29/month
   - Growth: $99/month
   - Scale: $299/month
4. Copy the price IDs
5. Set up webhook endpoint (will be created after Vercel deployment)

## Step 4: AI Provider Setup

### Option A: OpenRouter (Recommended)
1. Go to [OpenRouter](https://openrouter.ai)
2. Create an account
3. Generate an API key
4. Set:
   - `AI_API_KEY`: Your OpenRouter key
   - `AI_BASE_URL`: https://openrouter.ai/api/v1
   - `AI_MODEL`: anthropic/claude-3.5-sonnet

### Option B: OpenAI
1. Go to [OpenAI](https://platform.openai.com)
2. Generate an API key
3. Set:
   - `AI_API_KEY`: Your OpenAI key
   - `AI_BASE_URL`: https://api.openai.com/v1
   - `AI_MODEL`: gpt-4

## Step 5: Deploy to Vercel

1. Push code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your GitHub repository
4. Configure environment variables:

```env
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
GOOGLE_CLIENT_ID=<optional>
GOOGLE_CLIENT_SECRET=<optional>
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=<will be set after webhook creation>
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_PRICE_STARTER=price_...
STRIPE_PRICE_GROWTH=price_...
STRIPE_PRICE_SCALE=price_...
AI_API_KEY=sk-or-v1-...
AI_BASE_URL=https://openrouter.ai/api/v1
AI_MODEL=anthropic/claude-3.5-sonnet
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NEXT_PUBLIC_APP_NAME=ClientPulse AI
```

5. Deploy!

## Step 6: Database Migration

After first deployment:

```bash
# Install Vercel CLI
npm i -g vercel

# Link project
vercel link

# Run migration
vercel env pull .env.local
npx prisma db push
```

## Step 7: Stripe Webhook

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-domain.vercel.app/api/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy the webhook signing secret
5. Add to Vercel environment variables as `STRIPE_WEBHOOK_SECRET`
6. Redeploy

## Step 8: Deploy Worker (Railway)

1. In Railway, create a new service
2. Connect to your GitHub repository
3. Set build command: `npm install && npm run build`
4. Set start command: `npm run worker`
5. Add all environment variables (same as Vercel)
6. Deploy

## Step 9: Verify Deployment

1. Visit your Vercel URL
2. Create an account
3. Add a test client
4. Check that health scores are calculated
5. Verify worker logs in Railway

## Monitoring

### Vercel
- View deployment logs in Vercel dashboard
- Monitor function execution times
- Check error rates

### Railway
- Monitor worker logs
- Check Redis connection
- View job processing stats

### Supabase
- Monitor database performance
- Check connection pool usage
- View query performance

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check Supabase connection limits
- Ensure IP allowlist includes Vercel IPs

### Worker Not Processing Jobs
- Check Railway logs
- Verify `REDIS_URL` is correct
- Ensure worker service is running

### Stripe Webhooks Failing
- Verify webhook secret is correct
- Check endpoint URL is accessible
- Review Stripe webhook logs

### AI API Errors
- Verify API key is valid
- Check rate limits
- Ensure model name is correct

## Scaling

### Database
- Upgrade Supabase plan for more connections
- Add read replicas for heavy read workloads
- Implement connection pooling

### Redis
- Upgrade Railway Redis plan
- Add Redis Cluster for high availability

### Workers
- Scale Railway worker instances
- Add more worker types for specific tasks
- Implement job prioritization

## Security Checklist

- [ ] All environment variables are set
- [ ] NEXTAUTH_SECRET is strong and unique
- [ ] Stripe webhook secret is configured
- [ ] Database has SSL enabled
- [ ] Redis requires authentication
- [ ] Rate limiting is enabled
- [ ] CORS is properly configured
- [ ] API routes have authentication

## Backup Strategy

### Database
- Supabase provides automatic daily backups
- Set up point-in-time recovery
- Export critical data regularly

### Redis
- Redis data is ephemeral (jobs only)
- No backup needed for queue data

## Cost Estimation

### Monthly Costs (estimated)

**Vercel:**
- Pro Plan: $20/month
- Additional usage: ~$10-50/month

**Railway:**
- Redis: $5-10/month
- Worker: $5-10/month

**Supabase:**
- Pro Plan: $25/month

**Stripe:**
- 2.9% + $0.30 per transaction

**AI API:**
- OpenRouter: Pay per use (~$0.01-0.10 per request)
- Varies based on usage

**Total: ~$65-115/month + usage-based costs**

## Support

For issues or questions:
- Open a GitHub issue
- Check documentation
- Review logs in respective platforms

---

**Deployment completed! 🚀**

Your ClientPulse AI instance is now live and ready to help predict churn and retain clients.
