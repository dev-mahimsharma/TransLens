import type { Chapter, ChapterMeta } from '@/types/chapter';

const meta: ChapterMeta = {
  slug: 'sampling',
  unit: 'UNIT IV: OUTPUT GENERATION',
  number: 9,
  title: 'Sampling',
  subtitle: 'Temperature, top-k, top-p — choosing the next token',
  readTime: '8 min read',
  icon: 'Dices',
  status: 'complete',
};

export const sampling: Omit<Chapter, 'prev' | 'next'> = {
  meta,
  blocks: [
    {
      type: 'paragraph',
      lead: true,
      text: 'Logits rank every possible next token, but which one actually gets chosen? That decision is controlled by a family of sampling strategies — and the choices made here are exactly why the same prompt can produce a different answer every time, or a very repetitive one.',
    },
    { type: 'heading', level: 2, text: 'From logits to probabilities', id: 'logits-to-probs' },
    {
      type: 'paragraph',
      text: 'The first step is always softmax, converting raw logits into a proper probability distribution over the vocabulary that sums to 1. From there, several strategies decide how to pick a token from that distribution.',
    },
    { type: 'heading', level: 2, text: 'Greedy decoding', id: 'greedy' },
    {
      type: 'paragraph',
      text: 'The simplest strategy: always pick the single highest-probability token. It\'s fast and fully deterministic (same prompt always gives the same output), but it tends to produce bland, repetitive text — real language has natural variation that always-pick-the-top-choice can\'t capture.',
    },
    { type: 'heading', level: 2, text: 'Temperature', id: 'temperature' },
    {
      type: 'paragraph',
      text: 'Temperature reshapes the distribution before sampling by dividing logits by a value T before softmax. Low temperature (< 1) sharpens the distribution, making the model more confident and deterministic; high temperature (> 1) flattens it, giving lower-ranked tokens a real chance and increasing randomness/creativity, at the cost of occasional incoherence.',
    },
    { type: 'heading', level: 2, text: 'Top-k and top-p (nucleus) sampling', id: 'topk-topp' },
    {
      type: 'paragraph',
      text: 'Top-k sampling restricts choices to only the k highest-probability tokens before sampling, cutting off the long, unreliable tail of unlikely options. Top-p (nucleus) sampling instead keeps the smallest set of tokens whose cumulative probability exceeds p (e.g. 0.9) — a more adaptive cutoff that shrinks the candidate pool when the model is confident and expands it when it\'s uncertain.',
    },
    {
      type: 'interactive',
      component: 'SamplingPlayground',
      title: 'Try it yourself',
      description: 'Adjust temperature and top-k live and watch the probability distribution reshape.',
    },
    {
      type: 'callout',
      variant: 'info',
      title: 'Real-world analogy',
      body: 'Think of choosing a restaurant. Greedy decoding is always picking the #1-rated place. Temperature is how open you are to trying something further down the list. Top-k is "only consider the top 5 rated places." Top-p is "only consider places that together cover 90% of all the good reviews" — a smarter, adaptive cutoff.',
    },
    {
      type: 'callout',
      variant: 'didYouKnow',
      title: 'Did you know?',
      body: 'A temperature of exactly 0 is mathematically equivalent to greedy decoding — the distribution becomes so sharp it collapses entirely onto the single highest-probability token.',
    },
    {
      type: 'callout',
      variant: 'misconception',
      title: 'Common misconception',
      body: '"Higher temperature makes the model \'smarter\' or \'more creative\' in a positive sense." It just increases randomness — past a certain point, higher temperature reliably produces less coherent, more error-prone text, not deeper insight.',
    },
    { type: 'divider' },
    { type: 'heading', level: 2, text: 'Quick check', id: 'quiz' },
    {
      type: 'quiz',
      title: 'Sampling — mini quiz',
      questions: [
        {
          id: 'q1',
          question: 'What does greedy decoding always do?',
          options: ['Pick a random token', 'Always pick the single highest-probability token', 'Pick the lowest-probability token', 'Ignore the logits entirely'],
          correctIndex: 1,
          explanation: 'Greedy decoding is fully deterministic — it always takes the top-ranked choice, which can produce repetitive text.',
        },
        {
          id: 'q2',
          question: 'What effect does raising temperature above 1 have?',
          options: [
            'It sharpens the distribution toward one token',
            'It flattens the distribution, increasing randomness',
            'It removes the need for softmax',
            'It has no effect on sampling',
          ],
          correctIndex: 1,
          explanation: 'Dividing logits by a temperature greater than 1 flattens the distribution before softmax, giving less-likely tokens more chance.',
        },
        {
          id: 'q3',
          question: 'How does top-p (nucleus) sampling differ from top-k?',
          options: [
            'Top-p always keeps exactly k tokens like top-k',
            'Top-p keeps the smallest set of tokens whose cumulative probability exceeds a threshold, adapting to model confidence',
            'Top-p ignores probability entirely',
            'Top-p is only used during training',
          ],
          correctIndex: 1,
          explanation: 'Top-p adapts the candidate pool size based on how confident the distribution is, unlike top-k\'s fixed cutoff count.',
        },
      ],
    },
    { type: 'heading', level: 2, text: 'Glossary', id: 'glossary' },
    {
      type: 'glossary',
      terms: [
        { term: 'Greedy decoding', definition: 'Always selecting the single highest-probability token; deterministic but often repetitive.' },
        { term: 'Temperature', definition: 'A scaling factor applied to logits before softmax that controls how sharp or flat the resulting distribution is.' },
        { term: 'Top-k sampling', definition: 'Restricting sampling to only the k highest-probability tokens.' },
        { term: 'Top-p (nucleus) sampling', definition: 'Restricting sampling to the smallest set of tokens whose cumulative probability exceeds threshold p.' },
      ],
    },
    { type: 'heading', level: 2, text: 'Summary', id: 'summary' },
    {
      type: 'paragraph',
      text: 'Sampling strategies — greedy decoding, temperature, top-k, top-p — control how a probability distribution over the vocabulary becomes one chosen token. This single choice is the source of an LLM\'s variability, creativity, and occasional incoherence. Next: what happens once that token is chosen — and how the loop repeats.',
    },
  ],
};