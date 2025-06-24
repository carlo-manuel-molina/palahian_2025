import { NextRequest, NextResponse } from 'next/server';
import { Bloodline, Farm, User, UserAttributes } from '@/models';
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

async function getFarmFromUser(userId: number): Promise<Farm | null> {
  return await Farm.findOne({ where: { userId } });
}

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    
    const userAttrs = user.toJSON() as UserAttributes;
    if (userAttrs.role !== 'breeder') return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    if (!userAttrs.userId) return NextResponse.json({ error: 'Invalid user' }, { status: 400 });

    await getSequelize();
    const farm = await getFarmFromUser(userAttrs.userId);
    console.log('farm from DB:', farm, 'keys:', Object.keys(farm?.toJSON?.() || {}));
    if (!farm) return NextResponse.json({ error: 'Farm not found' }, { status: 404 });

    const bloodlines = await Bloodline.findAll({
      where: { farmId: farm.farmId },
      order: [['createdAt', 'DESC']]
    });

    return NextResponse.json({ bloodlines });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    
    const userAttrs = user.toJSON() as UserAttributes;
    if (userAttrs.role !== 'breeder') return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    if (!userAttrs.userId) return NextResponse.json({ error: 'Invalid user' }, { status: 400 });

    await getSequelize();
    const farm = await getFarmFromUser(userAttrs.userId);
    console.log('farm from DB:', farm, 'keys:', Object.keys(farm?.toJSON?.() || {}));
    if (!farm) return NextResponse.json({ error: 'Farm not found' }, { status: 404 });

    const { name, origin, modelImagesMale, modelImagesFemale, yearAcquired } = await req.json();
    
    if (!name) {
      return NextResponse.json({ error: 'Bloodline name is required' }, { status: 400 });
    }

    const bloodline = await Bloodline.create({
      farmId: farm.farmId,
      name,
      origin,
      modelImagesMale,
      modelImagesFemale,
      yearAcquired
    });

    return NextResponse.json({ bloodline }, { status: 201 });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    
    const userAttrs = user.toJSON() as UserAttributes;
    if (userAttrs.role !== 'breeder') return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    if (!userAttrs.userId) return NextResponse.json({ error: 'Invalid user' }, { status: 400 });

    await getSequelize();
    const farm = await getFarmFromUser(userAttrs.userId);
    console.log('farm from DB:', farm, 'keys:', Object.keys(farm?.toJSON?.() || {}));
    if (!farm) return NextResponse.json({ error: 'Farm not found' }, { status: 404 });

    const { id, name, origin, modelImagesMale, modelImagesFemale, yearAcquired } = await req.json();
    
    if (!id) {
      return NextResponse.json({ error: 'Bloodline ID is required' }, { status: 400 });
    }

    const bloodline = await Bloodline.findOne({
      where: { bloodlineId: id, farmId: farm.farmId }
    });

    if (!bloodline) {
      return NextResponse.json({ error: 'Bloodline not found' }, { status: 404 });
    }

    await bloodline.update({
      name,
      origin,
      modelImagesMale,
      modelImagesFemale,
      yearAcquired
    });

    return NextResponse.json({ bloodline });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    
    const userAttrs = user.toJSON() as UserAttributes;
    if (userAttrs.role !== 'breeder') return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    if (!userAttrs.userId) return NextResponse.json({ error: 'Invalid user' }, { status: 400 });

    await getSequelize();
    const farm = await getFarmFromUser(userAttrs.userId);
    console.log('farm from DB:', farm, 'keys:', Object.keys(farm?.toJSON?.() || {}));
    if (!farm) return NextResponse.json({ error: 'Farm not found' }, { status: 404 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Bloodline ID is required' }, { status: 400 });
    }

    const bloodline = await Bloodline.findOne({
      where: { bloodlineId: id, farmId: farm.farmId }
    });

    if (!bloodline) {
      return NextResponse.json({ error: 'Bloodline not found' }, { status: 404 });
    }

    await bloodline.destroy();

    return NextResponse.json({ message: 'Bloodline deleted successfully' });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
} 