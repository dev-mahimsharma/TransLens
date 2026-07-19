import { NextRequest, NextResponse } from 'next/server';
import { getChapter, getChapterSlugs } from '@/lib/chapters/registry';

export function generateStaticParams() {
  return getChapterSlugs().map((slug) => ({ slug }));
}

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const chapter = getChapter(params.slug);
  if (!chapter) {
    return NextResponse.json({ error: `Chapter "${params.slug}" not found` }, { status: 404 });
  }
  return NextResponse.json(chapter, {
    headers: { 'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400' },
  });
}