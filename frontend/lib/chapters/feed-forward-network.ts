import type { Chapter, ChapterMeta } from '@/types/chapter';

const meta: ChapterMeta = {
  slug: 'feed-forward-network',
  unit: 'UNIT III: THE TRANSFORMER CORE',
  number: 7,
  title: 'Feed-Forward Network',
  subtitle: "Each token's private reasoning step",
  readTime: '7 min read',
  icon: 'Layers',
  status: 'complete',
};

export const feedForwardNetwork: Omit<Chapter, 'prev' | 'next'> = {
  meta,
  blocks: [
    {
      type: 'paragraph',
      lead: true,
      text: 'Self-attention is where tokens exchange information with each other. The feed-forward network (FFN) is the opposite: applied to each token independently, it\'s where the model does deeper, private processing on what attention just gathered — no cross-token communication happens here at all.',
    },
    { type: 'heading', level: 2, text: 'What it actually does', id: 'what-it-does' },
    {
      type: 'paragraph',
      text: 'The FFN is two linear layers with a nonlinear activation function (typically GELU or ReLU) in between. The first layer expands the representation — commonly to 4× the model\'s hidden dimension — giving the network more "room" to combine features in complex ways; the activation function introduces nonlinearity (without it, stacking linear layers would collapse to a single linear transformation, no matter how many layers deep); the second layer projects back down to the original size so it can be passed to the next Transformer block.',
    },
    {
      type: 'diagram',
      component: 'FFNDiagram',
      title: 'Expand → activate → contract',
      caption: 'The same FFN weights are applied independently to every token position — no information crosses between tokens here.',
    },
    {
      type: 'callout',
      variant: 'info',
      title: 'Real-world analogy',
      body: 'If self-attention is a group discussion where everyone shares information, the FFN is each person going back to their own desk afterward to think it over privately and refine their own notes — no more group talking, just individual reasoning.',
    },
    { type: 'heading', level: 2, text: 'Where it fits in a Transformer block', id: 'in-context' },
    {
      type: 'paragraph',
      text: 'A full Transformer block is: self-attention → Add & Norm → feed-forward network → Add & Norm — the exact pattern shown in the architecture diagram from the previous chapter. This block is repeated N times (often dozens of times in large models), and each repetition alternates between "tokens talk to each other" (attention) and "each token thinks alone" (FFN), progressively building richer representations layer by layer.',
    },
    {
      type: 'callout',
      variant: 'didYouKnow',
      title: 'Did you know?',
      body: 'Despite being conceptually "simpler" than attention, feed-forward layers actually hold the majority of a Transformer\'s total parameters — often around two-thirds. A lot of what a model "knows" is thought to live largely in these FFN weights.',
    },
    {
      type: 'callout',
      variant: 'misconception',
      title: 'Common misconception',
      body: '"The feed-forward network is a minor, optional add-on to attention." It\'s the opposite — remove it and the model loses most of its capacity to transform and refine what attention gathered. Attention decides what to look at; the FFN does much of the actual computation.',
    },
    { type: 'divider' },
    { type: 'heading', level: 2, text: 'Quick check', id: 'quiz' },
    {
      type: 'quiz',
      title: 'Feed-Forward Network — mini quiz',
      questions: [
        {
          id: 'q1',
          question: 'What is the key structural difference between self-attention and the feed-forward network?',
          options: [
            'The FFN uses no weights at all',
            'Attention lets tokens exchange information; the FFN processes each token independently',
            'The FFN only runs during training, never inference',
            'Attention runs after the FFN in every block',
          ],
          correctIndex: 1,
          explanation: 'Attention is cross-token; the FFN applies the same transformation to each token position with no interaction between positions.',
        },
        {
          id: 'q2',
          question: 'Why is a nonlinear activation function necessary between the two linear layers?',
          options: [
            'It speeds up tokenization',
            'Without it, stacked linear layers would collapse into a single linear transformation',
            'It reduces the vocabulary size',
            'It replaces the need for positional encoding',
          ],
          correctIndex: 1,
          explanation: 'Nonlinearity is what lets deep networks represent complex, non-linear functions rather than just one big matrix multiply.',
        },
      ],
    },
    { type: 'heading', level: 2, text: 'Glossary', id: 'glossary' },
    {
      type: 'glossary',
      terms: [
        { term: 'Feed-forward network (FFN)', definition: 'A per-token, two-layer neural network with a nonlinear activation, applied identically and independently at every sequence position.' },
        { term: 'Activation function', definition: 'A nonlinear function (e.g. GELU, ReLU) applied between linear layers, without which stacked layers would collapse into one linear transform.' },
        { term: 'Transformer block', definition: 'The repeating unit of a Transformer: self-attention → Add & Norm → feed-forward → Add & Norm.' },
      ],
    },
    { type: 'heading', level: 2, text: 'Summary', id: 'summary' },
    {
      type: 'paragraph',
      text: 'The feed-forward network is where each token, independently, gets deeper nonlinear processing on the information attention just gathered — and it holds most of a Transformer\'s parameters. After N repetitions of attention + FFN, the final layer\'s output for the last token position is ready to be converted into a prediction: that\'s where logits come in.',
    },
  ],
};