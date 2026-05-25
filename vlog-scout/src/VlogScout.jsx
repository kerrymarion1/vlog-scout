import React, { useState, useRef, useEffect } from "react";
import { MapPin, Camera, Mic2, Sparkles, Copy, Check, ListChecks, Lightbulb, Clock, Hash, RotateCcw, Backpack, Plane, Compass, Printer } from "lucide-react";

// ── Trip mode: your Osaka–Kyoto–Cebu stops as quick picks ───────────────────
const TRIP_STOPS = [
  { city: "Osaka", spots: ["Dotonbori", "Kuromon Ichiba Market", "Osaka Castle", "Umeda Sky Building"] },
  { city: "Kyoto", spots: ["Fushimi Inari Shrine", "Arashiyama Bamboo Grove", "Kiyomizu-dera", "Gion district"] },
  { city: "Nara", spots: ["Nara Deer Park", "Todai-ji Temple"] },
  { city: "Cebu", spots: ["Kawasan Falls", "Oslob whale sharks", "Mactan island hopping", "Cebu Bay sunset cruise"] },
];

// ── Vibe options ──────────────────────────────────────────────────────────
const VIBES = [
  { id: "casual", label: "Casual & funny", blurb: "Loose, warm, a little goofy" },
  { id: "doc", label: "Documentary", blurb: "Informative, grounded, factual" },
  { id: "diary", label: "Travel diary", blurb: "Reflective, personal, slow" },
  { id: "hype", label: "High-energy", blurb: "Punchy, fast, made-to-scroll" },
];

const LENGTHS = [
  { id: "short", label: "~30s" },
  { id: "medium", label: "~60s" },
  { id: "long", label: "~90s" },
];

// ── Dark theme palette ──────────────────────────────────────────────────────
const C = {
  bg: "#13161c",          // page background
  card: "#1c2029",        // card surface
  cardSoft: "#232834",    // inset surfaces
  line: "#323a47",        // borders
  text: "#e8e6e0",        // primary text
  textDim: "#9aa0ab",     // secondary text
  textFaint: "#6b7280",   // hints
  gold: "#d4a017",        // accent — amber/gold
  green: "#5b9e7a",       // accent — sage
  red: "#d9694f",         // accent — coral/red
  greenDeep: "#2c4a3b",   // deep banner green
};

// ── API call (calls our backend, which holds the key) ───────────────────────
async function generatePrep(location, vibe, length) {
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ location, vibe, length }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Request failed");
  }
  return res.json();
}

// ── Copy button ─────────────────────────────────────────────────────────────
function CopyBtn({ text, label }) {
  const [done, setDone] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard?.writeText(text);
        setDone(true);
        setTimeout(() => setDone(false), 1400);
      }}
      className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border transition-colors"
      style={{ borderColor: C.line, color: done ? C.green : C.gold, background: "transparent" }}
    >
      {done ? <Check size={13} /> : <Copy size={13} />}
      {done ? "Copied" : label || "Copy"}
    </button>
  );
}

function Section({ icon, title, accent, children, copy }) {
  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span style={{ color: accent }}>{icon}</span>
          <h3 className="text-sm font-semibold uppercase" style={{ color: C.textDim, letterSpacing: "0.08em" }}>
            {title}
          </h3>
        </div>
        {copy && <CopyBtn text={copy} />}
      </div>
      {children}
    </div>
  );
}

// ── Animated scouting state ─────────────────────────────────────────────────
const SCOUT_LINES = [
  "Pinpointing the location…",
  "Digging up the good facts…",
  "Reading the light and the crowds…",
  "Writing your script…",
  "Packing the shot list…",
];

