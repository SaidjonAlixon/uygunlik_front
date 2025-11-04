import { NextRequest, NextResponse } from 'next/server';
import { LessonService, initializeDatabase } from '@/lib/postgres';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await initializeDatabase();
    const lessons = await LessonService.findAllByTariff(parseInt(params.id));
    return NextResponse.json(lessons, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await initializeDatabase();
    const body = await request.json();
    const { title, description, video_url, order_number, additional_resources } = body;

    if (!title) {
      return NextResponse.json({ error: 'title kerak' }, { status: 400 });
    }

    const lesson = await LessonService.create({
      tariff_id: parseInt(params.id),
      title,
      description,
      video_url,
      order_number: order_number || 0,
      additional_resources: additional_resources || [],
    });

    return NextResponse.json(lesson, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

