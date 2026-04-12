# Arquitetura (v2 incremental)

## Visão geral
- Frontend público em Next.js App Router (SSR).
- Admin client-side com autenticação Google e autorização server-side.
- Firestore como base principal com coleções por domínio.
- Integrações externas de agenda com coleção de curadoria (`eventos_importados`).

## Domínios centrais
- Conteúdo editorial: `noticias`, `eventos`, `musicas`, `espiritualidades`.
- Comunicação institucional: `avisos_oficiais`.
- Engajamento em eventos: `eventos_pre_inscricoes`.

## Camadas
- `types/content.ts`: contratos de domínio e status editoriais.
- `services/content.ts`: mapeamento + fallback + filtragem de publicados.
- `app/api/admin/content/route.ts`: CRUD administrativo com validação/sanitização.
- `app/api/admin/integrations/events/route.ts`: sincronização e curadoria em lote.
- `app/api/eventos/pre-inscricao/route.ts`: captura pré-inscrições.

## Decisões
1. Status editorial unificado (`draft/published/archived`) para todos os domínios.
2. Slug consistente gerado no backend para criação/edição.
3. Exclusão com confirmação textual (`EXCLUIR`) para reduzir erro operacional.
4. Publicação pública filtra apenas `published`.
