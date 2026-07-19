import type { Chapter, ChapterMeta } from '@/types/chapter';

const meta: ChapterMeta = {
  slug: 'self-attention',
  unit: 'UNIT III: THE TRANSFORMER CORE',
  number: 6,
  title: 'Self-Attention',
  subtitle: 'Q, K, V, and the mechanism that changed everything',
  readTime: '20 min read',
  icon: 'Network',
  status: 'complete',
};

export const selfAttention: Omit<Chapter, 'prev' | 'next'> = {
  meta,
  blocks: [
    {
      type: 'paragraph',
      lead: true,
      text: 'This is the mechanism the whole "Attention Is All You Need" paper is named after — and the single biggest reason modern LLMs work as well as they do. Self-attention lets every token in a sequence directly look at every other token and decide, dynamically, how much each one matters for understanding it.',
    },
    { type: 'heading', level: 2, text: 'The problem it solves', id: 'the-problem' },
    {
      type: 'paragraph',
      text: 'Take the sentence: "The trophy didn\'t fit in the suitcase because it was too big." What does "it" refer to — the trophy or the suitcase? A human resolves this instantly using context. Self-attention gives a model the same ability: for every token, it computes a weighted blend of every other token\'s information, weighted by relevance. "It" ends up attending heavily to "trophy," not because of a hard-coded grammar rule, but because the model learned that pattern from data.',
    },
    { type: 'heading', level: 2, text: 'Query, Key, and Value', id: 'qkv' },
    {
      type: 'paragraph',
      text: 'Every token\'s embedding is projected, using three separate learned weight matrices, into three vectors: a Query (what this token is looking for), a Key (what this token offers, for others to match against), and a Value (the actual content this token contributes if it\'s deemed relevant). It helps to think of it like a search engine: the Query is your search terms, the Keys are document titles/tags being matched against, and the Values are the actual document contents you retrieve.',
    },
    {
      type: 'diagram',
      component: 'QKVDiagram',
      title: 'One embedding → three vectors',
      caption: 'Q, K, and V come from the same input embedding, multiplied by three independently learned weight matrices.',
    },
    {
      type: 'callout',
      variant: 'info',
      title: 'Real-world analogy',
      body: 'Think of a classroom Q&A: your Query is the question you\'re asking. Every classmate has a Key (a label of what topic they\'re an expert in) and a Value (their actual answer). You "attend" most strongly to classmates whose Key best matches your Query, and you blend their Values weighted by how good that match is.',
    },
    { type: 'heading', level: 2, text: 'Scaled dot-product attention', id: 'scaled-dot-product' },
    {
      type: 'paragraph',
      text: 'The core formula compares every Query to every Key using a dot product (higher dot product = more relevant), scales the result down by the square root of the key dimension to keep gradients stable during training, then applies softmax to turn raw scores into a clean probability distribution that sums to 1 across all tokens. Those probabilities are used to compute a weighted sum of all the Value vectors.',
    },
    {
      type: 'interactive',
      component: 'ScaledDotProductDiagram',
      title: 'The formula, broken into steps',
      description: 'softmax(QKᵀ / √dₖ) · V — each stage explained.',
    },
    {
      type: 'callout',
      variant: 'didYouKnow',
      title: 'Did you know?',
      body: 'The √dₖ scaling factor exists purely for numerical stability. Without it, as vector dimension grows, dot products can become extremely large, pushing softmax into a regime where gradients vanish — quietly stalling training.',
    },
    { type: 'heading', level: 2, text: 'See it in action: attention weights', id: 'attention-heatmap' },
    {
      type: 'paragraph',
      text: 'Below is the "trophy/suitcase" example. Click "it" to see how attention actually distributes its weight across every other token in the sentence — this is a real (if simplified) illustration of exactly the ambiguity-resolution behavior described above.',
    },
    {
      type: 'interactive',
      component: 'AttentionHeatmap',
      title: 'Interactive attention visualization',
      description: 'Click any token to see what it pays attention to.',
    },
    { type: 'heading', level: 2, text: 'The causal mask', id: 'causal-mask' },
    {
      type: 'paragraph',
      text: 'When a model is generating text, it must not be allowed to "peek" at tokens that come after the one it\'s currently predicting — that would be cheating, since those future tokens don\'t exist yet at inference time. The causal mask enforces this by zeroing out (setting to −∞ before softmax) any attention score from a token to a later token, producing a lower-triangular pattern: each token can only attend to itself and everything before it.',
    },
    {
      type: 'diagram',
      component: 'CausalMaskDiagram',
      title: 'The causal (lower-triangular) mask',
      caption: 'Blue cells are allowed attention connections; gray cells are masked out — no token can see the future.',
    },
    { type: 'heading', level: 2, text: 'Multi-head attention', id: 'multi-head' },
    {
      type: 'paragraph',
      text: 'Rather than computing one big attention pass, Transformers split Q, K, and V into several smaller "heads" that each run scaled dot-product attention independently, in parallel, then concatenate the results and project them back to the original size. Different heads tend to specialize — one might track syntactic relationships (subject-verb agreement), another long-range coreference (like "it" → "trophy"), another local word order — giving the model several complementary "perspectives" on the same sequence simultaneously.',
    },
    {
      type: 'diagram',
      component: 'MultiHeadAttentionDiagram',
      title: 'Multiple attention heads running in parallel',
      caption: 'Each head learns its own Q/K/V projections, specializing in different kinds of relationships between tokens.',
    },
    { type: 'heading', level: 2, text: 'Residual connections and Layer Normalization', id: 'residuals-layernorm' },
    {
      type: 'paragraph',
      text: 'Stacking dozens of Transformer layers naively tends to make training unstable and gradients hard to propagate. Two techniques fix this, used together after every attention and feed-forward sub-layer: a residual connection adds the sub-layer\'s input directly to its output (output = x + Sublayer(x)), giving gradients a direct path backward through the whole network; Layer Normalization then rescales the result so values stay in a stable, consistent range. This "Add & Norm" pattern appears twice per Transformer block and is essential to training networks dozens of layers deep.',
    },
    {
      type: 'keyTakeaways',
      items: [
        { icon: 'Network', title: 'Residual connection', body: 'Adds a sub-layer\'s input to its output, giving gradients an unobstructed path through deep stacks of layers.' },
        { icon: 'Layers', title: 'Layer Normalization', body: 'Rescales activations to a stable range after each sub-layer, keeping training numerically well-behaved.' },
      ],
    },
    { type: 'heading', level: 2, text: 'Encoder vs. decoder', id: 'encoder-vs-decoder' },
    {
      type: 'paragraph',
      text: 'The original Transformer paper describes two stacks: an encoder that processes the full input with unmasked (bidirectional) self-attention — every token can see every other token, since the whole input is available at once — and a decoder that generates output token-by-token using masked (causal) self-attention plus a cross-attention layer that looks back at the encoder\'s output. Most modern LLMs (GPT, Claude, LLaMA) are decoder-only: no separate encoder, just a stack of masked self-attention blocks, well suited to open-ended generation. BERT, by contrast, is encoder-only, built for understanding tasks (classification, search) rather than generating fluent continuations.',
    },
    {
      type: 'callout',
      variant: 'keyPrinciple',
      title: 'Key principle: masking determines the job',
      body: 'The presence or absence of a causal mask is the core architectural difference between "understanding" models (BERT-style, bidirectional, encoder-only) and "generating" models (GPT-style, causal, decoder-only) — same underlying attention mechanism, different masking strategy.',
    },
    { type: 'heading', level: 2, text: 'The full architecture, faithfully reproduced', id: 'full-architecture' },
    {
      type: 'paragraph',
      text: 'Here is the complete diagram from the original paper: input embeddings plus positional encoding feed into a stack of N identical encoder blocks (self-attention → Add & Norm → feed-forward → Add & Norm); the decoder stack mirrors this but adds a masked self-attention layer first, then a cross-attention layer that attends over the encoder\'s output, before its own feed-forward block; a final linear layer plus softmax converts the decoder\'s output into next-token probabilities.',
    },
    {
      type: 'diagram',
      component: 'TransformerArchitectureDiagram',
      title: 'The Transformer (Vaswani et al., 2017)',
      caption: 'Encoder (left) processes input bidirectionally. Decoder (right) generates output causally, cross-attending to the encoder. Decoder-only LLMs like GPT keep only the right-hand stack.',
    },
    {
      type: 'linkCard',
      text: 'Attention Is All You Need — Vaswani et al., 2017',
      href: 'https://arxiv.org/abs/1706.03762',
      description: 'The original paper — Figure 1 is exactly what\'s reproduced above.',
    },
    {
      type: 'callout',
      variant: 'misconception',
      title: 'Common misconception',
      body: '"GPT and BERT use completely different mechanisms." They both use the exact same self-attention math — the difference is entirely about masking (causal vs. bidirectional) and which half of the original architecture they keep, not a different underlying algorithm.',
    },
    { type: 'divider' },
    { type: 'heading', level: 2, text: 'Quick check', id: 'quiz' },
    {
      type: 'quiz',
      title: 'Self-Attention — mini quiz',
      questions: [
        {
          id: 'q1',
          question: 'In the Q/K/V framework, what does the Key vector represent?',
          options: ['The final output of attention', 'What a token is "advertising" for others to match against', 'A random noise vector', 'The token\'s position in the sequence'],
          correctIndex: 1,
          explanation: 'Keys are what get compared against a Query to determine relevance — like a document\'s tags in a search index.',
        },
        {
          id: 'q2',
          question: 'Why is the dot product scaled by √dₖ before softmax?',
          options: ['To make the model faster', 'To keep dot products from growing too large and destabilizing gradients', 'To reduce vocabulary size', 'It has no real effect'],
          correctIndex: 1,
          explanation: 'Without scaling, large dot products push softmax into a near-flat gradient regime, which harms training.',
        },
        {
          id: 'q3',
          question: 'What does the causal mask prevent?',
          options: ['A token from attending to itself', 'A token from attending to tokens that come after it', 'Multi-head attention from running in parallel', 'The use of positional encoding'],
          correctIndex: 1,
          explanation: 'It enforces that predictions only depend on earlier tokens, matching what\'s actually available at inference time.',
        },
        {
          id: 'q4',
          question: 'What is the main architectural difference between GPT-style and BERT-style models?',
          options: [
            'GPT doesn\'t use attention at all',
            'BERT is bidirectional/encoder-only; GPT is causal/decoder-only',
            'BERT can only process one word at a time',
            'They use entirely unrelated mechanisms',
          ],
          correctIndex: 1,
          explanation: 'Both use self-attention; the difference is masking strategy and which stack of the original architecture they retain.',
        },
        {
          id: 'q5',
          question: 'What problem do residual connections primarily address?',
          options: ['Reducing the vocabulary size', 'Letting gradients flow through very deep stacks of layers', 'Speeding up tokenization', 'Removing the need for softmax'],
          correctIndex: 1,
          explanation: 'By adding a sub-layer\'s input directly to its output, gradients have a shortcut path backward through dozens of stacked layers.',
        },
      ],
    },
    { type: 'heading', level: 2, text: 'Glossary', id: 'glossary' },
    {
      type: 'glossary',
      terms: [
        { term: 'Query (Q)', definition: 'A vector representing what a token is "looking for" in other tokens.' },
        { term: 'Key (K)', definition: 'A vector representing what a token "offers" for other tokens to match against.' },
        { term: 'Value (V)', definition: 'The actual content vector a token contributes once deemed relevant.' },
        { term: 'Scaled dot-product attention', definition: 'The core formula: softmax(QKᵀ/√dₖ)·V, computing weighted blends of Value vectors.' },
        { term: 'Softmax', definition: 'A function converting raw scores into a probability distribution that sums to 1.' },
        { term: 'Multi-head attention', definition: 'Running several attention computations in parallel on different learned projections, then combining them.' },
        { term: 'Causal mask', definition: 'A mask preventing a token from attending to any token that comes after it in the sequence.' },
        { term: 'Residual connection', definition: 'Adding a sub-layer\'s input to its output, giving gradients a direct path through deep networks.' },
        { term: 'Layer Normalization', definition: 'Rescaling activations to a stable range after each sub-layer, used together with residuals as "Add & Norm".' },
        { term: 'Encoder', definition: 'A Transformer stack using bidirectional (unmasked) self-attention over the full input, built for understanding.' },
        { term: 'Decoder', definition: 'A Transformer stack using causal (masked) self-attention, built for autoregressive generation.' },
        { term: 'Cross-attention', definition: 'An attention layer in the decoder where Queries come from the decoder but Keys/Values come from the encoder\'s output.' },
      ],
    },
    { type: 'heading', level: 2, text: 'Summary', id: 'summary' },
    {
      type: 'paragraph',
      text: 'Self-attention lets every token dynamically weigh the relevance of every other token, via learned Query/Key/Value projections, scaled dot products, and softmax. Multi-head attention runs several of these in parallel for richer relationships; residuals and LayerNorm keep deep stacks trainable; a causal mask keeps generation honest about what\'s actually known at each step. This is the engine — the next chapter covers what happens to each token\'s representation right after attention: the feed-forward network.',
    },
  ],
};