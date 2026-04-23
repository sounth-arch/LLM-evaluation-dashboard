// ─────────────────────────────────────────────────────────────────────────────
// Mock dataset — 80 evaluation rows
// Each row simulates one LLM response evaluated by the judge
// ─────────────────────────────────────────────────────────────────────────────

export const MODELS      = ['GPT-4', 'Claude 3', 'Llama 3']
export const TASKS       = ['QA', 'Summarization', 'Reasoning', 'Coding']
export const DIFFICULTIES= ['Easy', 'Medium', 'Hard']
export const PROMPT_VERS = ['v1.0', 'v1.1', 'v2.0']

export const MODEL_COLORS = {
  'GPT-4':    '#378ADD',
  'Claude 3': '#1D9E75',
  'Llama 3':  '#D85A30',
}

export const METRIC_KEYS = [
  'factual_score',
  'helpfulness_score',
  'instruction_score',
  'tone_score',
  'safety_score',
]

export const METRIC_LABELS = {
  factual_score:      'Factual',
  helpfulness_score:  'Helpful',
  instruction_score:  'Instruction',
  tone_score:         'Tone',
  safety_score:       'Safety',
}

export const PROMPT_TEXTS = {
  'v1.0': 'Answer the following question accurately and concisely.',
  'v1.1': 'Answer the following question accurately, concisely, and provide a brief explanation.',
  'v2.0': 'You are a helpful expert. Answer thoroughly, cite reasoning, avoid ambiguity.',
}

const INPUT_PROMPTS = {
  QA:            ['What is the capital of France?', "Explain Newton's third law.", 'Who wrote Hamlet?', 'What causes rainbows?', 'Define machine learning.'],
  Summarization: ['Summarize the French Revolution in 3 sentences.', 'Summarize the plot of 1984.', 'Give a brief summary of climate change impacts.', 'Summarize transformer architecture.', 'Summarize the Apollo 11 mission.'],
  Reasoning:     ['If A>B and B>C, is A>C?', 'A bat and ball cost $1.10. Bat costs $1 more. How much is the ball?', 'All roses are flowers. Some flowers fade quickly. Do all roses fade quickly?', 'What comes next: 2, 4, 8, 16, ?', 'Three boxes: apples, oranges, mixed. Labels wrong. How to identify?'],
  Coding:        ['Write a Python function to reverse a string.', 'Explain Big O notation with an example.', 'Write SQL to find duplicate rows.', 'Implement binary search in Python.', 'What is a closure in JavaScript?'],
}

const EXPECTED_OUTPUTS = {
  QA:            ['Paris', 'For every action there is an equal and opposite reaction.', 'William Shakespeare', 'Light refraction through water droplets', 'A field of AI that enables systems to learn from data'],
  Summarization: ['The French Revolution (1789–1799) was a period of radical political change...', '1984 is a dystopian novel about Winston Smith living under totalitarian surveillance...', 'Climate change causes rising temperatures, sea levels, and extreme weather events...', 'Transformers use self-attention to process sequences in parallel...', 'Apollo 11 landed the first humans on the Moon on July 20, 1969.'],
  Reasoning:     ['Yes, by transitivity', '$0.05', 'Not necessarily', '32', 'Pick from mixed-labeled box first'],
  Coding:        ['def reverse(s): return s[::-1]', 'O(n) means linear time growth relative to input size', 'SELECT *, COUNT(*) FROM t GROUP BY col HAVING COUNT(*)>1', 'def binary_search(arr, t): ...', 'A closure is a function that captures variables from its enclosing scope'],
}

