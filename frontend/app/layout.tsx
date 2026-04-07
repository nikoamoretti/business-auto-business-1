import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: "SaaSify — Build faster, grow smarter",
  description: "The all-in-one SaaS platform for modern teams.",
};

// Guard: only load Clerk when keys are properly configured to avoid
// runtime crashes when deployed without auth env vars (e.g. uptime monitor MVP).
const clerkConfigured =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes("REPLACE_ME") &&
  process.env.CLERK_SECRET_KEY &&
  !process.env.CLERK_SECRET_KEY.includes("REPLACE_ME");

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { ClerkProvider } = clerkConfigured ? require("@clerk/nextjs") : { ClerkProvider: null };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const html = (
    <html lang="en" className={`${inter.variable} ${jakarta.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );

  return ClerkProvider ? <ClerkProvider>{html}</ClerkProvider> : html;
}
