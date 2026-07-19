import type { Chapter, ChapterMeta } from '@/types/chapter';

const meta: ChapterMeta = {
  slug: 'logits',
  unit: 'UNIT IV: OUTPUT GENERATION',
  number: 8,
  title: 'Logits',
  subtitle: 'Raw scores for every word in the vocabulary',
  readTime: '6 min read',
  icon: 'BarChart3',
  status: 'complete',
};

export const logits: Omit<Chapter, 'prev' | 'next'> = {
  meta,
  blocks: [
    {
      type: 'paragraph',
      lead: true,
      text: 'After passing through every Transformer block, the model has a rich hidden-state vector for the final token position — but that\'s just a vector of numbers, not a word. One more step converts it into a score for literally every token in the vocabulary: the logits.',
    },
    { type: 'heading', level: 2, text: 'The final linear layer', id: 'final-linear' },
    {
      type: 'paragraph',
      text: 'A single learned linear layer (often called the "language modeling head" or "unembedding" layer) projects the last hidden state — a vector of length d_model — up to a vector of length vocab_size, often 50,000 to 200,000+. Each entry in this output vector is the raw, unnormalized score the model assigns to that specific vocabulary token being the next one.',
    },
    {
      type: 'interactive',
      component: 'LogitsBarChart',
      title: 'Raw logits for a next-token prediction',
      description: 'Higher logit = the model thinks this token is a better fit — but these aren\'t probabilities yet.',
    },
    {
      type: 'callout',
      variant: 'info',
      title: 'Real-world analogy',
      body: 'Think of logits like judges\' raw point totals in a competition before they\'re converted into percentages of the vote. A judge might give scores of 8.2, 6.9, and -3.8 to different contestants — informative for ranking, but not yet a clean probability distribution.',
    },
    { type: 'heading', level: 2, text: 'Why "raw" matters', id: 'why-raw' },
    {
      type: 'paragraph',
      text: 'Logits can be any real number — negative, zero, or large positive — and they don\'t sum to anything meaningful on their own. They\'re useful for ranking (a higher logit token is always preferred to a lower logit one), but to get something you can actually sample from as a probability, they need one more transformation: softmax. That\'s the very next chapter.',
    },
    {
      type: 'callout',
      variant: 'didYouKnow',
      title: 'Did you know?',
      body: 'In many modern architectures, the same weight matrix used for the input token embeddings is reused (transposed) as the final unembedding layer — a trick called weight tying that saves a significant number of parameters.',
    },
    {
      type: 'callout',
      variant: 'misconception',
      title: 'Common misconception',
      body: '"The model directly outputs the next word." It doesn\'t — it outputs a logit score for every possible token simultaneously. Turning that into one chosen word requires the separate sampling step covered next.',
    },
    { type: 'divider' },
    { type: 'heading', level: 2, text: 'Quick check', id: 'quiz' },
    {
      type: 'quiz',
      title: 'Logits — mini quiz',
      questions: [
        {
          id: 'q1',
          question: 'What is a logit vector\'s length equal to?',
          options: ['The length of the input prompt', 'The size of the vocabulary', 'The number of Transformer layers', 'The embedding dimension d_model'],
          correctIndex: 1,
          explanation: 'The final linear layer projects the hidden state up to exactly vocab_size — one score per possible token.',
        },
        {
          id: 'q2',
          question: 'Why can\'t logits be used directly as probabilities?',
          options: [
            'They\'re always positive already',
            'They\'re unnormalized real numbers that don\'t sum to 1',
            'They\'re rounded to whole numbers',
            'They only exist during training',
          ],
          correctIndex: 1,
          explanation: 'Logits need softmax to become a proper probability distribution that sums to 1 across the vocabulary.',
        },
      ],
    },
    { type: 'heading', level: 2, text: 'Glossary', id: 'glossary' },
    {
      type: 'glossary',
      terms: [
        { term: 'Logits', definition: 'Raw, unnormalized scores — one per vocabulary token — produced by the final linear layer, before softmax.' },
        { term: 'Language modeling head', definition: 'The final linear layer that projects the last hidden state to a vocab_size-length logit vector.' },
        { term: 'Weight tying', definition: 'Reusing the input embedding matrix (transposed) as the output unembedding layer to save parameters.' },
      ],
    },
    { type: 'heading', level: 2, text: 'Summary', id: 'summary' },
    {
      type: 'paragraph',
      text: 'The final Transformer layer\'s hidden state is projected, via one learned linear layer, into a raw score for every token in the vocabulary — the logits. They rank candidates but aren\'t probabilities yet. Sampling is the step that turns them into an actual choice.',
    },
  ],
};