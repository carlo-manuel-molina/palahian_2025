import { NextRequest, NextResponse } from 'next/server';
import { Chicken, Farm, Stable, Bloodline, User, sequelize } from '../../../models';
import '../../../models'; // This ensures associations are loaded

// GET /api/chickens - Get all chickens for the current user
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
    
    // Get chickens for this user with related data
    let whereClause = {};
    
    if (user.role === 'fighter') {
      // For fighters, get chickens from their stable
      const stable = await Stable.findOne({ where: { userId: user.id } });
      if (stable) {
        whereClause = { stableId: stable.stableId };
      } else {
        // If no stable found, return empty array
        return NextResponse.json({ chickens: [] });
      }
    } else {
      // For breeders and sellers, get chickens by breederId
      whereClause = { breederId: user.id };
    }
    
    const chickens = await Chicken.findAll({
      where: whereClause,
      include: [
        { model: Farm, as: 'farm', attributes: ['farmId', 'name'] },
        { model: Stable, as: 'stable', attributes: ['stableId', 'name'] },
        { model: Bloodline, as: 'bloodlineRef', attributes: ['bloodlineId', 'name'] },
        { 
          model: Chicken, 
          as: 'father', 
          attributes: ['chickenId', 'legbandNo', 'wingbandNo', 'bloodline'],
          required: false 
        },
        { 
          model: Chicken, 
          as: 'mother', 
          attributes: ['chickenId', 'legbandNo', 'wingbandNo', 'bloodline'],
          required: false 
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return NextResponse.json({ chickens });
  } catch (error) {
    console.error('Error fetching chickens:', error);
    return NextResponse.json({ error: 'Failed to fetch chickens' }, { status: 500 });
  }
}

// POST /api/chickens - Create a new chicken
export async function POST(request: NextRequest) {
  try {
    // Get user from session
    const authResponse = await fetch(`${request.nextUrl.origin}/api/auth/me`, {
      headers: { cookie: request.headers.get('cookie') || '' }
    });
    
    if (!authResponse.ok) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const { user } = await authResponse.json();
    
    // Check if user has permission to create chickens
    const allowedRoles = ['breeder', 'seller', 'fighter'];
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json({ 
        error: 'Insufficient permissions. You need to be a breeder, seller, or fighter to add chickens.' 
      }, { status: 403 });
    }
    
    const body = await request.json();

    console.log('Creating chicken for user:', user.id, 'with role:', user.role);
    console.log('Request body:', body);

    let farmId = null;
    let stableId = null;

    // Get user's farm or stable based on role
    if (user.role === 'fighter') {
      const stable = await Stable.findOne({ where: { userId: user.id } });
      if (!stable) {
        return NextResponse.json({ error: 'Stable not found. Please set up your stable first.' }, { status: 404 });
      }
      stableId = stable.stableId;
    } else {
      // For breeders and sellers, use farm
      const farm = await Farm.findOne({ where: { userId: user.id } });
      if (!farm) {
        return NextResponse.json({ error: 'Farm not found' }, { status: 404 });
      }
      farmId = farm.farmId;
    }

    // Auto-assign band numbers if none provided
    let legbandNo = body.legbandNo;
    let wingbandNo = body.wingbandNo;

    if (!legbandNo && !wingbandNo) {
      // Get the next available number for auto-assignment
      const lastChicken = await Chicken.findOne({
        where: { breederId: user.id },
        order: [['chickenId', 'DESC']]
      });

      const nextNumber = lastChicken ? (lastChicken.get('chickenId') as number) + 1 : 1;
      wingbandNo = `Palahian_${nextNumber}`;
    } else if (!wingbandNo) {
      // If only legband is provided, set a default wingband
      wingbandNo = 'n/a';
    } else if (!legbandNo) {
      // If only wingband is provided, set a default legband
      legbandNo = 'n/a';
    }

    // Auto-assign name if not provided
    let chickenName = body.name;
    if (!chickenName || chickenName.trim() === '') {
      // Get the next available chicken ID for auto-assignment
      const lastChicken = await Chicken.findOne({
        where: { breederId: user.id },
        order: [['chickenId', 'DESC']]
      });

      const nextId = lastChicken ? (lastChicken.get('chickenId') as number) + 1 : 1;
      const genderPrefix = body.gender === 'hen' ? 'Hen' : 'Rooster';
      chickenName = `${genderPrefix}_${nextId}`;
    }

    // Prepare chicken data
    const chickenData = {
      ...body,
      breederId: user.id,
      farmId: farmId,
      stableId: stableId,
      name: chickenName,
      sire: body.sire || null,
      dam: body.dam || null,
      legbandNo: legbandNo || null,
      wingbandNo: wingbandNo || null,
      bloodline: body.bloodline || 'Unknown',
      bloodlineId: body.bloodlineId && body.bloodlineId !== '' ? parseInt(body.bloodlineId) : null,
      pictures: body.pictures || [],
      fightVideos: body.fightVideos || [],
      forSale: body.forSale || false,
      isBreeder: body.isBreeder || false,
      breederType: body.breederType || (user.role === 'fighter' ? 'fighter' : 'breeder'),
      status: body.status || 'alive',
      gender: body.gender,
      hatchDate: body.hatchDate || null,
      description: body.description || null,
      fightRecord: body.fightRecord || null,
      price: body.price ? parseFloat(body.price) : null,
      color: body.color || null,
      legs: body.legs || null,
    };

    console.log('Chicken data to create:', chickenData);

    // Create chicken
    const chicken = await Chicken.create(chickenData);

    console.log('Chicken created successfully:', chicken.get('chickenId'));

    return NextResponse.json({ chicken }, { status: 201 });
  } catch (error) {
    console.error('Error creating chicken:', error);
    return NextResponse.json({ 
      error: 'Failed to create chicken',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 