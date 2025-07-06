import { NextRequest, NextResponse } from 'next/server';
import { Stable, User, Chicken } from '@/models';
import '@/models';

export async function GET(request: NextRequest) {
  try {
    // Parse fighterId from the URL
    const url = new URL(request.url);
    const segments = url.pathname.split('/');
    // Find the fighterId segment (should be the last segment)
    const fighterId = parseInt(segments[segments.length - 1]);
    if (isNaN(fighterId)) {
      return NextResponse.json({ error: 'Invalid fighter ID' }, { status: 400 });
    }

    // Find the stable for this fighter
    const stable = await Stable.findOne({ 
      where: { userId: fighterId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['userId', 'name', 'email', 'role']
        }
      ]
    });

    if (!stable) {
      return NextResponse.json({ error: 'Stable not found' }, { status: 404 });
    }

    // Fetch chickens for this stable
    const chickens = await Chicken.findAll({
      where: { breederId: fighterId },
      include: [
        {
          model: Chicken,
          as: 'father',
          attributes: ['chickenId', 'name', 'bloodline']
        },
        {
          model: Chicken,
          as: 'mother',
          attributes: ['chickenId', 'name', 'bloodline']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    const stableData = stable as any;
    return NextResponse.json({
      stable: {
        stableId: stableData.stableId,
        name: stableData.name,
        owner: stableData.owner,
        region: stableData.region,
        province: stableData.province,
        city: stableData.city,
        barangay: stableData.barangay,
        street: stableData.street,
        mapPin: stableData.mapPin,
        email: stableData.email,
        description: stableData.description,
        bannerUrl: stableData.bannerUrl,
        avatarUrl: stableData.avatarUrl
      },
      fighter: {
        userId: stableData.user.userId,
        name: stableData.user.name,
        email: stableData.user.email,
        role: stableData.user.role
      },
      chickens: chickens.map(chicken => {
        const chickenData = chicken as any;
        return {
          chickenId: chickenData.chickenId,
          name: chickenData.name,
          sire: chickenData.sire,
          dam: chickenData.dam,
          legbandNo: chickenData.legbandNo,
          wingbandNo: chickenData.wingbandNo,
          bloodline: chickenData.bloodline,
          status: chickenData.status,
          gender: chickenData.gender,
          hatchDate: chickenData.hatchDate,
          breederType: chickenData.breederType,
          forSale: chickenData.forSale,
          isBreeder: chickenData.isBreeder,
          pictures: chickenData.pictures,
          description: chickenData.description,
          fightRecord: chickenData.fightRecord,
          price: chickenData.price,
          father: chickenData.father,
          mother: chickenData.mother
        };
      })
    });
  } catch (error) {
    console.error('Error fetching stable data:', error);
    return NextResponse.json({ error: 'Failed to fetch stable data' }, { status: 500 });
  }
} 