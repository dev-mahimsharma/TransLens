import type { Chapter, ChapterMeta } from '@/types/chapter';

const meta: ChapterMeta = {
  slug: 'tokenization',
  unit: 'UNIT II: INPUT PROCESSING',
  number: 3,
  title: 'Tokenization',
  subtitle: 'Turning text into numbers a model can read',
  readTime: '10 min read',
  icon: 'Scissors',
  status: 'complete',
};

export const tokenization: Omit<Chapter, 'prev' | 'next'> = {
  meta,
  blocks: [
    {
      type: 'paragraph',
      lead: true,
      text: 'A neural network only understands numbers. Before a single matrix multiplication happens, your prompt has to be chopped into small chunks — tokens — and each one mapped to an integer ID. This is tokenization, and every decision it makes quietly shapes what the model can and can\'t do well.',
    },
    { type: 'heading', level: 2, text: 'Why not just use whole words?', id: 'why-not-words' },
    {
      type: 'paragraph',
      text: 'A word-level vocabulary sounds simple, but it breaks down fast: English alone has hundreds of thousands of words, plus names, typos, slang, and other languages. A character-level vocabulary is tiny but makes sequences enormous and forces the model to reconstruct meaning from scratch every time. Subword tokenization is the middle ground almost every LLM uses today.',
    },
    {
      type: 'callout',
      variant: 'info',
      title: 'Real-world analogy',
      body: 'Think of subword tokens like LEGO pieces instead of pre-built houses (whole words) or individual atoms (characters). "unbelievable" might become "un" + "believ" + "able" — reusable pieces that combine to build almost any word, even ones the model never saw during training.',
    },
    { type: 'heading', level: 2, text: 'Byte-Pair Encoding (BPE)', id: 'bpe' },
    {
      type: 'paragraph',
      text: 'Most modern LLMs use Byte-Pair Encoding or a close variant. During training, BPE starts with individual characters and repeatedly merges the most frequent adjacent pair into a new token — "t"+"h" → "th", then "th"+"e" → "the" — until it reaches a target vocabulary size (commonly 30,000–100,000+ tokens). Common words end up as single tokens; rare words get split into familiar fragments.',
    },
    {
      type: 'interactive',
      component: 'TokenizerPlayground',
      title: 'Try it yourself',
      description: 'Type anything and watch it get sliced into tokens in real time.',
    },
    { type: 'heading', level: 2, text: 'The vocabulary', id: 'vocabulary' },
    {
      type: 'paragraph',
      text: 'The vocabulary is the model\'s fixed dictionary of every token it knows — typically tens of thousands of entries, each with a unique integer ID. Tokenization never invents new IDs at inference time; it only ever looks up pieces that already exist in this fixed table, which is exactly why a rare or made-up word gets fragmented into several known sub-pieces rather than one clean token.',
    },
    { type: 'heading', level: 2, text: 'Special tokens: BOS, EOS, and friends', id: 'special-tokens' },
    {
      type: 'paragraph',
      text: 'Beyond ordinary word-pieces, the vocabulary reserves IDs for control tokens the model uses as signposts. BOS (Beginning of Sequence) marks where a piece of text starts; EOS (End of Sequence) marks where it ends and, during generation, tells the model "stop here." Chat models add further special tokens to mark turn boundaries — for example separating a system prompt, a user turn, and an assistant turn — so the model can distinguish structure from content.',
    },
    {
      type: 'diagram',
      component: 'SpecialTokensDiagram',
      title: 'A prompt wrapped in special tokens',
      caption: 'Special tokens never appear in ordinary text — they are reserved IDs the model learns to treat as structural signals.',
    },
    { type: 'heading', level: 2, text: 'The context window', id: 'context-window' },
    {
      type: 'paragraph',
      text: 'Every model has a maximum number of tokens it can process at once — its context window (e.g. 128,000 tokens). This includes your prompt, any system instructions, and the reply being generated, all counted together. Once a conversation exceeds that limit, the earliest tokens have to be dropped or summarized, which is why very long chats can cause a model to "forget" the beginning.',
    },
    {
      type: 'callout',
      variant: 'didYouKnow',
      title: 'Did you know?',
      body: 'Because tokens ≠ words, a rough English rule of thumb is 1 token ≈ 4 characters ≈ ¾ of a word. That "100k context window" is closer to ~75,000 words — about a 250-page novel.',
    },
    {
      type: 'callout',
      variant: 'misconception',
      title: 'Common misconception',
      body: '"Tokens are always whole words." False — common words are usually one token, but longer, rarer, or non-English words routinely split into 2, 3, or more sub-word tokens. This is also why LLMs are famously bad at counting letters in a word: they never actually see individual letters, only token fragments.',
    },
    { type: 'divider' },
    { type: 'heading', level: 2, text: 'Quick check', id: 'quiz' },
    {
      type: 'quiz',
      title: 'Tokenization — mini quiz',
      questions: [
        {
          id: 'q1',
          question: 'Why do most LLMs use subword tokenization instead of whole-word tokenization?',
          options: [
            'It makes the model faster at math',
            'It balances vocabulary size against sequence length and handles unseen words gracefully',
            'It removes the need for a vocabulary entirely',
            'It only works for English',
          ],
          correctIndex: 1,
          explanation: 'Subwords keep the vocabulary manageable while still letting rare or novel words be built from familiar fragments.',
        },
        {
          id: 'q2',
          question: 'What does the EOS token signal during generation?',
          options: ['The start of the system prompt', 'That the model should stop generating', 'A grammar error', 'The middle of the context window'],
          correctIndex: 1,
          explanation: 'EOS (End of Sequence) tells the model — and the decoding loop — that this is a natural stopping point.',
        },
        {
          id: 'q3',
          question: 'A model has a 128k-token context window. What does this actually limit?',
          options: [
            'Only the length of your prompt',
            'Only the length of the model\'s reply',
            'The combined total of prompt + system instructions + generated reply',
            'The size of the vocabulary',
          ],
          correctIndex: 2,
          explanation: 'The context window is a shared budget across everything the model reads and writes in one pass.',
        },
      ],
    },
    { type: 'heading', level: 2, text: 'Glossary', id: 'glossary' },
    {
      type: 'glossary',
      terms: [
        { term: 'Token', definition: 'A chunk of text (word, sub-word, or character) mapped to a single integer ID — the basic unit an LLM reads and writes.' },
        { term: 'Byte-Pair Encoding (BPE)', definition: 'An algorithm that builds a subword vocabulary by repeatedly merging the most frequent adjacent symbol pairs.' },
        { term: 'Vocabulary', definition: 'The fixed, finite table mapping every token the model knows to a unique integer ID.' },
        { term: 'BOS / EOS', definition: 'Beginning-of-sequence / end-of-sequence special tokens marking where text starts and stops.' },
        { term: 'Context Window', definition: 'The maximum number of tokens (prompt + reply combined) a model can process in a single pass.' },
      ],
    },
    { type: 'heading', level: 2, text: 'Summary', id: 'summary' },
    {
      type: 'paragraph',
      text: 'Tokenization converts raw text into a sequence of integer IDs drawn from a fixed vocabulary, using subword algorithms like BPE to balance efficiency and flexibility. Special tokens like BOS/EOS give the model structural signposts, and the context window caps how many tokens — prompt and reply combined — it can handle at once. Next: those integer IDs get converted into vectors the model can actually do math with.',
    },
  ],
};