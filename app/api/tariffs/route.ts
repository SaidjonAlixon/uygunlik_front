import { NextRequest, NextResponse } from 'next/server';
import { TariffService, initializeDatabase } from '@/lib/postgres';

export async function GET() {
  try {
    await initializeDatabase();
    const tariffs = await TariffService.findAll();
    return NextResponse.json(tariffs, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await initializeDatabase();
    const body = await request.json();
    const { name, description, price } = body;

    if (!name || price === undefined) {
      return NextResponse.json({ error: 'name va price kerak' }, { status: 400 });
    }

    const tariff = await TariffService.create({
      name,
      description,
      price,
    });

    return NextResponse.json(tariff, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

