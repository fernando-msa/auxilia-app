import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Auxilia | Movimento Salesiano",
  description:
    "Portal de oração, missão e notícias para consagrados e jovens do movimento salesiano/católico.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
