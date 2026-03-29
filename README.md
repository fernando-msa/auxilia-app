# Auxilia App Beta

Website do movimento salesiano/católico com dois focos:
- **Consagrados**: guia de oração, missão e norteador das atividades.
- **Jovens**: experiência com atividades e notícias do mundo salesiano.

## Stack
- Next.js (deploy na Vercel)
- Firebase (Firestore para notícias)

## Rodando localmente
```bash
npm install
npm run dev
```

## Configuração do Firebase
1. Copie `.env.example` para `.env.local`.
2. Preencha as variáveis com os dados do seu projeto Firebase.
3. Crie a coleção `noticias` no Firestore com campos:
   - `titulo` (string)
   - `resumo` (string)
   - `categoria` (string)

Se não houver conexão com o Firebase, o site exibe notícias de exemplo.

## Deploy na Vercel
1. Suba o projeto para o GitHub.
2. Importe na Vercel.
3. Configure as variáveis de ambiente da `.env.example` no painel da Vercel.
4. Faça deploy.
