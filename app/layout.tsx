import type { Metadata } from "next";
import "./globals.css";
import LanguageProvider from "@/components/language-provider";

export const metadata: Metadata = {
  title: "Yacht Claims MVP",
  description: "Yacht claims management system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
