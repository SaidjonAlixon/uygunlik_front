import { NextRequest, NextResponse } from 'next/server';
import { findUserById, updateUser } from '@/lib/database';

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

// Simple JWT implementation for Vercel
function verifyToken(token: string): any {
  try {
    const [header, data, signature] = token.split('.');
    const expectedSignature = btoa(require('crypto').createHmac('sha256', JWT_SECRET).update(`${header}.${data}`).digest('base64'));
    
    if (signature !== expectedSignature) {
      throw new Error('Invalid signature');
    }
    
    return JSON.parse(atob(data));
  } catch (error) {
    throw new Error('Invalid token');
  }
}

export async function PATCH(request: NextRequest) {
  try {
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
    const currentUser = findUserById(decoded.id);
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
    const userToUpdate = findUserById(parseInt(userId));
    if (!userToUpdate) {
      return NextResponse.json(
        { error: 'Foydalanuvchi topilmadi' },
        { status: 404 }
      );
    }

    // Update user status
    const updatedUser = updateUser(parseInt(userId), { status });
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
