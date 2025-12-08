import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export async function POST(request: NextRequest) {
  try {
    // Güvenlik kontrolü - sadece secret bilen kişi admin oluşturabilir
    const secret = request.headers.get('x-admin-secret');
    if (secret !== process.env.ADMIN_CREATION_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email, password, fullName } = await request.json();

    if (!email || !password || !fullName) {
      return NextResponse.json({
        success: false,
        error: 'Email, password, and fullName are required.',
      }, { status: 400 });
    }

    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({
        success: false,
        error: 'A user with this email already exists.',
      }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const newUser = await db.$transaction(async (db) => {
      const user = await db.user.create({
        data: {
          email,
          passwordHash,
          fullName,
        },
      });

      await db.adminUser.create({
        data: {
          userId: user.id,
          role: 'superadmin',
        },
      });

      return user;
    });

    return NextResponse.json({
      success: true,
      message: `Admin user '${newUser.email}' created successfully. You can now log in.`,
      user: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.fullName,
      },
    });

  } catch (error: any) {
    console.error('Failed to create admin user:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create admin user: ' + error.message,
    }, { status: 500 });
  }
}
