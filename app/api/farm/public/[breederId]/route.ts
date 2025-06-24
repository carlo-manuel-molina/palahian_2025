import { NextRequest, NextResponse } from 'next/server';
import { Farm, User } from '@/models';
import '@/models'; // This ensures associations are loaded

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ breederId: string }> }
) {
  try {
    const { breederId } = await params;
    const userId = parseInt(breederId);
    
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'Invalid breeder ID' },
        { status: 400 }
      );
    }

    // Get user details
    const user = await User.findByPk(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'Breeder not found' },
        { status: 404 }
      );
    }

    // Get farm details
    const farm = await Farm.findOne({ 
      where: { userId: userId },
      attributes: [
        'farmId', 'name', 'owner', 'region', 'province', 'city', 
        'barangay', 'street', 'mapPin', 'email', 'description', 
        'bannerUrl', 'avatarUrl'
      ]
    });

    if (!farm) {
      return NextResponse.json(
        { error: 'Farm not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      farm,
      breeder: {
        userId: user.get('userId'),
        name: user.get('name'),
        email: user.get('email'),
        role: user.get('role')
      }
    });
  } catch (error) {
    console.error('Error fetching public farm:', error);
    return NextResponse.json(
      { error: 'Failed to fetch farm details' },
      { status: 500 }
    );
  }
} 