import Link from "next/link";

const FEATURES = [
  {
    icon: "⚡",
    title: "Blazing Fast",
    desc: "Sub-100ms response times powered by edge infrastructure.",
  },
  {
    icon: "🔐",
    title: "Secure by Default",
    desc: "SOC2-grade auth with Clerk. Zero passwords stored.",
  },
  {
    icon: "💳",
    title: "Stripe Billing",
    desc: "Usage-based or seat billing. One-click upgrades & downgrades.",
  },
  {
    icon: "📊",
    title: "Real-time Analytics",
    desc: "Live dashboards with team-level insights and audit logs.",
  },
];

const PLANS = [
  {
    name: "Starter",
    price: "$0",
    period: "/mo",
    description: "Perfect for solo builders",
    features: ["Up to 3 projects", "1GB storage", "Community support", "Basic analytics"],
    cta: "Get started free",
    accent: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/mo",
    description: "For growing teams",
    features: ["Unlimited projects", "50GB storage", "Priority support", "Advanced analytics", "Custom domains"],
    cta: "Start free trial",
    accent: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large organizations",
    features: ["Everything in Pro", "SSO & SAML", "SLA guarantee", "Dedicated infrastructure", "Custom contracts"],
    cta: "Contact sales",
    accent: false,
  },
];

