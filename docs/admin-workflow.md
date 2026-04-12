# Fluxo administrativo (v2)

1. Usuário acessa `/admin` e autentica com Google.
2. Client envia ID token em `Authorization: Bearer`.
3. API valida token com Firebase Admin + e-mail permitido em `CONTENT_ADMIN_EMAILS`.
4. API sanitiza payload por domínio e valida status.
5. Criação via `POST /api/admin/content`.
6. Edição via `PUT /api/admin/content`.
7. Listagem via `GET /api/admin/content?type=&status=&category=&q=`.
8. Exclusão via `DELETE /api/admin/content` com confirmação textual (`EXCLUIR`).

## Curadoria de eventos importados
1. `POST /api/admin/integrations/events` com action `sync`.
2. Eventos entram em `eventos_importados` com deduplicação por hash.
3. Admin seleciona em lote para `publish` ou `archive`.
4. Publicação cria/atualiza `eventos` e marca status do importado.
