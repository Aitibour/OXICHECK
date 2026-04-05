import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});

export const metadata: Metadata = {
  title: "OxiCheck | Smart Pre-Check-In Solution for Any PMS",
  description:
    "Streamline hotel arrivals with OxiCheck. Guests complete check-in before arrival — ID verification, preferences, payments. Works with any PMS.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} font-sans bg-white text-secondary antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
