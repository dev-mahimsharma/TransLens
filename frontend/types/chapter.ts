// ── TransLens content schema ──────────────────────────────────────────────
// Every chapter is pure data (lib/chapters/*.ts). ChapterRenderer maps this
// JSON to UI. Adding a chapter = adding a data file, never touching UI code.

export type CalloutVariant = 'info' | 'didYouKnow' | 'misconception' | 'keyPrinciple' | 'warning';

export interface CalloutBlock {
  type: 'callout';
  variant: CalloutVariant;
  title: string;
  body: string;
}

export interface DiagramBlock {
  /** `component` must match a key in components/diagrams/registry.ts */
  type: 'diagram';
  component: string;
  title: string;
  caption?: string;
  props?: Record<string, unknown>;
}

export interface InteractiveBlock {
  /** `component` must match a key in components/diagrams/registry.ts */
  type: 'interactive';
  component: string;
  title: string;
  description?: string;
  props?: Record<string, unknown>;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface QuizBlock {
  type: 'quiz';
  title: string;
  questions: QuizQuestion[];
}

export interface GlossaryTerm {
  term: string;
  definition: string;
}

export interface GlossaryBlock {
  type: 'glossary';
  terms: GlossaryTerm[];
}

export interface HeadingBlock {
  type: 'heading';
  level: 2 | 3;
  text: string;
  id: string; // used for TOC anchor + scrollspy
}

export interface ParagraphBlock {
  type: 'paragraph';
  text: string;
  lead?: boolean; // larger intro-style paragraph
}

export interface LinkCardBlock {
  type: 'linkCard';
  text: string;
  href: string;
  description?: string;
}

export interface KeyTakeawaysBlock {
  type: 'keyTakeaways';
  items: { icon: string; title: string; body: string }[];
}

export interface CodeBlock {
  type: 'codeSnippet';
  language: string;
  code: string;
  caption?: string;
}

export interface DividerBlock {
  type: 'divider';
}

export type ContentBlock =
  | HeadingBlock
  | ParagraphBlock
  | CalloutBlock
  | DiagramBlock
  | InteractiveBlock
  | QuizBlock
  | GlossaryBlock
  | LinkCardBlock
  | KeyTakeawaysBlock
  | CodeBlock
  | DividerBlock;

export interface ChapterMeta {
  slug: string;
  unit: string;
  number: number;
  title: string;
  subtitle: string;
  readTime: string;
  icon: string; // lucide-react icon name
  status: 'complete' | 'stub';
}

export interface ChapterNavRef {
  slug: string;
  title: string;
}

export interface Chapter {
  meta: ChapterMeta;
  blocks: ContentBlock[];
  prev?: ChapterNavRef;
  next?: ChapterNavRef;
}