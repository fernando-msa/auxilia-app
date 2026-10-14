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

## Security & Hardening

The application underwent a comprehensive security and robustness audit with the following protections in place:

- **Strict Identity & Token Verification** — `validateAdminRequest` enforces `email_verified: true` and `checkRevoked: true` on Firebase ID tokens, preventing account takeover via unverified email addresses.
- **XSS & Protocol Validation** — Custom Zod schemas enforce strict `https:`/`http:` URL protocols, rejecting `javascript:` and `data:` schemes. CTA buttons accept safe internal relative paths (`/eventos`) while forbidding protocol-relative URLs (`//`).
- **Domain-Restricted Media Links** — YouTube and Spotify URLs are verified against official platform hostnames.
- **DDoS & Memory Exhaustion Defense** — In-memory rate limiting with automated eviction and a strict `MAX_STORE_SIZE` ceiling (10,000 keys) prevents memory ballooning. Headers `cf-connecting-ip`, `x-vercel-forwarded-for`, and `x-real-ip` are prioritized.
- **API Information Disclosure Protection (CWE-209)** — Internal error traces are logged privately on the server; clients receive clean, uniform error messages.
- **Rate-Limited Public Endpoints** — Volunteer signup (`/api/voluntarios`), event pre-registration (`/api/eventos/pre-inscricao`), and provider synchronization (`/api/integrations/sync/events`) are protected by IP rate limits.
- **Hardened Firestore Rules** — Client access is restricted to published documents; sensitive PII collections (`voluntarios`, `eventos_pre_inscricoes`, `eventos_importados`) strictly deny client read/write and are accessible only through the server-side Firebase Admin SDK.
- **HTTP Security Headers** — Strict CSP, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Strict-Transport-Security`, `Permissions-Policy`, and `poweredByHeader: false`.
- **Fault-Tolerant UI Rendering** — Safe date parsing guards all components against `RangeError: Invalid time value` unhandled exceptions.

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js 15 (App Router) | SSR, API routes, file-based routing |
| UI | React 19 | Component-based UI |
| Language | TypeScript 5 (strict) | Type safety across the stack |
| Database | Google Firestore | NoSQL document storage |
| Auth | Firebase Auth (Google) | Client-side authentication |
| Admin SDK | Firebase Admin | Server-side token verification & data management |
| Validation | Zod | Runtime schema validation |
| Testing | Vitest | Unit, security, and integration tests |
| Deploy | Vercel | Serverless hosting |

## Architecture

The application follows a **layered service-oriented architecture**:

```
Pages (SSR)  →  Services  →  Firestore
    ↓
API Routes   →  Auth + Validation + Rate Limiting  →  Firestore Admin SDK
    ↓
Components   →  Firebase Client SDK  →  Firestore (reads only)
```

- **Pages** — Server components that call services directly for SSR
- **Services** — Data access layer that maps Firestore documents to typed domain objects
- **API Routes** — Authorization boundary with token verification, rate limiting, and input validation
- **Middleware** — Protects internal dashboard routes (`/dashboard/*`)
- **Firestore Rules** — Secondary defense layer requiring admin custom claims for writes and denying client access to PII

See [docs/architecture.md](docs/architecture.md) for detailed architecture documentation.

## Getting Started

### Prerequisites

- Node.js 18+
- A Firebase project with Firestore enabled
- Firebase Admin SDK service account credentials

### Installation

```bash
git clone https://github.com/fernando-msa/auxilia-app.git
cd auxilia-app
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
auxilia-app/
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
│   │   ├── eventos/pre-inscricao # Event pre-registration (rate-limited)
│   │   ├── integrations/sync/    # External sync endpoint (rate-limited)
│   │   └── voluntarios/          # Volunteer registration (rate-limited)
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
├── firestore.rules               # Hardened Firestore security rules
├── middleware.ts                  # Route protection for /dashboard/*
└── vitest.config.ts              # Test configuration
```

## Routes

### Public
| Route | Description |
|-------|-------------|
| `/` | Landing page with hero, about section, and content preview |
| `/noticias`, `/eventos`, `/musicas`, `/espiritualidade` | Content modules with list and detail views |
| `/busca` | Global search across all content |
| `/quero-ajudar` | Volunteer registration form with LGPD consent |
| `/admin` | Admin login (Google OAuth) and content management |

### Protected (requires authentication)
| Route | Description |
|-------|-------------|
| `/dashboard/avisos` | Community announcements board |
| `/dashboard/calendario` | Community event calendar |

### API
| Endpoint | Methods | Auth / Protection |
|----------|---------|-------------------|
| `/api/admin/content` | GET, POST, PUT, DELETE | Token + verified email allowlist + rate limit |
| `/api/admin/integrations/events` | GET, POST | Token + verified email allowlist + rate limit |
| `/api/integrations/sync/events` | POST | Sync secret + rate limit |
| `/api/voluntarios` | POST | Public + rate limit (5 req/min) |
| `/api/eventos/pre-inscricao` | POST | Public + rate limit (10 req/min) |

## Testing

```bash
npm test            # Run all tests
npm run test:watch  # Run tests in watch mode
```

The automated test suite contains **53 tests** covering:
- **Zod validation schemas** — Required fields, limits, XSS prevention (`javascript:` rejection), relative vs absolute URL policies, and domain filtering for media links.
- **Rate limiter behavior** — Request thresholds, custom limits, key isolation, memory ceiling eviction, and multi-proxy header extraction (`cf-connecting-ip`, `x-vercel-forwarded-for`, `x-real-ip`).
- **Auth module** — Missing tokens, malformed headers, email verification enforcement (`email_verified`), and whitelist access control.

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
- Volunteer engagement form with LGPD consent
- External calendar integration with curation workflow
- Global search, PWA manifest, hardened Firestore security rules
- Complete security audit: anti-XSS URL validation, email verification checks, rate limiting with memory eviction, error sanitization, and resilient UI date rendering

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

