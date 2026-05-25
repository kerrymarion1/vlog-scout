# Vlog Scout

A travel-vlogging prep app. Type any location, pick a vibe and clip length, and it
researches the spot and writes you a ready-to-read script, shot list, gear reminders,
and social captions — powered by the Claude API.

## How it's wired (read this first)

The app has two halves:

- **Frontend** (`src/`) — the React UI you see in the browser.
- **Backend** (`api/generate.js`) — a serverless function that holds your Anthropic
  API key and talks to Claude.

The frontend calls `/api/generate`, NOT Anthropic directly. This matters: your API key
lives only on the server, so it's never visible to anyone who opens the page. Putting an
API key in frontend code would let anyone read it and run up your bill — so don't.

---

## Run it locally

You'll need [Node.js](https://nodejs.org/) 18+ installed.

1. Install dependencies:
   ```bash
   npm install
   ```

2. Get an Anthropic API key from <https://console.anthropic.com/> → **API Keys**.

3. Copy the example env file and paste your key into it:
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` so it reads `ANTHROPIC_API_KEY=sk-ant-...`

4. Because the `/api` function is a Vercel serverless function, the easiest way to run
   the frontend AND the backend together locally is the Vercel CLI:
   ```bash
   npm install -g vercel
   vercel dev
   ```
   This serves both on one local URL (usually http://localhost:3000). Open it and try a
   location.

   > Plain `npm run dev` runs ONLY the frontend — the `/api/generate` call will 404
   > because the serverless function isn't running. Use `vercel dev` for the full app.

---

## Deploy it (free, ~10 minutes)

1. Put this folder on GitHub:
   ```bash
   git init
   git add .
   git commit -m "Vlog Scout"
   ```
   Create a new empty repo on github.com, then follow its "push an existing repository"
   instructions.

2. Go to <https://vercel.com/>, sign in with GitHub, and click **Add New → Project**.
   Import your `vlog-scout` repo. Vercel auto-detects Vite — leave the build settings as-is.

3. Before deploying, open **Environment Variables** and add:
   - Name: `ANTHROPIC_API_KEY`
   - Value: your `sk-ant-...` key

   This is the secure home for your key — it stays on Vercel's servers, never in your code.

4. Click **Deploy**. In a minute you'll get a live URL like `vlog-scout.vercel.app`.

That's it. Every time you push to GitHub, Vercel redeploys automatically.

---

## Costs

Each prep pack is one Claude API call (Sonnet 4, ~1500 output tokens max). At current
pricing that's a fraction of a cent per generation. Vercel's hobby tier is free for a
project this size.

## Files

```
api/generate.js     ← serverless backend; holds the key, calls Claude
src/VlogScout.jsx   ← the app UI
src/main.jsx        ← React entry point
src/index.css       ← minimal styling (no Tailwind needed)
index.html          ← page shell
.env.example        ← shows the one variable you need to set
```

## Where to take it next

- **Save scouted spots** — add a database (Vercel KV or Postgres) and a couple more
  `/api` routes to persist packs so they survive across sessions and devices.
- **Offline export** — a "download all packs as a PDF/text file" button so everything's
  on your phone before you fly and you're not burning eSIM data in the field.
