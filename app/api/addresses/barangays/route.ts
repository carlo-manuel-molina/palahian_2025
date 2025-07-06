import { NextRequest, NextResponse } from 'next/server';
import { psgcAPI } from '@/lib/psgc-api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cityCode = searchParams.get('cityCode');
    if (!cityCode) {
      return NextResponse.json({ error: 'Missing cityCode' }, { status: 400 });
    }
    const barangays = await psgcAPI.getBarangaysByCityOrMunicipality(cityCode);
    return NextResponse.json({ barangays });
  } catch (error) {
    console.error('Error fetching barangays:', error);
    return NextResponse.json(
      { error: 'Failed to fetch barangays' },
      { status: 500 }
    );
  }
} 