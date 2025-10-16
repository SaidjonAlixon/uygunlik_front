import { Pool } from 'pg';

// PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/uygunlik',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Check if database is available
let isDatabaseAvailable = false;

// Fallback in-memory database
let users: any[] = [];
let nextId = 1;

// Initialize with default admin for fallback
if (users.length === 0) {
  users.push({
    id: 1,
    first_name: 'Admin',
    last_name: 'User',
    email: 'admin@uygunlik.uz',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    role: 'admin',
    status: true,
    created_at: new Date().toISOString(),
    courses: []
  });
  nextId = 2;
}

// Database schema initialization
export async function initializeDatabase() {
  try {
    // Test database connection
    await pool.query('SELECT 1');
    isDatabaseAvailable = true;
    console.log('✅ PostgreSQL database connected');
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        status BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        courses JSONB DEFAULT '[]'::jsonb
      )
    `);

    // Create courses table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) DEFAULT 0,
        category TEXT[],
        videos JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create videos table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS videos (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        filename VARCHAR(255) NOT NULL,
        url VARCHAR(500) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create user_courses junction table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_courses (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, course_id)
      )
    `);

    // Create default admin user if not exists
    const adminExists = await pool.query('SELECT id FROM users WHERE email = $1', ['admin@uygunlik.uz']);
    if (adminExists.rows.length === 0) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('password', 10);
      
      await pool.query(`
        INSERT INTO users (first_name, last_name, email, password, role, status)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, ['Admin', 'User', 'admin@uygunlik.uz', hashedPassword, 'admin', true]);
      
      console.log('✅ Default admin user created');
    }

    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    isDatabaseAvailable = false;
    console.log('⚠️ Falling back to in-memory database');
    // Don't throw error, fall back to in-memory database
  }
}

// User operations
export class UserService {
  static async create(userData: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    role?: string;
    status?: boolean;
  }) {
    if (isDatabaseAvailable) {
      const result = await pool.query(`
        INSERT INTO users (first_name, last_name, email, password, role, status)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, [
        userData.first_name,
        userData.last_name,
        userData.email,
        userData.password,
        userData.role || 'user',
        userData.status !== undefined ? userData.status : true
      ]);
      
      return result.rows[0];
    } else {
      // Fallback to in-memory database
      const newUser = {
        id: nextId++,
        ...userData,
        role: userData.role || 'user',
        status: userData.status !== undefined ? userData.status : true,
        created_at: new Date().toISOString(),
        courses: []
      };
      users.push(newUser);
      return newUser;
    }
  }

  static async findByEmail(email: string) {
    if (isDatabaseAvailable) {
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      return result.rows[0] || null;
    } else {
      // Fallback to in-memory database
      return users.find(user => user.email === email) || null;
    }
  }

  static async findById(id: number) {
    if (isDatabaseAvailable) {
      const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
      return result.rows[0] || null;
    } else {
      // Fallback to in-memory database
      return users.find(user => user.id === id) || null;
    }
  }

  static async findAll(page: number = 1, limit: number = 10, search: string = '') {
    if (isDatabaseAvailable) {
      const offset = (page - 1) * limit;
      let query = 'SELECT * FROM users';
      let params: any[] = [];
      
      if (search) {
        query += ' WHERE first_name ILIKE $1 OR last_name ILIKE $1 OR email ILIKE $1';
        params.push(`%${search}%`);
      }
      
      query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limit, offset);
      
      const result = await pool.query(query, params);
      
      // Get total count
      let countQuery = 'SELECT COUNT(*) FROM users';
      let countParams: any[] = [];
      
      if (search) {
        countQuery += ' WHERE first_name ILIKE $1 OR last_name ILIKE $1 OR email ILIKE $1';
        countParams.push(`%${search}%`);
      }
      
      const countResult = await pool.query(countQuery, countParams);
      const total = parseInt(countResult.rows[0].count);
      
      return {
        data: result.rows,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };
    } else {
      // Fallback to in-memory database
      let filteredUsers = users;
      
      if (search) {
        filteredUsers = users.filter(user => 
          user.first_name.toLowerCase().includes(search.toLowerCase()) ||
          user.last_name.toLowerCase().includes(search.toLowerCase()) ||
          user.email.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      const offset = (page - 1) * limit;
      const paginatedUsers = filteredUsers.slice(offset, offset + limit);
      
      return {
        data: paginatedUsers,
        total: filteredUsers.length,
        page,
        limit,
        totalPages: Math.ceil(filteredUsers.length / limit)
      };
    }
  }

  static async update(id: number, updates: {
    first_name?: string;
    last_name?: string;
    email?: string;
    password?: string;
    role?: string;
    status?: boolean;
  }) {
    if (isDatabaseAvailable) {
      const fields = [];
      const values = [];
      let paramCount = 1;
      
      Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined) {
          fields.push(`${key} = $${paramCount}`);
          values.push(value);
          paramCount++;
        }
      });
      
      if (fields.length === 0) return null;
      
      fields.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id);
      
      const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
      const result = await pool.query(query, values);
      
      return result.rows[0] || null;
    } else {
      // Fallback to in-memory database
      const userIndex = users.findIndex(user => user.id === id);
      if (userIndex === -1) return null;
      
      users[userIndex] = {
        ...users[userIndex],
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      return users[userIndex];
    }
  }

  static async delete(id: number) {
    if (isDatabaseAvailable) {
      const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
      return result.rows[0] || null;
    } else {
      // Fallback to in-memory database
      const userIndex = users.findIndex(user => user.id === id);
      if (userIndex === -1) return null;
      
      const deletedUser = users[userIndex];
      users.splice(userIndex, 1);
      return deletedUser;
    }
  }
}

