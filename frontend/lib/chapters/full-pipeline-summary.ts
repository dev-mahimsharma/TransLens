import type { Chapter, ChapterMeta } from '@/types/chapter';

const meta: ChapterMeta = {
  slug: 'full-pipeline-summary',
  unit: 'UNIT V: SYNTHESIS',
  number: 11,
  title: 'Full Pipeline Summary',
  subtitle: 'Every chapter, one continuous animation',
  readTime: '10 min read',
  icon: 'Workflow',
  status: 'complete',
};

export const fullPipelineSummary: Omit<Chapter, 'prev' | 'next'> = {
  meta,
  blocks: [
    {
      type: 'paragraph',
      lead: true,
      text: 'You now know every stage that turns your typed message into a reply. Here it is, one final time, as a single continuous system — plus one crucial failure mode every one of these stages quietly contributes to: hallucination.',
    },
    { type: 'heading', level: 2, text: 'The complete journey', id: 'complete-journey' },
    {
      type: 'interactive',
      component: 'PipelineDiagram',
      title: 'Your prompt → the model\'s reply',
      description: 'Click through every stage one more time.',
    },
    {
      type: 'keyTakeaways',
      items: [
        { icon: 'MessageSquare', title: 'Prompt', body: 'Your message is assembled with system instructions and history into a role-tagged document.' },
        { icon: 'Scissors', title: 'Tokenization', body: 'Text is split into subword tokens and mapped to integer IDs via BPE.' },
        { icon: 'Orbit', title: 'Embeddings', body: 'Each token ID becomes a dense vector positioned by learned meaning.' },
        { icon: 'ArrowLeftRight', title: 'Positional encoding', body: 'Order information is injected since attention alone is order-blind.' },
        { icon: 'Network', title: 'Self-attention', body: 'Every token dynamically weighs relevance to every other token via Q/K/V.' },
        { icon: 'Layers', title: 'Feed-forward', body: 'Each token gets private, deeper nonlinear processing.' },
        { icon: 'BarChart3', title: 'Logits', body: 'A final linear layer scores every vocabulary token as a candidate.' },
        { icon: 'Dices', title: 'Sampling', body: 'Temperature, top-k, and top-p turn scores into one chosen token.' },
      ],
    },
    { type: 'heading', level: 2, text: 'Why hallucinations happen', id: 'hallucinations' },
    {
      type: 'paragraph',
      text: 'A hallucination is a confident, fluent, but factually wrong statement. Understanding the pipeline explains why this happens structurally, not just as a "bug": at every step, the model is optimizing for "what token is statistically most plausible next," never for "is this true." Sampling always picks from a probability distribution — even a low-probability, factually wrong token gets selected sometimes, especially at higher temperature. Nothing in this pipeline includes a fact-checking step; fluency and correctness are optimized very differently, and fluency almost always wins the tug-of-war when the two diverge.',
    },
    {
      type: 'callout',
      variant: 'info',
      title: 'Real-world analogy',
      body: 'It\'s like an extremely well-read student answering a pop quiz question they don\'t actually know — they\'ll produce something fluent and confident-sounding because that\'s the skill they trained, even though the specific fact is wrong. The fluency is real; the underlying knowledge sometimes isn\'t.',
    },
    {
      type: 'callout',
      variant: 'keyPrinciple',
      title: 'Key principle',
      body: 'Every stage in this pipeline optimizes for plausible continuation, not verified truth. Hallucination isn\'t a separate malfunction — it\'s an expected occasional outcome of a system built entirely around next-token probability.',
    },
    { type: 'heading', level: 2, text: 'Training vs. inference, one more time', id: 'training-inference-recap' },
    {
      type: 'paragraph',
      text: 'Training shapes all the weights used throughout this pipeline — the embedding matrix, every attention head\'s Q/K/V projections, every feed-forward layer, the final unembedding layer — by adjusting them via backpropagation to make the model\'s predicted next-token probabilities match real text as closely as possible, across enormous datasets. Inference is everything covered in this course: running that already-trained, now-frozen pipeline forward, one token at a time, to generate new text.',
    },
    {
      type: 'callout',
      variant: 'didYouKnow',
      title: 'Did you know?',
      body: 'None of the weights change during inference — a model\'s behavior in a conversation feels adaptive, but the underlying parameters are completely frozen. All apparent "learning" within a single conversation comes entirely from context (everything visible in the current prompt), not from any actual weight update.',
    },
    {
      type: 'callout',
      variant: 'misconception',
      title: 'Common misconception',
      body: '"A bigger model just means fewer hallucinations, full stop." Scale generally helps, but hallucination is structural to how next-token prediction works — it\'s reduced by techniques like retrieval augmentation, better training data, and instruction tuning, not eliminated purely by adding parameters.',
    },
    { type: 'divider' },
    { type: 'heading', level: 2, text: 'Final check', id: 'quiz' },
    {
      type: 'quiz',
      title: 'Full Pipeline — comprehensive quiz',
      questions: [
        {
          id: 'q1',
          question: 'Put these in the correct pipeline order.',
          options: [
            'Sampling → Tokenization → Attention → Logits',
            'Tokenization → Embeddings → Self-Attention → Logits → Sampling',
            'Embeddings → Sampling → Tokenization → Logits',
            'Logits → Embeddings → Tokenization → Attention',
          ],
          correctIndex: 1,
          explanation: 'Text is tokenized, embedded, processed through attention/FFN blocks, projected to logits, then sampled into a token.',
        },
        {
          id: 'q2',
          question: 'Why does the pipeline sometimes produce confident, fluent, but false statements?',
          options: [
            'Because of a rare software bug',
            'Because every stage optimizes for plausible continuation, not verified truth',
            'Because tokenization fails randomly',
            'Because the model refuses to answer',
          ],
          correctIndex: 1,
          explanation: 'Hallucination is a structural consequence of optimizing for next-token plausibility rather than fact-checking.',
        },
        {
          id: 'q3',
          question: 'Do a model\'s weights change during a single conversation?',
          options: ['Yes, they update after every message', 'No — weights are frozen at inference time; only the visible context changes', 'Only the embedding matrix updates', 'Yes, but only for the system prompt'],
          correctIndex: 1,
          explanation: 'Inference uses a completely frozen set of trained weights; all apparent adaptation comes from context, not weight updates.',
        },
      ],
    },
    { type: 'heading', level: 2, text: 'Glossary', id: 'glossary' },
    {
      type: 'glossary',
      terms: [
        { term: 'Hallucination', definition: 'A fluent, confident, but factually incorrect model output — an expected occasional outcome of next-token-probability optimization.' },
        { term: 'Training', definition: 'The process of adjusting a model\'s weights via backpropagation so its predictions match real text across a large dataset.' },
        { term: 'Inference', definition: 'Running an already-trained, frozen model forward to generate new output, token by token.' },
        { term: 'Retrieval augmentation', definition: 'A technique that reduces hallucination by giving the model relevant retrieved documents as context before it answers.' },
      ],
    },
    { type: 'heading', level: 2, text: 'Summary', id: 'summary' },
    {
      type: 'paragraph',
      text: 'You\'ve now traced the complete path from a typed message to a generated reply — prompt assembly, tokenization, embeddings, positional encoding, self-attention, feed-forward processing, logits, sampling, and the autoregressive loop that ties it all together — and understood why hallucination is a structural feature of this design, not a random glitch. That\'s the whole engine. Everything an LLM does is some composition of these nine stages, running over and over, one token at a time.',
    },
  ],
};