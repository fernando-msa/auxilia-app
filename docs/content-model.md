# Modelo de conteúdo

## Campos comuns
Todos os módulos compartilham base:
- `title`, `summary`, `slug`, `category`
- `status` (`draft|published`)
- `featured` (`boolean`)
- `createdAt`, `updatedAt`, `publishedAt`
- `createdBy`

## Coleções

### `noticias`
- `content`, `author`

### `eventos`
- `eventType`, `location`, `audience`, `startsAt`, `endsAt?`, `externalSignupUrl?`

### `musicas`
- `songType`, `lyrics`, `youtubeUrl?`, `spotifyUrl?`

### `espiritualidades`
- `spiritualType`, `content`

## Observações
- O app mantém compatibilidade com campos legados (`titulo`, `resumo`, etc.) por meio de mapeadores no serviço.
- Dados de exemplo em `lib/mock-content.ts` são explicitamente demonstrativos.
