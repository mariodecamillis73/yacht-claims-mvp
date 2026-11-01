import { NextResponse } from 'next/server';

export function ok(data: unknown) {
  return NextResponse.json(data, { status: 200 });
}

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function unauthorized(message = 'Unauthorized') {
  return NextResponse.json({ error: message }, { status: 401 });
}
