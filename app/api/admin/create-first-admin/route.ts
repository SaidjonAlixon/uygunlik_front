import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { addUser, users } from '@/lib/database';

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

// Simple JWT implementation for Vercel
function createToken(payload: any): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const data = btoa(JSON.stringify(payload));
  const signature = btoa(require('crypto').createHmac('sha256', JWT_SECRET).update(`${header}.${data}`).digest('base64'));
  return `${header}.${data}.${signature}`;
}

export async function POST(request: NextRequest) {
  try {
    // Check if admin already exists
    const existingAdmin = users.find(user => user.role === 'admin');
    if (existingAdmin) {
      return NextResponse.json(
        { error: 'Admin allaqachon mavjud' },
        { status: 409 }
      );
    }

    const body = await request.json();
    const { first_name, last_name, email, password } = body;

    // Validation
    if (!first_name || !last_name || !email || !password) {
      return NextResponse.json(
        { error: 'Barcha maydonlar to\'ldirilishi kerak' },
        { status: 400 }
      );
    }

    if (password.length < 4) {
      return NextResponse.json(
        { error: 'Parol kamida 4 ta belgidan iborat bo\'lishi kerak' },
        { status: 400 }
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Noto\'g\'ri email formati' },
        { status: 400 }
      );
    }

    // Check if user with this email already exists
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'Bu email bilan foydalanuvchi allaqachon mavjud' },
        { status: 409 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create admin user
    const adminUser = addUser({
      first_name,
      last_name,
      email,
      password: hashedPassword,
      role: 'admin',
      status: true,
      courses: []
    });

    // Create JWT token
    const token = createToken({ id: adminUser.id, email: adminUser.email });

    // Return admin user without password
    const { password: _, ...adminWithoutPassword } = adminUser;

    return NextResponse.json(
      { 
        user: adminWithoutPassword, 
        token,
        message: 'Birinchi admin muvaffaqiyatli yaratildi' 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Create first admin error:', error);
    return NextResponse.json(
      { error: 'Server xatoligi yuz berdi' },
      { status: 500 }
    );
  }
}
