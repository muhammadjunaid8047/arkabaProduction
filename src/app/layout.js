import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// import ConditionalHeader from "@/components/conditionalHeader";
import ConditionalNavbar from "@/components/conditionalNavbar"; // 👈 new import
import SessionProviderWrapper from "@/components/SessionProviderWrapper";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "ArkABA - Arkansas Association of Behavior Analysis",
  description: "Professional organization for behavior analysts in Arkansas",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProviderWrapper>
          {/* <ConditionalHeader /> */}
          <ConditionalNavbar /> {/* 👈 Conditionally renders navbar */}
          {children}
          <Footer />
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
