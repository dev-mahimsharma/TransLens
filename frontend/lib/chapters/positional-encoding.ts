import type { Chapter, ChapterMeta } from '@/types/chapter';

const meta: ChapterMeta = {
  slug: 'positional-encoding',
  unit: 'UNIT II: INPUT PROCESSING',
  number: 5,
  title: 'Positional Encoding',
  subtitle: 'Teaching a model that word order matters',
  readTime: '8 min read',
  icon: 'ArrowLeftRight',
  status: 'complete',
};

export const positionalEncoding: Omit<Chapter, 'prev' | 'next'> = {
  meta,
  blocks: [
    {
      type: 'paragraph',
      lead: true,
      text: '"Dog bites man" and "Man bites dog" use identical words — only their order differs, and that order completely changes the meaning. But the self-attention mechanism at the heart of a Transformer processes all tokens in parallel, with no built-in sense of sequence. Positional encoding is how order gets reintroduced.',
    },
    { type: 'heading', level: 2, text: 'Why parallel processing loses order', id: 'why-parallel-loses-order' },
    {
      type: 'paragraph',
      text: 'The RNNs that came before Transformers processed tokens one at a time, in order, so sequence was automatic — but slow. Transformers process every token simultaneously for speed, which means, on its own, attention treats a sentence like a bag of words: "the cat sat" and "sat the cat" would look identical without some extra signal encoding position.',
    },
    {
      type: 'callout',
      variant: 'info',
      title: 'Real-world analogy',
      body: 'Imagine handing someone a stack of shuffled photos from a road trip with no captions — they can tell it was a trip, but not the order of stops. Positional encoding is like stamping a timestamp on each photo: same content, but now the sequence is recoverable.',
    },
    { type: 'heading', level: 2, text: 'The original approach: sinusoidal encoding', id: 'sinusoidal' },
    {
      type: 'paragraph',
      text: 'The original Transformer paper added a fixed pattern of sine and cosine waves — at different frequencies per dimension — directly onto each token\'s embedding vector, based on its position in the sequence. Low-frequency waves distinguish coarse position (early vs. late in a long document); high-frequency waves distinguish fine position (adjacent tokens). This pattern needs no training and generalizes cleanly to sequence lengths never seen during training.',
    },
    {
      type: 'diagram',
      component: 'PositionalEncodingWave',
      title: 'Sine/cosine waves at increasing frequency',
      caption: 'Each embedding dimension gets a wave at a different frequency — together, the set of values at any position forms a unique "position fingerprint."',
    },
    { type: 'heading', level: 2, text: 'Modern alternatives', id: 'modern-alternatives' },
    {
      type: 'paragraph',
      text: 'Many current LLMs use learned positional embeddings (a trainable vector per position, rather than a fixed formula) or more recent schemes like RoPE (Rotary Positional Embedding), which rotates Query and Key vectors by an angle proportional to position directly inside the attention calculation rather than adding to the input embedding. RoPE has become popular because it handles relative distances between tokens especially well and extends more gracefully to longer contexts.',
    },
    {
      type: 'callout',
      variant: 'didYouKnow',
      title: 'Did you know?',
      body: 'Because sinusoidal encoding is a fixed mathematical formula, not a learned parameter, a model can in principle process sequences longer than any it saw during training — though in practice quality still degrades well beyond the trained context length.',
    },
    {
      type: 'callout',
      variant: 'misconception',
      title: 'Common misconception',
      body: '"Positional encoding is a separate step the model runs before attention." It\'s really just arithmetic on the input representation (or, with RoPE, inside the attention math itself) — there\'s no separate "positional encoding module" doing independent reasoning about order.',
    },
    { type: 'divider' },
    { type: 'heading', level: 2, text: 'Quick check', id: 'quiz' },
    {
      type: 'quiz',
      title: 'Positional Encoding — mini quiz',
      questions: [
        {
          id: 'q1',
          question: 'Why does a Transformer need explicit positional encoding at all?',
          options: [
            'To make training faster',
            'Because self-attention processes tokens in parallel and has no inherent sense of order',
            'To reduce the vocabulary size',
            'To replace the need for embeddings',
          ],
          correctIndex: 1,
          explanation: 'Parallel processing means order isn\'t automatically preserved the way it is in sequential RNNs, so it must be injected explicitly.',
        },
        {
          id: 'q2',
          question: 'What makes sinusoidal positional encoding notable compared to a learned position vector?',
          options: [
            'It requires more training data',
            'It\'s a fixed formula that needs no training and can generalize to unseen lengths',
            'It only works for short sentences',
            'It replaces token embeddings entirely',
          ],
          correctIndex: 1,
          explanation: 'Because it\'s computed, not learned, it can be evaluated at any position, including ones never seen during training.',
        },
        {
          id: 'q3',
          question: 'How does RoPE differ from adding a fixed positional vector to the embedding?',
          options: [
            'It removes positional information entirely',
            'It rotates Query/Key vectors by a position-dependent angle inside the attention calculation',
            'It only encodes the first token\'s position',
            'It requires no positional information at all',
          ],
          correctIndex: 1,
          explanation: 'RoPE encodes relative position directly into the attention mechanism via rotation, rather than modifying the input embedding beforehand.',
        },
      ],
    },
    { type: 'heading', level: 2, text: 'Glossary', id: 'glossary' },
    {
      type: 'glossary',
      terms: [
        { term: 'Positional encoding', definition: 'A signal injected into token representations that encodes each token\'s position in the sequence.' },
        { term: 'Sinusoidal encoding', definition: 'The original Transformer\'s fixed sine/cosine wave pattern used to encode position, requiring no training.' },
        { term: 'Learned positional embedding', definition: 'A trainable vector per sequence position, learned during training rather than computed by formula.' },
        { term: 'RoPE (Rotary Positional Embedding)', definition: 'A modern technique that encodes position by rotating Query/Key vectors inside the attention calculation.' },
      ],
    },
    { type: 'heading', level: 2, text: 'Summary', id: 'summary' },
    {
      type: 'paragraph',
      text: 'Because self-attention has no built-in sense of order, positional encoding injects that information explicitly — whether via the original sinusoidal formula, learned position vectors, or modern schemes like RoPE. With embeddings carrying meaning and positional encoding carrying order, the input is finally ready for the mechanism that made Transformers famous: self-attention.',
    },
  ],
};