import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/contexts/WalletContext";
import { Navbar } from "@/components/Navbar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MicroNews | Decentralized Micro-Journalism Platform",
  description: "Pay-per-article journalism platform powered by HTTP x402 protocol. No subscriptions, no middlemen.",
  keywords: ["x402", "blockchain", "journalism", "USDC", "cryptocurrency", "micropayments"],
  authors: [{ name: "MicroNews Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased bg-white text-slate-900 min-h-screen`}>
        <WalletProvider>
          <Navbar />
          <main className="pt-16">
            {children}
          </main>

          {/* Footer */}
          <footer className="border-t border-slate-200 mt-20 py-12 px-4 bg-slate-50">
            <div className="max-w-5xl mx-auto">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 
                                  flex items-center justify-center">
                    <span className="text-white text-sm font-bold">M</span>
                  </div>
                  <span className="font-semibold text-slate-700">MicroNews</span>
                </div>
                <p className="text-slate-600 text-sm">
                  Built with{" "}
                  <a
                    href="https://github.com/coinbase/x402"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 font-medium hover:underline"
                  >
                    x402 Protocol
                  </a>
                  {" "}on Ethereum Sepolia
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <a href="#" className="text-slate-600 hover:text-slate-900">About</a>
                  <a href="#" className="text-slate-600 hover:text-slate-900">Terms</a>
                  <a href="#" className="text-slate-600 hover:text-slate-900">Privacy</a>
                </div>
              </div>
            </div>
          </footer>
        </WalletProvider>
      </body>
    </html>
  );
}
