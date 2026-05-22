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

## ✨ Novas features (consolidação)
- **Dashboard protegido** (`/dashboard/*`): Mural de Avisos + Calendário de Eventos
- **Formulário de Engajamento** (`/quero-ajudar`): Cadastro público de voluntários
- **Landing page aprimorada**: Seção "Quem Somos" (missão + pilares) + Dashboard Visual de estatísticas
- **Middleware de autenticação** para proteção de rotas internas
- **Firestore collections**: `avisos`, `voluntarios` + policies RLS básicas
- **Documentação de segurança**: `lib/FIRESTORE_SETUP.md` com setup e deployment guide

## Stack
- Next.js 15.5.18 + React 19 + TypeScript
- Firebase Client SDK (Auth, Firestore, Analytics)
- Firebase Admin SDK (autorização server-side)
- CSS Vanilla (design tokens + utility classes)

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
- `lib/FIRESTORE_SETUP.md` — Collections, RLS policies, admin guide, deployment

## Rotas principais

### 🌐 Públicas
- `/` — Landing page (hero + Quem Somos + Dashboard Visual + conteúdo)
- `/espiritualidade`, `/musicas`, `/eventos`, `/noticias` — Conteúdo
- `/busca` — Busca global
- `/quero-ajudar` — Formulário de engajamento/voluntários
- `/admin` — Login (Google OAuth)

### 🔐 Protegidas (requer autenticação)
- `/dashboard/avisos` — Mural de avisos interno (grid de cards)
- `/dashboard/calendario` — Calendário de eventos (lista cronológica)

### 📡 API
- `POST /api/voluntarios` — Submissão de cadastro (público)
- `POST /api/admin/content` — CRUD admin (protegido por email whitelist)
- `POST /api/admin/integrations/events` — Publicar/arquivar eventos (protegido)

## Estrutura de diretórios (destaques)
```
app/
├── page.tsx — Landing page (aprimorada com Quem Somos + Dashboard Visual)
├── quero-ajudar/page.tsx — Engajamento de voluntários
├── dashboard/
│   ├── layout.tsx — Layout protegido com header/nav
│   ├── avisos/page.tsx — Mural de avisos
│   └── calendario/page.tsx — Calendário de eventos
└── api/voluntarios/route.ts — API para cadastro de voluntários

components/
├── AnnouncementCard.tsx — Card de aviso
├── CalendarView.tsx — Visualização de eventos
└── VolunteerForm.tsx — Formulário de voluntário ('use client')

services/
├── announcements.ts — Fetch avisos com fallback mock
├── calendar.ts — Fetch eventos do calendário
└── volunteers.ts — Validação e inserção de voluntários

types/
├── announcements.ts — Interface Aviso
└── volunteers.ts — Interfaces Voluntario, VoluntarioFormData

lib/
├── firebase.ts, firebaseAdmin.ts — Configuração Firebase
├── mock-content.ts — Mock data (inclui avisos e eventos)
└── FIRESTORE_SETUP.md — Guia de setup Firestore e RLS

middleware.ts — Proteção de /dashboard/* routes
```

## Segurança

### Autenticação
- **Rotas públicas**: Acesso livre
- **Dashboard (`/dashboard/*`)**: Requer autenticação via Google OAuth
- **Admin endpoints**: Token Firebase + email whitelist (`CONTENT_ADMIN_EMAILS`)

### Firestore Security Rules
Veja `lib/FIRESTORE_SETUP.md` para:
- Collections e fields recomendados
- Policies RLS para `avisos`, `eventos`, `voluntarios`
- Email allowlist para admins
- Guia de deployment

### Validações
- **Email**: Formato básico (regex)
- **WhatsApp**: Padrão brasileiro (11 dígitos com DDD)
- **Form fields**: Trim, sanitização, validação server-side
- **Sanitização**: Escape de conteúdo em renderização

## Desenvolvendo

```bash
# Instalar dependências
npm install

# Dev server (localhost:3000)
npm run dev

# Build e testes
npm run build
npm run lint

# Verificar vulnerabilidades
npm audit
```

## Deployment

1. **Configurar variáveis de ambiente** no provedor (Firebase config + admin credentials)
2. **Deploy Firestore Security Rules** (veja `lib/FIRESTORE_SETUP.md`)
3. **Criar allowlist de admins** em `/allowlist/admins` no Firestore
4. **Deploy via Next.js** (Vercel, self-hosted, ou container)
