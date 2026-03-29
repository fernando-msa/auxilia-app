# Auxilia App Beta

Website do movimento salesiano/católico com dois focos:
- **Consagrados**: guia de oração, missão e norteador das atividades.
- **Jovens**: experiência com atividades e notícias do mundo salesiano.

## Stack
- Next.js (deploy na Vercel)
- Firebase Client SDK (Firestore + Analytics)
- Firebase Admin SDK (operações server-side)

## Rodando localmente
```bash
npm install
npm run dev
```

## Configuração do Firebase
1. Copie `.env.example` para `.env.local`.
2. O projeto já traz os dados públicos do app web (`NEXT_PUBLIC_*`).
3. Para recursos server-side, preencha as variáveis do Admin SDK:
   - `FIREBASE_ADMIN_PROJECT_ID`
   - `FIREBASE_ADMIN_CLIENT_EMAIL`
   - `FIREBASE_ADMIN_PRIVATE_KEY`
4. Crie a coleção `noticias` no Firestore com campos:
   - `titulo` (string)
   - `resumo` (string)
   - `categoria` (string)

Se não houver conexão com o Firebase, o site exibe notícias de exemplo.

## Arquivos principais de integração
- `lib/firebase.ts`: inicializa o app client, Firestore e Analytics.
- `lib/firebaseAdmin.ts`: inicializa o Firebase Admin com credenciais vindas de ambiente.

## Deploy na Vercel
1. Suba o projeto para o GitHub.
2. Importe na Vercel.
3. Configure as variáveis de ambiente da `.env.example` no painel da Vercel.
4. Faça deploy.


## Ajuste para erro de output na Vercel
Se o projeto estiver com erro **"Nenhum diretório de saída chamado public"**, este repositório já define `vercel.json` com `outputDirectory: ".next"`, compatível com Next.js.
