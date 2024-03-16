import "./globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { GemIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "CC AI Playground",
  description: "Dream it, build it, share it",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={cn('scrollbar-hide',inter.className)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="fixed top-0 flex items-center justify-between w-full h-12 p-8 bg-white scrollbar-hide">
          <p className="text-black"><GemIcon/></p>
            <ThemeToggle />
           
          </div>
          <div className="mt-5 scrollbar-hide">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  );
}
