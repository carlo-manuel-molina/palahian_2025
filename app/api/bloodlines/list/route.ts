import { NextRequest, NextResponse } from 'next/server';
import { Bloodline, Farm } from '../../../../models';
import '../../../../models'; // This ensures associations are loaded

// GET /api/bloodlines/list - Get bloodlines for dropdown
export async function GET(request: NextRequest) {
  try {
    // Get user from session
    const authResponse = await fetch(`${request.nextUrl.origin}/api/auth/me`, {
      headers: { cookie: request.headers.get('cookie') || '' }
    });
    
    if (!authResponse.ok) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const { user } = await authResponse.json();
    
    // Get user's farm first
    const farm = await Farm.findOne({ where: { userId: user.id } });
    if (!farm) {
      return NextResponse.json({ bloodlines: [] });
    }
    
    // Get bloodlines for this farm
    const bloodlines = await Bloodline.findAll({
      where: { farmId: farm.farmId },
      attributes: ['bloodlineId', 'name'],
      order: [['name', 'ASC']]
    });

    return NextResponse.json({ bloodlines });
  } catch (error) {
    console.error('Error fetching bloodlines:', error);
    return NextResponse.json({ error: 'Failed to fetch bloodlines' }, { status: 500 });
  }
} 