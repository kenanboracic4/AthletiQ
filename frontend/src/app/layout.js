import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Providers from "./providers";
import AppFooter from "@/components/Footer/AppFooter";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "AthletiQ — Sportska mreža i marketplace",
  description:
    "AthletiQ povezuje sportiste, trenere, klubove i skaute. Feed, oglasi, chat i profili na jednom mjestu.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="bs" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <Providers>
          <AuthProvider>
            <div className="appShell">
              <div className="appMain">{children}</div>
              <AppFooter />
            </div>
            <Toaster position="top-center" toastOptions={{ duration: 2000 }} />
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
