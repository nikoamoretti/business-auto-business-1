import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #f8f7ff 0%, #ede8ff 100%)",
        padding: 24,
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div style={{ marginBottom: 32 }}>
          <span style={{ fontWeight: 800, fontSize: 28, color: "var(--accent)" }}>
            ◆ SaaSify
          </span>
          <p style={{ color: "var(--muted)", marginTop: 8 }}>
            Create your account
          </p>
        </div>
        <SignUp />
      </div>
    </div>
  );
}
