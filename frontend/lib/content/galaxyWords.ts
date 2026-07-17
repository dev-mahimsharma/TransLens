// Curated, fixed word list for the Embeddings page's "Explore Examples"
// galaxy. Deliberately NOT derived from any live prompt -- see the
// conversation decision: a real typed prompt won't naturally contain a
// clean spread across categories, so this static list exists purely to
// demonstrate that semantically related words end up close together in
// real GPT-2 embedding space.

export interface CategoryDef {
  name: string;
  color: string; // hex, used for point color in the 3D scene
  words: string[];
}

export const GALAXY_CATEGORIES: CategoryDef[] = [
  {
    name: "Animals",
    color: "#4CE0D2", // signal-cyan
    words: ["cat", "dog", "tiger", "lion", "wolf", "horse"],
  },
  {
    name: "Food",
    color: "#FF6B4A", // ember
    words: ["apple", "banana", "orange", "bread", "cheese", "rice"],
  },
  {
    name: "Technology",
    color: "#9B7FFF", // signal-violet
    words: ["computer", "robot", "internet", "software", "keyboard", "code"],
  },
];

export const GALAXY_WORDS: string[] = GALAXY_CATEGORIES.flatMap((c) => c.words);

export function categoryForWord(word: string): CategoryDef | null {
  return GALAXY_CATEGORIES.find((c) => c.words.includes(word)) ?? null;
}