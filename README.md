# Auxilia App

Plataforma digital oficial em evolução para apoiar o Movimento Auxilia na evangelização da juventude católica: espiritualidade, música, agenda de eventos e comunicação institucional.

## Proposta de valor
- **Evangelização digital acessível** para jovens e comunidades.
- **Conteúdo organizado** em notícias, agenda, músicas e espiritualidade.
- **Gestão segura** por painel administrativo com validação server-side.
- **Base escalável** para evoluções futuras (PWA, notificações, perfis e analytics avançado).

## Público-alvo
- Jovens e lideranças do Movimento Auxilia.
- Equipes locais de evangelização e comunicação.
- Comunidade em geral que acompanha as iniciativas.

## Funcionalidades atuais
- Home institucional com seções de valor e CTAs.
- Módulos com listagem e detalhe para:
  - Notícias (`/noticias`)
  - Eventos (`/eventos`)
  - Músicas (`/musicas`)
  - Espiritualidade (`/espiritualidade`)
- Painel admin (`/admin`) com autenticação Google + validação no servidor para CRUD básico (publicar/listar/excluir).
- Curadoria de agenda externa no admin (sincronizar importados e publicar selecionados).
- Fallback com conteúdo de demonstração quando não há dados no Firestore.
- Metadata base e `manifest` para evolução de experiência PWA.

## Stack
- Next.js 15 + React 19 + TypeScript
- Firebase Client SDK (Auth, Firestore, Analytics)
- Firebase Admin SDK (autorização server-side)
- Firestore como base de conteúdo

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
- `GOOGLE_CALENDAR_ID` (provider de agenda - opcional)
- `GOOGLE_CALENDAR_API_KEY` (provider de agenda - opcional)

## Deploy (Vercel)
1. Conectar repositório na Vercel.
2. Configurar variáveis de ambiente.
3. Aplicar `firestore.rules` no Firebase.
4. Publicar e monitorar logs do endpoint `/api/admin/content`.

## Estrutura do projeto
- `app/`: rotas e páginas (home, módulos, admin, API)
- `components/`: componentes de UI e painel
- `services/`: acesso a dados e mapeamentos de domínio
- `types/`: tipos de domínio
- `lib/`: integrações Firebase + mocks
- `docs/`: documentação de arquitetura, roadmap, conteúdo e fluxo admin

## Documentação complementar
- `docs/architecture.md`
- `docs/content-model.md`
- `docs/admin-workflow.md`
- `docs/integrations.md`
- `docs/product-roadmap.md`

## Roadmap rápido
Consulte `docs/product-roadmap.md` para visão do que foi entregue, próximo ciclo e backlog futuro.
