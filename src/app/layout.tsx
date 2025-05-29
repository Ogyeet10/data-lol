import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import { PHProvider, PostHogPageview } from "./providers";
import { Suspense } from 'react';
import MyStatsig from "./my-statsig";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "data lol",
  description: "Powerful CSV analysis with beautiful visualizations",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="transition-colors duration-300 ease-in-out">
      <Suspense>
        <PostHogPageview />
      </Suspense>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased transition-colors duration-300 ease-in-out`}
      >
        <PHProvider>
          <MyStatsig>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              enableColorScheme={false}
            >
              {children}
              <Toaster richColors closeButton={true} />
            </ThemeProvider>
          </MyStatsig>
        </PHProvider>
        <Analytics />
      </body>
    </html>
  );
}
