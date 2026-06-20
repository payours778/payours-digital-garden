import type { Metadata } from "next";
import { Noto_Serif_SC, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SakuraEffect } from "@/components/effects/SakuraEffect";
import { FireflyEffect } from "@/components/effects/FireflyEffect";
import { MusicProvider } from "@/contexts/MusicContext";

const notoSerif = Noto_Serif_SC({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-noto-serif",
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Payours の 空中花园",
    template: "%s | Payours の 空中花园",
  },
  description: "一个综合博客，分享技术、生活和思考",
  keywords: ["博客", "技术", "生活", "Next.js", "React"],
  icons: {
    icon: "/moon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body
        className={`${notoSerif.variable} ${sourceSerif.variable} h-full antialiased bg-slate-50 dark:bg-slate-950 font-serif`}
      >
        <ThemeProvider>
          <MusicProvider>
            <SakuraEffect />
            <FireflyEffect />
            <Header />
            <main className="relative z-10 flex-1 flex flex-col">
              {children}
            </main>
            <Footer />
          </MusicProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
