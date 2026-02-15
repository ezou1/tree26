// Perplexity API client — ported from review.py

const PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions"

export async function queryPerplexity(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const apiKey = process.env.PERPLEXITY_API_KEY
  if (!apiKey) throw new Error("PERPLEXITY_API_KEY not set")

  const res = await fetch(PERPLEXITY_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "sonar-pro",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 8000,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Perplexity API error ${res.status}: ${text}`)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? ""
}

/**
 * Robustly parse JSON from Perplexity response text.
 * Handles markdown fences, trailing commas, control chars.
 * Ported from review.py:_parse_json_response()
 */
export function parseJsonResponse(raw: string): Record<string, unknown> {
  // Strip markdown code fences
  let cleaned = raw.replace(/```(?:json)?\s*/gi, "").replace(/```\s*/g, "")

  // Try to extract JSON object or array
  const jsonMatch = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/)
  if (jsonMatch) {
    cleaned = jsonMatch[1]
  }

  // Remove trailing commas before } or ]
  cleaned = cleaned.replace(/,\s*([}\]])/g, "$1")

  // Remove control characters (except newline, tab)
  cleaned = cleaned.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, "")

  try {
    return JSON.parse(cleaned) as Record<string, unknown>
  } catch {
    // Last resort: try to find any JSON-like structure
    const fallback = cleaned.match(/\{[^{}]*\}/)
    if (fallback) {
      try {
        return JSON.parse(fallback[0]) as Record<string, unknown>
      } catch {
        // Give up
      }
    }
    return {}
  }
}
