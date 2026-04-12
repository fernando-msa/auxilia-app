import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Auxilia App | Movimento Auxilia",
    template: "%s | Auxilia App",
  },
  description:
    "Plataforma digital do Movimento Auxilia para evangelização da juventude, espiritualidade, agenda, músicas e comunicação institucional.",
  openGraph: {
    title: "Auxilia App",
    description:
      "Evangelização juvenil católica com conteúdos espirituais, notícias e agenda missionária.",
    type: "website",
    locale: "pt_BR",
  },
};

const navItems = [
  ["Início", "/"],
  ["Espiritualidade", "/espiritualidade"],
  ["Músicas", "/musicas"],
  ["Eventos", "/eventos"],
  ["Notícias", "/noticias"],
  ["Admin", "/admin"],
] as const;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <header className="top-nav">
          <div className="top-nav-inner">
            <Link href="/" className="brand-link">
              Auxilia App
            </Link>
            <nav>
              {navItems.map(([label, href]) => (
                <Link key={href} href={href} className="nav-link">
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