function ScoutingAnimation() {
  const [line, setLine] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setLine((l) => (l + 1) % SCOUT_LINES.length), 1400);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{ marginTop: 28, background: C.card, borderRadius: 16, border: `1px solid ${C.line}`, padding: "44px 24px", textAlign: "center" }}>
      {/* Radar sweep */}
      <div style={{ position: "relative", width: 120, height: 120, margin: "0 auto 22px" }}>
        <div className="scout-ring" style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `1px solid ${C.line}` }} />
        <div className="scout-ring" style={{ position: "absolute", inset: 18, borderRadius: "50%", border: `1px solid ${C.line}` }} />
        <div className="scout-ring" style={{ position: "absolute", inset: 36, borderRadius: "50%", border: `1px solid ${C.line}` }} />
        <div className="scout-sweep" style={{ position: "absolute", inset: 0, borderRadius: "50%" }} />
        <div className="scout-ping" style={{ position: "absolute", top: "30%", left: "62%", width: 8, height: 8, borderRadius: "50%", background: C.gold }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: C.gold }}>
          <Compass size={26} className="scout-compass" />
        </div>
      </div>
      <div style={{ color: C.text, fontSize: 17, fontWeight: 600, fontFamily: "Georgia, serif" }}>Scouting the location</div>
      <div key={line} className="scout-fade" style={{ color: C.textDim, fontSize: 14, marginTop: 6, fontStyle: "italic", minHeight: 20 }}>
        {SCOUT_LINES[line]}
      </div>
    </div>
  );
}

