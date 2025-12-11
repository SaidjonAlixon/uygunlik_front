import { NextRequest, NextResponse } from 'next/server';
import { UserService, initializeDatabase } from '@/lib/postgres';

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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    // Get users from database
    const result = await UserService.findAll(page, limit, search);

    // Return users without passwords
    const usersWithoutPasswords = result.data.map(user => {
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    return NextResponse.json(
      { 
        data: usersWithoutPasswords,
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Get all users error:', error);
    return NextResponse.json(
      { error: 'Server xatoligi yuz berdi' },
      { status: 500 }
    );
  }
}
