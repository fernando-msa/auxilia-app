# Auxilia App

Plataforma digital oficial em evolução para apoiar o Movimento Auxilia na evangelização da juventude católica: espiritualidade, música, agenda de eventos e comunicação institucional.

## O que evoluiu neste ciclo
- Admin com **criação + edição + exclusão protegida** (`POST`, `PUT`, `DELETE`) por domínio.
- Status editoriais: `draft`, `published`, `archived`.
- Campo de **imagem de capa** por URL e upload rápido (data URL) no admin.
- Filtros e busca no admin (tipo, status, categoria, texto).
- Curadoria de agenda importada com ações de **publicar** e **arquivar** em lote.
- Página de eventos com filtros de tipo/público/status e destaque de próximos eventos.
- **Pré-inscrição interna** de eventos com endpoint dedicado.
- Módulo de **avisos oficiais** e banner institucional na home.
- Busca global entre notícias, eventos, músicas e espiritualidade (`/busca`).

## Stack
- Next.js 15 + React 19 + TypeScript
- Firebase Client SDK (Auth, Firestore, Analytics)
- Firebase Admin SDK (autorização server-side)

## Setup local
```bash
npm install
npm run dev
```

## Variáveis de ambiente
Configure `.env.local` com:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`
- `FIREBASE_ADMIN_PROJECT_ID`
- `FIREBASE_ADMIN_CLIENT_EMAIL`
- `FIREBASE_ADMIN_PRIVATE_KEY`
- `CONTENT_ADMIN_EMAILS` (emails separados por vírgula)
- `SYNC_API_SECRET` (proteção dos endpoints de sincronização)
- `GOOGLE_CALENDAR_ID` e `GOOGLE_CALENDAR_API_KEY` (integração opcional)

## Documentação
- `docs/architecture.md`
- `docs/content-model.md`
- `docs/admin-workflow.md`
- `docs/product-roadmap.md`
- `docs/rbac-plan.md`
- `docs/event-signup-flow.md`
- `docs/media-management.md`
