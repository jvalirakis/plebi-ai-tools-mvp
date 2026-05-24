import Script from "next/script";
import { Header } from "@/components/header";
import { JsonLd } from "@/components/json-ld";
import { createRootMetadata } from "@/lib/seo/metadata";
import { createWebsiteJsonLd } from "@/lib/seo/structured-data";
import "./globals.css";

export const metadata = createRootMetadata();

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
        <JsonLd data={createWebsiteJsonLd()} />
        <Header />
        <main className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      </body>
    </html>
  );
}
