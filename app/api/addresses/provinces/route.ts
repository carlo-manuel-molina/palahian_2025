import { NextRequest, NextResponse } from 'next/server';
import { psgcAPI } from '@/lib/psgc-api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const regionCode = searchParams.get('regionCode');
    let provinces = [];
    if (regionCode) {
      provinces = await psgcAPI.getProvincesByRegion(regionCode);
    } else {
      provinces = await psgcAPI.getProvinces();
    }
    return NextResponse.json({ provinces });
  } catch (error) {
    console.error('Error fetching provinces:', error);
    return NextResponse.json(
      { error: 'Failed to fetch provinces' },
      { status: 500 }
    );
  }
} 