import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Drama Desk - Sistema di Gestione Teatrale",
  description: "Sistema di gestione multi-tenant per associazioni teatrali",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Set Italian as default locale in browser
              if (!localStorage.getItem('NEXT_LOCALE')) {
                localStorage.setItem('NEXT_LOCALE', 'it');
              }
            `,
          }}
        />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
