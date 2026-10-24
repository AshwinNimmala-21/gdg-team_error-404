import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Public_Sans } from "next/font/google";
import "./globals.css";

const publicSans = Public_Sans({ variable: "--font-public-sans", subsets: ["latin"] });
const plexMono = IBM_Plex_Mono({ variable: "--font-plex-mono", subsets: ["latin"], weight: ["400", "500"] });

export const metadata: Metadata = {
  title: "Clearlease: check a rental before you pay",
  description:
    "A free pre-sign check for renters in DC, Maryland and Virginia: price vs. HUD data, FTC scam warning signs, and lease clauses to question.",
};

export const viewport: Viewport = {
  themeColor: "#eef1f4",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${publicSans.variable} ${plexMono.variable} antialiased`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
