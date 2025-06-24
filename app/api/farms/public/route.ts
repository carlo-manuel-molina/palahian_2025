import { NextRequest, NextResponse } from 'next/server';
import { Farm, User } from '@/models';
import '@/models'; // This ensures associations are loaded

export async function GET(request: NextRequest) {
  try {
    // Get all farms with their owners (only sellers)
    const farms = await Farm.findAll({
      include: [
        {
          model: User,
          as: 'user', // Use lowercase 'user' to match the association
          attributes: ['userId', 'name', 'email', 'role'],
          where: {
            role: ['breeder', 'fighter', 'seller'] // Only show users with selling capabilities
          },
          required: true // Only include farms that have users with these roles
        }
      ],
      attributes: [
        'farmId', 'name', 'owner', 'region', 'province', 'city', 
        'barangay', 'street', 'mapPin', 'email', 'description', 
        'bannerUrl', 'avatarUrl', 'userId'
      ],
      order: [['createdAt', 'DESC']]
    });

    // Transform the data to match the expected format
    const farmsData = farms.map(farm => {
      const user = farm.get('user') as any;
      return {
        farm: {
          farmId: farm.get('farmId'),
          name: farm.get('name'),
          owner: farm.get('owner'),
          region: farm.get('region'),
          province: farm.get('province'),
          city: farm.get('city'),
          barangay: farm.get('barangay'),
          street: farm.get('street'),
          mapPin: farm.get('mapPin'),
          email: farm.get('email'),
          description: farm.get('description'),
          bannerUrl: farm.get('bannerUrl'),
          avatarUrl: farm.get('avatarUrl')
        },
        breeder: {
          userId: user?.get('userId'),
          name: user?.get('name'),
          email: user?.get('email'),
          role: user?.get('role')
        }
      };
    });

    return NextResponse.json({ farms: farmsData });
  } catch (error) {
    console.error('Error fetching public farms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch farms' },
      { status: 500 }
    );
  }
} 