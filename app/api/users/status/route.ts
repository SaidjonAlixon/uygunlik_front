import { NextRequest, NextResponse } from 'next/server';
import { UserService, initializeDatabase } from '@/lib/postgres';
import { verifyToken } from '@/lib/jwt';

export async function PATCH(request: NextRequest) {
  try {
    // Initialize database
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

    const body = await request.json();
    const { userId, status } = body;

    if (!userId || typeof status !== 'boolean') {
      return NextResponse.json(
        { error: 'userId va status (boolean) kerak' },
        { status: 400 }
      );
    }

    // Find user to update
    const userToUpdate = await UserService.findById(parseInt(userId));
    if (!userToUpdate) {
      return NextResponse.json(
        { error: 'Foydalanuvchi topilmadi' },
        { status: 404 }
      );
    }

    // Update user status
    const updatedUser = await UserService.update(parseInt(userId), { status });
    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Foydalanuvchi statusi yangilanmadi' },
        { status: 500 }
      );
    }

    // Return updated user without password
    const { password: _, ...userWithoutPassword } = updatedUser;

    return NextResponse.json(
      { 
        user: userWithoutPassword,
        message: `Foydalanuvchi statusi ${status ? 'faol' : 'nofaol'} qilindi` 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Update user status error:', error);
    return NextResponse.json(
      { error: 'Server xatoligi yuz berdi' },
      { status: 500 }
    );
  }
}
