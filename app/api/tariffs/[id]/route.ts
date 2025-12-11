import { NextRequest, NextResponse } from 'next/server';
import { TariffService, initializeDatabase } from '@/lib/postgres';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await initializeDatabase();
    const tariff = await TariffService.findById(parseInt(params.id));
    if (!tariff) {
      return NextResponse.json({ error: 'Tarif topilmadi' }, { status: 404 });
    }
    return NextResponse.json(tariff, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await initializeDatabase();
    const body = await request.json();
    const tariff = await TariffService.update(parseInt(params.id), body);
    if (!tariff) {
      return NextResponse.json({ error: 'Tarif topilmadi' }, { status: 404 });
    }
    return NextResponse.json(tariff, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await initializeDatabase();
    const tariff = await TariffService.delete(parseInt(params.id));
    if (!tariff) {
      return NextResponse.json({ error: 'Tarif topilmadi' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Tarif o\'chirildi' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

