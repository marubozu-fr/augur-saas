import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Augur — Trading Statistics Platform",
  description:
    "Data-driven trading probabilities for disciplined market participants.",
  icons: {
    icon: "/icon.svg",
  },
};

// Single root layout shared by BOTH the URL-prefixed marketing routes
// ([locale]) and the cookie-driven private routes (dashboard/account/stats/
// auth) — see src/i18n/request.ts for how the active locale is resolved for
// each. `lang` and the translation messages follow that same resolved locale.
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
