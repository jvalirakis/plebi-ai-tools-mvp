import type { Metadata } from "next";
import Script from "next/script";
import { Header } from "@/components/header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Plebi | AI Tools Intelligence",
  description: "Transparent AI tool rankings with source observations, poll sentiment, and score breakdowns."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <Script id="theme-init" strategy="beforeInteractive">
          {`try{var t=localStorage.getItem('plebi-theme')||'dark';document.documentElement.classList.toggle('dark',t==='dark')}catch(e){document.documentElement.classList.add('dark')}`}
        </Script>
        <Header />
        <main className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      </body>
    </html>
  );
}
