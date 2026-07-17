// Shared stage descriptions for the pipeline walkthrough.

export const STAGE_EXPLANATIONS = {
  tokenization:
    "The model never sees words — it sees numbers. Your prompt gets chopped into small pieces called tokens (often whole words, sometimes just word-fragments), and each piece is looked up in a giant dictionary the model memorized during training.",
  embeddings:
    "Each token becomes a list of 768 numbers — think of it as a point in a huge space where similar meanings end up near each other. The model also adds a second set of numbers just to mark each token's position in the sentence, since order matters ('dog bites man' ≠ 'man bites dog').",
  positional_encoding:
    "Without something marking word order, the model would see your sentence as a bag of words with no sequence — 'dog bites man' and 'man bites dog' would look identical. So every position (1st word, 2nd word, ...) gets its own learned pattern of numbers added to the token, which is how the model knows what came before what.",
  attention:
    "This is how the model decides what to pay attention to. For every word, it looks at every other word that came before it and decides how relevant each one is — like highlighting the most important parts of a sentence before deciding what comes next.",
  feed_forward:
    "After attention finishes mixing information between words, each word passes through its own small 'thinking' step — the same simple calculation applied individually to every token. Some of these internal units light up strongly for specific patterns (like certain topics or grammar), which is part of how the model stores what it learned during training.",
  logits:
    "Before the model turns its thinking into probabilities, it produces one raw score per possible next word — these are called logits. A higher score means the model favors that word, but the scores themselves aren't probabilities yet (they can even be negative). The next stage turns them into something you can actually compare.",
  sampling:
    "The model doesn't pick one fixed next word — it assigns a probability to every possible next word, then rolls the dice according to those odds. Temperature controls how bold that roll is: low temperature almost always picks the most likely word; high temperature is willing to gamble on surprising ones.",
} as const;
