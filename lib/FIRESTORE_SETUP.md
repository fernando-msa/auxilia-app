# Firestore Setup & Security Rules

## Overview

Este documento descreve a estrutura de collections e as políticas de segurança (RLS) recomendadas para o Firestore do projeto Auxilia App.

---

## Collections a Criar

### 1. `avisos` (Mural de Avisos Interno)

Stores announcements for authenticated users only.

**Fields:**
```typescript
{
  titulo: string,              // Required: announcement title
  conteudo: string,            // Required: announcement content/body
  autor: string,               // Required: author name
  data_criacao: Timestamp,     // Required: creation timestamp
  categoria: string,           // Optional: category tag
  status: string,              // Enum: "draft" | "published" | "archived" (default: "published")
  createdAt: Timestamp,        // Server timestamp (auto-generated)
  updatedAt: Timestamp,        // Server timestamp (auto-generated)
}
```

**Indexes (recommended):**
- `data_criacao` (Descending) for chronological listing
- `status` (Ascending) + `data_criacao` (Descending) for filtered queries

---

### 2. `eventos_calendario` (Calendar Events - reuse existing `eventos` collection)

The project already has an `eventos` collection. You can either:
- **Option A:** Reuse the existing `eventos` collection with a filter for published events
- **Option B:** Create a separate `eventos_calendario` collection for events meant for the internal calendar only

Current approach: Use existing `eventos` collection with `status: "published"` filter.

**Fields (see `services/calendar.ts` for mapper):**
```typescript
{
  titulo: string,
  descricao: string,
  data_evento: Timestamp,
  local: string,
  tipo: string,                // Enum: "retiro" | "missao" | "adoracao" | "formacao" | "oratorio" | "outro"
  status: string,              // Enum: "draft" | "published" | "archived"
  startsAt: Timestamp,
  endsAt: Timestamp,           // Optional
  category: string,
  audience: string,
  eventType: string,
  publishedAt: Timestamp,
  createdAt: Timestamp,
  createdBy: string,
}
```

---

### 3. `voluntarios` (Public Volunteer Signups)

Public collection for volunteer registrations. Anyone can create, only admins can read/update/delete.

**Fields:**
```typescript
{
  nome: string,                // Required: full name
  email: string,               // Required: email (validated, unique recommended)
  whatsapp: string,            // Required: phone number (Brazilian format, no special chars)
  cidade: string,              // Optional: city
  estado: string,              // Optional: state (2-letter code)
  como_ajudar: string,         // Required: how they want to help (textarea)
  criado_em: Timestamp,        // Server timestamp (auto-generated)
  status: string,              // Enum: "novo" | "contatado" | "ativo" (default: "novo")
}
```

**Indexes (recommended):**
- `criado_em` (Descending) for admin listing
- `status` (Ascending) + `criado_em` (Descending) for status-based filtering

---

## Firestore Security Rules

