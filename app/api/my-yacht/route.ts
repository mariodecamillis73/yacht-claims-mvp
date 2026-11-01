import { NextResponse } from 'next/server';
import { demoData, customerData } from '@/lib/mock-data';

export async function GET() {
  return NextResponse.json({
    user: {
      id: 'user-customer',
      email: 'owner@bluehorizon.com',
      role: 'customer',
      yacht: customerData.yacht
    },
    claims: customerData.claims
  });
}
