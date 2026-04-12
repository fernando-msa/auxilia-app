# RBAC plan (proposta)

## Papéis
- `editor`: cria e edita drafts.
- `publisher`: publica/arquiva.
- `admin`: gerencia integrações, exclusões e permissões.

## Estratégia técnica
1. Curto prazo: mapear e-mails permitidos por variável de ambiente.
2. Médio prazo: registrar papel em `admin_users` no Firestore.
3. Longo prazo: custom claims no Firebase Auth para autorização granular.

## Ações futuras
- Restringir `DELETE` para `admin`.
- Restringir `publish/archived` para `publisher` e `admin`.
