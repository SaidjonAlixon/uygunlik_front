import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Mock API response for development
    const mockUser = {
      id: Math.random().toString(36).substr(2, 9),
      first_name: body.first_name,
      last_name: body.last_name,
      email: body.email,
      role: 'USER',
      created_at: new Date().toISOString(),
    };

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return NextResponse.json({ 
      success: true,
      user: mockUser,
      message: "Muvaffaqiyatli ro'yxatdan o'tdingiz!"
    }, { status: 201 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
