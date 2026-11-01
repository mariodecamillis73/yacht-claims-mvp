import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { decision, validatedBy, validationNote, rejectionReason } = body;

    if (!decision || !validatedBy) {
      return NextResponse.json(
        { error: 'decision and validatedBy are required' },
        { status: 400 }
      );
    }

    if (decision === 'rejected' && !rejectionReason) {
      return NextResponse.json(
        { error: 'A rejection reason is required when the claim is rejected' },
        { status: 400 }
      );
    }

    const claim = await prisma.claim.update({
      where: { id: params.id },
      data: {
        validationStatus: decision,
        validatedBy,
        validatedAt: new Date(),
        rejectedReason: decision === 'rejected' ? rejectionReason : null,
        rejectedBy: decision === 'rejected' ? validatedBy : null,
        rejectedAt: decision === 'rejected' ? new Date() : null,
        status: decision === 'approved' ? 'assigned' : 'rejected',
        closedAt: decision === 'rejected' ? new Date() : null,
      },
    });

    return NextResponse.json({
      success: true,
      claim,
      message:
        decision === 'approved'
          ? 'Claim approved and moved into workflow.'
          : 'Claim rejected and closed.',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to validate claim', details: String(error) },
      { status: 500 }
    );
  }
}
