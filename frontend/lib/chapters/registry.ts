import type { Chapter, ChapterMeta } from '@/types/chapter';
import { introduction } from './introduction';
import { prompt } from './prompt';
import { tokenization } from './tokenization';
import { vectorEmbeddings } from './vector-embeddings';
import { positionalEncoding } from './positional-encoding';
import { selfAttention } from './self-attention';
import { feedForwardNetwork } from './feed-forward-network';
import { logits } from './logits';
import { sampling } from './sampling';
import { prediction } from './prediction';
import { fullPipelineSummary } from './full-pipeline-summary';

// ── Ordered chapter list (source of truth for nav, prev/next, sidebar) ────
const CHAPTER_ORDER: ChapterMeta[] = [
  { slug: 'introduction', unit: 'UNIT I: FOUNDATIONS', number: 1, title: 'Introduction', subtitle: 'From AI to Transformers — the full picture before we zoom in', readTime: '12 min read', icon: 'Sparkles', status: 'complete' },
  { slug: 'prompt', unit: 'UNIT I: FOUNDATIONS', number: 2, title: 'The Prompt', subtitle: 'What actually happens the instant you hit send', readTime: '6 min read', icon: 'MessageSquare', status: 'complete' },
  { slug: 'tokenization', unit: 'UNIT II: INPUT PROCESSING', number: 3, title: 'Tokenization', subtitle: 'Turning text into numbers a model can read', readTime: '10 min read', icon: 'Scissors', status: 'complete' },
  { slug: 'vector-embeddings', unit: 'UNIT II: INPUT PROCESSING', number: 4, title: 'Vector Embeddings', subtitle: 'Giving every token a place in meaning-space', readTime: '9 min read', icon: 'Orbit', status: 'complete' },
  { slug: 'positional-encoding', unit: 'UNIT II: INPUT PROCESSING', number: 5, title: 'Positional Encoding', subtitle: 'Teaching a model that word order matters', readTime: '8 min read', icon: 'ArrowLeftRight', status: 'complete' },
  { slug: 'self-attention', unit: 'UNIT III: THE TRANSFORMER CORE', number: 6, title: 'Self-Attention', subtitle: 'Q, K, V, and the mechanism that changed everything', readTime: '20 min read', icon: 'Network', status: 'complete' },
  { slug: 'feed-forward-network', unit: 'UNIT III: THE TRANSFORMER CORE', number: 7, title: 'Feed-Forward Network', subtitle: "Each token's private reasoning step", readTime: '7 min read', icon: 'Layers', status: 'complete' },
  { slug: 'logits', unit: 'UNIT IV: OUTPUT GENERATION', number: 8, title: 'Logits', subtitle: 'Raw scores for every word in the vocabulary', readTime: '6 min read', icon: 'BarChart3', status: 'complete' },
  { slug: 'sampling', unit: 'UNIT IV: OUTPUT GENERATION', number: 9, title: 'Sampling', subtitle: 'Temperature, top-k, top-p — choosing the next token', readTime: '8 min read', icon: 'Dices', status: 'complete' },
  { slug: 'prediction', unit: 'UNIT IV: OUTPUT GENERATION', number: 10, title: 'Prediction', subtitle: 'From one token to a full autoregressive response', readTime: '7 min read', icon: 'Target', status: 'complete' },
  { slug: 'full-pipeline-summary', unit: 'UNIT V: SYNTHESIS', number: 11, title: 'Full Pipeline Summary', subtitle: 'Every chapter, one continuous animation', readTime: '10 min read', icon: 'Workflow', status: 'complete' },
];

const CHAPTER_DATA: Record<string, Omit<Chapter, 'prev' | 'next'>> = {
  introduction,
  prompt,
  tokenization,
  'vector-embeddings': vectorEmbeddings,
  'positional-encoding': positionalEncoding,
  'self-attention': selfAttention,
  'feed-forward-network': feedForwardNetwork,
  logits,
  sampling,
  prediction,
  'full-pipeline-summary': fullPipelineSummary,
};

export function getAllChapterMeta(): ChapterMeta[] {
  return CHAPTER_ORDER;
}

export function getChapterSlugs(): string[] {
  return CHAPTER_ORDER.map((c) => c.slug);
}

export function getChapter(slug: string): Chapter | null {
  const data = CHAPTER_DATA[slug];
  if (!data) return null;
  const idx = CHAPTER_ORDER.findIndex((c) => c.slug === slug);
  const prev = idx > 0 ? { slug: CHAPTER_ORDER[idx - 1].slug, title: CHAPTER_ORDER[idx - 1].title } : undefined;
  const next = idx < CHAPTER_ORDER.length - 1 ? { slug: CHAPTER_ORDER[idx + 1].slug, title: CHAPTER_ORDER[idx + 1].title } : undefined;
  return { ...data, prev, next };
}