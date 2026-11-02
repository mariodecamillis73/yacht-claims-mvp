export const dynamic = 'force-dynamic';
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  const yachts = await prisma.yacht.findMany({
    orderBy: { name: 'asc' },
  });

  return NextResponse.json(yachts);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (
      !body.hullNumber ||
      !body.name ||
      !body.yearBuilt ||
      !body.ownerId ||
      !body.captainName
    ) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: hullNumber, name, yearBuilt, ownerId, captainName',
        },
        { status: 400 }
      );
    }

    const yacht = await prisma.yacht.create({
      data: {
        hullNumber: body.hullNumber,
        name: body.name,
        yearBuilt: Number(body.yearBuilt),
        ownerId: body.ownerId,
        captainName: body.captainName,
      },
    });

    return NextResponse.json(yacht, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create yacht', details: String(error) },
      { status: 500 }
    );
  }
}