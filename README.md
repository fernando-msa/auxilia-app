# Auxilia App

> Digital platform for Catholic youth evangelization — Movimento Auxilia

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?logo=firebase)
![License](https://img.shields.io/badge/License-MIT-green)

<p align="center">
  <img src="docs/images/home-preview.svg" alt="Auxilia App Preview" width="700" />
</p>

---

## Overview

Auxilia App is a full-stack web application built for the **Movimento Auxilia**, a Salesian-inspired Catholic youth movement. It serves as the official digital platform for publishing spiritual content, music, events, and news — bridging the gap between traditional evangelization and modern web technology.

The platform features a **public-facing website** with server-rendered pages optimized for SEO, a **secure admin panel** where authorized content managers can publish, curate, and manage all content through Google authentication with server-side validation, and an **internal dashboard** for team collaboration with announcements and event calendars.

An external calendar integration allows automated import of events from Google Calendar, with a manual curation workflow before publishing to the public feed.

## Features

- **4 Content Modules** — News, Events, Songs, and Spirituality, each with list and detail views
- **Server-Side Rendering** — Public pages are SSR for fast load times and SEO
- **Admin Panel** — Google Auth login with server-side token verification and email whitelist authorization
- **Content Management** — Create, edit, publish, archive, and delete content with status workflow (draft/published/archived)
- **Internal Dashboard** — Protected routes for announcements board and event calendar
- **Volunteer Engagement** — Public form for youth to sign up as volunteers
- **External Calendar Sync** — Import events from Google Calendar, curate before publishing
- **Firestore Security Rules** — Read access for published content only; writes restricted to admin users
- **PWA Ready** — Web manifest configured for progressive web app installation
- **Input Validation** — Zod schemas validate all API inputs with detailed error messages
- **Rate Limiting** — In-memory rate limiter protects admin API endpoints
- **Security Headers** — X-Frame-Options, X-Content-Type-Options, Referrer-Policy, and Permissions-Policy configured
- **Global Search** — Search across all content modules

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js 15 (App Router) | SSR, API routes, file-based routing |
| UI | React 19 | Component-based UI |
| Language | TypeScript 5 (strict) | Type safety across the stack |
| Database | Google Firestore | NoSQL document storage |
| Auth | Firebase Auth (Google) | Client-side authentication |
| Admin SDK | Firebase Admin | Server-side token verification |
| Validation | Zod | Runtime schema validation |
| Testing | Vitest | Unit and integration tests |
| Deploy | Vercel | Serverless hosting |

## Architecture

The application follows a **layered service-oriented architecture**:

```
Pages (SSR)  →  Services  →  Firestore
    ↓
API Routes   →  Auth + Validation  →  Firestore
    ↓
Components   →  Firebase Client SDK  →  Firestore (reads only)
```

- **Pages** — Server components that call services directly for SSR
- **Services** — Data access layer that maps Firestore documents to typed domain objects
- **API Routes** — Authorization boundary with token verification and input validation
- **Middleware** — Protects internal dashboard routes (`/dashboard/*`)
- **Firestore Rules** — Secondary defense layer requiring admin custom claims for writes

See [docs/architecture.md](docs/architecture.md) for detailed architecture documentation.

## Getting Started

### Prerequisites

- Node.js 18+
- A Firebase project with Firestore enabled
- Firebase Admin SDK service account credentials

### Installation

```bash
git clone https://github.com/fernando-msa/auxilia-app-1.git
cd auxilia-app-1
npm install
```

### Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Web API key | Yes |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | Yes |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID | Yes |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | Yes |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID | Yes |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID | Yes |
| `FIREBASE_ADMIN_PROJECT_ID` | Admin SDK project ID | Yes |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | Admin SDK service account email | Yes |
| `FIREBASE_ADMIN_PRIVATE_KEY` | Admin SDK private key | Yes |
| `CONTENT_ADMIN_EMAILS` | Comma-separated admin email whitelist | Yes |
| `SYNC_API_SECRET` | Secret for external sync endpoint | Yes |
| `GOOGLE_CALENDAR_ID` | Google Calendar ID for event import | No |
| `GOOGLE_CALENDAR_API_KEY` | Google Calendar API key | No |

### Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

1. Connect your repository to [Vercel](https://vercel.com)
2. Configure all environment variables in the Vercel dashboard
3. Apply `firestore.rules` in the Firebase Console under Firestore > Rules
4. Deploy — Vercel builds and publishes automatically

## Project Structure

```
auxilia-app-1/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Home page (hero + content preview)
│   ├── layout.tsx                # Root layout with navigation
│   ├── admin/                    # Admin panel
│   ├── dashboard/                # Internal dashboard (protected)
│   │   ├── avisos/               # Announcements board
│   │   └── calendario/           # Event calendar
│   ├── api/                      # API routes
│   │   ├── admin/content/        # Content CRUD (GET/POST/PUT/DELETE)
│   │   ├── admin/integrations/   # Imported events curation
│   │   ├── integrations/sync/    # External sync endpoint
│   │   └── voluntarios/          # Volunteer registration
│   ├── busca/                    # Global search
│   ├── quero-ajudar/             # Volunteer engagement form
│   ├── eventos/                  # Events module
│   ├── musicas/                  # Songs module
│   ├── noticias/                 # News module
│   └── espiritualidade/          # Spirituality module
├── components/                   # React components
├── lib/                          # Firebase config, auth, validation, rate limiting
├── services/                     # Data access layer + integrations
├── types/                        # TypeScript type definitions
├── docs/                         # Architecture and product documentation
├── firestore.rules               # Firestore security rules
├── middleware.ts                  # Route protection for /dashboard/*
└── vitest.config.ts              # Test configuration
```

## Routes

### Public
| Route | Description |
|-------|-------------|
| `/` | Landing page with hero, about section, and content preview |
| `/noticias`, `/eventos`, `/musicas`, `/espiritualidade` | Content modules |
| `/busca` | Global search across all content |
| `/quero-ajudar` | Volunteer registration form |
| `/admin` | Login (Google OAuth) |

### Protected (requires authentication)
| Route | Description |
|-------|-------------|
| `/dashboard/avisos` | Announcements board |
| `/dashboard/calendario` | Event calendar |

### API
| Endpoint | Methods | Auth |
|----------|---------|------|
| `/api/admin/content` | GET, POST, PUT, DELETE | Token + email whitelist |
| `/api/admin/integrations/events` | GET, POST | Token + email whitelist |
| `/api/integrations/sync/events` | POST | Sync secret |
| `/api/voluntarios` | POST | Public |

## Testing

```bash
npm test            # Run all tests
npm run test:watch  # Run tests in watch mode
```

Tests cover:
- Zod validation schemas (valid/invalid inputs, edge cases)
- Rate limiter behavior (threshold, key isolation)
- Auth module (missing tokens, empty tokens)

## Documentation

- [Architecture](docs/architecture.md) — Technical layers and key decisions
- [Content Model](docs/content-model.md) — Firestore data model and field definitions
- [Admin Workflow](docs/admin-workflow.md) — Step-by-step admin flow
- [Integrations](docs/integrations.md) — External calendar sync design
- [Product Roadmap](docs/product-roadmap.md) — Delivered features, next cycle, and backlog
- [Firestore Setup](lib/FIRESTORE_SETUP.md) — Collections, RLS policies, deployment guide

## Roadmap

**Delivered:**
- Institutional home page with 4 content modules
- Admin panel with Google Auth + server-side validation + content editing
- Internal dashboard with announcements and calendar
- Volunteer engagement form
- External calendar integration with curation workflow
- Global search, PWA manifest, Firestore security rules

**Next:**
- Advanced filters, image upload, loading skeletons
- Accessibility audit, visual curation UI

**Future:**
- User profiles, push notifications, engagement analytics

See [docs/product-roadmap.md](docs/product-roadmap.md) for full details.

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

## Author

**Fernando S. De Santana Junior**

Built with the spirit of Don Bosco — accompanying young people through technology and faith.
