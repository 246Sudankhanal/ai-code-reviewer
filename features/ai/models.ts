export const REVIEW_MODEL =
  process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini";

export const JUDGE_MODEL =
  process.env.OPENROUTER_JUDGE_MODEL ?? "google/gemini-2.5-flash";

/** Used if the primary judge model errors (downtime, bad slug, 402). */
export const JUDGE_FALLBACK_MODEL =
  process.env.OPENROUTER_JUDGE_FALLBACK_MODEL ?? "openai/gpt-4o-mini";

export const JUDGE_MODELS = [JUDGE_MODEL, JUDGE_FALLBACK_MODEL].filter(
  (model, index, list) => list.indexOf(model) === index
);
