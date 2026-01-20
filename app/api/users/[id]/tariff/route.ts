import { NextRequest, NextResponse } from 'next/server';
import { UserService, initializeDatabase } from '@/lib/postgres';
import { verifyToken } from '@/lib/jwt';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initializeDatabase();
    
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization token kerak' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    let decoded: any;
    try {
      decoded = verifyToken(token);
    } catch (error) {
      return NextResponse.json(
        { error: 'Noto\'g\'ri token' },
        { status: 401 }
      );
    }

    // Check if current user is admin
    const currentUser = await UserService.findById(decoded.id);
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin huquqi kerak' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const userId = parseInt(id);
    
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'Noto\'g\'ri foydalanuvchi ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { tariffId } = body;

    // Find user to update
    const userToUpdate = await UserService.findById(userId);
    if (!userToUpdate) {
      return NextResponse.json(
        { error: 'Foydalanuvchi topilmadi' },
        { status: 404 }
      );
    }

    // Update user tariff
    const updatedUser = await UserService.update(userId, { 
      tariff_id: tariffId === null || tariffId === undefined ? null : tariffId 
    });
    
    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Foydalanuvchi tarifi yangilanmadi' },
        { status: 500 }
      );
    }

    // Return updated user without password
    const { password: _, ...userWithoutPassword } = updatedUser;

    return NextResponse.json(
      { 
        user: userWithoutPassword,
        message: 'Foydalanuvchi tarifi muvaffaqiyatli yangilandi' 
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Update user tariff error:', error);
    return NextResponse.json(
      { error: error.message || 'Server xatoligi yuz berdi' },
      { status: 500 }
    );
  }
}
