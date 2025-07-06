import { NextRequest, NextResponse } from 'next/server';
import { psgcAPI } from '@/lib/psgc-api';

export async function GET(request: NextRequest) {
  try {
    const regions = await psgcAPI.getRegions();
    return NextResponse.json({ regions });
  } catch (error) {
    console.error('Error fetching regions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch regions' },
      { status: 500 }
    );
  }
} 