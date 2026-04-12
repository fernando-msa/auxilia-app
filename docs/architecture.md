# Arquitetura (versão atual)

## Visão geral
- **Frontend:** Next.js App Router, páginas server-rendered para conteúdo público.
- **Dados:** Firestore com coleções por domínio (`noticias`, `eventos`, `musicas`, `espiritualidades`).
- **Admin:** Login Google no client + autorização final no backend (`/api/admin/content`).
- **Fallback:** conteúdo mock para garantir experiência mínima sem dependência de dados reais.

## Camadas
- `types/content.ts`: contratos de domínio.
- `services/content.ts`: leitura e mapeamento dos documentos Firestore para tipos estáveis.
- `services/integrations/*`: conectores externos e normalização para coleções importadas.
- `app/*`: páginas e rotas.
- `app/api/admin/content/route.ts`: governança de publicação.
- `app/api/integrations/sync/*`: sincronização protegida por segredo.

## Decisões técnicas
1. **Leitura server-side prioritária** para melhorar SEO e consistência.
2. **Slug padronizado** gerado no backend.
3. **Admin com whitelist de e-mails** via `CONTENT_ADMIN_EMAILS`.
4. **CRUD mínimo viável no admin** (publicar/listar/excluir) com confirmação de exclusão no client.

## Expansão preparada
- filtros por categoria no servidor;
- paginação de coleções;
- papéis editoriais (RBAC avançado);
- ingestão de conteúdo multimídia.
