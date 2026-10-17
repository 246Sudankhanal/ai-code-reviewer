import type { Metadata } from "next";
import { Geist_Mono, Plus_Jakarta_Sans, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { APP_DOMAIN, APP_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "@/components/ui/sonner";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-heading",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(`https://${APP_DOMAIN}`),
  title: {
    default: APP_NAME,
    template: `%s · ${APP_NAME}`,
  },
  description:
    "Open-source GitHub App that posts AI pull request reviews: inline comments on added lines, a summary, and a second-model judge. Built by Sudan Khanal.",
  applicationName: APP_NAME,
  icons: {
    icon: [{ url: "/logo.png", type: "image/png" }],
    apple: [{ url: "/logo.png" }],
  },
  openGraph: {
    title: APP_NAME,
    description:
      "GitHub App that drafts inline PR comments and a summary, judged by a second model before posting.",
    siteName: APP_NAME,
    type: "website",
    url: `https://${APP_DOMAIN}`,
    images: [{ url: "/logo.png", width: 512, height: 512, alt: APP_NAME }],
  },
  verification: {
    google: "EcPenoVjkl4u2AaARJsKhCs8AB1VFn-BKt2WVsagSfI",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full antialiased font-sans",
        plusJakarta.variable,
        geistMono.variable,
        instrumentSerif.variable
      )}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
        {children}
        <Toaster/>
        </ThemeProvider>
        </QueryProvider>
        </body>
    </html>
  );
}
