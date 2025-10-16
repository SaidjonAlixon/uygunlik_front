import { NextRequest, NextResponse } from 'next/server';
import { VideoService, initializeDatabase } from '@/lib/postgres';

export async function GET() {
  try {
    await initializeDatabase();
    const videos = await VideoService.findAll();
    return NextResponse.json(videos, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await initializeDatabase();
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({ error: 'multipart/form-data kerak' }, { status: 400 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const title = String(formData.get('title') || '');
    const description = String(formData.get('description') || '');

    if (!file || !title) {
      return NextResponse.json({ error: 'file va title kerak' }, { status: 400 });
    }

    // In a real app, upload file to storage (S3/Cloudflare R2). For now store URL as filename
    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${Date.now()}_${file.name}`;

    // Note: Skipping actual disk upload in serverless; store URL placeholder
    const url = `/uploads/${filename}`;

    const video = await VideoService.create({ title, description, filename, url });
    return NextResponse.json(video, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