export const JUDGE_EXPLANATIONS = {
  high: [
    'Response is factually accurate, well-structured, and directly addresses the prompt. Tone is appropriate and no safety concerns detected.',
    'Excellent instruction following. The answer is complete, contextually relevant, and demonstrates strong reasoning.',
    'Helpful and concise. All key points are covered with no hallucinations observed.',
  ],
  mid: [
    'Response is mostly correct but omits some key details. Slightly verbose in places, reducing overall helpfulness.',
    'Instruction partially followed. The answer addresses the main question but misses edge cases mentioned in the prompt.',
    'Factually acceptable but tone could be more appropriate for the context. Minor formatting issues present.',
  ],
  low: [
    'Response contains factual inaccuracies and does not follow instructions adequately. Hallucinated content detected.',
    'Output fails to address the core question. Reasoning errors present and the response may mislead the user.',
    'Potentially unsafe content detected. Factual correctness is low and the tone is inappropriate for the task.',
  ],
}

// ── Seeded pseudo-random (deterministic) ───────────────
const sr = s => { const x = Math.sin(s + 1) * 10000; return x - Math.floor(x) }
const pick = (arr, s) => arr[Math.floor(sr(s) * arr.length)]

// ── Generate rows ───────────────────────────────────────
export const DATASET = Array.from({ length: 80 }, (_, i) => {
  const model  = pick(MODELS, i * 7)
  const task   = pick(TASKS, i * 13)
  const diff   = pick(DIFFICULTIES, i * 17)
  const pv     = pick(PROMPT_VERS, i * 23)
  const pidx   = Math.floor(sr(i * 31) * 5)

  // Base score per model
  const base = model === 'GPT-4' ? 0.83 : model === 'Claude 3' ? 0.78 : 0.69
  const dm   = diff === 'Hard' ? -0.13 : diff === 'Easy' ? 0.07 : 0
  const pm   = pv === 'v2.0' ? 0.05 : pv === 'v1.0' ? -0.03 : 0

  const noise = seed => Math.min(1, Math.max(0, base + dm + pm + (sr(i * seed) - 0.5) * 0.18))

  const factual_score      = +noise(3).toFixed(2)
  const helpfulness_score  = +noise(5).toFixed(2)
  const instruction_score  = +noise(7).toFixed(2)
  const tone_score         = +noise(11).toFixed(2)
  const safety_score       = +Math.min(1, noise(13) + 0.1).toFixed(2)
  const overall_score      = +((factual_score + helpfulness_score + instruction_score + tone_score + safety_score) / 5).toFixed(2)

  const latency_ms = Math.round(
    model === 'GPT-4' ? 1200 + sr(i * 19) * 800
    : model === 'Claude 3' ? 950 + sr(i * 19) * 600
    : 700 + sr(i * 19) * 500
  )

  const cost = +(
    model === 'GPT-4'    ? 0.03  + sr(i * 29) * 0.02
    : model === 'Claude 3' ? 0.024 + sr(i * 29) * 0.015
    : 0.008 + sr(i * 29) * 0.005
  ).toFixed(4)

  const passed   = overall_score >= 0.55
  const errTypes = ['Hallucination', 'Reasoning Error', 'Formatting Issue', 'Incomplete']
  const error_type = passed ? null : pick(errTypes, i * 37)

  const scoreLevel = overall_score >= 0.75 ? 'high' : overall_score >= 0.55 ? 'mid' : 'low'
  const judge_explanation = pick(JUDGE_EXPLANATIONS[scoreLevel], i * 43)

  const day = Math.floor(sr(i * 41) * 14)
  const timestamp = new Date(2024, 2, 1 + day).toISOString().split('T')[0]

  return {
    id: i + 1, model, task, difficulty: diff, prompt_version: pv,
    prompt_text: PROMPT_TEXTS[pv],
    input_prompt:    INPUT_PROMPTS[task][pidx % 5],
    expected_output: EXPECTED_OUTPUTS[task][pidx % 5],
    model_output: passed
      ? `Correct and well-reasoned answer to: "${INPUT_PROMPTS[task][pidx % 5]}"`
      : `[Flawed] Incomplete or incorrect answer to: "${INPUT_PROMPTS[task][pidx % 5]}"`,
    factual_score, helpfulness_score, instruction_score, tone_score, safety_score, overall_score,
    latency_ms, cost, error_type, passed, timestamp, judge_explanation,
  }
})
