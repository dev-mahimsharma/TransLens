import { NextRequest, NextResponse } from 'next/server';
import { getChapter } from '@/lib/chapters/registry';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const chapter = getChapter(slug);

  if (!chapter) {
    return NextResponse.json(
      { error: `Chapter "${slug}" not found` },
      { status: 404 }
    );
  }

  return NextResponse.json(chapter, {
    headers: {
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}