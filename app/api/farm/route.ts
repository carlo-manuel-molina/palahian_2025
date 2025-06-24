import { NextRequest, NextResponse } from 'next/server';
import { Farm, User, UserAttributes } from '@/models';
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

async function getUserFromRequest(req: NextRequest): Promise<User | null> {
  const token = req.cookies.get('token')?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; email: string; role: string };
    await getSequelize();
    const user = await User.findByPk(decoded.userId);
    if (!user) return null;
    return user;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const userAttrs = user.toJSON() as UserAttributes;
  if (userAttrs.role !== 'breeder') return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  await getSequelize();
  const farm = await Farm.findOne({ where: { userId: userAttrs.userId } });
  console.log('farm from DB:', farm, 'keys:', Object.keys(farm?.toJSON?.() || {}));
  if (!farm) return NextResponse.json({ error: 'Farm not found' }, { status: 404 });
  return NextResponse.json({ farm });
}

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const userAttrs = user.toJSON() as UserAttributes;
  if (userAttrs.role !== 'breeder') return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  await getSequelize();
  const existing = await Farm.findOne({ where: { userId: userAttrs.userId } });
  if (existing) return NextResponse.json({ error: 'Farm already exists' }, { status: 400 });
  const data = await req.json();
  const farm = await Farm.create({ ...data, userId: userAttrs.userId });
  return NextResponse.json({ farm });
}

export async function PUT(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const userAttrs = user.toJSON() as UserAttributes;
  if (userAttrs.role !== 'breeder') return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  await getSequelize();
  const farm = await Farm.findOne({ where: { userId: userAttrs.userId } });
  if (!farm) return NextResponse.json({ error: 'Farm not found' }, { status: 404 });
  const data = await req.json();
  await farm.update(data);
  return NextResponse.json({ farm });
} 