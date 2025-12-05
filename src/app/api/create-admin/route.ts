import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName } = await request.json();

    if (!email || !password || !fullName) {
      return NextResponse.json({
        success: false,
        error: 'Email, password, and fullName are required.',
      }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({
        success: false,
        error: 'A user with this email already exists.',
      }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const newUser = await prisma.$transaction(async (prisma) => {
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          fullName,
        },
      });

      await prisma.adminUser.create({
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
