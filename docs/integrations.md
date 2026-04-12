# Integrações externas (fase 1)

## Objetivo
Criar uma base segura para ingestão de eventos externos (agenda) sem publicar automaticamente no feed principal.

## Estratégia adotada
1. Buscar eventos externos (provider Google Calendar).
2. Normalizar e gravar em `eventos_importados`.
3. Manter curadoria manual para promoção ao módulo `eventos` público.

## Endpoint de sincronização
- `POST /api/integrations/sync/events`
- Header obrigatório: `x-sync-secret: <SYNC_API_SECRET>`

## Endpoint administrativo de curadoria
- `GET /api/admin/integrations/events` lista itens importados.
- `POST /api/admin/integrations/events` com:
  - `{ "action": "sync" }` para executar importação;
  - `{ "action": "publish", "ids": ["id1", "id2"] }` para publicar na coleção `eventos`.

## Variáveis de ambiente
- `SYNC_API_SECRET`: segredo para proteger endpoint de sync.
- `GOOGLE_CALENDAR_ID`: ID do calendário público.
- `GOOGLE_CALENDAR_API_KEY`: chave de leitura do Google Calendar API.

## Coleção gerada
`eventos_importados`:
- `externalId`
- `importHash`
- `source`
- `sourceUrl`
- `title`
- `summary`
- `category`
- `eventType`
- `location`
- `audience`
- `startsAt`
- `endsAt`
- `externalSignupUrl`
- `status` (`imported`)
- `importedAt`
- `updatedAt`

## Próximos passos sugeridos
- Tela admin para aprovar/importar em lote para `eventos`.
- Deduplicação avançada por `importHash` + janela temporal.
- Novo provider de agenda (ICS/paróquia/diocese).
