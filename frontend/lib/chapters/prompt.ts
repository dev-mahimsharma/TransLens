import type { Chapter, ChapterMeta } from '@/types/chapter';

const meta: ChapterMeta = {
  slug: 'prompt',
  unit: 'UNIT I: FOUNDATIONS',
  number: 2,
  title: 'The Prompt',
  subtitle: 'What actually happens the instant you hit send',
  readTime: '6 min read',
  icon: 'MessageSquare',
  status: 'complete',
};

export const prompt: Omit<Chapter, 'prev' | 'next'> = {
  meta,
  blocks: [
    {
      type: 'paragraph',
      lead: true,
      text: 'A "prompt" feels like a single message box, but by the time it reaches the model, your chat app has quietly assembled a whole structured document — instructions, conversation history, and your new message — wrapped in a format the model was specifically trained to recognize.',
    },
    { type: 'heading', level: 2, text: 'It\'s not just your text', id: 'not-just-text' },
    {
      type: 'paragraph',
      text: 'Behind the scenes, a chat interface builds a sequence of role-tagged turns: a system turn (invisible instructions like "you are a helpful assistant"), one or more user turns (your messages), and assistant turns (the model\'s previous replies, if any). All of this — not just your latest sentence — is what gets tokenized and fed to the model.',
    },
    {
      type: 'diagram',
      component: 'PromptAnatomyDiagram',
      title: 'Anatomy of a chat prompt',
      caption: 'Every turn is tagged with a role so the model can tell instructions, your questions, and its own past answers apart.',
    },
    {
      type: 'callout',
      variant: 'info',
      title: 'Real-world analogy',
      body: 'Think of it like a screenplay script handed to an actor: stage directions (system prompt), other characters\' lines (your messages), and the actor\'s own previous lines (assistant turns) are all visible on the page — the actor (model) reads the whole script before delivering the next line.',
    },
    { type: 'heading', level: 2, text: 'Why roles matter', id: 'why-roles' },
    {
      type: 'paragraph',
      text: 'Models are trained to treat each role differently. System instructions typically carry the most authority and shape overall behavior; user turns are requests to respond to; assistant turns are the model\'s own past output, which it uses as context for staying consistent. This role structure is what makes multi-turn conversation possible at all — without it, the model would just see one undifferentiated wall of text.',
    },
    {
      type: 'callout',
      variant: 'didYouKnow',
      title: 'Did you know?',
      body: 'Every model family has its own exact chat template — the specific special tokens and formatting used to mark role boundaries. This is why the same conversation, tokenized for two different model families, can produce meaningfully different token sequences even with identical visible text.',
    },
    {
      type: 'callout',
      variant: 'misconception',
      title: 'Common misconception',
      body: '"The model remembers our earlier conversation." It doesn\'t, in the way memory usually works — there\'s no persistent state between turns. The entire visible conversation history is re-sent and reprocessed from scratch every single time you send a new message, up to the context window limit.',
    },
    { type: 'divider' },
    { type: 'heading', level: 2, text: 'Quick check', id: 'quiz' },
    {
      type: 'quiz',
      title: 'The Prompt — mini quiz',
      questions: [
        {
          id: 'q1',
          question: 'What is actually sent to the model when you send a chat message?',
          options: ['Only your latest message', 'The system prompt, full conversation history, and your new message', 'A compressed summary of the chat', 'Only the assistant\'s last reply'],
          correctIndex: 1,
          explanation: 'Chat apps reconstruct and resend the full role-tagged conversation (within the context window) on every turn.',
        },
        {
          id: 'q2',
          question: 'Why does role-tagging (system/user/assistant) matter?',
          options: [
            'It makes the text shorter',
            'It lets the model distinguish instructions, requests, and its own past replies',
            'It is purely cosmetic for the chat UI',
            'It replaces the need for tokenization',
          ],
          correctIndex: 1,
          explanation: 'Without role structure, the model would see one undifferentiated block of text with no way to tell who said what.',
        },
        {
          id: 'q3',
          question: 'Does an LLM retain memory of a conversation between separate messages the way a database would?',
          options: ['Yes, permanently', 'No — the full visible history is resent and reprocessed each turn', 'Only for the first 10 messages', 'Only if you enable a memory setting'],
          correctIndex: 1,
          explanation: 'There\'s no persistent internal state; apparent "memory" comes entirely from resending prior turns as part of the prompt.',
        },
      ],
    },
    { type: 'heading', level: 2, text: 'Glossary', id: 'glossary' },
    {
      type: 'glossary',
      terms: [
        { term: 'Prompt', definition: 'The full structured input sent to a model — system instructions, conversation history, and the latest user message.' },
        { term: 'System prompt', definition: 'Instructions set by the application, usually invisible to the user, that shape the model\'s behavior and persona.' },
        { term: 'Chat template', definition: 'The model-family-specific format and special tokens used to mark role boundaries in a conversation.' },
        { term: 'Turn', definition: 'One role-tagged unit in a conversation — a single system, user, or assistant message.' },
      ],
    },
    { type: 'heading', level: 2, text: 'Summary', id: 'summary' },
    {
      type: 'paragraph',
      text: 'What feels like "typing a message" is really constructing a role-tagged document — system instructions, conversation history, and your new turn — formatted using a model-specific chat template. That whole document is what gets tokenized next.',
    },
  ],
};