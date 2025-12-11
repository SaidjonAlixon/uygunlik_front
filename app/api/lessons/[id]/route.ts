import { NextRequest, NextResponse } from 'next/server';
import { LessonService, initializeDatabase } from '@/lib/postgres';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await initializeDatabase();
    const lesson = await LessonService.findById(parseInt(params.id));
    if (!lesson) {
      return NextResponse.json({ error: 'Dars topilmadi' }, { status: 404 });
    }
    return NextResponse.json(lesson, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await initializeDatabase();
    const body = await request.json();
    const lesson = await LessonService.update(parseInt(params.id), body);
    if (!lesson) {
      return NextResponse.json({ error: 'Dars topilmadi' }, { status: 404 });
    }
    return NextResponse.json(lesson, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await initializeDatabase();
    const lesson = await LessonService.delete(parseInt(params.id));
    if (!lesson) {
      return NextResponse.json({ error: 'Dars topilmadi' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Dars o\'chirildi' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

