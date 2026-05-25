// Vercel serverless function — runs on the SERVER, never shipped to the browser.
// This is where your Anthropic API key lives. The frontend calls THIS endpoint
// (/api/generate); this function adds the key and forwards to Anthropic, so the
// key is never exposed in client-side code.
//
// Set the key in Vercel: Project Settings → Environment Variables →
//   ANTHROPIC_API_KEY = sk-ant-...
// (and in a local .env file for `vercel dev` — see README)

const VIBE_LABELS = {
  casual: "Casual & funny",
  doc: "Documentary",
  diary: "Travel diary",
  hype: "High-energy",
};
const LENGTH_LABELS = { short: "~30s", medium: "~60s", long: "~90s" };

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Server is missing ANTHROPIC_API_KEY." });
  }

  // Vercel sometimes delivers req.body already parsed, sometimes as a raw
  // string, sometimes undefined — parse defensively so the function never
  // crashes on a malformed body.
  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  if (!body || typeof body !== "object") body = {};

  const { location, vibe, length } = body;
  if (!location || !location.trim()) {
    return res.status(400).json({ error: "A location is required." });
  }

  const vibeLabel = VIBE_LABELS[vibe] || "Casual";
  const lenLabel = LENGTH_LABELS[length] || "~60s";

  const prompt = `You are a seasoned travel vlogger's prep assistant. A creator is about to film at: "${location}".

Produce a complete on-location prep pack. Tone for the SCRIPT: ${vibeLabel}. Target spoken length: ${lenLabel}.

Respond ONLY with a single valid JSON object, no markdown, no backticks, no preamble. Use this exact shape:
{
  "place": "cleaned-up display name of the location",
  "oneLiner": "one sentence on why this place matters / is worth filming",
  "facts": ["4 to 5 short, specific, genuinely interesting facts most tourists don't know — each under 25 words"],
  "bestTime": "best time of day to film here and why (light, crowds) — one or two sentences",
  "etiquette": "one key local etiquette or respect note worth knowing on camera — one sentence",
  "script": {
    "hook": "an opening line of 1-2 sentences designed to stop the scroll in the first 3 seconds",
    "body": "the main spoken narration, written to be read aloud naturally, woven with 1-2 of the facts above, matched to the chosen tone and length",
    "signoff": "a closing line or transition to the next stop, 1 sentence"
  },
  "shotList": ["5 to 6 specific shots to capture here, including at least 2 b-roll ideas — each a short imperative phrase like 'Wide of the torii gates at the entrance'"],
  "gear": ["3 to 4 specific gear or prep reminders tailored to THIS location — e.g. waterproof housing for a waterfall, ND filter for bright midday water, extra battery for a long hike, a wide lens for tight temple interiors — each under 12 words"],
  "captions": ["2 ready-to-post social captions for this clip, each under 20 words, with 2-3 relevant hashtags"]
}

Be concrete and specific to THIS location. Avoid generic filler. If the location is ambiguous, pick the most likely famous interpretation and reflect it in "place".`;

  try {
    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1500,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!anthropicRes.ok) {
      const detail = await anthropicRes.text();
      return res.status(502).json({
        error: `Anthropic returned ${anthropicRes.status}.`,
        status: anthropicRes.status,
        detail,
      });
    }

    const data = await anthropicRes.json();
    const text = (data.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");

    const clean = text.replace(/```json|```/g, "").trim();
    const start = clean.indexOf("{");
    const end = clean.lastIndexOf("}");
    if (start === -1 || end === -1) {
      return res.status(500).json({ error: "Anthropic did not return valid JSON.", raw: text.slice(0, 500) });
    }

    let pack;
    try {
      pack = JSON.parse(clean.slice(start, end + 1));
    } catch (parseErr) {
      return res.status(500).json({ error: "Could not parse the prep pack.", raw: text.slice(0, 500) });
    }

    return res.status(200).json(pack);
  } catch (err) {
    return res.status(500).json({ error: "Failed to build prep pack.", detail: String(err) });
  }
}
