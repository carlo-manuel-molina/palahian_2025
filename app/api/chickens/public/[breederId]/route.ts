import { NextRequest, NextResponse } from 'next/server';
import { Chicken, Farm, Bloodline } from '@/models';
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

    // Get chickens for this breeder with related data
    const chickens = await Chicken.findAll({
      where: { breederId: userId },
      include: [
        { model: Farm, as: 'farm', attributes: ['farmId', 'name'] },
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
    console.error('Error fetching public chickens:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chickens' },
      { status: 500 }
    );
  }
} 