export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { Sequelize } from 'sequelize';
import type { UserAttributes } from '@/models';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

let sequelize: Sequelize;
async function getSequelize() {
  if (!sequelize) {
    const { sequelize: seq } = await import('@/lib/sequelize');
    sequelize = seq;
  }
  return sequelize;
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
    }

    const sequelize = await getSequelize();
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync();
    }

    const { User } = await import('@/models'); // ✅ Lazy import
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Type-safe access to user fields
    const userAttrs = user as unknown as UserAttributes;
    if (!userAttrs.isEmailVerified) {
      return NextResponse.json({ 
        error: 'Please verify your email address before logging in. Check your inbox for a verification link.' 
      }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, userAttrs.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = jwt.sign({ userId: userAttrs.userId, email: userAttrs.email, role: userAttrs.role }, JWT_SECRET, { expiresIn: '5m' });
    const response = NextResponse.json({ user: { userId: userAttrs.userId, name: userAttrs.name, email: userAttrs.email, role: userAttrs.role } });
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 300, // 5 minutes
    });

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; email: string; role: string };

    return response;
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
