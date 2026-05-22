import Link from "next/link";
import { ReactNode } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="dashboard-layout">
      <header className="dashboard-header">
        <div className="dashboard-header-content">
          <h1>Dashboard Auxilia</h1>
          <nav className="dashboard-nav">
            <Link href="/dashboard/avisos" className="nav-link">
              Mural de Avisos
            </Link>
            <Link href="/dashboard/calendario" className="nav-link">
              Calendário
            </Link>
            <Link href="/" className="nav-link nav-back">
              ← Voltar ao site
            </Link>
          </nav>
        </div>
      </header>

      <main className="dashboard-main">{children}</main>
    </div>
  );
}
