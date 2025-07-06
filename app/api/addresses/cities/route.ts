import { NextRequest, NextResponse } from 'next/server';
import { psgcAPI } from '@/lib/psgc-api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const provinceCode = searchParams.get('provinceCode');
    let cities = [];
    if (provinceCode) {
      cities = await psgcAPI.getAllCitiesAndMunicipalitiesByProvince(provinceCode);
    } else {
      cities = await psgcAPI.getCities();
    }
    return NextResponse.json({ cities });
  } catch (error) {
    console.error('Error fetching cities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cities' },
      { status: 500 }
    );
  }
} 