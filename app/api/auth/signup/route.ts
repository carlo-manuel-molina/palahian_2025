import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/models/User';
import { sequelize } from '@/lib/sequelize';
import bcrypt from 'bcrypt';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role } = await req.json();
    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await sequelize.sync(); // Ensure DB is ready (optional, for dev)

    // Check if user already exists
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash, role });
    return NextResponse.json({ message: 'User created', user: { id: user.id, name: user.name, email: user.email, role: user.role } }, { status: 201 });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
} 