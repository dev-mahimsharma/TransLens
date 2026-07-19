import type { Chapter, ChapterMeta } from '@/types/chapter';

const meta: ChapterMeta = {
  slug: 'prediction',
  unit: 'UNIT IV: OUTPUT GENERATION',
  number: 10,
  title: 'Prediction',
  subtitle: 'From one token to a full autoregressive response',
  readTime: '7 min read',
  icon: 'Target',
  status: 'complete',
};

export const prediction: Omit<Chapter, 'prev' | 'next'> = {
  meta,
  blocks: [
    {
      type: 'paragraph',
      lead: true,
      text: 'Everything so far — tokenizing, embedding, attention, logits, sampling — produces exactly one new token. A full reply is built by looping that entire process, one token at a time, feeding each new token back in as part of the input for predicting the next one. This is autoregressive generation.',
    },
    { type: 'heading', level: 2, text: 'The generation loop', id: 'the-loop' },
    {
      type: 'paragraph',
      text: 'After sampling a token, it gets appended to the sequence, and the whole (now slightly longer) sequence is run through the model again to predict the next token — repeating until an EOS token is sampled or a maximum length is hit. This is why longer replies take proportionally longer to generate: each new token requires reprocessing an ever-growing sequence.',
    },
    {
      type: 'diagram',
      component: 'AutoregressiveLoopDiagram',
      title: 'The autoregressive loop',
      caption: 'Each predicted token is appended to the input, and the model runs again — one forward pass per output token.',
    },
    {
      type: 'callout',
      variant: 'info',
      title: 'Real-world analogy',
      body: 'It\'s like writing a story one word at a time, re-reading the entire story so far before deciding each new word — never planning multiple words ahead, just committing to the single best next word given everything written before it.',
    },
    { type: 'heading', level: 2, text: 'The KV cache', id: 'kv-cache' },
    {
      type: 'paragraph',
      text: 'Naively, reprocessing the whole growing sequence from scratch for every single new token would be wildly wasteful — most of that computation is identical to the previous step. The KV cache fixes this: since the Key and Value vectors for already-processed tokens never change, they\'re computed once and cached, so each new step only computes Q/K/V for the newest token and reuses everything else. This is one of the most important practical optimizations in real-world LLM inference.',
    },
    {
      type: 'callout',
      variant: 'didYouKnow',
      title: 'Did you know?',
      body: 'The KV cache is also the main reason longer conversations use more GPU memory even before generating a single new token — every past token\'s Key and Value vectors have to stay cached in memory for the model to keep attending to them.',
    },
    { type: 'heading', level: 2, text: 'Training vs. inference', id: 'training-vs-inference' },
    {
      type: 'paragraph',
      text: 'During training, the model sees entire real sequences at once and predicts every position\'s next token in parallel, using teacher forcing — the actual correct next token (not the model\'s own guess) is always fed in as context for predicting the following one, which makes training far more efficient and stable. During inference (actually generating text), there\'s no ground truth to feed in — the model must use its own previous predictions as input, one step at a time, exactly as described above. This training/inference mismatch is part of why models can sometimes "drift" on very long generations.',
    },
    {
      type: 'callout',
      variant: 'misconception',
      title: 'Common misconception',
      body: '"The model plans out its whole response in advance, then writes it." It doesn\'t — generation is strictly sequential, one token at a time, with no lookahead. Any appearance of forward planning emerges indirectly from patterns learned during training, not explicit multi-step planning inside a single forward pass.',
    },
    { type: 'divider' },
    { type: 'heading', level: 2, text: 'Quick check', id: 'quiz' },
    {
      type: 'quiz',
      title: 'Prediction — mini quiz',
      questions: [
        {
          id: 'q1',
          question: 'What does "autoregressive" generation mean?',
          options: [
            'The model predicts all tokens simultaneously',
            'Each predicted token is fed back in as input for predicting the next one',
            'The model only works on regression problems',
            'Generation happens without any input',
          ],
          correctIndex: 1,
          explanation: 'Autoregressive means each output depends on — and is appended to — the sequence used to generate the next output.',
        },
        {
          id: 'q2',
          question: 'What problem does the KV cache solve?',
          options: [
            'It reduces the vocabulary size',
            'It avoids recomputing Key/Value vectors for already-processed tokens at every generation step',
            'It replaces the need for sampling',
            'It only matters during training',
          ],
          correctIndex: 1,
          explanation: 'Caching K/V vectors for past tokens avoids redundant computation, since those tokens are already fully processed.',
        },
        {
          id: 'q3',
          question: 'What is "teacher forcing" used for?',
          options: [
            'Speeding up inference',
            'Feeding the true next token as context during training, rather than the model\'s own guess',
            'Choosing which tokens to mask',
            'Compressing the model after training',
          ],
          correctIndex: 1,
          explanation: 'Teacher forcing uses ground-truth tokens during training for efficient, stable parallel prediction across a whole sequence.',
        },
      ],
    },
    { type: 'heading', level: 2, text: 'Glossary', id: 'glossary' },
    {
      type: 'glossary',
      terms: [
        { term: 'Autoregressive generation', definition: 'Generating text one token at a time, feeding each new token back in as input for predicting the next.' },
        { term: 'KV cache', definition: 'A cache of previously computed Key/Value vectors, avoiding redundant recomputation at each generation step.' },
        { term: 'Teacher forcing', definition: 'A training technique where the true next token, not the model\'s own prediction, is fed in as context.' },
        { term: 'Inference', definition: 'The process of actually running a trained model to generate output, as opposed to training it.' },
      ],
    },
    { type: 'heading', level: 2, text: 'Summary', id: 'summary' },
    {
      type: 'paragraph',
      text: 'A full response is built by looping the entire predict-one-token pipeline, feeding each new token back in — made computationally practical by the KV cache. Training uses teacher-forced parallel prediction; inference is strictly sequential. With every stage now covered individually, the final chapter zooms back out to see the whole pipeline as one continuous system.',
    },
  ],
};