import { NextResponse } from 'next/server';
import { demoData } from '@/lib/mock-data';

export async function GET(_: Request, { params }: { params: { token: string } }) {
  const claimId = params.token;
  const claim = demoData.claims.find((entry) => entry.id === claimId);

  if (!claim) {
    return NextResponse.json({ error: 'Claim not found' }, { status: 404 });
  }

  return NextResponse.json({
    id: claim.id,
    title: claim.title,
    description: claim.description,
    status: claim.status,
    yachId: claim.yachtId,
    supplier_name: 'MarineParts'
  });
}
