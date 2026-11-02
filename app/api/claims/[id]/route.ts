export const dynamic = 'force-dynamic';
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const claim = await prisma.claim.findUnique({
    where: { id: params.id },
    include: {
      comments: true,
      documents: true,
    },
  });

  if (!claim) {
    return NextResponse.json({ error: 'Claim not found' }, { status: 404 });
  }

  return NextResponse.json({ claim, comments: claim.comments, documents: claim.documents, previousClaimId: null, nextClaimId: null });
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const claim = await prisma.claim.update({
      where: { id: params.id },
      data: {
        title: body.title,
        description: body.description,
        status: body.status,
        priority: body.priority,
        assignedTo: body.assignedTo,
        supplierId: body.supplierId,
        warrantyStatus: body.warrantyStatus,

        closedAt: body.closedAt ?? undefined,
      },
    });

    return NextResponse.json(claim);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update claim', details: String(error) },
      { status: 500 }
    );
  }
}
