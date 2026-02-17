# Vercel Deployment Guide (Mock AI Mode)

## Предварителна подготовка

### 1. Push проекта на GitHub
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

## Vercel Setup

### 2. Създай Vercel Postgres Database

1. Отвори [vercel.com](https://vercel.com) и влез с GitHub акаунт
2. Отиди на **Storage** → **Create Database**
3. Избери **Postgres** → **Continue**
4. Дай име (напр. `codereview-db`) → **Create**
5. След създаване, копирай **Connection String** (показва се като `DATABASE_URL`)

### 3. Deploy проекта

1. На Vercel Dashboard → **Add New** → **Project**
2. Import GitHub repo: `codereview-mentor`
3. В **Environment Variables** добави:

```
DATABASE_URL = (paste connection string от Postgres DB)
USE_MOCK_AI = true
```

**Забележка:** OPENAI_API_KEY **НЕ** е нужен за mock режим.

4. Натисни **Deploy**

### 4. Migrate базата данни

След първи deploy:

```bash
# Локално, update .env с production DATABASE_URL
npm run db:push
```

Или използвай Vercel CLI:

```bash
vercel env pull .env.local
npx prisma db push
```

## Проверка

След deployment:
- Отвори Vercel URL (напр. `https://codereview-mentor.vercel.app`)
- Изпрати тестов код
- Провери дали се показва mock feedback
- Виж дали submission-ите се записват в историята

## Troubleshooting

### Build грешка с Prisma?
- Провери дали `DATABASE_URL` е правилно зададен във Vercel Environment Variables
- Натисни **Redeploy** след добавяне на променливи

### Database migration грешка?
```bash
npx prisma migrate dev --name init
git add prisma/migrations
git commit -m "Add Prisma migrations"
git push
```

### Mock AI не работи?
- Провери дали `USE_MOCK_AI=true` е зададено във Vercel Environment Variables
- Виж Vercel Logs (Runtime Logs) за грешки
