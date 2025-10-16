# Vercel Environment Variables

## Frontend uchun (Vercel Dashboard > Settings > Environment Variables)

### Production Environment Variables:

```
NEXT_PUBLIC_API_URL = https://www.uygunlik.uz/api
NEXT_PUBLIC_APP_NAME = Uygunlik Learning Platform
NODE_ENV = production
```

### Preview Environment Variables (ixtiyoriy):

```
NEXT_PUBLIC_API_URL = https://staging.uygunlik.uz/api
NEXT_PUBLIC_APP_NAME = Uygunlik Learning Platform (Staging)
NODE_ENV = development
```

### Development Environment Variables (ixtiyoriy):

```
NEXT_PUBLIC_API_URL = http://localhost:5000/api
NEXT_PUBLIC_APP_NAME = Uygunlik Learning Platform (Local)
NODE_ENV = development
```

## Vercel'da qo'shish yo'li:

1. **Vercel Dashboard** ga kiring
2. Loyihangizni tanlang
3. **Settings** > **Environment Variables** ga o'ting
4. Har bir variable uchun:
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://www.uygunlik.uz/api`
   - **Environment**: Production (va Preview/Development kerak bo'lsa)

## Muhim eslatmalar:

- `NEXT_PUBLIC_` bilan boshlangan o'zgaruvchilar frontend'da foydalanish mumkin
- Backend API URL'ni to'g'ri ko'rsating
- Har xil muhitlar uchun turli URL'lar ishlatishingiz mumkin
- Production'da HTTPS ishlatishni unutmang

## Qo'shimcha sozlamalar:

Agar boshqa environment variables kerak bo'lsa:

```
NEXT_PUBLIC_APP_VERSION = 1.0.0
NEXT_PUBLIC_ANALYTICS_ID = your_analytics_id
NEXT_PUBLIC_SENTRY_DSN = your_sentry_dsn
```