export default function Home() {
  return (
    <div style={{ fontFamily: "var(--font-jakarta, system-ui, sans-serif)" }}>
      {/* Nav */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          backdropFilter: "blur(12px)",
          backgroundColor: "rgba(248,247,255,0.85)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 24px",
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontWeight: 700, fontSize: 22, color: "var(--accent)" }}>
            ◆ SaaSify
          </span>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <Link
              href="/sign-in"
              style={{ color: "var(--muted)", textDecoration: "none", fontSize: 14, fontWeight: 500 }}
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              style={{
                backgroundColor: "var(--accent)",
                color: "#fff",
                padding: "8px 18px",
                borderRadius: "var(--radius-md)",
                textDecoration: "none",
                fontSize: 14,
                fontWeight: 600,
                transition: "background 0.2s",
              }}
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "100px 24px 80px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-block",
            backgroundColor: "var(--accent-subtle)",
            color: "var(--accent)",
            padding: "4px 14px",
            borderRadius: 999,
            fontSize: 13,
            fontWeight: 600,
            marginBottom: 24,
          }}
        >
          Now in public beta · Free to start
        </div>
        <h1
          style={{
            fontSize: "clamp(40px, 7vw, 72px)",
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            color: "var(--foreground)",
            marginBottom: 24,
            maxWidth: 800,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          Build faster.{" "}
          <span style={{ color: "var(--accent)" }}>Ship smarter.</span>
          <br />
          Grow without limits.
        </h1>
        <p
          style={{
            fontSize: 20,
            color: "var(--muted)",
            maxWidth: 560,
            margin: "0 auto 40px",
            lineHeight: 1.7,
          }}
        >
          SaaSify is the all-in-one platform that handles auth, billing, and
          infrastructure so you can focus on what matters.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href="/sign-up"
            style={{
              backgroundColor: "var(--accent)",
              color: "#fff",
              padding: "14px 32px",
              borderRadius: "var(--radius-md)",
              textDecoration: "none",
              fontWeight: 700,
              fontSize: 16,
              boxShadow: "0 4px 24px rgba(108,71,255,0.3)",
              transition: "all 0.2s",
            }}
          >
            Start for free →
          </Link>
          <Link
            href="/dashboard"
            style={{
              backgroundColor: "var(--surface)",
              color: "var(--foreground)",
              padding: "14px 32px",
              borderRadius: "var(--radius-md)",
              textDecoration: "none",
              fontWeight: 600,
              fontSize: 16,
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            View demo
          </Link>
        </div>
      </section>

      {/* Features */}
      <section
        style={{
          backgroundColor: "var(--surface)",
          borderTop: "1px solid var(--border)",
          borderBottom: "1px solid var(--border)",
          padding: "80px 24px",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <h2
            style={{
              textAlign: "center",
              fontSize: 36,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              marginBottom: 60,
              color: "var(--foreground)",
            }}
          >
            Everything you need, nothing you don't
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 24,
            }}
          >
            {FEATURES.map((f) => (
              <div
                key={f.title}
                style={{
                  padding: 28,
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--border)",
                  backgroundColor: "var(--background)",
                  boxShadow: "var(--shadow-sm)",
                  transition: "box-shadow 0.2s, transform 0.2s",
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 16 }}>{f.icon}</div>
                <h3
                  style={{
                    fontWeight: 700,
                    fontSize: 18,
                    marginBottom: 8,
                    color: "var(--foreground)",
                  }}
                >
                  {f.title}
                </h3>
                <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.6 }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section style={{ padding: "80px 24px", maxWidth: 1200, margin: "0 auto" }}>
        <h2
          style={{
            textAlign: "center",
            fontSize: 36,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            marginBottom: 16,
            color: "var(--foreground)",
          }}
        >
          Simple, transparent pricing
        </h2>
        <p
          style={{ textAlign: "center", color: "var(--muted)", marginBottom: 56, fontSize: 17 }}
        >
          Start free. Upgrade when you need to.
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 24,
            alignItems: "start",
          }}
        >
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              style={{
                padding: 32,
                borderRadius: "var(--radius-xl)",
                border: plan.accent ? "2px solid var(--accent)" : "1px solid var(--border)",
                backgroundColor: plan.accent ? "var(--accent)" : "var(--surface)",
                color: plan.accent ? "#fff" : "var(--foreground)",
                boxShadow: plan.accent ? "0 8px 40px rgba(108,71,255,0.35)" : "var(--shadow-sm)",
                position: "relative",
              }}
            >
              {plan.accent && (
                <div
                  style={{
                    position: "absolute",
                    top: -12,
                    left: "50%",
                    transform: "translateX(-50%)",
                    backgroundColor: "#fff",
                    color: "var(--accent)",
                    padding: "3px 14px",
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                  }}
                >
                  Most popular
                </div>
              )}
              <div style={{ marginBottom: 24 }}>
                <p
                  style={{
                    fontWeight: 700,
                    fontSize: 14,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    opacity: plan.accent ? 0.8 : 0.6,
                    marginBottom: 8,
                  }}
                >
                  {plan.name}
                </p>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                  <span style={{ fontSize: 48, fontWeight: 800, letterSpacing: "-0.03em" }}>
                    {plan.price}
                  </span>
                  <span style={{ opacity: 0.7 }}>{plan.period}</span>
                </div>
                <p style={{ opacity: 0.7, marginTop: 8 }}>{plan.description}</p>
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px", display: "flex", flexDirection: "column", gap: 10 }}>
                {plan.features.map((f) => (
                  <li key={f} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 15 }}>
                    <span style={{ opacity: 0.8 }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/sign-up"
                style={{
                  display: "block",
                  textAlign: "center",
                  padding: "12px",
                  borderRadius: "var(--radius-md)",
                  textDecoration: "none",
                  fontWeight: 700,
                  fontSize: 15,
                  backgroundColor: plan.accent ? "#fff" : "var(--accent)",
                  color: plan.accent ? "var(--accent)" : "#fff",
                  transition: "opacity 0.2s",
                }}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid var(--border)",
          padding: "32px 24px",
          textAlign: "center",
          color: "var(--muted)",
          fontSize: 14,
        }}
      >
        <p>
          © 2025 SaaSify · Built with Next.js, FastAPI, Clerk & Stripe ·{" "}
          <Link href="/dashboard" style={{ color: "var(--accent)", textDecoration: "none" }}>
            Dashboard
          </Link>
        </p>
      </footer>
    </div>
  );
}
