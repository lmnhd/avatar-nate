"use client";
import "./globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { GemIcon, SettingsIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useContext, useEffect, useState } from "react";
import AppProvider, { AppContext } from "./context";
import Header from "@/components/header";
//import { publishSubscribe } from "@/ably";

const inter = Inter({ subsets: ["latin"] });



const metadata = {
  title: "CC AI Playground",
  description: "Dream it, build it, share it",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
 (AppContext);
//  useEffect(() => {
//   console.log("Starting Ably:1")
//   publishSubscribe();
// }, []);
  return (
    <html lang="en">
      <body className={cn("h-screen overflow-hidden dark:bg-gradient-to-b dark:from-black/0 dark:to-cyan-900", inter.className)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
         
          <AppProvider>
            <Header/>
            <div className="mt-24 -z-20 mx-auto md:w-2/3 shadow-sm">{children}</div>
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
