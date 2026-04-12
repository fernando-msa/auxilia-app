"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signInWithPopup, signOut, type User } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

type Tab = "noticias" | "eventos" | "musicas" | "espiritualidades";

type AdminItem = { id: string; title: string; slug?: string; category?: string };
type ImportedEventItem = { id: string; title: string; startsAt: string; source: string; status: string };

const initialForms: Record<Tab, Record<string, string>> = {
  noticias: { title: "", summary: "", category: "Comunicados", content: "", author: "" },
  eventos: {
    title: "",
    summary: "",
    category: "Agenda",
    eventType: "outro",
    location: "",
    audience: "Jovens",
    startsAt: "",
    externalSignupUrl: "",
  },
  musicas: {
    title: "",
    summary: "",
    category: "Música",
    songType: "hino",
    lyrics: "",
    youtubeUrl: "",
    spotifyUrl: "",
  },
  espiritualidades: {
    title: "",
    summary: "",
    category: "Espiritualidade",
    spiritualType: "reflexao",
    content: "",
  },
};

export default function AdminContentManager() {
  const [user, setUser] = useState<User | null>(null);
  const [tab, setTab] = useState<Tab>("noticias");
  const [status, setStatus] = useState<string>("");
  const [items, setItems] = useState<AdminItem[]>([]);
  const [importedEvents, setImportedEvents] = useState<ImportedEventItem[]>([]);
  const [selectedImported, setSelectedImported] = useState<string[]>([]);
  const [form, setForm] = useState<Record<Tab, Record<string, string>>>(initialForms);

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  const tabTitle = useMemo(
    () =>
      ({
        noticias: "Notícias",
        eventos: "Eventos",
        musicas: "Músicas",
        espiritualidades: "Espiritualidade",
      })[tab],
    [tab],
  );

  const authorizedFetch = useCallback(
    async (input: RequestInfo, init?: RequestInit) => {
      if (!user) throw new Error("Faça login para continuar.");

      const token = await user.getIdToken();
      const response = await fetch(input, {
        ...init,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...(init?.headers ?? {}),
        },
      });

      const result = (await response.json()) as { error?: string; items?: AdminItem[] };

      if (!response.ok) throw new Error(result.error ?? "Erro na requisição administrativa.");
      return result;
    },
    [user],
  );

  const loadItems = useCallback(
    async (currentTab: Tab) => {
      try {
        const result = await authorizedFetch(`/api/admin/content?type=${currentTab}`);
        setItems(result.items ?? []);
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Falha ao carregar itens.");
      }
    },
    [authorizedFetch],
  );

  const loadImportedEvents = useCallback(async () => {
    try {
      const result = (await authorizedFetch("/api/admin/integrations/events")) as {
        items?: ImportedEventItem[];
      };
      setImportedEvents(result.items ?? []);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Falha ao carregar eventos importados.");
    }
  }, [authorizedFetch]);

  useEffect(() => {
    if (user) {
      void loadItems(tab);
      void loadImportedEvents();
    }
  }, [tab, user, loadItems, loadImportedEvents]);

  const handleGoogleLogin = async () => {
    setStatus("");
    await signInWithPopup(auth, googleProvider);
    setStatus("Login realizado. A autorização é validada no servidor.");
  };

  const publish = async (event: FormEvent) => {
    event.preventDefault();
    setStatus("");

    try {
      await authorizedFetch("/api/admin/content", {
        method: "POST",
        body: JSON.stringify({ type: tab, data: form[tab] }),
      });

      setStatus(`${tabTitle.slice(0, -1)} publicado com sucesso.`);
      setForm((prev) => ({ ...prev, [tab]: initialForms[tab] }));
      await loadItems(tab);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Erro ao publicar conteúdo.");
    }
  };

  const removeItem = async (id: string) => {
    const shouldDelete = window.confirm("Deseja realmente excluir este conteúdo?");
    if (!shouldDelete) return;

    try {
      await authorizedFetch("/api/admin/content", {
        method: "DELETE",
        body: JSON.stringify({ type: tab, id }),
      });
      setStatus("Conteúdo excluído com sucesso.");
      await loadItems(tab);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Erro ao excluir conteúdo.");
    }
  };

  const syncImportedEvents = async () => {
    try {
      const result = (await authorizedFetch("/api/admin/integrations/events", {
        method: "POST",
        body: JSON.stringify({ action: "sync" }),
      })) as { importedCount?: number; warnings?: string[] };

      const warnings =
        result.warnings && result.warnings.length
          ? ` Avisos: ${result.warnings.join(" | ")}`
          : "";
      setStatus(`Sincronização concluída. ${result.importedCount ?? 0} evento(s) importado(s).${warnings}`);
      await loadImportedEvents();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Erro ao sincronizar eventos.");
    }
  };

  const publishImportedEvents = async () => {
    if (!selectedImported.length) {
      setStatus("Selecione ao menos um evento importado para publicar.");
      return;
    }

    try {
      const result = (await authorizedFetch("/api/admin/integrations/events", {
        method: "POST",
        body: JSON.stringify({ action: "publish", ids: selectedImported }),
      })) as { publishedCount?: number };

      setStatus(`${result.publishedCount ?? 0} evento(s) importado(s) publicado(s) na agenda.`);
      setSelectedImported([]);
      await Promise.all([loadImportedEvents(), loadItems("eventos")]);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Erro ao publicar eventos importados.");
    }
  };

  return (
    <section className="admin-panel">
      <h1>Painel administrativo</h1>
      <p className="section-description">
        Gestão segura de notícias, eventos, músicas e conteúdos espirituais com validação
        server-side via Firebase Admin.
      </p>

      {!user ? (
        <button type="button" className="btn btn-dark" onClick={handleGoogleLogin}>
          Entrar com Google
        </button>
      ) : (
        <div className="admin-box">
          <p>
            Logado como <strong>{user.email}</strong>
          </p>

          <div className="tabs">
            {(Object.keys(initialForms) as Tab[]).map((currentTab) => (
              <button
                key={currentTab}
                type="button"
                className={tab === currentTab ? "tab active" : "tab"}
                onClick={() => setTab(currentTab)}
              >
                {currentTab}
              </button>
            ))}
          </div>

          <form className="form-grid" onSubmit={publish}>
            {Object.keys(form[tab]).map((field) => (
              <label key={field} className="form-field">
                <span>{field}</span>
                <input
                  required={["externalSignupUrl", "youtubeUrl", "spotifyUrl", "author"].indexOf(field) < 0}
                  value={form[tab][field]}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      [tab]: { ...prev[tab], [field]: e.target.value },
                    }))
                  }
                />
              </label>
            ))}
            <button type="submit" className="btn btn-dark">
              Publicar {tab}
            </button>
          </form>

          <h3>Conteúdos recentes</h3>
          <ul className="admin-list">
            {items.map((item) => (
              <li key={item.id}>
                <div>
                  <strong>{item.title}</strong>
                  <p className="muted">{item.category}</p>
                </div>
                <button type="button" className="btn btn-ghost" onClick={() => removeItem(item.id)}>
                  Excluir
                </button>
              </li>
            ))}
          </ul>

          <button type="button" className="btn btn-ghost" onClick={() => signOut(auth)}>
            Sair
          </button>
        </div>
      )}

      {user ? (
        <div className="admin-box" style={{ marginTop: "1rem" }}>
          <h3>Integrações de agenda</h3>
          <p className="muted">
            Sincronize eventos externos para curadoria e publique os selecionados na agenda oficial.
          </p>
          <div className="cta-row">
            <button type="button" className="btn btn-dark" onClick={syncImportedEvents}>
              Sincronizar agenda externa
            </button>
            <button type="button" className="btn btn-ghost" onClick={publishImportedEvents}>
              Publicar selecionados
            </button>
          </div>
          <ul className="admin-list">
            {importedEvents.map((event) => (
              <li key={event.id}>
                <label style={{ display: "flex", gap: ".5rem", alignItems: "center" }}>
                  <input
                    type="checkbox"
                    checked={selectedImported.includes(event.id)}
                    onChange={(e) =>
                      setSelectedImported((prev) =>
                        e.target.checked ? [...prev, event.id] : prev.filter((item) => item !== event.id),
                      )
                    }
                  />
                  <span>
                    <strong>{event.title}</strong>{" "}
                    <span className="muted">
                      ({event.source} • {event.startsAt || "sem data"} • {event.status})
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {status ? <p className="status">{status}</p> : null}
    </section>
  );
}
