import { NextRequest, NextResponse } from 'next/server';
import { UserService, initializeDatabase, pool } from '@/lib/postgres';
import { verifyToken } from '@/lib/jwt';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

    const { id } = await params;
    const userId = parseInt(id);
    
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'Noto\'g\'ri foydalanuvchi ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { courses } = body;

    if (!Array.isArray(courses)) {
      return NextResponse.json(
        { error: 'courses array kerak' },
        { status: 400 }
      );
    }

    // Find user to update
    const userToUpdate = await UserService.findById(userId);
    if (!userToUpdate) {
      return NextResponse.json(
        { error: 'Foydalanuvchi topilmadi' },
        { status: 404 }
      );
    }

    // Delete existing user courses
    await pool.query('DELETE FROM user_courses WHERE user_id = $1', [userId]);

    // Insert new user courses
    if (courses.length > 0) {
      const courseIds = courses.map(id => parseInt(id)).filter(id => !isNaN(id));
      if (courseIds.length > 0) {
        const values = courseIds.map((courseId, index) => 
          `($${index * 2 + 1}, $${index * 2 + 2})`
        ).join(', ');
        
        const params = courseIds.flatMap(courseId => [userId, courseId]);
        await pool.query(
          `INSERT INTO user_courses (user_id, course_id) VALUES ${values}`,
          params
        );
      }
    }

    // Get updated user with courses
    const result = await pool.query(`
      SELECT 
        u.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', c.id,
              'title', c.title,
              'description', c.description,
              'price', c.price
            )
          ) FILTER (WHERE c.id IS NOT NULL),
          '[]'
        ) as courses
      FROM users u
      LEFT JOIN user_courses uc ON u.id = uc.user_id
      LEFT JOIN courses c ON uc.course_id = c.id
      WHERE u.id = $1
      GROUP BY u.id
    `, [userId]);

    const updatedUser = result.rows[0];
    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Foydalanuvchi topilmadi' },
        { status: 404 }
      );
    }

    // Return updated user without password
    const { password: _, ...userWithoutPassword } = updatedUser;

    return NextResponse.json(
      { 
        user: {
          ...userWithoutPassword,
          courses: userWithoutPassword.courses || []
        },
        message: 'Foydalanuvchi kurslari muvaffaqiyatli yangilandi' 
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Update user courses error:', error);
    return NextResponse.json(
      { error: error.message || 'Server xatoligi yuz berdi' },
      { status: 500 }
    );
  }
}
