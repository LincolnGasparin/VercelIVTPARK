# IVTPark – Sistema de Estacionamento

Aplicação web para gestão de estacionamentos, incluindo controle de vagas, transações (entradas e saídas), fechamento de caixa e painel financeiro com métricas diárias, semanais e mensais.

---

## 🧱 Stack Principal

- **Next.js 14** (App Pages, Server Actions, Turbopack)
- **React** + **Tailwind CSS**
- **Prisma ORM**
- **PostgreSQL / Supabase**
- **TypeScript**
- **Zod**

---

## ✨ Funcionalidades

- Cadastro de transações: lado, andar e vaga ocupada, dados do veículo e hora de entrada.
- Liberação de vaga com cálculo automático de permanência e valor pago.
- Painel financeiro com receita diária/semana/mês e listagem de saídas.
- Gestão de caixas: abertura, fechamento e resumo das transações vinculadas.
- Impressão de tickets e detalhamento de transações por caixa.
- Migrações via Prisma e reuso de cliente Prisma com cache global.
- Utilizado zod para validação de dados.
- Cadastro só funciona com o caixa aberto.

---

## 🚀 Como rodar localmente

1. **Clonar o projeto**
   ```bash
   git clone https://github.com/LincolnGasparin/VercelIVTPARK.git
   cd VercelIVTPARK
   ```

2. **Instalar dependências**
   ```bash
   pnpm install
   # ou yarn install / npm install
   ```

3. **Configurar variáveis de ambiente**

   Crie um `.env` na raiz com:

   ```env
   DATABASE_URL="postgresql://usuario:senha@host:5432/banco?schema=public"
   DIRECT_URL="postgresql://usuario:senha@host:5432/banco?schema=public&connection_limit=1"
   ```

   > Use as credenciais do seu Postgres/Supabase. Se preferir, `DIRECT_URL` pode ser igual a `DATABASE_URL`.

4. **Preparar o banco**

   ```bash
   npx prisma migrate deploy   # ou npx prisma db push (ambiente de dev)
   npx prisma generate
   ```

5. **Executar o projeto**

   ```bash
   pnpm dev
   # ou npm run dev / yarn dev
   ```

   Acesse em `http://localhost:3000`.


## 🗂 Estrutura de Pastas (resumo)src/
  app/
    dashboard/
    caixa/
    financeiro/
    cadastro/
  components/
    ticket-printer.tsx
  lib/
    prisma.ts          # cliente Prisma com cache global
prisma/
  schema.prisma
  migrations/




LinkedIn: [Lincoln Gasparin](https://www.linkedin.com/in/lincolngasparin/)
Email: [lincolngasparin@hotmail.com]
Deploy:[Link para o app](https://vercel-ivtpark.vercel.app/dashboard)
