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

    if (!body.yachtHullNumber || !body.title || !body.description) {
      return NextResponse.json(
        {
          error: 'Missing required fields: yachtHullNumber, title, description',
        },
        { status: 400 }
      );
    }

    const claim = await prisma.claim.create({
      data: {
        yachtHullNumber: body.yachtHullNumber,
        title: body.title,
        description: body.description,
        priority: body.priority ?? 'medium',
        status: 'new',
        validationStatus: 'pending',
        assignedTo: body.assignedTo ?? null,
        createdBy: body.createdBy ?? null,
        supplierId: body.supplierId ?? null,
        warrantyStatus: body.warrantyStatus ?? null,
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
