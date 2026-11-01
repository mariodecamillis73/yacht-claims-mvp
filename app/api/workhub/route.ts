import { NextResponse } from 'next/server';
import { workhubData } from '@/lib/mock-data';

export async function GET() {
  return NextResponse.json(workhubData);
}
