import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Mock API response for development
    const mockUser = {
      id: 'user123',
      first_name: 'Test',
      last_name: 'User',
      email: body.email,
      role: 'USER',
      created_at: new Date().toISOString(),
    };

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simple mock validation
    if (body.email && body.password) {
      return NextResponse.json({ 
        success: true,
        user: mockUser,
        message: "Xush kelibsiz!"
      }, { status: 200 });
    } else {
      return NextResponse.json({ 
        error: "Email yoki parol noto'g'ri" 
      }, { status: 401 });
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
