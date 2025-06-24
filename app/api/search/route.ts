import { NextRequest, NextResponse } from 'next/server';
import { Op } from 'sequelize';
import { Chicken, Farm, User } from '@/models';
import '@/models'; // This ensures associations are loaded

interface SearchResults {
  chickens: Array<{
    chickenId: number;
    name?: string;
    bloodline?: string;
    gender: string;
    breederType?: string;
    forSale: boolean;
    price?: number;
    pictures?: string[];
    breederId: number;
    breederName?: string;
    farmName?: string;
  }>;
  sellers: Array<{
    userId: number;
    name: string;
    email: string;
    role: string;
    farmName?: string;
    stableName?: string;
    storeName?: string;
    location?: string;
    description?: string;
    bannerUrl?: string;
  }>;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category') || 'all';
    const gender = searchParams.get('gender') || 'all';
    const breederType = searchParams.get('breederType') || 'all';
    const priceRange = searchParams.get('priceRange') || 'all';
    const forSale = searchParams.get('forSale') === 'true';

    if (!query.trim()) {
      return NextResponse.json({ chickens: [], sellers: [] });
    }

    const results: SearchResults = {
      chickens: [],
      sellers: []
    };

    // Search for chickens
    if (category === 'all' || category === 'chickens') {
      const chickenWhere: Record<string, any> = {
        [Op.or]: [
          { name: { [Op.like]: `%${query}%` } },
          { bloodline: { [Op.like]: `%${query}%` } },
          { legbandNo: { [Op.like]: `%${query}%` } },
          { wingbandNo: { [Op.like]: `%${query}%` } },
          { description: { [Op.like]: `%${query}%` } }
        ]
      };

      if (gender !== 'all') {
        chickenWhere.gender = gender;
      }

      if (breederType !== 'all') {
        chickenWhere.breederType = breederType;
      }

      if (forSale) {
        chickenWhere.forSale = true;
      }

      // Add price range filter
      if (priceRange !== 'all') {
        const [min, max] = priceRange.split('-').map(p => p === '+' ? null : parseInt(p));
        if (min !== null) {
          chickenWhere.price = { [Op.gte]: min };
        }
        if (max !== null) {
          chickenWhere.price = { ...chickenWhere.price, [Op.lte]: max };
        }
      }

      const chickens = await Chicken.findAll({
        where: chickenWhere,
        include: [
          {
            model: User,
            as: 'breeder',
            attributes: ['userId', 'name', 'role']
          },
          {
            model: Farm,
            as: 'farm',
            attributes: ['farmId', 'name']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: 50
      });

      results.chickens = chickens.map(chicken => {
        const breeder = chicken.get('breeder') as any;
        const farm = chicken.get('farm') as any;
        return {
          chickenId: chicken.get('chickenId') as number,
          name: chicken.get('name') as string | undefined,
          bloodline: chicken.get('bloodline') as string | undefined,
          gender: chicken.get('gender') as string,
          breederType: chicken.get('breederType') as string | undefined,
          forSale: chicken.get('forSale') as boolean,
          price: chicken.get('price') as number | undefined,
          pictures: chicken.get('pictures') as string[] | undefined,
          breederId: chicken.get('breederId') as number,
          breederName: breeder?.get('name') as string | undefined,
          farmName: farm?.get('name') as string | undefined
        };
      });
    }

    // Search for sellers (farms, stables, stores)
    if (category === 'all' || ['farms', 'stables', 'stores'].includes(category)) {
      const allowedRoles = ['breeder', 'fighter', 'seller'];
      const roleFilter = category === 'farms' ? ['breeder'] : 
                        category === 'stables' ? ['fighter'] : 
                        category === 'stores' ? ['seller'] : 
                        allowedRoles;

      const userWhere: Record<string, any> = {
        role: { [Op.in]: roleFilter },
        [Op.or]: [
          { name: { [Op.like]: `%${query}%` } },
          { email: { [Op.like]: `%${query}%` } }
        ]
      };

      const users = await User.findAll({
        where: userWhere,
        include: [
          {
            model: Farm,
            as: 'farm',
            attributes: ['farmId', 'name', 'city', 'province', 'description', 'bannerUrl'],
            where: {
              [Op.or]: [
                { name: { [Op.like]: `%${query}%` } },
                { city: { [Op.like]: `%${query}%` } },
                { province: { [Op.like]: `%${query}%` } },
                { description: { [Op.like]: `%${query}%` } }
              ]
            },
            required: false
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: 20
      });

      results.sellers = users
        .filter(user => {
          const farm = user.get('farm') as any;
          const userName = user.get('name') as string;
          return farm || userName.toLowerCase().includes(query.toLowerCase());
        })
        .map(user => {
          const farm = user.get('farm') as any;
          const userRole = user.get('role') as string;
          return {
            userId: user.get('userId') as number,
            name: user.get('name') as string,
            email: user.get('email') as string,
            role: user.get('role') as string,
            farmName: farm?.get('name') as string | undefined,
            stableName: userRole === 'fighter' ? farm?.get('name') as string | undefined : undefined,
            storeName: userRole === 'seller' ? farm?.get('name') as string | undefined : undefined,
            location: farm ? `${farm.get('city')}, ${farm.get('province')}` : undefined,
            description: farm?.get('description') as string | undefined,
            bannerUrl: farm?.get('bannerUrl') as string | undefined
          };
        });
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error performing search:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
} 