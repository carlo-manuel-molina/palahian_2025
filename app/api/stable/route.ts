import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { Stable, User } from '@/models';
import '@/models';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

async function getUserFromRequest(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; email: string; role: string };
    const user = await User.findByPk(decoded.userId);
    return user;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get the authenticated user
    const user = await getUserFromRequest(request) as any;
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const userAttrs = user as import('@/models').UserAttributes;
    if (userAttrs.role !== 'fighter') {
      return NextResponse.json({ error: 'Not a fighter' }, { status: 403 });
    }

    // Try to find the stable for this user
    let stable = await Stable.findOne({ where: { userId: userAttrs.userId } });
    if (!stable) {
      return NextResponse.json({ needsSetup: true });
    }
    return NextResponse.json({ stable });
  } catch (error) {
    console.error('Error fetching/creating stable:', error);
    return NextResponse.json({ error: 'Failed to fetch or create stable' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request) as any;
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const userAttrs = user as import('@/models').UserAttributes;
    if (userAttrs.role !== 'fighter') {
      return NextResponse.json({ error: 'Not a fighter' }, { status: 403 });
    }
    const existing = await Stable.findOne({ where: { userId: userAttrs.userId } });
    if (existing) {
      return NextResponse.json({ error: 'Stable already exists' }, { status: 400 });
    }
    const data = await request.json();
    const stable = await Stable.create({
      userId: userAttrs.userId,
      name: data.name,
      owner: userAttrs.name,
      region: data.region,
      province: data.province,
      city: data.city,
      barangay: data.barangay,
      street: data.street,
      mapPin: data.mapPin,
      email: userAttrs.email,
      description: data.description,
      bannerUrl: data.bannerUrl || '',
      avatarUrl: data.avatarUrl || ''
    });
    return NextResponse.json({ stable });
  } catch (error) {
    console.error('Error creating stable:', error);
    return NextResponse.json({ error: 'Failed to create stable' }, { status: 500 });
  }
} 