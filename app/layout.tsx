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
    "AI pull request reviews on GitHub — inline comments, a summary, and a judge step before posting.",
  applicationName: APP_NAME,
  icons: {
    icon: [{ url: "/logo.png", type: "image/png" }],
    apple: [{ url: "/logo.png" }],
  },
  openGraph: {
    title: APP_NAME,
    siteName: APP_NAME,
    images: [{ url: "/logo.png", width: 512, height: 512, alt: APP_NAME }],
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
