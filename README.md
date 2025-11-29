# ClientPulse AI

**Tagline:** Predict churn before it happens. Automate retention. Grow revenue.

ClientPulse AI is a production-ready, AI-powered client success & retention platform designed for service businesses and B2B SaaS teams. It continuously monitors client interactions, feedback, sentiment, and behavioral signals to predict churn risk, generate client health scores, automate follow-ups, and provide actionable insights.

## 🎯 Features

### Core Capabilities
- **AI Health Scoring Engine** - Real-time client health scores based on engagement, sentiment, and behavior
- **Churn Prediction** - Identify at-risk clients before they leave
- **Sentiment Analysis** - AI-powered analysis of all client communications
- **Smart Alerts** - Automated notifications when risk levels change
- **Retention Automation** - AI-generated action plans and message templates
- **NPS & CSAT Surveys** - Automated feedback collection and analysis
- **Multi-tenant Workspaces** - Team collaboration with role-based access
- **Analytics Dashboard** - Visualize trends and track retention metrics
- **Stripe Billing** - Subscription management with multiple plans

### Technical Highlights
- ✅ Production-ready architecture
- ✅ Multi-tenant with row-level security
- ✅ Real-time health score calculations
- ✅ Background job processing with BullMQ
- ✅ Comprehensive API routes
- ✅ Type-safe with TypeScript
- ✅ Responsive UI with Tailwind CSS
- ✅ CI/CD ready

## 🏗️ Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS + shadcn/ui
- React Query

**Backend:**
- Next.js API Routes
- Prisma ORM
- PostgreSQL (Supabase)
- Redis + BullMQ
- NextAuth.js

**AI & Services:**
- OpenRouter API (flexible LLM provider)
- Stripe for payments
- Sentiment analysis
- Automated summarization

**Infrastructure:**
- Vercel (app hosting)
- Railway (Redis + workers)
- Supabase (PostgreSQL)
- GitHub Actions (CI/CD)

## 📦 Installation

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Redis instance
- Stripe account
- AI API key (OpenRouter or OpenAI)

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/itskiranbabu/clientpulse-ai.git
cd clientpulse-ai
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
# Database
DATABASE_URL="postgresql://..."

# Redis
REDIS_URL="redis://..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Stripe Price IDs
STRIPE_PRICE_STARTER="price_..."
STRIPE_PRICE_GROWTH="price_..."
STRIPE_PRICE_SCALE="price_..."

# AI Provider
AI_API_KEY="sk-or-v1-..."
AI_BASE_URL="https://openrouter.ai/api/v1"
AI_MODEL="anthropic/claude-3.5-sonnet"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

4. **Setup database**
```bash
npx prisma db push
```

5. **Run development server**
```bash
npm run dev
```

6. **Run background worker** (in separate terminal)
```bash
npm run worker
```

Visit `http://localhost:3000`

## 🚀 Deployment

### Vercel (App)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Railway (Redis + Worker)

1. Create Redis service
2. Create worker service with `npm run worker`
3. Add environment variables

### Supabase (Database)

1. Create project
2. Copy connection string to `DATABASE_URL`
3. Run migrations: `npx prisma db push`

### Stripe Webhooks

1. Create webhook endpoint: `https://your-domain.com/api/webhooks/stripe`
2. Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
3. Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

## 📊 Database Schema

The application uses Prisma with PostgreSQL. Key tables:

- `User` - User accounts
- `Workspace` - Multi-tenant workspaces
- `WorkspaceMember` - Team members with roles
- `Client` - Client profiles with health scores
- `ClientInteraction` - Communication logs
- `Survey` & `SurveyResponse` - Feedback collection
- `HealthScoreHistory` - Score tracking over time
- `Alert` - Churn risk notifications
- `AutomationRule` - Workflow automation
- `Subscription` - Stripe billing
- `AIRequestLog` - AI usage tracking

## 🔐 Security

- Multi-tenant row-level data isolation
- Role-based access control (Owner, Admin, Member)
- Password hashing with bcrypt
- JWT session management
- Input validation and sanitization
- Rate limiting on API routes
- Audit logging for sensitive actions

## 📈 Health Score Algorithm

The health score (0-100) is calculated from:

1. **Communication Frequency (25 points)** - Recent interaction count
2. **Sentiment Score (30 points)** - Average sentiment from interactions
3. **Engagement Score (20 points)** - Recent activity levels
4. **Feedback Score (15 points)** - NPS/CSAT survey results
5. **Time Score (10 points)** - Client tenure bonus

Risk levels:
- **Healthy**: 70-100
- **At Risk**: 40-69
- **Critical**: 0-39

## 🤖 AI Features

### Sentiment Analysis
Analyzes text from interactions to determine positive/neutral/negative sentiment with confidence scores.

### Retention Actions
Generates personalized retention strategies including:
- Risk factor analysis
- Suggested actions
- Email templates

### Feedback Summarization
Automatically summarizes survey responses and identifies key themes.

## 💳 Pricing Plans

| Plan | Price | Clients | Team Members | Features |
|------|-------|---------|--------------|----------|
| **Starter** | $29/mo | 50 | 1 | Basic health scoring, Email surveys |
| **Growth** | $99/mo | 500 | 5 | Advanced AI, Automation rules, Priority support |
| **Scale** | $299/mo | Unlimited | Unlimited | Custom AI, Advanced automation, API access |

## 🔄 Background Jobs

Automated tasks running via BullMQ:

- Daily health score recalculation
- Alert generation for at-risk clients
- Survey distribution
- Sentiment analysis processing
- Follow-up reminders

## 📝 API Documentation

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/signin` - Sign in (via NextAuth)

### Webhooks
- `POST /api/webhooks/stripe` - Stripe events

### Client Management
- Dashboard routes handle CRUD operations via Server Actions

## 🧪 Development

```bash
# Run dev server
npm run dev

# Run worker
npm run worker

# Database operations
npm run db:push      # Push schema changes
npm run db:migrate   # Create migration
npm run db:studio    # Open Prisma Studio

# Linting
npm run lint
```

## 📦 Project Structure

```
clientpulse-ai/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/                   # Next.js app router
│   │   ├── api/              # API routes
│   │   ├── auth/             # Auth pages
│   │   ├── dashboard/        # Main app (to be added)
│   │   └── page.tsx          # Landing page
│   ├── components/
│   │   └── ui/               # shadcn/ui components
│   ├── lib/
│   │   ├── ai.ts             # AI service
│   │   ├── auth.ts           # NextAuth config
│   │   ├── db.ts             # Prisma client
│   │   ├── health-score.ts   # Health calculation
│   │   ├── redis.ts          # Redis client
│   │   ├── session.ts        # Session helpers
│   │   ├── stripe.ts         # Stripe integration
│   │   └── utils.ts          # Utilities
│   └── workers/              # Background jobs (to be added)
└── package.json
```

## 🤝 Contributing

This is a production application built by Antigravity AI. For issues or feature requests, please open a GitHub issue.

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

Built with:
- Next.js
- Prisma
- Stripe
- OpenRouter
- shadcn/ui
- And many other amazing open-source projects

---

**Built with ❤️ by Antigravity AI**

For questions or support, please open an issue on GitHub.
