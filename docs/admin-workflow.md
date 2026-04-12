# Fluxo administrativo

1. Usuário acessa `/admin`.
2. Faz login Google (Firebase Auth).
3. Client envia ID token no header `Authorization`.
4. API `/api/admin/content` valida token com Firebase Admin.
5. API verifica e-mail em `CONTENT_ADMIN_EMAILS`.
6. Conteúdo é sanitizado, recebe `slug`, timestamps e `createdBy`.
7. Firestore grava documento na coleção correspondente.
8. Admin pode listar e excluir conteúdos publicados.
9. Admin também pode sincronizar agenda externa e publicar eventos importados selecionados.

## Segurança
- Autorização final sempre no backend.
- Firestore Rules restringem escrita a usuários com claim administrativa.
- Coleções públicas permitem apenas leitura de conteúdo publicado (ou legado sem `status`).
