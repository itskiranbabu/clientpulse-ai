# ClientPulse AI - System Architecture

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Browser    │  │    Mobile    │  │   API Client │          │
│  │   (React)    │  │  (Future)    │  │   (Future)   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                           │
│                      (Next.js 14 + Vercel)                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Frontend (React)                       │  │
│  │  • Landing Page    • Dashboard    • Client Management    │  │
│  │  • Auth Pages      • Surveys      • Settings             │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                 API Routes (Next.js)                      │  │
│  │  • /api/auth/*           • /api/clients/*                │  │
│  │  • /api/webhooks/*       • /api/surveys/*                │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  Server Actions                           │  │
│  │  • Client Operations     • Health Calculations           │  │
│  │  • Survey Management     • Alert Generation              │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       SERVICE LAYER                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Auth Service│  │  AI Service  │  │Stripe Service│          │
│  │  (NextAuth)  │  │ (OpenRouter) │  │   (Billing)  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │Health Score  │  │Alert Service │  │Email Service │          │
│  │   Engine     │  │              │  │   (SMTP)     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              PostgreSQL (Supabase)                        │  │
│  │  • Users & Workspaces    • Clients & Interactions        │  │
│  │  • Surveys & Responses   • Health Scores & Alerts        │  │
│  │  • Subscriptions         • Audit Logs                    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  Prisma ORM                               │  │
│  │  • Type-safe queries     • Migrations                    │  │
│  │  • Connection pooling    • Query optimization            │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      WORKER LAYER                                │
│                    (Railway + BullMQ)                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Redis Queue                            │  │
│  │  • Job scheduling        • Queue management              │  │
│  │  • Priority handling     • Retry logic                   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │Health Score  │  │  Sentiment   │  │    Alert     │          │
│  │   Worker     │  │   Worker     │  │   Worker     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow

### 1. User Authentication Flow
```
User → Sign In Page → NextAuth → Database → Session Created → Dashboard
```

### 2. Client Health Score Calculation Flow
```
Client Data → Health Score Engine → Calculate Factors → Update Database
     ↓
Historical Record → Alert Check → Generate Alert (if needed) → Notify User
```

### 3. AI Sentiment Analysis Flow
```
New Interaction → Queue Job → Sentiment Worker → AI API → Update Database
     ↓
Health Score Recalculation → Alert Generation (if needed)
```

### 4. Survey Response Flow
```
Survey Link → User Response → Save to Database → AI Analysis → Summary
     ↓
Update Client Health Score → Check for Alerts → Notify Team
```

### 5. Billing Flow
```
User → Checkout → Stripe → Webhook → Update Subscription → Activate Features
```

## 🗄️ Database Schema Overview

### Core Tables
```
User
├── id (PK)
├── email (unique)
├── password (hashed)
└── Relations: WorkspaceMember[], ClientInteraction[], Alert[]

Workspace
├── id (PK)
├── slug (unique)
├── plan (starter/growth/scale)
└── Relations: WorkspaceMember[], Client[], Survey[], Subscription

Client
├── id (PK)
├── workspaceId (FK)
├── healthScore (0-100)
├── riskLevel (healthy/at_risk/critical)
└── Relations: ClientInteraction[], SurveyResponse[], Alert[]

ClientInteraction
├── id (PK)
├── clientId (FK)
├── sentiment (positive/neutral/negative)
└── sentimentScore (-1 to 1)

HealthScoreHistory
├── id (PK)
├── clientId (FK)
├── score
├── factors (JSON)
└── calculatedAt
```

## 🔐 Security Architecture

### Multi-Tenant Isolation
```
Request → Auth Check → Workspace Verification → Row-Level Filter → Response
```

### RBAC Implementation
```
User Role → Permission Check → Action Allowed/Denied
     ↓
Audit Log Entry (for sensitive actions)
```

### Data Protection Layers
1. **Transport**: HTTPS/TLS encryption
2. **Storage**: Encrypted passwords (bcrypt)
3. **Session**: JWT with secure cookies
4. **Database**: Connection encryption
5. **API**: Rate limiting & validation

## 🚀 Deployment Architecture

### Production Environment
```
┌─────────────────────────────────────────────────────────────────┐
│                         VERCEL                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Next.js Application (Serverless Functions)              │  │
│  │  • Auto-scaling                                          │  │
│  │  • Edge caching                                          │  │
│  │  • Global CDN                                            │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
┌──────────────────────────┐  ┌──────────────────────────┐
│       SUPABASE           │  │       RAILWAY            │
│  ┌────────────────────┐  │  │  ┌────────────────────┐  │
│  │   PostgreSQL       │  │  │  │   Redis + Workers  │  │
│  │   • Managed DB     │  │  │  │   • BullMQ         │  │
│  │   • Auto backups   │  │  │  │   • Job processing │  │
│  │   • Scaling        │  │  │  │   • Auto-scaling   │  │
│  └────────────────────┘  │  │  └────────────────────┘  │
└──────────────────────────┘  └──────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │    Stripe    │  │  OpenRouter  │  │    SMTP      │          │
│  │   (Billing)  │  │     (AI)     │  │   (Email)    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

## 📊 Performance Optimization

### Caching Strategy
```
1. Redis Cache
   ├── Session data
   ├── Frequently accessed clients
   └── Health score calculations

2. Next.js Cache
   ├── Static pages
   ├── API responses
   └── Component rendering

3. Database Indexes
   ├── Client lookups
   ├── Health score queries
   └── Alert filtering
```

### Query Optimization
- Prisma query optimization
- Selective field loading
- Pagination for large datasets
- Batch operations
- Connection pooling

## 🔄 Background Job Processing

### Job Queue Architecture
```
Application → Redis Queue → Worker Pool → Process Job → Update Database
                                ↓
                          Retry on Failure
                                ↓
                          Dead Letter Queue
```

### Job Types
1. **Health Score Jobs**: Daily recalculation
2. **Sentiment Jobs**: Real-time analysis
3. **Alert Jobs**: Notification delivery
4. **Cleanup Jobs**: Data maintenance

## 🌐 API Architecture

### RESTful Endpoints
```
/api/auth/*           - Authentication
/api/clients/*        - Client management
/api/surveys/*        - Survey operations
/api/webhooks/*       - External integrations
```

### Server Actions
```
Client-side → Server Action → Database → Response
                    ↓
              Validation & Auth Check
```

## 📈 Scalability Considerations

### Horizontal Scaling
- Vercel serverless functions (auto-scale)
- Railway worker instances (manual scale)
- Database read replicas (future)

### Vertical Scaling
- Database plan upgrades
- Redis memory increase
- Worker resource allocation

### Performance Targets
- Page load: < 2s
- API response: < 500ms
- Health calculation: < 1s
- Background jobs: < 5s

## 🔍 Monitoring & Observability

### Metrics Tracked
- Request latency
- Error rates
- Database query performance
- Worker job completion
- AI API usage
- User engagement

### Logging
- Application logs (Vercel)
- Worker logs (Railway)
- Database logs (Supabase)
- Error tracking (Sentry ready)

## 🛡️ Disaster Recovery

### Backup Strategy
- Database: Daily automated backups (Supabase)
- Code: Git version control
- Configuration: Environment variable backups

### Recovery Plan
1. Database restore from backup
2. Redeploy from Git
3. Reconfigure environment variables
4. Verify functionality

## 🔮 Future Architecture Enhancements

### Phase 2
- Microservices for AI processing
- Dedicated analytics database
- Real-time WebSocket connections
- Mobile API gateway

### Phase 3
- Multi-region deployment
- Advanced caching layer
- Machine learning pipeline
- Data warehouse integration

---

**Architecture designed for:**
- ✅ Scalability
- ✅ Reliability
- ✅ Security
- ✅ Performance
- ✅ Maintainability

Built with modern best practices and production-ready infrastructure.
