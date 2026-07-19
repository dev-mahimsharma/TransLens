import { notFound } from 'next/navigation';
import { getChapter, getChapterSlugs, getAllChapterMeta } from '@/lib/chapters/registry';
import { ChapterShell } from '@/components/layout/ChapterShell';
import { ChapterRenderer } from '@/components/ChapterRenderer';

export function generateStaticParams() {
  return getChapterSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const chapter = getChapter(params.slug);
  if (!chapter) return {};
  return {
    title: `${chapter.meta.title} · TransLens`,
    description: chapter.meta.subtitle,
  };
}

export default function ChapterPage({ params }: { params: { slug: string } }) {
  const chapter = getChapter(params.slug);
  if (!chapter) notFound();

  const toc = chapter.blocks
    .filter((b): b is Extract<typeof b, { type: 'heading' }> => b.type === 'heading')
    .map((b) => ({ id: b.id, label: b.text, level: b.level }));

  return (
    <ChapterShell chapter={chapter} toc={toc} allChapters={getAllChapterMeta()}>
      <ChapterRenderer blocks={chapter.blocks} />
    </ChapterShell>
  );
}