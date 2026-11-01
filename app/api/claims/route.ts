import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  const claims = await prisma.claim.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(claims);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      yachtId,
      title,
      description,
      priority,
      assignedTo,
      supplierId,
      createdBy,
      warrantyStatus,
    } = body;

    if (!yachtId || !title || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: yachtId, title, description' },
        { status: 400 }
      );
    }

    const claim = await prisma.claim.create({
      data: {
        yachtId,
        title,
        description,
        priority: priority ?? 'medium',
        status: 'new',
        validationStatus: 'pending',
        assignedTo: assignedTo ?? null,
        supplierId: supplierId ?? null,
        createdBy: createdBy ?? null,
        warrantyStatus: warrantyStatus ?? null,
      },
    });

    return NextResponse.json(claim, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create claim', details: String(error) },
      { status: 500 }
    );
  }
}
