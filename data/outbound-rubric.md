# Pass 2 Outbound Eval Rubric

Six dimensions, 1-5 each. The judge LLM scores Pass 1 (brief + 3 emails) on each dimension, with per-claim flags surfaced inline.

## Dimensions

### 1. factual_grounding (1-5)
Does every claim in the brief and emails tie back to the scraped dealer data, the Ekho competitor footprint, or the dealer economics priors? Hallucinated dealer attributes are an automatic flag.

- 5: every specific claim is traceable to source data
- 3: most claims grounded, one or two unsupported generalizations
- 1: includes details not present in any source

### 2. specificity (1-5)
Is the output specific enough that a competing AI-SDR tool with the same dealer URL would not produce it?

- 5: names specific brands, specific inventory, specific local-market dynamics
- 3: generic dealer-segment claims that would apply to any store in the segment
- 1: would work for any dealer in the country

### 3. voice_match (1-5)
Does the output sound like an Ekho operator wrote it, not an AI tool?

- 5: matches voice samples; operator-to-operator; no marketing softness
- 3: mostly on-voice with one or two BDR phrases
- 1: reads like generic AI sales copy

### 4. insight_quality (1-5)
Does the brief or emails say something the dealer would not already know about their own business or competitive position?

- 5: at least one observation the dealer principal would pause on
- 3: surface-level observations the dealer is aware of
- 1: tells the dealer what they tell themselves on their about page

### 5. outbound_discipline (1-5)
Does each of the three emails earn its place? Is the cadence ascending in urgency without becoming desperate?

- 5: three distinct emails, each with a different angle and a single ask
- 3: emails overlap in topic or one is filler
- 1: same email three times with subject-line variations

### 6. anti_sycophancy (1-5)
Does the output avoid flattering the dealer or hedging on hard claims?

- 5: zero flattery; addresses gaps directly when relevant
- 3: one or two unnecessary compliments
- 1: opens with praise; hedges on the competitive comparison

## Output schema

```json
{
  "scores": [
    { "dimension": "factual_grounding", "score": 1-5, "note": "string" },
    { "dimension": "specificity", "score": 1-5, "note": "string" },
    { "dimension": "voice_match", "score": 1-5, "note": "string" },
    { "dimension": "insight_quality", "score": 1-5, "note": "string" },
    { "dimension": "outbound_discipline", "score": 1-5, "note": "string" },
    { "dimension": "anti_sycophancy", "score": 1-5, "note": "string" }
  ],
  "flags": [
    {
      "excerpt": "verbatim phrase from Pass 1 output",
      "dimension": "one of the six",
      "why": "specific reason, one sentence",
      "severity": "low | med | high"
    }
  ],
  "overall": 1-5
}
```

JSON only. No prose, no code fences, no preamble.
