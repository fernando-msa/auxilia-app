import type { Metadata } from "next";
import AdminContentManager from "@/components/AdminContentManager";

export const metadata: Metadata = {
  title: "Admin | Auxilia App",
  description: "Painel administrativo para gestão de notícias, eventos, músicas e espiritualidade.",
};

export default function AdminPage() {
  return (
    <main className="section">
      <AdminContentManager />
    </main>
  );
}
