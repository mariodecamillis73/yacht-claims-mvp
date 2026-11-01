import { NextResponse } from 'next/server';
import { demoData } from '@/lib/mock-data';
import { signToken } from '@/lib/auth';

export async function POST(request: Request) {
  const body = await request.json();
  const user = demoData.users.find((entry) => entry.email === body.email);

  if (!user) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const token = signToken({
    sub: user.id,
    email: user.email,
    role: user.role,
    language: user.language
  });

  return NextResponse.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      language: user.language
    }
  });
}
