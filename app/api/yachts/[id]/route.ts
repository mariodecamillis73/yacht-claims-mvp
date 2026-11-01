import { NextResponse } from 'next/server';
import { demoData } from '@/lib/mock-data';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const yacht = demoData.yachts.find((entry) => entry.id === params.id);
  const claims = demoData.claims.filter((claim) => claim.yachtId === params.id);

  if (!yacht) {
    return NextResponse.json({ error: 'Yacht not found' }, { status: 404 });
  }

  return NextResponse.json({
    ...yacht,
    claims,
    technicalProfile: demoData.technicalSections.filter((section) => section.yachtId === params.id).map((section) => ({
      sectionName: section.sectionName,
      displayName: section.displayName,
      fields: section.fields
    }))
  });
}