// Course operations
export class CourseService {
  static async create(courseData: {
    title: string;
    description?: string;
    price?: number;
    category?: string[];
    videos?: any[];
  }) {
    const result = await pool.query(`
      INSERT INTO courses (title, description, price, category, videos)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [
      courseData.title,
      courseData.description || '',
      courseData.price || 0,
      courseData.category || [],
      JSON.stringify(courseData.videos || [])
    ]);
    
    return result.rows[0];
  }

  static async findAll() {
    const result = await pool.query('SELECT * FROM courses ORDER BY created_at DESC');
    return result.rows;
  }

  static async findById(id: number) {
    const result = await pool.query('SELECT * FROM courses WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async update(id: number, updates: any) {
    const fields = [];
    const values = [];
    let paramCount = 1;
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === 'videos' || key === 'category') {
          fields.push(`${key} = $${paramCount}`);
          values.push(JSON.stringify(value));
        } else {
          fields.push(`${key} = $${paramCount}`);
          values.push(value);
        }
        paramCount++;
      }
    });
    
    if (fields.length === 0) return null;
    
    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);
    
    const query = `UPDATE courses SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await pool.query(query, values);
    
    return result.rows[0] || null;
  }

  static async delete(id: number) {
    const result = await pool.query('DELETE FROM courses WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] || null;
  }
}

// Video operations
export class VideoService {
  static async create(videoData: {
    title: string;
    description?: string;
    filename: string;
    url: string;
  }) {
    const result = await pool.query(`
      INSERT INTO videos (title, description, filename, url)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [
      videoData.title,
      videoData.description || '',
      videoData.filename,
      videoData.url
    ]);
    
    return result.rows[0];
  }

  static async findAll() {
    const result = await pool.query('SELECT * FROM videos ORDER BY created_at DESC');
    return result.rows;
  }

  static async findById(id: number) {
    const result = await pool.query('SELECT * FROM videos WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async update(id: number, updates: any) {
    const fields = [];
    const values = [];
    let paramCount = 1;
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });
    
    if (fields.length === 0) return null;
    
    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);
    
    const query = `UPDATE videos SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await pool.query(query, values);
    
    return result.rows[0] || null;
  }

  static async delete(id: number) {
    const result = await pool.query('DELETE FROM videos WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] || null;
  }
}

export default pool;
