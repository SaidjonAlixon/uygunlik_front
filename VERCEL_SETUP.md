# Vercel'ga Deploy - Qisqa Yo'riqnoma

## 1️⃣ Database Yaratish

### Vercel Postgres (Eng oson)

1. Vercel Dashboard > Project > Storage
2. "Create Database" > "Postgres"
3. Database nomi: `uygunlik_db`
4. `DATABASE_URL` avtomatik qo'shiladi

## 2️⃣ Environment Variables

Vercel Dashboard > Settings > Environment Variables:

```
NEXT_PUBLIC_API_URL = /api
JWT_SECRET = [32+ belgidan iborat xavfsiz kalit]
DATABASE_URL = [Vercel Postgres avtomatik qo'shadi]
NODE_ENV = production
```

## 3️⃣ GitHub'ga Push

```bash
git add .
git commit -m "Vercel deploy"
git push origin main
```

## 4️⃣ Deploy

1. Vercel Dashboard > "Deploy" yoki GitHub'ga push qiling
2. Deploy tugashi kutish
3. Domain: `https://your-project.vercel.app`

## 5️⃣ Birinchi Marta

1. `https://your-project.vercel.app/admin/setup` - Admin yaratish
2. Database avtomatik yaratiladi

## ⚠️ Video Upload

Hozirgi kod Vercel'da ishlamaydi (file system yo'q). 

**Yechimlar:**
1. **Vercel Blob Storage** (tavsiya)
2. **Cloudinary** 
3. **AWS S3**

Video upload qismini o'zgartirish kerak.

