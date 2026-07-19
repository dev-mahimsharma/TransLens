import type { Chapter, ChapterMeta } from '@/types/chapter';

const meta: ChapterMeta = {
  slug: 'introduction',
  unit: 'UNIT I: FOUNDATIONS',
  number: 1,
  title: 'Introduction',
  subtitle: 'From AI to Transformers — the full picture before we zoom in',
  readTime: '12 min read',
  icon: 'Sparkles',
  status: 'complete',
};

export const introduction: Omit<Chapter, 'prev' | 'next'> = {
  meta,
  blocks: [
    {
      type: 'paragraph',
      lead: true,
      text: 'Every time you chat with an LLM, a precise, mechanical pipeline runs underneath — no magic, no mystery, just linear algebra at massive scale. TransLens opens that pipeline up, step by step, so you can see exactly what happens between your keystroke and its reply.',
    },
    { type: 'heading', level: 2, text: 'Where LLMs sit in the AI family tree', id: 'family-tree' },
    {
      type: 'paragraph',
      text: 'People use "AI" to mean everything from a chess engine to ChatGPT, but each term below is a narrower subset of the one before it. Understanding this nesting is the fastest way to stop being confused by AI headlines.',
    },
    {
      type: 'diagram',
      component: 'AIFamilyTree',
      title: 'The AI containment hierarchy',
      caption: 'Each ring is a strict subset of the one outside it — every Transformer is a neural network, but not every neural network is a Transformer.',
    },
    {
      type: 'callout',
      variant: 'info',
      title: 'A real-world analogy',
      body: 'Think of it like Vehicles → Cars → Electric Cars → Teslas → Tesla Model 3. AI is "vehicles." Machine Learning is "cars." Deep Learning is "electric cars." Neural Networks are the engineering approach. LLMs are "Teslas" — a specific, hugely successful application. Transformers are the Model 3\'s drivetrain: the specific architecture that made it work this well.',
    },
    { type: 'heading', level: 2, text: 'The six layers, defined', id: 'layers-defined' },
    {
      type: 'keyTakeaways',
      items: [
        { icon: 'Brain', title: 'Artificial Intelligence', body: 'Any system that performs tasks we\'d normally say require human intelligence — from rule-based chess bots to modern chatbots.' },
        { icon: 'TrendingUp', title: 'Machine Learning', body: 'AI systems that improve by learning patterns from data instead of following hand-written rules.' },
        { icon: 'Layers', title: 'Deep Learning', body: 'Machine learning using neural networks with many stacked layers, letting the model learn increasingly abstract features.' },
        { icon: 'CircuitBoard', title: 'Neural Networks', body: 'Layers of connected "neurons" (numbers + weights) loosely inspired by the brain, trained by adjusting weights via backpropagation.' },
        { icon: 'MessageCircle', title: 'Large Language Models', body: 'Neural networks trained on massive text corpora to predict the next token — scale turns next-token prediction into apparent reasoning.' },
        { icon: 'Network', title: 'Transformers', body: 'The specific neural network architecture (2017) that made today\'s LLMs possible, built around the self-attention mechanism.' },
      ],
    },
    { type: 'heading', level: 2, text: 'The complete pipeline, end to end', id: 'complete-pipeline' },
    {
      type: 'paragraph',
      text: 'This is the map for the entire course. Every remaining chapter is a zoomed-in look at exactly one box in this diagram. By the time you reach the Full Pipeline Summary, every arrow below will make complete sense.',
    },
    {
      type: 'interactive',
      component: 'PipelineDiagram',
      title: 'From your prompt to the model\'s reply',
      description: 'Click each stage to jump straight to its chapter.',
    },
    { type: 'heading', level: 2, text: '"Attention Is All You Need"', id: 'attention-paper' },
    {
      type: 'paragraph',
      text: 'In 2017, eight researchers at Google published a paper that quietly rewrote the future of AI. Before it, the best language models used recurrent networks (RNNs/LSTMs) that read text one word at a time, in order — slow to train and forgetful over long passages. The Transformer replaced recurrence entirely with self-attention, letting a model look at every word in a sentence simultaneously and weigh how relevant each one is to every other one.',
    },
    {
      type: 'linkCard',
      text: 'Attention Is All You Need — Vaswani et al., 2017',
      href: 'https://arxiv.org/abs/1706.03762',
      description: 'The original paper. Chapter 6 (Self-Attention) rebuilds its architecture diagram piece by piece.',
    },
    {
      type: 'callout',
      variant: 'didYouKnow',
      title: 'Did you know?',
      body: 'GPT stands for "Generative Pre-trained Transformer." The T isn\'t decorative — GPT, BERT, LLaMA, Claude, and nearly every modern LLM are all Transformers wearing different training recipes.',
    },
    {
      type: 'callout',
      variant: 'misconception',
      title: 'Common misconception',
      body: '"LLMs understand language the way humans do." Not quite — an LLM has no beliefs or awareness. It has learned an extraordinarily good statistical model of which token is likely to follow which sequence of tokens, at a scale where that statistical skill produces behavior that looks like understanding.',
    },
    { type: 'divider' },
    { type: 'heading', level: 2, text: 'Quick check', id: 'quiz' },
    {
      type: 'quiz',
      title: 'Introduction — mini quiz',
      questions: [
        {
          id: 'q1',
          question: 'Which statement about the AI hierarchy is correct?',
          options: [
            'Machine Learning is a subset of Deep Learning',
            'Deep Learning is a subset of Machine Learning',
            'Neural Networks are a subset of LLMs',
            'AI is a subset of Machine Learning',
          ],
          correctIndex: 1,
          explanation: 'It nests the other way: AI ⊃ ML ⊃ DL ⊃ Neural Networks, with LLMs and Transformers as specific applications inside that nesting.',
        },
        {
          id: 'q2',
          question: 'What core mechanism did the 2017 Transformer paper introduce to replace recurrence?',
          options: ['Convolution', 'Self-attention', 'Gradient boosting', 'Backpropagation'],
          correctIndex: 1,
          explanation: 'Self-attention lets the model weigh relationships between all tokens in parallel, removing the need to process text sequentially.',
        },
        {
          id: 'q3',
          question: 'Why is "LLMs understand language like humans" listed as a misconception?',
          options: [
            'LLMs are too slow to be considered understanding',
            'LLMs only work on English text',
            'LLMs model statistical patterns in token sequences, not beliefs or awareness',
            'LLMs cannot process more than one sentence',
          ],
          correctIndex: 2,
          explanation: 'Convincing behavior emerges from extremely good next-token prediction, not from human-like comprehension or awareness.',
        },
      ],
    },
    { type: 'heading', level: 2, text: 'Glossary', id: 'glossary' },
    {
      type: 'glossary',
      terms: [
        { term: 'Artificial Intelligence (AI)', definition: 'Broad field of building systems that perform tasks requiring human-like intelligence.' },
        { term: 'Machine Learning (ML)', definition: 'AI systems that learn patterns from data rather than following explicit rules.' },
        { term: 'Deep Learning (DL)', definition: 'ML using multi-layered neural networks to learn hierarchical representations.' },
        { term: 'Neural Network', definition: 'A model made of layers of weighted connections, trained via backpropagation.' },
        { term: 'Large Language Model (LLM)', definition: 'A neural network trained on huge text corpora to predict the next token in a sequence.' },
        { term: 'Transformer', definition: 'The 2017 neural network architecture built around self-attention, underlying nearly all modern LLMs.' },
        { term: 'Backpropagation', definition: 'The algorithm used to compute how much each weight contributed to a prediction error, so it can be adjusted.' },
      ],
    },
    { type: 'heading', level: 2, text: 'Summary', id: 'summary' },
    {
      type: 'paragraph',
      text: 'AI is the broadest category; ML narrows it to data-driven learning; Deep Learning narrows it further to layered neural networks; LLMs are neural networks specialized for language; and Transformers are the specific architecture, built on self-attention, that made today\'s LLMs possible. Every chapter from here forward zooms into one stage of the pipeline you just saw.',
    },
  ],
};