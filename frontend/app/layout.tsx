import "./globals.css";
import type { Metadata } from "next";
import { Inter, Baloo_2 } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-body" });
const baloo = Baloo_2({ subsets: ["latin"], variable: "--font-heading" });

export const metadata: Metadata = {
  title: "Spelling Bee | Real-time Spelling Competition",
  description: "A real-time spelling bee app for hosts and players",
  viewport: "width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover",
  themeColor: "#fde047",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="light">
      <body className={`${inter.variable} ${baloo.variable} ${inter.className}`}>
        {children}
      </body>
    </html>
  );
}
