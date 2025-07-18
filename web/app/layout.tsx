import type { Metadata } from "next";
import { Geist, Geist_Mono, Poppins } from "next/font/google";
import "./globals.css";
import { WalletContextProvider } from "./provider/WalletProvider";
import '@solana/wallet-adapter-react-ui/styles.css';
import { Toaster } from "sonner";
import { FloatingDockBar } from "./components/ui/FloatingDock";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const poppins = Poppins({
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
  variable: '--font-poppins',
})

export const metadata: Metadata = {
  title: "Stake-Do",
  description: "A Solana Staking Todo Dapp",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* ✅ Manually add the Google Fonts link */}
        <link
          href="https://fonts.googleapis.com/css2?family=Bitcount+Grid+Single:wght@100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Toaster richColors={true} />
        <WalletContextProvider>
          <FloatingDockBar />
          {children}
        </WalletContextProvider>
      </body>
    </html>
  );
}
