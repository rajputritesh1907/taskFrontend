import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme-context";
import { Sidebar } from "@/components/sidebar";
import { MobileHeader } from "@/components/mobile-header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TaskFlow - Modern Task Management",
  description: "A powerful and intuitive task management application built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
            {/* Desktop Sidebar */}
            <div className="hidden lg:flex">
              <Sidebar />
            </div>

            {/* Mobile Layout */}
            <div className="flex flex-col flex-1 lg:hidden">
              <MobileHeader />
              <main className="flex-1 overflow-auto">
                {children}
              </main>
            </div>

            {/* Desktop Main Content */}
            <main className="hidden lg:flex flex-1 overflow-auto">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
