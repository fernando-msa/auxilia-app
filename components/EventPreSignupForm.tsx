"use client";

import { FormEvent, useState } from "react";

export function EventPreSignupForm({ eventId, eventSlug }: { eventId: string; eventSlug: string }) {
  const [status, setStatus] = useState("");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("");

    const formData = new FormData(event.currentTarget);
    const payload = {
      eventId,
      eventSlug,
      name: String(formData.get("name") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      phone: String(formData.get("phone") ?? "").trim(),
      notes: String(formData.get("notes") ?? "").trim(),
    };

    const response = await fetch("/api/eventos/pre-inscricao", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = (await response.json()) as { error?: string; ok?: boolean };

    if (!response.ok) {
      setStatus(result.error ?? "Não foi possível enviar sua pré-inscrição.");
      return;
    }

    event.currentTarget.reset();
    setStatus("Pré-inscrição enviada! A equipe entrará em contato.");
  };

  return (
    <form className="pre-signup-form" onSubmit={onSubmit}>
      <h3>Pré-inscrição</h3>
      <input name="name" required placeholder="Seu nome" />
      <input name="email" required type="email" placeholder="Seu e-mail" />
      <input name="phone" placeholder="Telefone (opcional)" />
      <textarea name="notes" placeholder="Observações (opcional)" rows={3} />
      <button type="submit" className="btn btn-dark">
        Enviar pré-inscrição
      </button>
      {status ? <p className="muted">{status}</p> : null}
    </form>
  );
}
