import type { Chapter, ChapterMeta } from '@/types/chapter';

const meta: ChapterMeta = {
  slug: 'vector-embeddings',
  unit: 'UNIT II: INPUT PROCESSING',
  number: 4,
  title: 'Vector Embeddings',
  subtitle: 'Giving every token a place in meaning-space',
  readTime: '9 min read',
  icon: 'Orbit',
  status: 'complete',
};

export const vectorEmbeddings: Omit<Chapter, 'prev' | 'next'> = {
  meta,
  blocks: [
    {
      type: 'paragraph',
      lead: true,
      text: 'A token ID is just an index — "5321" tells you nothing about what the token means or how it relates to any other token. Embeddings fix this by mapping every token ID to a dense vector of hundreds or thousands of numbers, learned so that tokens with related meanings end up near each other in that space.',
    },
    { type: 'heading', level: 2, text: 'From ID to vector', id: 'id-to-vector' },
    {
      type: 'paragraph',
      text: 'Every model has an embedding matrix: one row per vocabulary entry, each row a vector of length d_model (768, 4096, or more, depending on model size). Looking up a token\'s embedding is literally that — a row lookup. This matrix is learned during training, not hand-designed, so the geometry that emerges reflects patterns the model discovered in its training data.',
    },
    {
      type: 'diagram',
      component: 'EmbeddingSpaceDiagram',
      title: 'A 2D slice of embedding space',
      caption: 'Real embeddings have hundreds of dimensions — this is a simplified 2D projection so the clustering is visible. Related words land near each other.',
    },
    {
      type: 'callout',
      variant: 'info',
      title: 'Real-world analogy',
      body: 'Imagine a giant library where instead of alphabetical order, books are shelved by meaning — cookbooks cluster together, physics textbooks cluster together, and a book that\'s part-cookbook-part-chemistry sits somewhere between the two clusters. An embedding is a book\'s exact shelf coordinates in that meaning-based library.',
    },
    { type: 'heading', level: 2, text: 'Measuring similarity', id: 'similarity' },
    {
      type: 'paragraph',
      text: 'Because embeddings are just vectors, you can measure how "close" two meanings are with ordinary geometry — most commonly cosine similarity, which measures the angle between two vectors regardless of their length. Tokens used in similar contexts during training end up with high cosine similarity, which is how a model can generalize: it has never seen your exact sentence, but it has seen geometrically similar ones.',
    },
    {
      type: 'callout',
      variant: 'didYouKnow',
      title: 'Did you know?',
      body: 'The famous "king − man + woman ≈ queen" result comes directly from embedding arithmetic. Directions in embedding space can capture relationships (like gender or tense) consistently enough that vector math along those directions produces sensible analogies.',
    },
    {
      type: 'callout',
      variant: 'misconception',
      title: 'Common misconception',
      body: '"Each dimension of an embedding means something specific, like dimension #42 = \'formality\'." In practice, meaning is usually spread across many dimensions in combination — individual dimensions are rarely interpretable on their own, even though the space as a whole is highly structured.',
    },
    { type: 'divider' },
    { type: 'heading', level: 2, text: 'Quick check', id: 'quiz' },
    {
      type: 'quiz',
      title: 'Vector Embeddings — mini quiz',
      questions: [
        {
          id: 'q1',
          question: 'What does an embedding matrix actually store?',
          options: ['One vector per possible sentence', 'One vector per token in the vocabulary', 'One vector per user', 'One vector for the entire model'],
          correctIndex: 1,
          explanation: 'It\'s a lookup table: one row (dense vector) per vocabulary token, learned during training.',
        },
        {
          id: 'q2',
          question: 'Why do embeddings help a model generalize to sentences it has never seen?',
          options: [
            'They compress the vocabulary to save memory',
            'Similar-meaning tokens land near each other in vector space, so patterns transfer across similar contexts',
            'They remove the need for attention',
            'They encode grammar rules explicitly',
          ],
          correctIndex: 1,
          explanation: 'Geometric closeness between related tokens lets the model apply patterns learned from one context to a semantically similar one.',
        },
        {
          id: 'q3',
          question: 'What does cosine similarity measure between two embedding vectors?',
          options: ['Their exact distance in meters', 'The angle between them, ignoring magnitude', 'Whether they have the same token ID', 'The number of shared characters'],
          correctIndex: 1,
          explanation: 'Cosine similarity focuses purely on direction, which correlates well with semantic similarity for embeddings.',
        },
      ],
    },
    { type: 'heading', level: 2, text: 'Glossary', id: 'glossary' },
    {
      type: 'glossary',
      terms: [
        { term: 'Embedding', definition: 'A dense vector representation of a token, learned so that semantically related tokens are geometrically close.' },
        { term: 'Embedding matrix', definition: 'The learned lookup table mapping every vocabulary token ID to its embedding vector.' },
        { term: 'd_model', definition: 'The dimensionality of each embedding vector — the width of the model\'s internal representations.' },
        { term: 'Cosine similarity', definition: 'A measure of how aligned two vectors are, based on the angle between them rather than their length.' },
        { term: 'Embedding space', definition: 'The high-dimensional geometric space where all token embeddings live and where semantic relationships correspond to spatial relationships.' },
      ],
    },
    { type: 'heading', level: 2, text: 'Summary', id: 'summary' },
    {
      type: 'paragraph',
      text: 'Embeddings turn meaningless token IDs into dense vectors positioned so that related meanings sit close together in a high-dimensional space, learned entirely from training data. This geometry is what lets a model generalize beyond exact sentences it has seen before — but position alone says nothing about word order, which is exactly the gap the next chapter closes.',
    },
  ],
};