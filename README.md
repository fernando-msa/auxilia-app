# Auxilia App Beta

Website do movimento salesiano/católico com dois focos:
- **Consagrados**: guia de oração, missão e norteador das atividades.
- **Jovens**: experiência com atividades e notícias do mundo salesiano.

## Stack
- Next.js (deploy na Vercel)
- Firebase Client SDK (Firestore + Analytics)

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
4. Crie as coleções no Firestore:
   - `noticias`: `titulo` (string), `resumo` (string), `categoria` (string)
   - `atividades`: `titulo` (string), `local` (string), `data` (string), `publico` (string)

Se não houver conexão com o Firebase, o site exibe notícias de exemplo.

## Arquivos principais de integração
- `lib/firebase.ts`: inicializa o app client, Firestore e Analytics.
- `lib/firebaseAdmin.ts`: placeholder de operações server-side (habilitar quando o pacote `firebase-admin` estiver disponível).
- `components/ActivitiesFeed.tsx`: carrega agenda de atividades e fallback local.


## Fluxo de publicação (Google Auth)
- O foco do site é **Notícias + Agenda Jovem** na home.
- A seção "Publicação de Conteúdo" permite login com Google para inserir itens no Firestore.
- E-mails permitidos no front atualmente: `ribeirojunior270@gmail.com`.
- Coleções alimentadas:
  - `noticias`
  - `atividades`

> Importante: para segurança real em produção, aplique também regras de segurança no Firebase/Firestore restringindo escrita ao usuário autorizado.

## Deploy na Vercel
1. Suba o projeto para o GitHub.
2. Importe na Vercel.
3. Configure as variáveis de ambiente da `.env.example` no painel da Vercel.
4. Faça deploy.


## Ajuste para erro de output na Vercel
Se o projeto estiver com erro **"Nenhum diretório de saída chamado public"**, este repositório já define `vercel.json` com `outputDirectory: ".next"`, compatível com Next.js.


## Canais oficiais utilizados para adaptação
- https://www.instagram.com/somosauxilia/
- https://www.facebook.com/somosauxilia/?locale=pt_BR
- https://www.youtube.com/c/somosauxilia
