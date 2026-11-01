import { NextResponse } from 'next/server';
import { demoData } from '@/lib/mock-data';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const claim = demoData.claims.find((entry) => entry.id === params.id);

  if (!claim) {
    return NextResponse.json({ error: 'Claim not found' }, { status: 404 });
  }

  const claimIndex = demoData.claims.findIndex((entry) => entry.id === params.id);
  const previousClaimId = demoData.claims[claimIndex - 1]?.id || null;
  const nextClaimId = demoData.claims[claimIndex + 1]?.id || null;

  return NextResponse.json({
    claim,
    previousClaimId,
    nextClaimId,
    comments: demoData.comments.filter((comment) => comment.claimId === params.id),
    documents: demoData.documents.filter((doc) => doc.claimId === params.id)
  });
}
