export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import type { Sequelize } from 'sequelize';
import { sendVerificationEmail } from '@/lib/email';
import type { UserAttributes } from '@/models/User';

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
    const { name, email, password, role } = await req.json();
    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const sequelize = await getSequelize();
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync();
    }

    const { User } = await import('@/models/User'); // ✅ Lazy import
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    
    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = await User.create({ 
      name, 
      email, 
      passwordHash, 
      role,
      isEmailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires
    });

    // Send verification email
    const emailResult = await sendVerificationEmail(email, verificationToken, name);
    
    if (!emailResult.success) {
      console.error('Failed to send verification email:', emailResult.error);
      // Still create the user, but log the email failure
    }

    const userAttrs = user as unknown as UserAttributes;
    return NextResponse.json(
        { 
          message: 'User created. Please check your email to verify your account.', 
          user: { id: userAttrs.id, name: userAttrs.name, email: userAttrs.email, role: userAttrs.role },
          emailSent: emailResult.success
        },
        { status: 201 }
    );
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
