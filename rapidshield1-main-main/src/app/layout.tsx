import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/contexts/AppContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { AlertOverlay } from "@/components/AlertOverlay";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });

export const metadata: Metadata = {
  title: "RapidShield | Crisis Response Coordination System",
  description: "AI-Powered Crisis Response Dashboard connected to RPi5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700;900&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning className={`${spaceGrotesk.variable} bg-background text-on-background overflow-hidden flex h-screen font-[Space_Grotesk,sans-serif]`}>
        <ThemeProvider>
          <AppProvider>
            <Sidebar />
            <div className="flex-1 flex flex-col h-screen overflow-hidden md:ml-64">
              <TopBar />
              <main className="flex-1 overflow-y-auto bg-background p-4 md:p-6 relative custom-scrollbar">
                {children}
              </main>
            </div>
            <AlertOverlay />
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
