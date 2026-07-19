import type { ContentBlock } from '@/types/chapter';
import { Callout } from './ui/Callout';
import { DiagramFrame } from './ui/DiagramFrame';
import { Quiz } from './ui/Quiz';
import { Glossary } from './ui/Glossary';
import { KeyTakeaways } from './ui/KeyTakeaways';
import { LinkCard } from './ui/LinkCard';
import { DIAGRAM_REGISTRY } from './diagrams/registry';

function DiagramMissing({ name }: { name: string }) {
  return <div className="my-6 rounded-xl border border-dashed border-graphite-dim p-6 text-center text-sm text-graphite/60">Diagram component "{name}" not found in registry.</div>;
}

export function ChapterRenderer({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <>
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'heading': {
            const Tag = block.level === 2 ? 'h2' : 'h3';
            return (
              <Tag key={i} id={block.id} className={block.level === 2 ? 'mt-12 mb-4 scroll-mt-24 font-display text-2xl font-semibold tracking-tight text-paper' : 'mt-8 mb-3 scroll-mt-24 font-display text-lg font-semibold text-paper'}>
                {block.text}
              </Tag>
            );
          }
          case 'paragraph':
            return (
              <p key={i} className={block.lead ? 'mb-4 text-lg leading-relaxed text-graphite' : 'mb-4 text-[15px] leading-relaxed text-graphite'}>
                {block.text}
              </p>
            );
          case 'callout':
            return <Callout key={i} variant={block.variant} title={block.title} body={block.body} />;
          case 'diagram': {
            const Comp = DIAGRAM_REGISTRY[block.component];
            return (
              <DiagramFrame key={i} title={block.title} caption={block.caption}>
                {Comp ? <Comp {...(block.props ?? {})} /> : <DiagramMissing name={block.component} />}
              </DiagramFrame>
            );
          }
          case 'interactive': {
            const Comp = DIAGRAM_REGISTRY[block.component];
            return (
              <div key={i} className="my-8">
                <p className="mb-1 text-sm font-semibold text-paper">{block.title}</p>
                {block.description && <p className="mb-3 text-[13px] text-graphite">{block.description}</p>}
                {Comp ? <Comp {...(block.props ?? {})} /> : <DiagramMissing name={block.component} />}
              </div>
            );
          }
          case 'quiz':
            return <Quiz key={i} block={block} />;
          case 'glossary':
            return <Glossary key={i} block={block} />;
          case 'keyTakeaways':
            return <KeyTakeaways key={i} block={block} />;
          case 'linkCard':
            return <LinkCard key={i} block={block} />;
          case 'codeSnippet':
            return (
              <div key={i} className="my-6 overflow-hidden rounded-xl border border-graphite-dim bg-[#0b0b0f]">
                {block.caption && <p className="border-b border-white/10 px-4 py-2 text-[11px] text-white/40">{block.caption}</p>}
                <pre className="overflow-x-auto p-4 font-mono text-[12.5px] leading-relaxed text-signal-cyan"><code>{block.code}</code></pre>
              </div>
            );
          case 'divider':
            return <hr key={i} className="my-10 border-graphite-dim" />;
          default:
            return null;
        }
      })}
    </>
  );
}