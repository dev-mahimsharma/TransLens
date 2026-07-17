"""
AI Explanations service.

Deliberately a SEPARATE small model from the GPT-2/TransformerLens service
that powers the pipeline itself -- GPT-2 base is not instruction-tuned and
would not follow "explain this in plain language" instructions well.
Qwen2.5-0.5B-Instruct is: small enough to run comfortably on CPU, genuinely
open-source (Apache 2.0), and instruction-tuned, so it actually follows the
explanation prompt instead of just continuing text.

This is what makes "free and unlimited" true rather than a marketing
claim: no API key, no external service, no per-request cost or rate limit
beyond your own machine's compute. The trade-off is quality -- a 0.5B
model's explanations will be serviceable, not brilliant. If explanation
quality matters more than the "fully self-hosted" property, swapping in a
larger open model (e.g. Qwen2.5-3B-Instruct, still free/open) is a
one-line change to MODEL_ID below; it'll just be slower on CPU.
"""

from __future__ import annotations

import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

from schemas import PredictionSummary

MODEL_ID = "Qwen/Qwen2.5-0.5B-Instruct"

SYSTEM_PROMPT_BEGINNER = (
    "You are explaining how a language model's internals work to a curious "
    "beginner. Use plain, everyday language, short sentences, and no jargon. "
    "Keep the explanation to 2-3 sentences."
)

class ExplanationService:
    def __init__(self, device: str | None = None):
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")
        self.tokenizer = AutoTokenizer.from_pretrained(MODEL_ID)
        self.model = AutoModelForCausalLM.from_pretrained(
            MODEL_ID,
            torch_dtype=torch.float32 if self.device == "cpu" else torch.float16,
        )
        self.model.to(self.device)
        self.model.eval()

    @torch.no_grad()
    def explain(
        self,
        prompt: str,
        edit_description: str,
        before: list[PredictionSummary],
        after: list[PredictionSummary],
    ) -> str:
        before_str = ", ".join(f"{p.token_text!r} ({p.probability:.1%})" for p in before)
        after_str = ", ".join(f"{p.token_text!r} ({p.probability:.1%})" for p in after)

        user_message = (
            f'The prompt was: "{prompt}"\n'
            f"A user made this edit: {edit_description}\n"
            f"Before the edit, the model's top predicted next tokens were: {before_str}\n"
            f"After the edit, the model's top predicted next tokens were: {after_str}\n"
            f"In 2-3 sentences, explain why this edit likely caused that change."
        )

        messages = [
            {"role": "system", "content": SYSTEM_PROMPT_BEGINNER},
            {"role": "user", "content": user_message},
        ]
        chat_text = self.tokenizer.apply_chat_template(
            messages, tokenize=False, add_generation_prompt=True
        )
        inputs = self.tokenizer(chat_text, return_tensors="pt").to(self.device)

        output_ids = self.model.generate(
            **inputs,
            max_new_tokens=150,
            temperature=0.7,
            do_sample=True,
            top_p=0.9,
            pad_token_id=self.tokenizer.eos_token_id,
        )
        # Only decode the newly generated tokens, not the prompt we sent in.
        new_tokens = output_ids[0][inputs["input_ids"].shape[1]:]
        text = self.tokenizer.decode(new_tokens, skip_special_tokens=True)
        return text.strip()
