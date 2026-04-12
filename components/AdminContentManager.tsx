"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signInWithPopup, signOut, type User } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import type { ContentStatus } from "@/types/content";

type Tab = "noticias" | "eventos" | "musicas" | "espiritualidades" | "avisos_oficiais";

type AdminItem = {
  id: string;
  title: string;
  slug?: string;
  category?: string;
  status: ContentStatus;
  coverImage?: string;
};

type ImportedEventItem = {
  id: string;
  title: string;
  startsAt: string;
  source: string;
  status: string;
  location?: string;
};

type FieldConfig = {
  key: string;
  label: string;
  placeholder: string;
  required?: boolean;
  as?: "input" | "textarea";
};

const contentStatuses: ContentStatus[] = ["draft", "published", "archived"];

const initialForms: Record<Tab, Record<string, string>> = {
  noticias: {
    title: "",
    summary: "",
    category: "Comunicados",
    content: "",
    author: "",
    coverImage: "",
    status: "draft",
  },
  eventos: {
    title: "",
    summary: "",
    category: "Agenda",
    eventType: "outro",
    location: "",
    audience: "Jovens",
    startsAt: "",
    endsAt: "",
    externalSignupUrl: "",
    coverImage: "",
    status: "draft",
  },
  musicas: {
    title: "",
    summary: "",
    category: "Música",
    songType: "hino",
    lyrics: "",
    youtubeUrl: "",
    spotifyUrl: "",
    coverImage: "",
    status: "draft",
  },
  espiritualidades: {
    title: "",
    summary: "",
    category: "Espiritualidade",
    spiritualType: "reflexao",
    content: "",
    coverImage: "",
    status: "draft",
  },
  avisos_oficiais: {
    title: "",
    message: "",
    level: "info",
    startsAt: "",
    endsAt: "",
    ctaLabel: "",
    ctaUrl: "",
    status: "draft",
  },
};

const tabLabels: Record<Tab, string> = {
  noticias: "Notícias",
  eventos: "Eventos",
  musicas: "Músicas",
  espiritualidades: "Espiritualidade",
  avisos_oficiais: "Avisos oficiais",
};

