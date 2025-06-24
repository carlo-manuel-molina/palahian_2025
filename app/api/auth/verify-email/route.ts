export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { Op } from 'sequelize';
import type { Sequelize } from 'sequelize';

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
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Missing verification token' }, { status: 400 });
    }

    const sequelize = await getSequelize();
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync();
    }

    const { User } = await import('@/models/User');
    
    // Find user with this token and check if it's not expired
    const user = await User.findOne({
      where: {
        emailVerificationToken: token,
        emailVerificationExpires: {
          [Op.gt]: new Date() // Greater than current time
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired verification token' }, { status: 400 });
    }

    // Mark user as verified and clear the token
    await user.update({
      isEmailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpires: null
    });

    // Redirect to login page with success message
    const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5000'}/login?verified=true`;
    return NextResponse.redirect(loginUrl);

  } catch (err: unknown) {
    const error = err as Error;
    console.error('Email verification error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
} 