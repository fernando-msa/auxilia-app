"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { auth, db, googleProvider } from "@/lib/firebase";

const ALLOWED_EMAILS = ["ribeirojunior270@gmail.com"];

type Tab = "noticias" | "atividades";

export default function AdminContentManager() {
  const [user, setUser] = useState<User | null>(null);
  const [tab, setTab] = useState<Tab>("noticias");
  const [status, setStatus] = useState<string>("");

  const [noticia, setNoticia] = useState({ titulo: "", resumo: "", categoria: "Juventude" });
  const [atividade, setAtividade] = useState({
    titulo: "",
    local: "",
    data: "",
    publico: "Jovens",
  });

  useEffect(() => {
    return onAuthStateChanged(auth, setUser);
  }, []);

  const isAllowed = useMemo(
    () => !!user?.email && ALLOWED_EMAILS.includes(user.email),
    [user?.email],
  );

  const handleGoogleLogin = async () => {
    setStatus("");
    const result = await signInWithPopup(auth, googleProvider);
    if (!result.user.email || !ALLOWED_EMAILS.includes(result.user.email)) {
      await signOut(auth);
      setStatus("Seu e-mail não tem permissão para publicar.");
      return;
    }
    setStatus("Login autorizado.");
  };

  const publishNoticia = async (event: FormEvent) => {
    event.preventDefault();
    if (!isAllowed) return;

    await addDoc(collection(db, "noticias"), {
      ...noticia,
      createdAt: serverTimestamp(),
    });

    setNoticia({ titulo: "", resumo: "", categoria: "Juventude" });
    setStatus("Notícia publicada com sucesso.");
  };

  const publishAtividade = async (event: FormEvent) => {
    event.preventDefault();
    if (!isAllowed) return;

    await addDoc(collection(db, "atividades"), {
      ...atividade,
      createdAt: serverTimestamp(),
    });

    setAtividade({ titulo: "", local: "", data: "", publico: "Jovens" });
    setStatus("Atividade publicada com sucesso.");
  };

  return (
    <section className="section admin-panel">
      <h2>Publicação de Conteúdo (Equipe)</h2>
      <p className="section-description">
        Área para inserir notícias e agenda para os jovens. Acesso inicial restrito por Google
        Sign-In ao e-mail autorizado.
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
          {!isAllowed ? (
            <p className="error">Este e-mail não está autorizado.</p>
          ) : (
            <>
              <div className="tabs">
                <button
                  type="button"
                  className={tab === "noticias" ? "tab active" : "tab"}
                  onClick={() => setTab("noticias")}
                >
                  Nova notícia
                </button>
                <button
                  type="button"
                  className={tab === "atividades" ? "tab active" : "tab"}
                  onClick={() => setTab("atividades")}
                >
                  Nova atividade
                </button>
              </div>

              {tab === "noticias" ? (
                <form className="form-grid" onSubmit={publishNoticia}>
                  <input
                    required
                    placeholder="Título"
                    value={noticia.titulo}
                    onChange={(e) => setNoticia((prev) => ({ ...prev, titulo: e.target.value }))}
                  />
                  <input
                    required
                    placeholder="Categoria"
                    value={noticia.categoria}
                    onChange={(e) =>
                      setNoticia((prev) => ({ ...prev, categoria: e.target.value }))
                    }
                  />
                  <textarea
                    required
                    placeholder="Resumo"
                    value={noticia.resumo}
                    onChange={(e) => setNoticia((prev) => ({ ...prev, resumo: e.target.value }))}
                  />
                  <button type="submit" className="btn btn-dark">
                    Publicar notícia
                  </button>
                </form>
              ) : (
                <form className="form-grid" onSubmit={publishAtividade}>
                  <input
                    required
                    placeholder="Título"
                    value={atividade.titulo}
                    onChange={(e) =>
                      setAtividade((prev) => ({ ...prev, titulo: e.target.value }))
                    }
                  />
                  <input
                    required
                    placeholder="Local"
                    value={atividade.local}
                    onChange={(e) => setAtividade((prev) => ({ ...prev, local: e.target.value }))}
                  />
                  <input
                    required
                    placeholder="Data/Hora"
                    value={atividade.data}
                    onChange={(e) => setAtividade((prev) => ({ ...prev, data: e.target.value }))}
                  />
                  <input
                    required
                    placeholder="Público"
                    value={atividade.publico}
                    onChange={(e) =>
                      setAtividade((prev) => ({ ...prev, publico: e.target.value }))
                    }
                  />
                  <button type="submit" className="btn btn-dark">
                    Publicar atividade
                  </button>
                </form>
              )}
            </>
          )}

          <button type="button" className="btn btn-ghost" onClick={() => signOut(auth)}>
            Sair
          </button>
        </div>
      )}

      {status ? <p className="status">{status}</p> : null}
    </section>
  );
}
