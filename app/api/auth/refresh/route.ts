import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';
const JWT_COOKIE_NAME = 'token';
const JWT_EXPIRES_IN = 60 * 60; // 1 hour (in seconds)

export async function POST(req: NextRequest) {
  try {
    // Get token from cookie
    const token = req.cookies.get(JWT_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Issue a new JWT with the same payload
    const { userId, email, role } = decoded as { userId: number; email: string; role: string };
    const newToken = jwt.sign({ userId, email, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    // Set the new token in an HTTP-only cookie
    const res = NextResponse.json({ ok: true });
    res.headers.set('Set-Cookie', serialize(JWT_COOKIE_NAME, newToken, {
      httpOnly: true,
      path: '/',
      maxAge: JWT_EXPIRES_IN,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    }));
    return res;
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 