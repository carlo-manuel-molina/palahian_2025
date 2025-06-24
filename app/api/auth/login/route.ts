export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { Sequelize } from 'sequelize';

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

    const { User } = await import('@/models/User'); // ✅ Lazy import
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return NextResponse.json({ 
        error: 'Please verify your email address before logging in. Check your inbox for a verification link.' 
      }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    return NextResponse.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