Replace the existing `firestore.rules` file with the following rules:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is admin
    function isAdmin() {
      return request.auth != null && 
             request.auth.token.email in resource(
               /databases/$(database)/documents/allowlist/admins
             ).data.emails;
    }

    // Allow read/write to all documents by default (override below)
    match /{document=**} {
      allow read, write: if false;
    }

    // Public content (existing collections)
    match /noticias/{document=**} {
      allow read: if true;
      allow create, update, delete: if isAdmin();
    }

    match /eventos/{document=**} {
      allow read: if true;
      allow create, update, delete: if isAdmin();
    }

    match /musicas/{document=**} {
      allow read: if true;
      allow create, update, delete: if isAdmin();
    }

    match /espiritualidades/{document=**} {
      allow read: if true;
      allow create, update, delete: if isAdmin();
    }

    match /avisos_oficiais/{document=**} {
      allow read: if true;
      allow create, update, delete: if isAdmin();
    }

    // Internal authenticated content
    match /avisos/{document=**} {
      allow read: if request.auth != null;
      allow create, update, delete: if isAdmin();
    }

    // Public volunteer signups
    match /voluntarios/{document=**} {
      allow create: if true; // Anyone can create (public signup)
      allow read, update, delete: if isAdmin(); // Only admins can manage
    }

    // Admin allowlist document
    match /allowlist/admins {
      allow read: if request.auth != null;
      allow write: if false; // Manage manually in Firestore Console
    }
  }
}
```

### Setup Instructions:

1. **Create `allowlist/admins` document:**
   - Collection: `allowlist`
   - Document: `admins`
   - Content:
     ```json
     {
       "emails": ["ribeirojunior270@gmail.com", "other-admin@example.com"]
     }
     ```

2. **Deploy rules:**
   - Go to **Firebase Console** → **Firestore Database** → **Rules** tab
   - Copy and paste the rules above
   - Click **Publish**

3. **Verify rules are working:**
   - Test unauthenticated access: should be denied for `/avisos/*`
   - Test authenticated non-admin access: should be allowed for `/avisos` read
   - Test admin access: should be allowed for create/update/delete

---

## API Endpoints

### POST `/api/voluntarios`

Create a new volunteer record (public endpoint, no auth required).

**Request:**
```json
{
  "nome": "João Silva",
  "email": "joao@example.com",
  "whatsapp": "11999999999",
  "cidade": "São Paulo",
  "estado": "SP",
  "como_ajudar": "Gostaria de ajudar em eventos..."
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "id": "volunteer-doc-id"
}
```

**Response (Error - 400):**
```json
{
  "success": false,
  "error": "E-mail inválido"
}
```

**Validation Rules:**
- `nome`: required, trimmed
- `email`: required, valid email format
- `whatsapp`: required, Brazilian format (11 digits after removing non-digits)
- `cidade`, `estado`: optional
- `como_ajudar`: required, min length 10 characters recommended

---

## Services/Functions

### `services/announcements.ts`
```typescript
export async function getAnnouncements(): Promise<Aviso[]>
```
- Fetches published announcements from `/avisos` collection
- Ordered by `data_criacao` (descending)
- Returns mock data on Firebase error
- **Use in:** `/dashboard/avisos` page

### `services/calendar.ts`
```typescript
export async function getCalendarEvents(): Promise<EventItem[]>
```
- Fetches published events from `/eventos` collection
- Ordered by `startsAt` (ascending) for chronological display
- Returns mock data on Firebase error
- **Use in:** `/dashboard/calendario` page

### `services/volunteers.ts`
```typescript
export async function createVolunteer(data: VoluntarioFormData): Promise<{ success: boolean; id?: string; error?: string }>
```
- Validates and inserts volunteer data into `/voluntarios` collection
- Client-side validation: email format, WhatsApp format
- Server-side sanitization: trim, lowercase email, remove special chars from phone
- Sets `criado_em` timestamp automatically
- Sets `status` to `"novo"` by default
- **Use in:** `/api/voluntarios` POST endpoint

---

## Testing

### 1. Create a test volunteer

```bash
curl -X POST http://localhost:3000/api/voluntarios \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Test User",
    "email": "test@example.com",
    "whatsapp": "(11) 99999-9999",
    "cidade": "São Paulo",
    "estado": "SP",
    "como_ajudar": "Quero ajudar com eventos"
  }'
```

### 2. View announcements (requires auth)

- Navigate to `/dashboard/avisos`
- Should see mock announcements (or real ones if in Firestore)
- Unauthenticated users should be redirected to `/admin`

### 3. View calendar events

- Navigate to `/dashboard/calendario`
- Should see mock events sorted chronologically
- Should see event details: date, time, location, type

### 4. Test volunteer form

- Navigate to `/quero-ajudar`
- Fill form and submit
- Should see success message
- Check Firestore `/voluntarios` collection for new document

---

## Monitoring & Admin

### Manage Volunteers (Firestore Console)

1. Go to **Firebase Console** → **Firestore Database** → **Collections**
2. Navigate to `/voluntarios`
3. View, edit, or delete volunteer records
4. Update `status` field: `"novo"` → `"contatado"` → `"ativo"`

### View Announcements (Firestore Console)

1. Navigate to `/avisos` collection
2. Create, edit, or delete announcements
3. Filter by `status: "published"` to control visibility

### Update Admin Allowlist

1. Go to `/allowlist/admins` document
2. Edit the `emails` array
3. Add or remove admin email addresses
4. Changes take effect immediately

---

## Backup & Migration

### Export Collections

Use Firebase Admin SDK to backup collections:

```bash
# Export to JSON (example with firebase-cli)
firebase firestore:export ./backup
```

### Import Collections

```bash
firebase firestore:import ./backup
```

---

## Troubleshooting

### "Permission denied" when accessing `/dashboard/avisos`

- Check if user is authenticated (see `/admin` page)
- Verify Firestore rules allow read access for authenticated users
- Check browser console for specific error message

### Volunteer signup fails with "E-mail inválido"

- Ensure email has valid format: `user@example.com`
- Check server logs for detailed error

### No announcements showing on `/dashboard/avisos`

- Verify `/avisos` collection exists and has documents
- Check that documents have `status: "published"`
- Check Firestore security rules allow read access

---

## Summary

| Feature | Collection | Auth | Access |
|---------|-----------|------|--------|
| Avisos (Mural) | `/avisos` | Yes | Read if authenticated, write if admin |
| Events (Calendário) | `/eventos` | No | Read public (published), write if admin |
| Volunteers | `/voluntarios` | No (create) | Create public, read/update if admin |
| Admins Allowlist | `/allowlist/admins` | Yes | Read if authenticated, write manually |

