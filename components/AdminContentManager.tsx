"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { onAuthStateChanged, signInWithPopup, signOut, type User } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

type Tab = "noticias" | "eventos" | "musicas" | "espiritualidades";

type AdminItem = { id: string; title: string; slug?: string; category?: string };
type ImportedEventItem = { id: string; title: string; startsAt: string; source: string; status: string };
type FieldConfig = {
  key: string;
  label: string;
  placeholder: string;
  required?: boolean;
  as?: "input" | "textarea";
};

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

const tabLabels: Record<Tab, string> = {
  noticias: "Notícias",
  eventos: "Eventos",
  musicas: "Músicas",
  espiritualidades: "Espiritualidade",
};

const tabSingularLabels: Record<Tab, string> = {
  noticias: "Notícia",
  eventos: "Evento",
  musicas: "Música",
  espiritualidades: "Conteúdo espiritual",
};

const fieldConfigs: Record<Tab, FieldConfig[]> = {
  noticias: [
    { key: "title", label: "Título", placeholder: "Ex.: Retiro jovem de maio", required: true },
    {
      key: "summary",
      label: "Resumo",
      placeholder: "Resumo curto para aparecer no card da notícia.",
      required: true,
      as: "textarea",
    },
    { key: "category", label: "Categoria", placeholder: "Ex.: Formação", required: true },
    {
      key: "content",
      label: "Conteúdo",
      placeholder: "Texto principal da notícia.",
      required: true,
      as: "textarea",
    },
    { key: "author", label: "Autor/Editor", placeholder: "Ex.: Equipe de Comunicação" },
  ],
  eventos: [
    { key: "title", label: "Título", placeholder: "Ex.: Adoração Jovem", required: true },
    {
      key: "summary",
      label: "Resumo",
      placeholder: "Mensagem breve sobre o evento.",
      required: true,
      as: "textarea",
    },
    { key: "category", label: "Categoria", placeholder: "Ex.: Agenda", required: true },
    { key: "eventType", label: "Tipo", placeholder: "Ex.: adoracao", required: true },
    { key: "location", label: "Local", placeholder: "Ex.: Capela Maria Auxiliadora", required: true },
    { key: "audience", label: "Público", placeholder: "Ex.: Jovens e famílias", required: true },
    {
      key: "startsAt",
      label: "Data/hora de início (ISO)",
      placeholder: "Ex.: 2026-06-15T19:30:00-03:00",
      required: true,
    },
    {
      key: "externalSignupUrl",
      label: "Link de inscrição externa",
      placeholder: "https://...",
    },
  ],
  musicas: [
    { key: "title", label: "Título", placeholder: "Ex.: Hino Auxilia", required: true },
    {
      key: "summary",
      label: "Resumo",
      placeholder: "Contexto da música para os encontros.",
      required: true,
      as: "textarea",
    },
    { key: "category", label: "Categoria", placeholder: "Ex.: Louvor", required: true },
    { key: "songType", label: "Tipo", placeholder: "Ex.: hino", required: true },
    {
      key: "lyrics",
      label: "Letra",
      placeholder: "Cole aqui a letra da música.",
      required: true,
      as: "textarea",
    },
    { key: "youtubeUrl", label: "Link YouTube", placeholder: "https://youtube.com/..." },
    { key: "spotifyUrl", label: "Link Spotify", placeholder: "https://open.spotify.com/..." },
  ],
  espiritualidades: [
    { key: "title", label: "Título", placeholder: "Ex.: Evangelho e reflexão do dia", required: true },
    {
      key: "summary",
      label: "Resumo",
      placeholder: "Resumo curto para card/listagem.",
      required: true,
      as: "textarea",
    },
    { key: "category", label: "Categoria", placeholder: "Ex.: Evangelho", required: true },
    { key: "spiritualType", label: "Tipo espiritual", placeholder: "Ex.: reflexao", required: true },
    {
      key: "content",
      label: "Conteúdo",
      placeholder: "Texto completo do conteúdo espiritual.",
      required: true,
      as: "textarea",
    },
  ],
};

function normalizeAdminError(error: unknown) {
  const fallback = "Não foi possível concluir a operação administrativa.";
  const message = error instanceof Error ? error.message : fallback;

  if (
    message.includes("FIREBASE_ADMIN_PROJECT_ID") ||
    message.includes("FIREBASE_ADMIN_CLIENT_EMAIL") ||
    message.includes("FIREBASE_ADMIN_PRIVATE_KEY")
  ) {
    return "Configuração do Firebase Admin incompleta no servidor. Defina FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL e FIREBASE_ADMIN_PRIVATE_KEY na Vercel.";
  }

  return message;
}

function formatImportedStatus(status: string) {
  if (status === "published") return "publicado";
  if (status === "imported") return "importado";
  return status;
}

export default function AdminContentManager() {
  const [user, setUser] = useState<User | null>(null);
  const [tab, setTab] = useState<Tab>("noticias");
  const [status, setStatus] = useState<string>("");
  const [items, setItems] = useState<AdminItem[]>([]);
  const [importedEvents, setImportedEvents] = useState<ImportedEventItem[]>([]);
  const [selectedImported, setSelectedImported] = useState<string[]>([]);
  const [form, setForm] = useState<Record<Tab, Record<string, string>>>(initialForms);

  useEffect(() => onAuthStateChanged(auth, setUser), []);

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
        setStatus(normalizeAdminError(error));
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
      setStatus(normalizeAdminError(error));
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

      setStatus(`${tabSingularLabels[tab]} publicado com sucesso.`);
      setForm((prev) => ({ ...prev, [tab]: initialForms[tab] }));
      await loadItems(tab);
    } catch (error) {
      setStatus(normalizeAdminError(error));
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
      setStatus(normalizeAdminError(error));
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
      setStatus(normalizeAdminError(error));
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
      setStatus(normalizeAdminError(error));
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
                {tabLabels[currentTab]}
              </button>
            ))}
          </div>

          <form className="form-grid" onSubmit={publish}>
            {fieldConfigs[tab].map((field) => (
              <label key={field.key} className="form-field">
                <span>{field.label}</span>
                {field.as === "textarea" ? (
                  <textarea
                    required={field.required}
                    placeholder={field.placeholder}
                    value={form[tab][field.key]}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        [tab]: { ...prev[tab], [field.key]: e.target.value },
                      }))
                    }
                  />
                ) : (
                  <input
                    required={field.required}
                    placeholder={field.placeholder}
                    value={form[tab][field.key]}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        [tab]: { ...prev[tab], [field.key]: e.target.value },
                      }))
                    }
                  />
                )}
              </label>
            ))}
            <button type="submit" className="btn btn-dark">
              Publicar {tabLabels[tab]}
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
                      ({event.source} • {event.startsAt || "sem data"} • {formatImportedStatus(event.status)})
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
