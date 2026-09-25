import type { Metadata } from "next";
import { Inter, Merriweather } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const merriweather = Merriweather({
  weight: ["300", "400", "700", "900"],
  subsets: ["latin"],
  variable: "--font-merriweather",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DHSGSU EventHub | Dr. Harisingh Gour Vishwavidyalaya, Sagar",
  description:
    "Discover. Register. Participate. The centralized university event management platform for Dr. Harisingh Gour Vishwavidyalaya, Sagar, Madhya Pradesh.",
  keywords: [
    "DHSGSU",
    "Dr Harisingh Gour Vishwavidyalaya",
    "Sagar University",
    "Gour Gourav Utsav",
    "University Events",
    "Student Registration",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${merriweather.variable}`}>
      <body className="min-h-screen flex flex-col font-sans bg-slate-50 antialiased selection:bg-university-gold/30 selection:text-university-maroon">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <MobileNav />
        </AuthProvider>
      </body>
    </html>
  );
}
