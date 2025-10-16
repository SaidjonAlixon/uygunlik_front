import { NextRequest, NextResponse } from 'next/server';
import { CourseService, initializeDatabase } from '@/lib/postgres';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await initializeDatabase();
    const body = await request.json();
    const { title, description, price, category, videos } = body;
    const courseId = parseInt(params.id);

    if (isNaN(courseId)) {
      return NextResponse.json({ error: 'Noto\'g\'ri kurs ID' }, { status: 400 });
    }

    const updates: any = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (price !== undefined) updates.price = price;
    if (category !== undefined) updates.category = Array.isArray(category) ? category : [];
    if (videos !== undefined) updates.videos = Array.isArray(videos) ? videos : [];

    const updatedCourse = await CourseService.update(courseId, updates);
    
    if (!updatedCourse) {
      return NextResponse.json({ error: 'Kurs topilmadi' }, { status: 404 });
    }

    return NextResponse.json(updatedCourse, { status: 200 });
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
    const courseId = parseInt(params.id);

    if (isNaN(courseId)) {
      return NextResponse.json({ error: 'Noto\'g\'ri kurs ID' }, { status: 400 });
    }

    const deletedCourse = await CourseService.delete(courseId);
    
    if (!deletedCourse) {
      return NextResponse.json({ error: 'Kurs topilmadi' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Kurs muvaffaqiyatli o\'chirildi' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
