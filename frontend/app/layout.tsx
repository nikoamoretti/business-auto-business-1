import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
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

// ClerkProvider requires a valid publishableKey to render without throwing.
// When keys aren't configured (e.g. uptime-monitor MVP, preview without secrets),
// skip the provider entirely so non-auth routes like /monitor remain accessible.
const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
const clerkEnabled = publishableKey.startsWith("pk_");

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const htmlContent = (
    <html lang="en" className={`${inter.variable} ${jakarta.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );

  if (!clerkEnabled) {
    return htmlContent;
  }

  return <ClerkProvider publishableKey={publishableKey}>{htmlContent}</ClerkProvider>;
}
