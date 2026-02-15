# Billing & Subscriptions - Backend Plan

**Priority:** P0 - Critical  
**Timeline:** 2-3 weeks  
**Cost:** 2.9% + $0.30 per transaction

---

## Overview

Stripe integration for subscription management, payments, and invoicing.

## Architecture

```
User Action
    │
    ▼
Stripe Checkout/Portal
    │
    ▼
Webhook (api/webhooks/stripe)
    │
    ▼
Update Supabase
    │
    ▼
Feature Gates Check
```

## Database Schema

```sql
-- Subscriptions table
CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) UNIQUE,
  stripe_customer_id text,
  stripe_subscription_id text,
  
  -- Status
  status text CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete')),
  tier text CHECK (tier IN ('free', 'pro', 'studio')),
  
  -- Billing period
  current_period_start timestamp,
  current_period_end timestamp,
  cancel_at_period_end boolean DEFAULT false,
  
  -- Metadata
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Invoices
CREATE TABLE invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  stripe_invoice_id text,
  stripe_charge_id text,
  
  -- Amounts
  amount_due integer, -- in cents
  amount_paid integer,
  currency text DEFAULT 'usd',
  
  -- Status
  status text,
  paid boolean DEFAULT false,
  
  -- Links
  pdf_url text,
  hosted_invoice_url text,
  
  created_at timestamp DEFAULT now()
);

-- Usage tracking (for metered billing)
CREATE TABLE usage_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  subscription_item_id text, -- Stripe subscription item
  quantity integer,
  timestamp timestamp DEFAULT now(),
  action text -- 'ai_generation', 'export', etc.
);

-- Indexes
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_invoices_user ON invoices(user_id, created_at DESC);
```

## Stripe Products Setup

```typescript
// scripts/setup-stripe.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function setupProducts() {
  // Pro Monthly
  const proMonthly = await stripe.products.create({
    name: 'Mashups Pro',
    description: 'Unlimited mashups + AI features',
    metadata: { tier: 'pro' }
  });

  await stripe.prices.create({
    product: proMonthly.id,
    unit_amount: 999, // $9.99
    currency: 'usd',
    recurring: { interval: 'month' },
    lookup_key: 'pro_monthly'
  });

  // Pro Yearly
  await stripe.prices.create({
    product: proMonthly.id,
    unit_amount: 9990, // $99.90 (2 months free)
    currency: 'usd',
    recurring: { interval: 'year' },
    lookup_key: 'pro_yearly'
  });

  // Studio Monthly
  const studioMonthly = await stripe.products.create({
    name: 'Mashups Studio',
    description: 'Everything in Pro + collaboration + priority',
    metadata: { tier: 'studio' }
  });

  await stripe.prices.create({
    product: studioMonthly.id,
    unit_amount: 2999, // $29.99
    currency: 'usd',
    recurring: { interval: 'month' },
    lookup_key: 'studio_monthly'
  });

  // Studio Yearly
  await stripe.prices.create({
    product: studioMonthly.id,
    unit_amount: 29990, // $299.90
    currency: 'usd',
    recurring: { interval: 'year' },
    lookup_key: 'studio_yearly'
  });
}
```

## API Endpoints

### Get Current Subscription
```typescript
GET /api/billing/subscription

Response:
{
  "subscription": {
    "id": "uuid",
    "tier": "pro",
    "status": "active",
    "currentPeriodStart": "2026-01-01",
    "currentPeriodEnd": "2026-02-01",
    "cancelAtPeriodEnd": false
  },
  "features": {
    "aiGenerations": { "used": 15, "limit": 100 },
    "exports": { "used": 5, "limit": null }, // unlimited
    "collaboration": true,
    "prioritySupport": false
  }
}
```

### Create Checkout Session
```typescript
POST /api/billing/checkout

Body:
{
  "tier": "pro",
  "interval": "month" | "year"
}

Response:
{
  "url": "https://checkout.stripe.com/..." // Redirect here
}
```

### Customer Portal
```typescript
POST /api/billing/portal

Response:
{
  "url": "https://billing.stripe.com/session/..."
}
```

