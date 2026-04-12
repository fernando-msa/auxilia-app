# Fluxo de pré-inscrição em eventos

1. Usuário abre detalhe do evento (`/eventos/[slug]`).
2. Preenche formulário de pré-inscrição.
3. App envia para `POST /api/eventos/pre-inscricao`.
4. API valida campos obrigatórios e e-mail.
5. Firestore grava em `eventos_pre_inscricoes` com `status = pending`.

## Próximo passo sugerido
- Criar tela no admin para listar/aprovar/rejeitar inscrições.
