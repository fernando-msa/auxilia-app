# Modelo de dados (legado + atual)

Este documento foi mantido por compatibilidade e agora referencia o modelo atualizado em `docs/content-model.md`.

## Coleções principais atuais
- `noticias`
- `eventos`
- `musicas`
- `espiritualidades`

## Coleções legadas suportadas
- `atividades` (mantida para transição)

## Publicação
A escrita deve ocorrer via endpoint server-side `POST /api/admin/content`, que valida autenticação e autorização.

Para detalhes de campos e tipos, consulte `docs/content-model.md`.
