import Head from 'next/head';
import Link from 'next/link';

interface PlanFeature {
  text: string;
}

interface PricingPlan {
  id: 'starter' | 'pro';
  name: string;
  price: number;
  period: string;
  description: string;
  features: PlanFeature[];
  highlighted: boolean;
  badge?: string;
}

const PLANS: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 9,
    period: 'mo',
    description: 'Perfect for individuals and small projects.',
    highlighted: false,
    features: [
      { text: '10 monitored endpoints' },
      { text: '5-minute check intervals' },
      { text: 'Email alerts' },
      { text: 'Status dashboard' },
      { text: '30-day history' },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 29,
    period: 'mo',
    description: 'Built for teams that need advanced monitoring.',
    highlighted: true,
    badge: 'Most Popular',
    features: [
      { text: '100 monitored endpoints' },
      { text: '1-minute check intervals' },
      { text: 'Email alerts' },
      { text: 'Webhook integrations' },
      { text: 'Slack notifications' },
      { text: '90-day history' },
      { text: 'Priority support' },
    ],
  },
];

function CheckIcon() {
  return (
    <svg
      className="w-4 h-4 shrink-0 text-indigo-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

export default function Pricing() {
  return (
    <>
      <Head>
        <title>Pricing — Uptime Monitor</title>
        <meta name="description" content="Simple, transparent pricing for uptime monitoring." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-[#0f172a] text-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">

          {/* Nav */}
          <nav className="flex items-center justify-between mb-12">
            <Link
              href="/"
              className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors duration-150"
            >
              <span className="text-indigo-400 text-lg leading-none">●</span>
              <span className="font-bold tracking-tight">Uptime Monitor</span>
            </Link>
            <Link
              href="/"
              className="text-sm text-slate-400 hover:text-slate-200 transition-colors duration-150 flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Dashboard
            </Link>
          </nav>

          {/* Hero */}
          <div className="text-center mb-14">
            <span className="inline-block mb-4 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 tracking-wider uppercase">
              Pricing
            </span>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4">
              Simple,{' '}
              <span className="text-indigo-400">transparent</span>{' '}
              pricing
            </h1>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              Start monitoring in minutes. No hidden fees, no lock-in. Upgrade or cancel anytime.
            </p>
          </div>

          {/* Plans */}
          <div className="grid sm:grid-cols-2 gap-6 mb-12">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`
                  relative rounded-2xl border p-8 flex flex-col
                  transition-all duration-200
                  ${plan.highlighted
                    ? 'bg-indigo-500/10 border-indigo-500/40 shadow-xl shadow-indigo-500/10 hover:border-indigo-400/60'
                    : 'bg-slate-800/60 border-slate-700/60 hover:border-slate-600 hover:bg-slate-800'
                  }
                `}
              >
                {plan.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 whitespace-nowrap">
                    {plan.badge}
                  </span>
                )}

                <div className="mb-6">
                  <h2 className="text-lg font-bold text-slate-100 mb-1">{plan.name}</h2>
                  <p className="text-sm text-slate-400 mb-4">{plan.description}</p>
                  <div className="flex items-end gap-1">
                    <span className="text-slate-400 text-lg font-medium self-start mt-1">$</span>
                    <span className="text-5xl font-extrabold tracking-tight text-slate-100">{plan.price}</span>
                    <span className="text-slate-400 mb-1.5">/{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feat) => (
                    <li key={feat.text} className="flex items-center gap-2.5 text-sm text-slate-300">
                      <CheckIcon />
                      {feat.text}
                    </li>
                  ))}
                </ul>

                <a
                  href={`/api/checkout?plan=${plan.id}`}
                  className={`
                    block w-full text-center py-3 rounded-xl text-sm font-semibold
                    transition-all duration-150
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0f172a]
                    ${plan.highlighted
                      ? 'bg-indigo-500 text-white hover:bg-indigo-400 shadow-lg shadow-indigo-500/25 focus:ring-indigo-500'
                      : 'bg-slate-700 text-slate-200 hover:bg-slate-600 focus:ring-slate-500'
                    }
                  `}
                >
                  Get started with {plan.name}
                </a>
              </div>
            ))}
          </div>

          {/* Feature comparison footer */}
          <div className="rounded-2xl border border-slate-700/60 bg-slate-800/40 p-6 mb-10">
            <h3 className="text-sm font-semibold text-slate-300 mb-4">All plans include</h3>
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                'SSL certificate checks',
                'Status page',
                'Incident history',
                'API access',
                'Multi-region checks',
                'Instant notifications',
              ].map((feat) => (
                <div key={feat} className="flex items-center gap-2 text-sm text-slate-400">
                  <CheckIcon />
                  {feat}
                </div>
              ))}
            </div>
          </div>

          <p className="text-center text-slate-600 text-xs">
            Built with Next.js · Deployed on Vercel
          </p>
        </div>
      </div>
    </>
  );
}
