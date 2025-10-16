import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

// Mock database - production'da real database ishlatish kerak
let users: any[] = [];
let nextId = 1;

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

// Simple JWT implementation for Vercel
function createToken(payload: any): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const data = btoa(JSON.stringify(payload));
  const signature = btoa(require('crypto').createHmac('sha256', JWT_SECRET).update(`${header}.${data}`).digest('base64'));
  return `${header}.${data}.${signature}`;
}

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

export async function POST(request: NextRequest) {
  try {
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

    // Check if user already exists
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

    // Create user
    const newUser = {
      id: nextId++,
      first_name,
      last_name,
      email,
      password: hashedPassword,
      role: 'user',
      status: true,
      created_at: new Date().toISOString(),
      courses: []
    };

    users.push(newUser);

    // Create JWT token
    const token = createToken({ id: newUser.id, email: newUser.email });

    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json(
      { 
        user: userWithoutPassword, 
        token,
        message: 'Foydalanuvchi muvaffaqiyatli yaratildi' 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Server xatoligi yuz berdi' },
      { status: 500 }
    );
  }
}
