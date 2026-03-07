import type { Metadata } from "next";
import { Courier_Prime } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const courierPrime = Courier_Prime({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-receipt",
});

export const metadata: Metadata = {
  title: "Daxerly - Daily Work Receipt Generator",
  description:
    "Connect your work tools, pull your daily activity, and generate a beautiful thermal receipt showing what you did and the dollar value of your output.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${courierPrime.variable} font-sans antialiased bg-background text-foreground min-h-screen`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
