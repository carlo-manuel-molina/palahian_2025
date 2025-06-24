export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
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

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; email: string; role: string };
      
      const sequelize = await getSequelize();
      if (process.env.NODE_ENV !== 'production') {
        await sequelize.sync();
      }

      const { User } = await import('@/models');
      const user = await User.findByPk(decoded.userId);
      
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 401 });
      }

      const userAttrs = user as unknown as UserAttributes;
      return NextResponse.json({ 
        user: { 
          id: userAttrs.userId, 
          name: userAttrs.name, 
          email: userAttrs.email, 
          role: userAttrs.role 
        } 
      });
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
} 