const tabSingularLabels: Record<Tab, string> = {
  noticias: "Notícia",
  eventos: "Evento",
  musicas: "Música",
  espiritualidades: "Conteúdo espiritual",
  avisos_oficiais: "Aviso oficial",
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
      key: "endsAt",
      label: "Data/hora de término (ISO)",
      placeholder: "Ex.: 2026-06-15T22:00:00-03:00",
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
  avisos_oficiais: [
    { key: "title", label: "Título", placeholder: "Ex.: Mudança no local do encontro", required: true },
    {
      key: "message",
      label: "Mensagem",
      placeholder: "Texto do aviso oficial para comunidade.",
      required: true,
      as: "textarea",
    },
    { key: "level", label: "Nível", placeholder: "info | warning | important", required: true },
    { key: "startsAt", label: "Início da exibição (ISO)", placeholder: "2026-05-01T12:00:00-03:00" },
    { key: "endsAt", label: "Fim da exibição (ISO)", placeholder: "2026-05-07T23:59:00-03:00" },
    { key: "ctaLabel", label: "Texto do botão", placeholder: "Ex.: Ver programação" },
    { key: "ctaUrl", label: "Link do botão", placeholder: "/eventos" },
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
  if (status === "imported") return "pendente";
  if (status === "archived") return "arquivado";
  return status;
}

export default function AdminContentManager() {
  const [user, setUser] = useState<User | null>(null);
  const [tab, setTab] = useState<Tab>("noticias");
  const [status, setStatus] = useState<string>("");
  const [statusTone, setStatusTone] = useState<"ok" | "error">("ok");
  const [items, setItems] = useState<AdminItem[]>([]);
  const [importedEvents, setImportedEvents] = useState<ImportedEventItem[]>([]);
  const [selectedImported, setSelectedImported] = useState<string[]>([]);
  const [form, setForm] = useState<Record<Tab, Record<string, string>>>(initialForms);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [importedFilter, setImportedFilter] = useState("imported");

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
        const params = new URLSearchParams({ type: currentTab });
        if (statusFilter !== "all") params.set("status", statusFilter);
        if (categoryFilter) params.set("category", categoryFilter);
        if (search) params.set("q", search);

        const result = await authorizedFetch(`/api/admin/content?${params.toString()}`);
        setItems(result.items ?? []);
      } catch (error) {
        setStatusTone("error");
        setStatus(normalizeAdminError(error));
      }
    },
    [authorizedFetch, statusFilter, categoryFilter, search],
  );

  const loadImportedEvents = useCallback(async () => {
    try {
      const query = importedFilter && importedFilter !== "all" ? `?status=${importedFilter}` : "";
      const result = (await authorizedFetch(`/api/admin/integrations/events${query}`)) as {
        items?: ImportedEventItem[];
      };
      setImportedEvents(result.items ?? []);
    } catch (error) {
      setStatusTone("error");
      setStatus(normalizeAdminError(error));
    }
  }, [authorizedFetch, importedFilter]);

  useEffect(() => {
    if (user) {
      void loadItems(tab);
    }
  }, [tab, user, loadItems]);

  useEffect(() => {
    if (user) void loadImportedEvents();
  }, [user, loadImportedEvents]);

  const categoryOptions = useMemo(
    () => [...new Set(items.map((item) => item.category).filter(Boolean))] as string[],
    [items],
  );

  const handleGoogleLogin = async () => {
    setStatus("");
    await signInWithPopup(auth, googleProvider);
    setStatusTone("ok");
    setStatus("Login realizado. A autorização é validada no servidor.");
  };

  const resetCurrentForm = () => {
    setForm((prev) => ({ ...prev, [tab]: initialForms[tab] }));
    setEditingId(null);
  };

  const saveContent = async (event: FormEvent) => {
    event.preventDefault();
    setStatus("");

    try {
      const method = editingId ? "PUT" : "POST";
      await authorizedFetch("/api/admin/content", {
        method,
        body: JSON.stringify({ type: tab, id: editingId ?? undefined, data: form[tab] }),
      });

      setStatusTone("ok");
      setStatus(
        editingId
          ? `${tabSingularLabels[tab]} atualizado com sucesso.`
          : `${tabSingularLabels[tab]} salvo com sucesso.`,
      );
      resetCurrentForm();
      await loadItems(tab);
    } catch (error) {
      setStatusTone("error");
      setStatus(normalizeAdminError(error));
    }
  };

  const editItem = (item: AdminItem) => {
    setEditingId(item.id);
    setForm((prev) => ({
      ...prev,
      [tab]: {
        ...prev[tab],
        title: item.title,
        category: item.category ?? prev[tab].category,
        status: item.status,
        coverImage: item.coverImage ?? "",
      },
    }));
    setStatusTone("ok");
    setStatus(`Editando ${item.title}. Complete os campos e clique em salvar.`);
  };

  const handleCoverImageFile = async (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setStatusTone("error");
      setStatus("Selecione um arquivo de imagem válido.");
      return;
    }

    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ""));
      reader.onerror = () => reject(new Error("Falha ao carregar imagem."));
      reader.readAsDataURL(file);
    });

    setForm((prev) => ({ ...prev, [tab]: { ...prev[tab], coverImage: dataUrl } }));
    setStatusTone("ok");
    setStatus("Imagem de capa carregada localmente. Salve para persistir no conteúdo.");
  };

  const removeItem = async (id: string) => {
    const confirmText = window.prompt("Digite EXCLUIR para confirmar a remoção deste conteúdo.");
    if (confirmText !== "EXCLUIR") {
      setStatusTone("error");
      setStatus("Exclusão cancelada: confirmação inválida.");
      return;
    }

    try {
      await authorizedFetch("/api/admin/content", {
        method: "DELETE",
        body: JSON.stringify({ type: tab, id, confirmText }),
      });
      setStatusTone("ok");
      setStatus("Conteúdo excluído com sucesso.");
      await loadItems(tab);
    } catch (error) {
      setStatusTone("error");
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
      setStatusTone("ok");
      setStatus(`Sincronização concluída. ${result.importedCount ?? 0} evento(s) importado(s).${warnings}`);
      await loadImportedEvents();
    } catch (error) {
      setStatusTone("error");
      setStatus(normalizeAdminError(error));
    }
  };

  const publishImportedEvents = async () => {
    if (!selectedImported.length) {
      setStatusTone("error");
      setStatus("Selecione ao menos um evento importado para publicar.");
      return;
    }

    try {
      const result = (await authorizedFetch("/api/admin/integrations/events", {
        method: "POST",
        body: JSON.stringify({ action: "publish", ids: selectedImported }),
      })) as { publishedCount?: number };

      setStatusTone("ok");
      setStatus(`${result.publishedCount ?? 0} evento(s) importado(s) publicado(s) na agenda.`);
      setSelectedImported([]);
      await Promise.all([loadImportedEvents(), loadItems("eventos")]);
    } catch (error) {
      setStatusTone("error");
      setStatus(normalizeAdminError(error));
    }
  };

  const archiveImportedEvents = async () => {
    if (!selectedImported.length) {
      setStatusTone("error");
      setStatus("Selecione ao menos um evento importado para arquivar.");
      return;
    }

    try {
      const result = (await authorizedFetch("/api/admin/integrations/events", {
        method: "POST",
        body: JSON.stringify({ action: "archive", ids: selectedImported }),
      })) as { archivedCount?: number };

      setStatusTone("ok");
      setStatus(`${result.archivedCount ?? 0} evento(s) importado(s) arquivado(s).`);
      setSelectedImported([]);
      await loadImportedEvents();
    } catch (error) {
      setStatusTone("error");
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
                onClick={() => {
                  setTab(currentTab);
                  setEditingId(null);
                }}
              >
                {tabLabels[currentTab]}
              </button>
            ))}
          </div>

          <div className="filters-row">
            <input
              placeholder="Buscar por título, slug ou categoria"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">Todos os status</option>
              {contentStatuses.map((contentStatus) => (
                <option key={contentStatus} value={contentStatus}>
                  {contentStatus}
                </option>
              ))}
            </select>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="">Todas as categorias</option>
              {categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <button type="button" className="btn btn-ghost" onClick={() => void loadItems(tab)}>
              Aplicar filtros
            </button>
          </div>

          <form className="form-grid" onSubmit={saveContent}>
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

            {tab !== "avisos_oficiais" ? (
              <label className="form-field">
                <span>Imagem de capa (URL)</span>
                <input
                  placeholder="https://..."
                  value={form[tab].coverImage}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, [tab]: { ...prev[tab], coverImage: e.target.value } }))
                  }
                />
              </label>
            ) : null}

            {tab !== "avisos_oficiais" ? (
              <label className="form-field">
                <span>Upload rápido de imagem de capa</span>
                <input type="file" accept="image/*" onChange={(e) => void handleCoverImageFile(e.target.files?.[0] ?? null)} />
              </label>
            ) : null}

            <label className="form-field">
              <span>Status</span>
              <select
                value={form[tab].status}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, [tab]: { ...prev[tab], status: e.target.value } }))
                }
              >
                {contentStatuses.map((contentStatus) => (
                  <option key={contentStatus} value={contentStatus}>
                    {contentStatus}
                  </option>
                ))}
              </select>
            </label>

            <div className="cta-row">
              <button type="submit" className="btn btn-dark">
                {editingId ? "Salvar edição" : `Criar ${tabSingularLabels[tab]}`}
              </button>
              {editingId ? (
                <button type="button" className="btn btn-ghost" onClick={resetCurrentForm}>
                  Cancelar edição
                </button>
              ) : null}
            </div>
          </form>

          <h3>Conteúdos recentes</h3>
          <ul className="admin-list">
            {items.map((item) => (
              <li key={item.id}>
                <div>
                  <strong>{item.title}</strong>
                  <p className="muted">
                    {item.category} • {item.status}
                  </p>
                </div>
                <div className="cta-row">
                  <button type="button" className="btn btn-ghost" onClick={() => editItem(item)}>
                    Editar
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={() => removeItem(item.id)}>
                    Excluir
                  </button>
                </div>
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
          <div className="filters-row">
            <select value={importedFilter} onChange={(e) => setImportedFilter(e.target.value)}>
              <option value="all">Todos</option>
              <option value="imported">Pendentes</option>
              <option value="published">Publicados</option>
              <option value="archived">Arquivados</option>
            </select>
            <button type="button" className="btn btn-ghost" onClick={() => void loadImportedEvents()}>
              Atualizar lista
            </button>
          </div>
          <div className="cta-row">
            <button type="button" className="btn btn-dark" onClick={syncImportedEvents}>
              Sincronizar agenda externa
            </button>
            <button type="button" className="btn btn-ghost" onClick={publishImportedEvents}>
              Publicar selecionados
            </button>
            <button type="button" className="btn btn-ghost" onClick={archiveImportedEvents}>
              Arquivar selecionados
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
                      ({event.source} • {event.startsAt || "sem data"} • {event.location || "sem local"} •{" "}
                      {formatImportedStatus(event.status)})
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {status ? <p className={statusTone === "error" ? "status status-error" : "status"}>{status}</p> : null}
    </section>
  );
}
