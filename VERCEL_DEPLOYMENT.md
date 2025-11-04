# Vercel'ga Deploy Qilish Yo'riqnomasi

## ⚠️ Muhim Eslatmalar

1. **Backend NestJS** Vercel'da ishlamaydi (serverless emas)
2. **SQLite** Vercel'da ishlamaydi (file system cheklangan)
3. **PostgreSQL** database kerak
4. **Video upload** uchun external storage kerak (Vercel Blob, Cloudinary, yoki S3)

## 📋 Vercel'ga Deploy Qilish Qadamlari

### 1. PostgreSQL Database Yaratish

Vercel'da PostgreSQL database yaratish uchun:

**Variant A: Vercel Postgres (Tavsiya etiladi)**
1. Vercel Dashboard > Project > Storage
2. "Create Database" > "Postgres" ni tanlang
3. Database nomini kiriting
4. Database yaratilgandan keyin `DATABASE_URL` avtomatik qo'shiladi

**Variant B: Tashqi PostgreSQL (Neon, Supabase, Railway)**
- Neon: https://neon.tech
- Supabase: https://supabase.com
- Railway: https://railway.app

Database URL format:
```
postgresql://username:password@host:port/database_name?sslmode=require
```

### 2. Vercel Project Yaratish

1. GitHub'da repository yarating yoki mavjud repository'ni ulang
2. Vercel Dashboard'ga kiring: https://vercel.com
3. "Add New Project" tugmasini bosing
4. GitHub repository'ni tanlang
5. Project Settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install`

### 3. Environment Variables Sozlash

Vercel Dashboard > Project > Settings > Environment Variables

#### Production Environment Variables:

```
NEXT_PUBLIC_API_URL = /api
NODE_ENV = production
JWT_SECRET = your_very_secure_jwt_secret_key_min_32_chars
DATABASE_URL = postgresql://username:password@host:port/database_name?sslmode=require
```

#### Preview Environment Variables (ixtiyoriy):

```
NEXT_PUBLIC_API_URL = /api
NODE_ENV = development
JWT_SECRET = your_very_secure_jwt_secret_key_min_32_chars
DATABASE_URL = postgresql://username:password@host:port/database_name?sslmode=require
```

### 4. Video Upload Sozlash

Vercel'da file system cheklangan, shuning uchun video upload uchun external storage kerak:

#### Variant A: Vercel Blob Storage (Tavsiya)

1. Vercel Dashboard > Project > Storage
2. "Create Database" > "Blob" ni tanlang
3. Environment variable qo'shing:
   ```
   BLOB_READ_WRITE_TOKEN = your_blob_token
   ```

#### Variant B: Cloudinary

1. Cloudinary account yarating: https://cloudinary.com
2. Environment variables qo'shing:
   ```
   CLOUDINARY_CLOUD_NAME = your_cloud_name
   CLOUDINARY_API_KEY = your_api_key
   CLOUDINARY_API_SECRET = your_api_secret
   ```

#### Variant C: AWS S3

1. AWS S3 bucket yarating
2. Environment variables qo'shing:
   ```
   AWS_S3_BUCKET_NAME = your_bucket_name
   AWS_ACCESS_KEY_ID = your_access_key
   AWS_SECRET_ACCESS_KEY = your_secret_key
   AWS_REGION = us-east-1
   ```

### 5. Build va Deploy

1. Vercel'da "Deploy" tugmasini bosing
2. Yoki GitHub'ga push qiling:
   ```bash
   git add .
   git commit -m "Deploy to Vercel"
   git push origin main
   ```

### 6. Deploy'dan Keyin

1. **Database Initialization**: Birinchi marta deploy qilinganda, database avtomatik yaratiladi (Next.js API route orqali)
2. **Admin Yaratish**: `/admin/setup` sahifasiga o'tib birinchi admin yarating
3. **Health Check**: `https://your-project.vercel.app/api/health` endpoint'ni tekshiring

## 🔧 Qo'shimcha Sozlamalar

### vercel.json (mavjud)

```json
{
  "functions": {
    "app/api/upload/video/route.ts": {
      "maxDuration": 30
    }
  }
}
```

### next.config.mjs (mavjud)

```javascript
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}
```

## 🚨 Muammolar va Yechimlar

### 1. Database Connection Error

**Muammo**: `Failed to connect to PostgreSQL database`

**Yechim**:
- `DATABASE_URL` to'g'ri ko'rsatilganligini tekshiring
- Database SSL mode'ni tekshiring (`?sslmode=require`)
- Database whitelist'da Vercel IP'larni qo'shing

### 2. Video Upload Error

**Muammo**: `File system error` yoki `ENOENT`

**Yechim**:
- External storage (Vercel Blob, Cloudinary, S3) ishlatish
- Video upload API route'ni o'zgartirish

### 3. Build Error

**Muammo**: TypeScript yoki ESLint xatolari

**Yechim**:
- `next.config.mjs` da `ignoreBuildErrors: true` va `ignoreDuringBuilds: true` mavjud
- Agar xato bo'lsa, `tsconfig.json` ni tekshiring

### 4. API Route Timeout

**Muammo**: API route 10 soniyadan keyin timeout bo'ladi

**Yechim**:
- `vercel.json` da `maxDuration` oshirildi (30 soniya)
- Agar yetmasa, `maxDuration: 60` qo'shing

## 📝 Checklist

Deploy qilishdan oldin:

- [ ] PostgreSQL database yaratildi
- [ ] `DATABASE_URL` environment variable qo'shildi
- [ ] `JWT_SECRET` environment variable qo'shildi (kamida 32 belgi)
- [ ] Video upload uchun external storage sozlandi
- [ ] GitHub repository tayyor
- [ ] Vercel project yaratildi
- [ ] Environment variables to'g'ri sozlandi
- [ ] Build test qilindi (local'da `npm run build`)

## 🔗 Foydali Linklar

- Vercel Documentation: https://vercel.com/docs
- Vercel Postgres: https://vercel.com/docs/storage/vercel-postgres
- Vercel Blob: https://vercel.com/docs/storage/vercel-blob
- Next.js Deployment: https://nextjs.org/docs/deployment

## 📞 Yordam

Agar muammo bo'lsa:
1. Vercel Dashboard > Project > Deployments > Logs ni tekshiring
2. Browser Console'da xatolarni ko'ring
3. API route'lar log'larini tekshiring

