import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Mock API response for development
    const mockUser = {
      id: 'user123',
      first_name: 'Test',
      last_name: 'User',
      email: 'test@example.com',
      role: 'USER',
      created_at: new Date().toISOString(),
    };

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json({ 
      success: true,
      user: mockUser
    }, { status: 200 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
