import { NextRequest, NextResponse } from 'next/server';
import { Chicken } from '@/models';

// GET /api/chickens/[id] - Get a specific chicken
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const chickenId = parseInt(id);
    
    if (isNaN(chickenId)) {
      return NextResponse.json(
        { error: 'Invalid chicken ID' },
        { status: 400 }
      );
    }

    const chicken = await Chicken.findByPk(chickenId, {
      include: [
        {
          model: Chicken,
          as: 'father',
          attributes: ['chickenId', 'name', 'bloodline', 'gender']
        },
        {
          model: Chicken,
          as: 'mother',
          attributes: ['chickenId', 'name', 'bloodline', 'gender']
        }
      ]
    });

    if (!chicken) {
      return NextResponse.json(
        { error: 'Chicken not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ chicken });
  } catch (error) {
    console.error('Error fetching chicken:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chicken' },
      { status: 500 }
    );
  }
}

// PUT /api/chickens/[id] - Update a chicken
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const chickenId = parseInt(id);
    
    if (isNaN(chickenId)) {
      return NextResponse.json(
        { error: 'Invalid chicken ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { breederType, isBreeder, ...otherFields } = body;

    const chicken = await Chicken.findByPk(chickenId);
    
    if (!chicken) {
      return NextResponse.json(
        { error: 'Chicken not found' },
        { status: 404 }
      );
    }

    // Update the chicken with the new fields
    await chicken.update({
      ...otherFields,
      ...(breederType !== undefined && { breederType }),
      ...(isBreeder !== undefined && { isBreeder })
    });

    return NextResponse.json({ 
      message: 'Chicken updated successfully',
      chicken 
    });
  } catch (error) {
    console.error('Error updating chicken:', error);
    return NextResponse.json(
      { error: 'Failed to update chicken' },
      { status: 500 }
    );
  }
} 