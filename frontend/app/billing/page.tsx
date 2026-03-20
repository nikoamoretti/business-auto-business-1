"use client";

import { useState } from "react";
import Link from "next/link";

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: 0,
    priceId: null,
    features: ["Up to 3 projects", "1GB storage", "Community support"],
  },
  {
    id: "pro",
    name: "Pro",
    price: 29,
    priceId: "price_pro_monthly",
    features: ["Unlimited projects", "50GB storage", "Priority support", "Advanced analytics"],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 99,
    priceId: "price_enterprise_monthly",
    features: ["Everything in Pro", "SSO & SAML", "SLA guarantee", "Dedicated infra"],
  },
];

export default function BillingPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [currentPlan] = useState("starter");

  async function handleUpgrade(priceId: string, planId: string) {
    setLoading(planId);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch (err) {
      console.error("Checkout error:", err);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--background)", padding: 32 }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <Link
            href="/dashboard"
            style={{ color: "var(--accent)", textDecoration: "none", fontSize: 14, fontWeight: 500 }}
          >
            ← Back to dashboard
          </Link>
          <h1
            style={{
              fontSize: 32,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              marginTop: 16,
              marginBottom: 8,
            }}
          >
            Billing & Plans
          </h1>
          <p style={{ color: "var(--muted)" }}>
            Manage your subscription. All payments are processed securely via Stripe.
          </p>
        </div>

        {/* Current plan banner */}
        <div
          style={{
            backgroundColor: "var(--accent-subtle)",
            border: "1px solid var(--accent)",
            borderRadius: "var(--radius-lg)",
            padding: "16px 24px",
            marginBottom: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <p style={{ fontWeight: 700, color: "var(--accent)" }}>
              Current plan: Starter (Free)
            </p>
            <p style={{ fontSize: 14, color: "var(--muted)", marginTop: 2 }}>
              Upgrade to unlock more features and higher limits.
            </p>
          </div>
          <span
            style={{
              backgroundColor: "var(--accent)",
              color: "#fff",
              padding: "4px 12px",
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            Active
          </span>
        </div>

        {/* Plans */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: 20,
          }}
        >
          {PLANS.map((plan) => {
            const isCurrent = plan.id === currentPlan;
            const isPro = plan.id === "pro";

            return (
              <div
                key={plan.id}
                style={{
                  backgroundColor: isPro ? "var(--accent)" : "var(--surface)",
                  border: isPro ? "2px solid var(--accent)" : "1px solid var(--border)",
                  borderRadius: "var(--radius-xl)",
                  padding: 28,
                  color: isPro ? "#fff" : "var(--foreground)",
                  boxShadow: isPro ? "0 8px 32px rgba(108,71,255,0.3)" : "var(--shadow-sm)",
                  position: "relative",
                }}
              >
                {isPro && (
                  <div
                    style={{
                      position: "absolute",
                      top: -11,
                      left: "50%",
                      transform: "translateX(-50%)",
                      backgroundColor: "#fff",
                      color: "var(--accent)",
                      padding: "3px 14px",
                      borderRadius: 999,
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    MOST POPULAR
                  </div>
                )}
                <h3 style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>{plan.name}</h3>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 16 }}>
                  <span style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-0.03em" }}>
                    ${plan.price}
                  </span>
                  <span style={{ opacity: 0.7, fontSize: 14 }}>/month</span>
                </div>
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "flex", flexDirection: "column", gap: 8 }}>
                  {plan.features.map((f) => (
                    <li key={f} style={{ display: "flex", gap: 8, fontSize: 14, alignItems: "flex-start" }}>
                      <span style={{ opacity: 0.8 }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                {isCurrent ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: 12,
                      borderRadius: "var(--radius-md)",
                      border: "1px solid",
                      borderColor: isPro ? "rgba(255,255,255,0.4)" : "var(--border)",
                      fontSize: 14,
                      fontWeight: 600,
                      opacity: 0.7,
                    }}
                  >
                    Current plan
                  </div>
                ) : plan.priceId ? (
                  <button
                    onClick={() => handleUpgrade(plan.priceId!, plan.id)}
                    disabled={loading === plan.id}
                    style={{
                      width: "100%",
                      padding: 12,
                      borderRadius: "var(--radius-md)",
                      border: "none",
                      backgroundColor: isPro ? "#fff" : "var(--accent)",
                      color: isPro ? "var(--accent)" : "#fff",
                      fontWeight: 700,
                      fontSize: 14,
                      cursor: loading === plan.id ? "wait" : "pointer",
                      opacity: loading === plan.id ? 0.7 : 1,
                      transition: "opacity 0.2s",
                    }}
                  >
                    {loading === plan.id ? "Redirecting..." : `Upgrade to ${plan.name} →`}
                  </button>
                ) : (
                  <a
                    href="mailto:sales@saasify.dev"
                    style={{
                      display: "block",
                      textAlign: "center",
                      padding: 12,
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border)",
                      color: "var(--foreground)",
                      textDecoration: "none",
                      fontWeight: 600,
                      fontSize: 14,
                    }}
                  >
                    Contact sales
                  </a>
                )}
              </div>
            );
          })}
        </div>

        {/* Billing info note */}
        <div
          style={{
            marginTop: 32,
            padding: "16px 24px",
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            fontSize: 13,
            color: "var(--muted)",
          }}
        >
          <strong style={{ color: "var(--foreground)" }}>🔒 Secure payments via Stripe</strong> — we never store your
          card details. Subscriptions auto-renew monthly. Cancel anytime from your billing portal.
        </div>
      </div>
    </div>
  );
}
