import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { QueryProvider } from "@/shared/infrastructure/http/query-provider";
import { Toaster } from "sonner";
import "./globals.css";
import { TokenSyncProvider } from "@/shared/presentation/components/TokenSyncProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ERP - Sistema de Gestión",
  description: "Sistema de gestión empresarial con autenticación y RBAC",
  icons: {
    icon: "/logo2.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TokenSyncProvider>
          <QueryProvider>
            {children}
            <Toaster position="top-right" richColors />
          </QueryProvider>
        </TokenSyncProvider>
      </body>
    </html>
  );
}
