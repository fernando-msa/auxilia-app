"use client";

import { useState } from "react";

interface FormState {
  nome: string;
  email: string;
  whatsapp: string;
  cidade: string;
  estado: string;
  como_ajudar: string;
}

interface FormStatus {
  type: "idle" | "loading" | "success" | "error";
  message?: string;
}

const ESTADOS = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];

export function VolunteerForm() {
  const [formData, setFormData] = useState<FormState>({
    nome: "",
    email: "",
    whatsapp: "",
    cidade: "",
    estado: "",
    como_ajudar: "",
  });

  const [status, setStatus] = useState<FormStatus>({ type: "idle" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus({ type: "loading" });

    try {
      const response = await fetch("/api/voluntarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setStatus({
          type: "success",
          message: "Obrigado! Seu cadastro foi enviado com sucesso.",
        });
        setFormData({
          nome: "",
          email: "",
          whatsapp: "",
          cidade: "",
          estado: "",
          como_ajudar: "",
        });
      } else {
        setStatus({
          type: "error",
          message: data.error || "Erro ao salvar cadastro. Tente novamente.",
        });
      }
    } catch {
      setStatus({
        type: "error",
        message: "Erro ao enviar formulário. Verifique sua conexão.",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="volunteer-form">
      <div className="form-field">
        <label htmlFor="nome">Nome completo *</label>
        <input
          id="nome"
          type="text"
          name="nome"
          value={formData.nome}
          onChange={handleChange}
          placeholder="Seu nome"
          required
        />
      </div>

      <div className="form-field">
        <label htmlFor="email">E-mail *</label>
        <input
          id="email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="seu.email@example.com"
          required
        />
      </div>

      <div className="form-field">
        <label htmlFor="whatsapp">WhatsApp *</label>
        <input
          id="whatsapp"
          type="tel"
          name="whatsapp"
          value={formData.whatsapp}
          onChange={handleChange}
          placeholder="(11) 99999-9999"
          required
        />
      </div>

      <div className="form-grid">
        <div className="form-field">
          <label htmlFor="cidade">Cidade</label>
          <input
            id="cidade"
            type="text"
            name="cidade"
            value={formData.cidade}
            onChange={handleChange}
            placeholder="São Paulo"
          />
        </div>

        <div className="form-field">
          <label htmlFor="estado">Estado</label>
          <select
            id="estado"
            name="estado"
            value={formData.estado}
            onChange={handleChange}
          >
            <option value="">Selecione...</option>
            {ESTADOS.map((estado) => (
              <option key={estado} value={estado}>
                {estado}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-field">
        <label htmlFor="como_ajudar">Como deseja ajudar? *</label>
        <textarea
          id="como_ajudar"
          name="como_ajudar"
          value={formData.como_ajudar}
          onChange={handleChange}
          placeholder="Conte-nos sobre seu interesse em contribuir com o Movimento Auxilia..."
          rows={5}
          required
        />
      </div>

      {status.type !== "idle" && (
        <div className={`form-message form-message-${status.type}`}>
          {status.message}
        </div>
      )}

      <button type="submit" className="btn" disabled={status.type === "loading"}>
        {status.type === "loading" ? "Enviando..." : "Quero ajudar!"}
      </button>
    </form>
  );
}