export default function VlogScout() {
  const [location, setLocation] = useState("");
  const [vibe, setVibe] = useState("casual");
  const [length, setLength] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pack, setPack] = useState(null);
  const resultRef = useRef(null);

  async function run() {
    if (!location.trim()) return;
    setLoading(true);
    setError("");
    setPack(null);
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    try {
      const result = await generatePrep(location.trim(), vibe, length);
      setPack(result);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch (e) {
      setError("Couldn't build the prep pack — try again, or tweak the location name.");
    } finally {
      setLoading(false);
    }
  }

  const fullScript = pack ? `${pack.script.hook}\n\n${pack.script.body}\n\n${pack.script.signoff}` : "";

  function printPack() {
    if (!pack) return;
    const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const li = (arr) => (arr || []).map((x) => `<li>${esc(x)}</li>`).join("");
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${esc(pack.place)} — Vlog Prep</title>
      <style>
        body { font-family: Georgia, 'Times New Roman', serif; color:#222; max-width:720px; margin:24px auto; padding:0 24px; line-height:1.6; }
        h1 { font-size:24px; margin:0 0 2px; }
        .one { font-style:italic; color:#555; margin:0 0 18px; }
        h2 { font-size:12px; text-transform:uppercase; letter-spacing:.08em; color:#8a6d3b; border-bottom:1px solid #ddd; padding-bottom:3px; margin:18px 0 8px; }
        ul { margin:4px 0; padding-left:20px; }
        li { margin-bottom:3px; }
        .meta { display:flex; gap:24px; margin:8px 0; }
        .meta div { flex:1; }
        .label { font-weight:bold; }
        .script p { margin:4px 0 12px; }
        .tag { font-size:11px; font-weight:bold; letter-spacing:.06em; color:#8a6d3b; }
        .check { list-style:none; padding-left:0; }
        .check li:before { content:"\\2610  "; }
        .foot { margin-top:28px; padding-top:10px; border-top:1px solid #ddd; font-size:11px; color:#999; text-align:center; }
        @media print { body { margin:0; } }
      </style></head><body>
      <h1>${esc(pack.place)}</h1>
      <p class="one">${esc(pack.oneLiner)}</p>
      <h2>Worth knowing</h2><ul>${li(pack.facts)}</ul>
      <div class="meta">
        <div><span class="label">Best time to film:</span> ${esc(pack.bestTime)}</div>
        <div><span class="label">Local etiquette:</span> ${esc(pack.etiquette)}</div>
      </div>
      <h2>Script</h2><div class="script">
        <div class="tag">HOOK</div><p>${esc(pack.script.hook)}</p>
        <div class="tag">BODY</div><p>${esc(pack.script.body)}</p>
        <div class="tag">SIGN-OFF</div><p>${esc(pack.script.signoff)}</p>
      </div>
      <h2>Shot list</h2><ul class="check">${li(pack.shotList)}</ul>
      <h2>Gear &amp; prep</h2><ul class="check">${li(pack.gear)}</ul>
      <h2>Captions</h2><ul>${li(pack.captions)}</ul>
      <div class="foot">Vlog Scout — Developed by Kerry Marion</div>
      </body></html>`;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 350);
  }

  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: "Georgia, 'Times New Roman', serif", position: "relative", overflow: "hidden" }}>
      {/* Faint travel / vlogging background motifs */}
      <div aria-hidden="true" style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, opacity: 0.8 }}>
        <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
          <defs>
            <pattern id="dots" width="34" height="34" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill={C.line} opacity="0.4" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
        {/* compass — top right */}
        <svg viewBox="0 0 100 100" style={{ position: "absolute", top: "4%", right: "-3%", width: 220, height: 220, opacity: 0.11 }}>
          <circle cx="50" cy="50" r="46" fill="none" stroke={C.gold} strokeWidth="1.5" />
          <circle cx="50" cy="50" r="38" fill="none" stroke={C.gold} strokeWidth="0.6" />
          <polygon points="50,16 56,50 50,84 44,50" fill={C.gold} />
          <circle cx="50" cy="50" r="3" fill={C.gold} />
          <text x="50" y="12" fill={C.gold} fontSize="7" textAnchor="middle" fontFamily="Georgia">N</text>
        </svg>
        {/* camera — left mid */}
        <svg viewBox="0 0 120 90" style={{ position: "absolute", top: "34%", left: "-4%", width: 200, height: 150, opacity: 0.095 }}>
          <rect x="8" y="22" width="104" height="60" rx="8" fill="none" stroke={C.green} strokeWidth="2" />
          <rect x="40" y="12" width="34" height="14" rx="3" fill="none" stroke={C.green} strokeWidth="2" />
          <circle cx="60" cy="52" r="18" fill="none" stroke={C.green} strokeWidth="2" />
          <circle cx="60" cy="52" r="9" fill="none" stroke={C.green} strokeWidth="1.5" />
          <circle cx="96" cy="34" r="3" fill={C.green} />
        </svg>
        {/* film strip — bottom right */}
        <svg viewBox="0 0 160 60" style={{ position: "absolute", bottom: "8%", right: "2%", width: 260, height: 100, opacity: 0.095, transform: "rotate(-12deg)" }}>
          <rect x="2" y="8" width="156" height="44" rx="3" fill="none" stroke={C.red} strokeWidth="2" />
          {[14, 40, 66, 92, 118, 144].map((x) => (
            <g key={x}>
              <rect x={x - 5} y="11" width="10" height="6" fill={C.red} opacity="0.7" />
              <rect x={x - 5} y="43" width="10" height="6" fill={C.red} opacity="0.7" />
            </g>
          ))}
        </svg>
        {/* location pin — mid right */}
        <svg viewBox="0 0 60 80" style={{ position: "absolute", top: "60%", right: "10%", width: 90, height: 120, opacity: 0.1 }}>
          <path d="M30 4 C14 4 4 16 4 30 C4 50 30 76 30 76 C30 76 56 50 56 30 C56 16 46 4 30 4 Z" fill="none" stroke={C.gold} strokeWidth="2.5" />
          <circle cx="30" cy="29" r="9" fill="none" stroke={C.gold} strokeWidth="2.5" />
        </svg>
        {/* paper plane — top left */}
        <svg viewBox="0 0 80 70" style={{ position: "absolute", top: "12%", left: "8%", width: 120, height: 105, opacity: 0.095 }}>
          <path d="M4 34 L76 6 L46 64 L38 42 Z" fill="none" stroke={C.green} strokeWidth="2" strokeLinejoin="round" />
          <path d="M38 42 L76 6" fill="none" stroke={C.green} strokeWidth="1.2" />
        </svg>
      </div>

      <style>{`
        @keyframes fadeUp { from { opacity:0; transform: translateY(12px);} to {opacity:1; transform:none;} }
        .fade-up { animation: fadeUp .5s ease both; }
        .scout-fade { animation: fadeUp .4s ease both; }
        input::placeholder { color:${C.textFaint}; }
        @keyframes sweep { to { transform: rotate(360deg); } }
        .scout-sweep { background: conic-gradient(from 0deg, transparent 0deg, ${C.gold}33 40deg, transparent 80deg); animation: sweep 2s linear infinite; }
        @keyframes ringPulse { 0%,100% { opacity:.5; } 50% { opacity:1; } }
        .scout-ring { animation: ringPulse 2s ease-in-out infinite; }
        @keyframes ping { 0% { transform: scale(.6); opacity:1; } 70%,100% { transform: scale(2.4); opacity:0; } }
        .scout-ping { animation: ping 1.6s ease-out infinite; box-shadow: 0 0 0 2px ${C.gold}66; }
        @keyframes bob { 0%,100% { transform: translateY(0) rotate(-6deg);} 50% { transform: translateY(-3px) rotate(6deg);} }
        .scout-compass { animation: bob 2.4s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .scout-sweep, .scout-ring, .scout-ping, .scout-compass { animation: none; }
        }
      `}</style>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 20px 56px", position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3" style={{ background: C.greenDeep, color: C.text, fontSize: 11, letterSpacing: "0.18em" }}>
            <Camera size={13} /> FIELD KIT
          </div>
          <h1 style={{ fontSize: 38, color: C.text, margin: 0, fontWeight: 700, letterSpacing: "-0.01em" }}>Vlog Scout</h1>
          <p style={{ color: C.textDim, marginTop: 8, fontSize: 15, fontStyle: "italic" }}>Research the place. Write the script. Shoot it cold.</p>
        </div>

        {/* Input card */}
        <div style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.line}`, padding: 24 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: C.textDim, textTransform: "uppercase", letterSpacing: "0.08em" }}>Where are you filming?</label>
          <div className="flex gap-2 mt-2 mb-5">
            <div className="flex items-center gap-2 flex-1 px-3 rounded-lg" style={{ border: `1px solid ${C.line}`, background: C.cardSoft }}>
              <MapPin size={18} style={{ color: C.red }} />
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && run()}
                placeholder="e.g. Fushimi Inari Shrine, Kyoto"
                style={{ flex: 1, border: "none", outline: "none", background: "transparent", padding: "12px 0", fontSize: 16, color: C.text, fontFamily: "Georgia, serif" }}
              />
            </div>
          </div>

          {/* Trip mode quick picks */}
          <div style={{ marginBottom: 20 }}>
            <div className="flex items-center gap-1.5 mb-2" style={{ fontSize: 12, fontWeight: 600, color: C.gold, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              <Plane size={13} /> Trip mode — August 2026
            </div>
            {TRIP_STOPS.map((g) => (
              <div key={g.city} style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 12, color: C.textFaint, marginBottom: 4, fontStyle: "italic" }}>{g.city}</div>
                <div className="flex flex-wrap gap-1.5">
                  {g.spots.map((s) => {
                    const on = location === s;
                    return (
                      <button key={s} onClick={() => setLocation(s)}
                        style={{ fontSize: 13, padding: "5px 11px", borderRadius: 999, cursor: "pointer",
                          border: on ? `1.5px solid ${C.green}` : `1px solid ${C.line}`,
                          background: on ? "#243029" : C.cardSoft, color: on ? C.green : C.textDim,
                          fontFamily: "Georgia, serif", transition: "all .15s" }}>
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Vibe picker */}
          <label style={{ fontSize: 13, fontWeight: 600, color: C.textDim, textTransform: "uppercase", letterSpacing: "0.08em" }}>Vibe for this spot</label>
          <div className="grid grid-cols-2 gap-2 mt-2 mb-5">
            {VIBES.map((v) => {
              const on = vibe === v.id;
              return (
                <button key={v.id} onClick={() => setVibe(v.id)}
                  style={{ textAlign: "left", padding: "10px 12px", borderRadius: 10,
                    border: on ? `1.5px solid ${C.green}` : `1px solid ${C.line}`,
                    background: on ? "#243029" : C.cardSoft, cursor: "pointer", transition: "all .15s" }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: on ? C.green : C.text }}>{v.label}</div>
                  <div style={{ fontSize: 12, color: C.textFaint, marginTop: 2 }}>{v.blurb}</div>
                </button>
              );
            })}
          </div>

          {/* Length */}
          <label style={{ fontSize: 13, fontWeight: 600, color: C.textDim, textTransform: "uppercase", letterSpacing: "0.08em" }}>Clip length</label>
          <div className="flex gap-2 mt-2 mb-6">
            {LENGTHS.map((l) => {
              const on = length === l.id;
              return (
                <button key={l.id} onClick={() => setLength(l.id)}
                  style={{ flex: 1, padding: "8px 0", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer",
                    border: on ? `1.5px solid ${C.red}` : `1px solid ${C.line}`,
                    background: on ? "#2e2320" : C.cardSoft, color: on ? C.red : C.textDim, transition: "all .15s" }}>
                  {l.label}
                </button>
              );
            })}
          </div>

          <button onClick={run} disabled={loading || !location.trim()}
            style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none",
              background: loading || !location.trim() ? "#3a4038" : C.greenDeep,
              color: loading || !location.trim() ? C.textFaint : C.text, fontSize: 16, fontWeight: 700,
              cursor: loading || !location.trim() ? "default" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              fontFamily: "Georgia, serif", transition: "background .2s" }}>
            <Sparkles size={18} /> {loading ? "Scouting…" : "Build my prep pack"}
          </button>
          {error && <p style={{ color: C.red, fontSize: 14, marginTop: 12, textAlign: "center" }}>{error}</p>}
        </div>

        {/* Loading animation */}
        {loading && <div ref={resultRef}><ScoutingAnimation /></div>}

        {/* Results */}
        {pack && !loading && (
          <div ref={resultRef} className="fade-up" style={{ marginTop: 28 }}>
            <div style={{ background: C.greenDeep, color: C.text, borderRadius: 14, padding: "20px 24px", marginBottom: 20, border: `1px solid ${C.line}` }}>
              <div style={{ fontSize: 11, letterSpacing: "0.2em", opacity: 0.7 }}>NOW FILMING</div>
              <div style={{ fontSize: 26, fontWeight: 700, marginTop: 4 }}>{pack.place}</div>
              <div style={{ fontSize: 15, fontStyle: "italic", marginTop: 6, opacity: 0.92 }}>{pack.oneLiner}</div>
            </div>

            <div style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.line}`, padding: 24 }}>
              <Section icon={<Lightbulb size={17} />} title="Worth knowing" accent={C.red}>
                <ul style={{ margin: 0, paddingLeft: 18, color: C.text, fontSize: 15, lineHeight: 1.7 }}>
                  {pack.facts.map((f, i) => <li key={i} style={{ marginBottom: 4 }}>{f}</li>)}
                </ul>
              </Section>

              <div className="flex flex-wrap gap-4 mb-5">
                <div style={{ flex: "1 1 220px", background: C.cardSoft, borderRadius: 10, padding: "12px 14px" }}>
                  <div className="flex items-center gap-1.5" style={{ color: C.gold, fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    <Clock size={13} /> Best time to film
                  </div>
                  <div style={{ color: C.text, fontSize: 14, marginTop: 4, lineHeight: 1.5 }}>{pack.bestTime}</div>
                </div>
                <div style={{ flex: "1 1 220px", background: C.cardSoft, borderRadius: 10, padding: "12px 14px" }}>
                  <div className="flex items-center gap-1.5" style={{ color: C.gold, fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    <Hash size={13} /> Local etiquette
                  </div>
                  <div style={{ color: C.text, fontSize: 14, marginTop: 4, lineHeight: 1.5 }}>{pack.etiquette}</div>
                </div>
              </div>

              <Section icon={<Mic2 size={17} />} title="Your script" accent={C.green} copy={fullScript}>
                <div style={{ background: C.cardSoft, borderRadius: 10, padding: 16, borderLeft: `3px solid ${C.green}` }}>
                  <div style={{ fontSize: 11, color: C.gold, fontWeight: 600, letterSpacing: "0.08em" }}>HOOK</div>
                  <p style={{ color: C.text, fontSize: 16, lineHeight: 1.6, margin: "4px 0 14px", fontWeight: 600 }}>{pack.script.hook}</p>
                  <div style={{ fontSize: 11, color: C.gold, fontWeight: 600, letterSpacing: "0.08em" }}>BODY</div>
                  <p style={{ color: C.text, fontSize: 15, lineHeight: 1.7, margin: "4px 0 14px" }}>{pack.script.body}</p>
                  <div style={{ fontSize: 11, color: C.gold, fontWeight: 600, letterSpacing: "0.08em" }}>SIGN-OFF</div>
                  <p style={{ color: C.text, fontSize: 15, lineHeight: 1.6, margin: "4px 0 0", fontStyle: "italic" }}>{pack.script.signoff}</p>
                </div>
              </Section>

              <Section icon={<ListChecks size={17} />} title="Shot list" accent={C.red} copy={pack.shotList.map((s, i) => `${i + 1}. ${s}`).join("\n")}>
                <div className="grid gap-2">
                  {pack.shotList.map((s, i) => (
                    <label key={i} className="flex items-start gap-2" style={{ fontSize: 15, color: C.text, lineHeight: 1.5 }}>
                      <input type="checkbox" style={{ marginTop: 4, accentColor: C.green }} />
                      <span>{s}</span>
                    </label>
                  ))}
                </div>
              </Section>

              <Section icon={<Backpack size={17} />} title="Gear & prep" accent={C.gold} copy={(pack.gear || []).map((g) => `• ${g}`).join("\n")}>
                <div className="grid gap-2">
                  {(pack.gear || []).map((g, i) => (
                    <label key={i} className="flex items-start gap-2" style={{ fontSize: 15, color: C.text, lineHeight: 1.5 }}>
                      <input type="checkbox" style={{ marginTop: 4, accentColor: C.gold }} />
                      <span>{g}</span>
                    </label>
                  ))}
                </div>
              </Section>

              <Section icon={<Camera size={17} />} title="Captions" accent={C.gold}>
                <div className="grid gap-2">
                  {pack.captions.map((c, i) => (
                    <div key={i} className="flex items-start justify-between gap-3" style={{ background: C.cardSoft, borderRadius: 8, padding: "10px 12px" }}>
                      <span style={{ fontSize: 14, color: C.text, lineHeight: 1.5 }}>{c}</span>
                      <CopyBtn text={c} label="" />
                    </div>
                  ))}
                </div>
              </Section>

              <div className="flex items-center gap-4" style={{ marginTop: 8 }}>
                <button onClick={() => { setPack(null); setLocation(""); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  className="inline-flex items-center gap-2"
                  style={{ fontSize: 14, color: C.gold, background: "none", border: "none", cursor: "pointer", fontFamily: "Georgia, serif" }}>
                  <RotateCcw size={15} /> Scout another spot
                </button>
                <button onClick={printPack}
                  className="inline-flex items-center gap-2"
                  style={{ fontSize: 14, color: C.green, background: "none", border: "none", cursor: "pointer", fontFamily: "Georgia, serif" }}>
                  <Printer size={15} /> Print this pack
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer credit */}
        <div style={{ textAlign: "center", marginTop: 40, paddingTop: 20, borderTop: `1px solid ${C.line}`, color: C.textFaint, fontSize: 13, letterSpacing: "0.04em" }}>
          Developed by Kerry Marion
        </div>
      </div>
    </div>
  );
}
