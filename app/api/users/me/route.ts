import { NextRequest, NextResponse } from 'next/server';
import { findUserById, updateUser, findUserByEmail } from '@/lib/database';

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

export async function GET(request: NextRequest) {
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

    // Find user by ID
    const user = findUserById(decoded.id);
    if (!user) {
      return NextResponse.json(
        { error: 'Foydalanuvchi topilmadi' },
        { status: 404 }
      );
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      { user: userWithoutPassword },
      { status: 200 }
    );

  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Server xatoligi yuz berdi' },
      { status: 500 }
    );
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

    // Find user by ID
    const existingUser = findUserById(decoded.id);
    if (!existingUser) {
      return NextResponse.json(
        { error: 'Foydalanuvchi topilmadi' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { first_name, last_name, email, password } = body;

    // Prepare updates
    const updates: any = {};
    if (first_name) updates.first_name = first_name;
    if (last_name) updates.last_name = last_name;
    
    if (email && email !== existingUser.email) {
      // Check if email is already in use
      const emailUser = findUserByEmail(email);
      if (emailUser && emailUser.id !== decoded.id) {
        return NextResponse.json(
          { error: 'Bu email allaqachon ishlatilmoqda' },
          { status: 409 }
        );
      }
      updates.email = email;
    }

    if (password) {
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(password, salt);
    }

    // Update user
    const updatedUser = updateUser(decoded.id, updates);
    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Foydalanuvchi yangilanmadi' },
        { status: 500 }
      );
    }

    // Return updated user without password
    const { password: _, ...userWithoutPassword } = updatedUser;

    return NextResponse.json(
      { 
        user: userWithoutPassword,
        message: 'Profil muvaffaqiyatli yangilandi' 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Server xatoligi yuz berdi' },
      { status: 500 }
    );
  }
}
