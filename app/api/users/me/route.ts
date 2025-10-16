import { NextRequest, NextResponse } from 'next/server';

// Mock database - production'da real database ishlatish kerak
let users: any[] = [];

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
    const user = users.find(u => u.id === decoded.id);
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
    const userIndex = users.findIndex(u => u.id === decoded.id);
    if (userIndex === -1) {
      return NextResponse.json(
        { error: 'Foydalanuvchi topilmadi' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { first_name, last_name, email, password } = body;

    // Update user fields
    if (first_name) users[userIndex].first_name = first_name;
    if (last_name) users[userIndex].last_name = last_name;
    
    if (email && email !== users[userIndex].email) {
      // Check if email is already in use
      const existingUser = users.find(u => u.email === email && u.id !== decoded.id);
      if (existingUser) {
        return NextResponse.json(
          { error: 'Bu email allaqachon ishlatilmoqda' },
          { status: 409 }
        );
      }
      users[userIndex].email = email;
    }

    if (password) {
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      users[userIndex].password = await bcrypt.hash(password, salt);
    }

    users[userIndex].updated_at = new Date().toISOString();

    // Return updated user without password
    const { password: _, ...userWithoutPassword } = users[userIndex];

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
