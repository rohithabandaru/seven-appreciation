import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { origin } = new URL(request.url);
  const { searchParams } = new URL(request.url);
  const exclude = searchParams.get('exclude') || '';

  const targetUrl = new URL('/api/daily/random-love', origin);
  if (exclude) targetUrl.searchParams.set('exclude', exclude);

  return NextResponse.redirect(targetUrl, 307);
}
