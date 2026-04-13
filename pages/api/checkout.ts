import type { NextApiRequest, NextApiResponse } from 'next';

const PLANS = {
  starter: {
    name: 'Starter',
    amount: 900, // $9.00 in cents
  },
  pro: {
    name: 'Pro',
    amount: 2900, // $29.00 in cents
  },
} as const;

type PlanId = keyof typeof PLANS;

function isPlanId(value: unknown): value is PlanId {
  return typeof value === 'string' && value in PLANS;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { plan } = req.query;

  if (!isPlanId(plan)) {
    return res.status(400).json({ error: 'Invalid plan. Must be "starter" or "pro".' });
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return res.status(500).json({
      error: 'Stripe is not configured. Set STRIPE_SECRET_KEY to enable checkout.',
    });
  }

  const selectedPlan = PLANS[plan];
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (req.headers.origin as string) ||
    `https://${req.headers.host}`;

  try {
    const params = new URLSearchParams({
      mode: 'payment',
      'line_items[0][price_data][currency]': 'usd',
      'line_items[0][price_data][product_data][name]': `Uptime Monitor — ${selectedPlan.name}`,
      'line_items[0][price_data][product_data][description]':
        plan === 'starter'
          ? '10 endpoints, 5-min checks, email alerts'
          : '100 endpoints, 1-min checks, webhooks & Slack',
      'line_items[0][price_data][unit_amount]': String(selectedPlan.amount),
      'line_items[0][quantity]': '1',
      success_url: `${origin}/?checkout=success`,
      cancel_url: `${origin}/pricing`,
    });

    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      console.error('[checkout] Stripe API error:', errorBody);
      return res.status(502).json({
        error: 'Failed to create Stripe checkout session.',
        details: errorBody?.error?.message ?? 'Unknown Stripe error',
      });
    }

    const session = await response.json();
    return res.redirect(303, session.url);
  } catch (err) {
    console.error('[checkout] Unexpected error:', err);
    return res.status(500).json({ error: 'Internal server error during checkout.' });
  }
}