### Webhook Handler
```typescript
// app/api/webhooks/stripe/route.ts
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  const payload = await req.text();
  const signature = req.headers.get('stripe-signature');

  let event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    return new Response('Invalid signature', { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object);
      break;

    case 'invoice.paid':
      await handleInvoicePaid(event.data.object);
      break;

    case 'invoice.payment_failed':
      await handlePaymentFailed(event.data.object);
      break;

    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object);
      break;

    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object);
      break;
  }

  return new Response('OK');
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;

  // Get subscription details
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  // Determine tier from price lookup_key
  const price = await stripe.prices.retrieve(
    subscription.items.data[0].price.id
  );
  const tier = price.lookup_key?.includes('studio') ? 'studio' : 'pro';

  // Get user from customer metadata
  const customer = await stripe.customers.retrieve(customerId);
  const userId = customer.metadata.userId;

  // Upsert subscription
  await supabase.from('subscriptions').upsert({
    user_id: userId,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId,
    status: subscription.status,
    tier,
    current_period_start: new Date(subscription.current_period_start * 1000),
    current_period_end: new Date(subscription.current_period_end * 1000)
  });
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  // Notify user
  const customer = await stripe.customers.retrieve(invoice.customer as string);
  const userId = customer.metadata.userId;

  await sendEmail(userId, 'payment_failed', {
    amount: invoice.amount_due / 100,
    invoiceUrl: invoice.hosted_invoice_url
  });
}
```

## Feature Gates

```typescript
// lib/billing/features.ts
const TIER_FEATURES = {
  free: {
    maxMashups: 3,
    aiGenerations: 0,
    exportsPerMonth: 5,
    collaboration: false,
    analyticsDays: 7,
    support: 'community'
  },
  pro: {
    maxMashups: Infinity,
    aiGenerations: 100,
    exportsPerMonth: Infinity,
    collaboration: true,
    analyticsDays: 90,
    support: 'email'
  },
  studio: {
    maxMashups: Infinity,
    aiGenerations: Infinity,
    exportsPerMonth: Infinity,
    collaboration: true,
    analyticsDays: Infinity,
    support: 'priority'
  }
};

export async function checkFeatureAccess(
  userId: string,
  feature: keyof typeof TIER_FEATURES.pro
): Promise<boolean> {
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('tier')
    .eq('user_id', userId)
    .single();

  const tier = subscription?.tier || 'free';
  const limit = TIER_FEATURES[tier][feature];

  if (limit === false) return false;
  if (typeof limit === 'number' && limit === Infinity) return true;

  // Check usage against limit
  const usage = await getUsage(userId, feature);
  return usage < limit;
}

// Middleware for API routes
export function requireFeature(feature: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user.id;
    const hasAccess = await checkFeatureAccess(userId, feature);

    if (!hasAccess) {
      return res.status(403).json({
        error: 'Feature not available on your plan',
        upgradeUrl: '/upgrade'
      });
    }

    next();
  };
}
```

## Testing Webhooks Locally

```bash
# Install Stripe CLI
stripe login

# Forward webhooks to local
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test events
stripe trigger checkout.session.completed
stripe trigger invoice.payment_failed
```

## Usage Tracking

```typescript
// lib/billing/usage.ts
export async function trackUsage(
  userId: string,
  action: string,
  quantity: number = 1
) {
  // Record in database
  await supabase.from('usage_records').insert({
    user_id: userId,
    action,
    quantity,
    timestamp: new Date()
  });

  // For metered billing with Stripe
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('stripe_subscription_id')
    .eq('user_id', userId)
    .single();

  if (subscription?.stripe_subscription_id) {
    const stripeSubscription = await stripe.subscriptions.retrieve(
      subscription.stripe_subscription_id
    );

    // Get the metered price item
    const meteredItem = stripeSubscription.items.data.find(
      item => item.price.recurring?.usage_type === 'metered'
    );

    if (meteredItem) {
      await stripe.subscriptionItems.createUsageRecord(
        meteredItem.id,
        { quantity, timestamp: 'now' }
      );
    }
  }
}
```

## Email Notifications

| Event | Template | Timing |
|-------|----------|--------|
| Subscription Started | welcome_pro | Immediately |
| Payment Failed | payment_failed | Immediately |
| Invoice Available | invoice_ready | Monthly |
| Trial Ending | trial_reminder | 3 days before |
| Subscription Canceled | cancellation | Immediately |

---

*Next: Real-time Collaboration*