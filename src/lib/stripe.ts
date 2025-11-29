import Stripe from 'stripe'
import { db } from './db'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
})

export const PLANS = {
  starter: {
    name: 'Starter',
    price: 29,
    priceId: process.env.STRIPE_PRICE_STARTER || '',
    features: [
      'Up to 50 clients',
      'Basic health scoring',
      'Email surveys',
      '1 team member',
    ],
  },
  growth: {
    name: 'Growth',
    price: 99,
    priceId: process.env.STRIPE_PRICE_GROWTH || '',
    features: [
      'Up to 500 clients',
      'Advanced AI insights',
      'Automation rules',
      'Up to 5 team members',
      'Priority support',
    ],
  },
  scale: {
    name: 'Scale',
    price: 299,
    priceId: process.env.STRIPE_PRICE_SCALE || '',
    features: [
      'Unlimited clients',
      'Custom AI models',
      'Advanced automation',
      'Unlimited team members',
      'Dedicated support',
      'API access',
    ],
  },
}

export async function createCheckoutSession(
  workspaceId: string,
  plan: keyof typeof PLANS,
  successUrl: string,
  cancelUrl: string
) {
  const workspace = await db.workspace.findUnique({
    where: { id: workspaceId },
    include: { subscription: true },
  })

  if (!workspace) {
    throw new Error('Workspace not found')
  }

  let customerId = workspace.subscription?.stripeCustomerId

  // Create customer if doesn't exist
  if (!customerId) {
    const customer = await stripe.customers.create({
      metadata: {
        workspaceId: workspace.id,
      },
    })
    customerId = customer.id

    await db.subscription.upsert({
      where: { workspaceId: workspace.id },
      create: {
        workspaceId: workspace.id,
        stripeCustomerId: customerId,
        plan,
        status: 'active',
      },
      update: {
        stripeCustomerId: customerId,
      },
    })
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: PLANS[plan].priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      workspaceId: workspace.id,
      plan,
    },
  })

  return session
}

export async function createPortalSession(workspaceId: string, returnUrl: string) {
  const subscription = await db.subscription.findUnique({
    where: { workspaceId },
  })

  if (!subscription?.stripeCustomerId) {
    throw new Error('No subscription found')
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: returnUrl,
  })

  return session
}

export async function handleWebhook(event: Stripe.Event) {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const workspaceId = session.metadata?.workspaceId
      const plan = session.metadata?.plan

      if (workspaceId && plan) {
        await db.subscription.update({
          where: { workspaceId },
          data: {
            stripeSubscriptionId: session.subscription as string,
            stripePriceId: PLANS[plan as keyof typeof PLANS].priceId,
            plan,
            status: 'active',
          },
        })

        await db.workspace.update({
          where: { id: workspaceId },
          data: { plan },
        })
      }
      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      const workspaceSubscription = await db.subscription.findUnique({
        where: { stripeSubscriptionId: subscription.id },
      })

      if (workspaceSubscription) {
        await db.subscription.update({
          where: { id: workspaceSubscription.id },
          data: {
            status: subscription.status,
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          },
        })
      }
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      const workspaceSubscription = await db.subscription.findUnique({
        where: { stripeSubscriptionId: subscription.id },
      })

      if (workspaceSubscription) {
        await db.subscription.update({
          where: { id: workspaceSubscription.id },
          data: { status: 'canceled' },
        })

        await db.workspace.update({
          where: { id: workspaceSubscription.workspaceId },
          data: { status: 'suspended' },
        })
      }
      break
    }
  }
}
