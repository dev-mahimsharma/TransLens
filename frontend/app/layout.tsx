import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { TopNav } from "@/components/TopNav";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TransLens — step inside an LLM",
  description:
    "Watch a real transformer language model think, token by token, layer by layer — and reach in and change how it thinks.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      {/* suppressHydrationWarning here too: browser extensions (Bitdefender's
          bis_*, ColorZilla's cz-shortcut-listen, etc.) inject attributes
          directly into the DOM before React hydrates, which otherwise
          triggers a false-positive hydration mismatch warning that has
          nothing to do with our actual rendered output. */}
      <body className="bg-void text-paper font-body antialiased" suppressHydrationWarning>
        <TopNav />
        {children}
      </body>
    </html>
  );
}