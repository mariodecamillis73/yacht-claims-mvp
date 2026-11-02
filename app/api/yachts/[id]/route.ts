export const dynamic = 'force-dynamic';
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
const prisma = new PrismaClient();
export async function GET(_: Request, { params }: { params: { id: string } }) {
  const yacht = await prisma.yacht.findUnique({ where: { hullNumber: params.id }, include: { claims: true } });
  if (!yacht) return NextResponse.json({ error: 'Yacht not found' }, { status: 404 });
  return NextResponse.json({ ...yacht, id: yacht.hullNumber, yachtNumber: yacht.hullNumber, technicalProfile: [], documents: [] });
}
