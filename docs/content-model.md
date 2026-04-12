# Modelo de conteúdo (v2)

## Campos comuns
- `title`, `summary`, `slug`, `category`
- `status`: `draft | published | archived`
- `coverImage?`, `featured?`
- `createdAt`, `updatedAt`, `publishedAt`, `createdBy`

## Coleções

### `noticias`
- `content`, `author?`

### `eventos`
- `eventType`, `location`, `audience`
- `startsAt`, `endsAt?`
- `externalSignupUrl?`

### `musicas`
- `songType`, `lyrics`
- `youtubeUrl?`, `spotifyUrl?`

### `espiritualidades`
- `spiritualType`, `content`

### `avisos_oficiais`
- `title`, `message`, `level` (`info|warning|important`)
- `startsAt?`, `endsAt?`
- `ctaLabel?`, `ctaUrl?`

### `eventos_pre_inscricoes`
- `eventId`, `eventSlug`
- `name`, `email`, `phone?`, `notes?`
- `status`: `pending | approved | rejected`
- `createdAt`, `updatedAt`
