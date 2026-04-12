# Gestão de mídia (estado atual e evolução)

## Estado atual
- Campo `coverImage` por URL em conteúdos.
- Upload rápido no admin usando Data URL (viável para operação inicial).

## Evolução recomendada
1. Migrar upload para Firebase Storage.
2. Salvar apenas URL pública no Firestore.
3. Criar coleção `media_assets` com metadados (owner, tamanho, tipo, uso).
4. Implementar limpeza e versionamento de imagens.
