import React, { useState, useRef } from "react";
import { MapPin, Camera, Mic2, Sparkles, Loader2, Copy, Check, ListChecks, Lightbulb, Clock, Hash, RotateCcw, Backpack, Plane } from "lucide-react";

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

// ── API call ──────────────────────────────────────────────────────────────
// Calls OUR backend (/api/generate), which holds the Anthropic key server-side.
// The key is never present in this frontend code.
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

// ── Small copy button ───────────────────────────────────────────────────────
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
      style={{ borderColor: "#c9a96a", color: done ? "#3f6b3f" : "#8a6d3b" }}
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
          <h3 className="text-sm font-semibold tracking-wide uppercase" style={{ color: "#4a3f2f", letterSpacing: "0.08em" }}>
            {title}
          </h3>
        </div>
        {copy && <CopyBtn text={copy} />}
      </div>
      {children}
    </div>
  );
}

export default function VlogPrepApp() {
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

  const fullScript = pack
    ? `${pack.script.hook}\n\n${pack.script.body}\n\n${pack.script.signoff}`
    : "";

  return (
    <div style={{ background: "#f4ecdc", minHeight: "100vh", fontFamily: "Georgia, 'Times New Roman', serif" }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform: translateY(12px);} to {opacity:1; transform:none;} }
        .fade-up { animation: fadeUp .5s ease both; }
        .ticket-edge { background-image: radial-gradient(circle at 6px 50%, transparent 5px, #f4ecdc 5px); background-size: 12px 12px; background-repeat: repeat-y; }
        input::placeholder { color:#b09a72; }
      `}</style>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 20px 80px" }}>
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3" style={{ background: "#2c4a3b", color: "#f4ecdc", fontSize: 11, letterSpacing: "0.18em", fontFamily: "Georgia, serif" }}>
            <Camera size={13} /> FIELD KIT
          </div>
          <h1 style={{ fontSize: 38, color: "#2c2118", margin: 0, fontWeight: 700, letterSpacing: "-0.01em" }}>
            Vlog Scout
          </h1>
          <p style={{ color: "#6b5b43", marginTop: 8, fontSize: 15, fontStyle: "italic" }}>
            Research the place. Write the script. Shoot it cold.
          </p>
        </div>

        {/* Input card */}
        <div style={{ background: "#fffdf7", borderRadius: 16, border: "1px solid #e4d4ab", boxShadow: "0 8px 24px rgba(80,60,20,0.08)", padding: 24 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "#4a3f2f", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Where are you filming?
          </label>
          <div className="flex gap-2 mt-2 mb-5">
            <div className="flex items-center gap-2 flex-1 px-3 rounded-lg" style={{ border: "1px solid #d8c39a", background: "#fff" }}>
              <MapPin size={18} style={{ color: "#c0392b" }} />
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && run()}
                placeholder="e.g. Fushimi Inari Shrine, Kyoto"
                style={{ flex: 1, border: "none", outline: "none", background: "transparent", padding: "12px 0", fontSize: 16, color: "#2c2118", fontFamily: "Georgia, serif" }}
              />
            </div>
          </div>

          {/* Trip mode quick picks */}
          <div style={{ marginBottom: 20 }}>
            <div className="flex items-center gap-1.5 mb-2" style={{ fontSize: 12, fontWeight: 600, color: "#8a6d3b", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              <Plane size={13} /> Trip mode — August 2026
            </div>
            {TRIP_STOPS.map((g) => (
              <div key={g.city} style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 12, color: "#a08a63", marginBottom: 4, fontStyle: "italic" }}>{g.city}</div>
                <div className="flex flex-wrap gap-1.5">
                  {g.spots.map((s) => (
                    <button
                      key={s}
                      onClick={() => setLocation(s)}
                      style={{
                        fontSize: 13, padding: "5px 11px", borderRadius: 999, cursor: "pointer",
                        border: location === s ? "1.5px solid #2c4a3b" : "1px solid #e0cfa6",
                        background: location === s ? "#eaf0e9" : "#fff",
                        color: location === s ? "#2c4a3b" : "#6b5b43",
                        fontFamily: "Georgia, serif", transition: "all .15s",
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Vibe picker */}
          <label style={{ fontSize: 13, fontWeight: 600, color: "#4a3f2f", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Vibe for this spot
          </label>
          <div className="grid grid-cols-2 gap-2 mt-2 mb-5">
            {VIBES.map((v) => {
              const on = vibe === v.id;
              return (
                <button
                  key={v.id}
                  onClick={() => setVibe(v.id)}
                  style={{
                    textAlign: "left", padding: "10px 12px", borderRadius: 10,
                    border: on ? "1.5px solid #2c4a3b" : "1px solid #e0cfa6",
                    background: on ? "#eaf0e9" : "#fff", cursor: "pointer", transition: "all .15s",
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: 14, color: on ? "#2c4a3b" : "#3a2f22" }}>{v.label}</div>
                  <div style={{ fontSize: 12, color: "#8a7a5e", marginTop: 2 }}>{v.blurb}</div>
                </button>
              );
            })}
          </div>

          {/* Length */}
          <label style={{ fontSize: 13, fontWeight: 600, color: "#4a3f2f", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Clip length
          </label>
          <div className="flex gap-2 mt-2 mb-6">
            {LENGTHS.map((l) => {
              const on = length === l.id;
              return (
                <button
                  key={l.id}
                  onClick={() => setLength(l.id)}
                  style={{
                    flex: 1, padding: "8px 0", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer",
                    border: on ? "1.5px solid #c0392b" : "1px solid #e0cfa6",
                    background: on ? "#fbeae7" : "#fff", color: on ? "#c0392b" : "#6b5b43", transition: "all .15s",
                  }}
                >
                  {l.label}
                </button>
              );
            })}
          </div>

          <button
            onClick={run}
            disabled={loading || !location.trim()}
            style={{
              width: "100%", padding: "14px", borderRadius: 12, border: "none",
              background: loading || !location.trim() ? "#b9a987" : "#2c4a3b",
              color: "#f4ecdc", fontSize: 16, fontWeight: 700, cursor: loading || !location.trim() ? "default" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "Georgia, serif",
              transition: "background .2s",
            }}
          >
            {loading ? <><Loader2 size={18} className="animate-spin" /> Scouting…</> : <><Sparkles size={18} /> Build my prep pack</>}
          </button>
          {error && <p style={{ color: "#c0392b", fontSize: 14, marginTop: 12, textAlign: "center" }}>{error}</p>}
        </div>

        {/* Results */}
        {pack && (
          <div ref={resultRef} className="fade-up" style={{ marginTop: 28 }}>
            {/* Place banner */}
            <div className="ticket-edge" style={{ background: "#2c4a3b", color: "#f4ecdc", borderRadius: 14, padding: "20px 24px 20px 30px", marginBottom: 20 }}>
              <div style={{ fontSize: 11, letterSpacing: "0.2em", opacity: 0.7 }}>NOW FILMING</div>
              <div style={{ fontSize: 26, fontWeight: 700, marginTop: 4 }}>{pack.place}</div>
              <div style={{ fontSize: 15, fontStyle: "italic", marginTop: 6, opacity: 0.92 }}>{pack.oneLiner}</div>
            </div>

            <div style={{ background: "#fffdf7", borderRadius: 16, border: "1px solid #e4d4ab", padding: 24 }}>
              <Section icon={<Lightbulb size={17} />} title="Worth knowing" accent="#c0392b">
                <ul style={{ margin: 0, paddingLeft: 18, color: "#3a2f22", fontSize: 15, lineHeight: 1.7 }}>
                  {pack.facts.map((f, i) => <li key={i} style={{ marginBottom: 4 }}>{f}</li>)}
                </ul>
              </Section>

              <div className="flex flex-wrap gap-4 mb-5">
                <div style={{ flex: "1 1 220px", background: "#f7f1e3", borderRadius: 10, padding: "12px 14px" }}>
                  <div className="flex items-center gap-1.5" style={{ color: "#8a6d3b", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    <Clock size={13} /> Best time to film
                  </div>
                  <div style={{ color: "#3a2f22", fontSize: 14, marginTop: 4, lineHeight: 1.5 }}>{pack.bestTime}</div>
                </div>
                <div style={{ flex: "1 1 220px", background: "#f7f1e3", borderRadius: 10, padding: "12px 14px" }}>
                  <div className="flex items-center gap-1.5" style={{ color: "#8a6d3b", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    <Hash size={13} /> Local etiquette
                  </div>
                  <div style={{ color: "#3a2f22", fontSize: 14, marginTop: 4, lineHeight: 1.5 }}>{pack.etiquette}</div>
                </div>
              </div>

              {/* Script */}
              <Section icon={<Mic2 size={17} />} title="Your script" accent="#2c4a3b" copy={fullScript}>
                <div style={{ background: "#f7f1e3", borderRadius: 10, padding: 16, borderLeft: "3px solid #2c4a3b" }}>
                  <div style={{ fontSize: 11, color: "#8a6d3b", fontWeight: 600, letterSpacing: "0.08em" }}>HOOK</div>
                  <p style={{ color: "#2c2118", fontSize: 16, lineHeight: 1.6, margin: "4px 0 14px", fontWeight: 600 }}>{pack.script.hook}</p>
                  <div style={{ fontSize: 11, color: "#8a6d3b", fontWeight: 600, letterSpacing: "0.08em" }}>BODY</div>
                  <p style={{ color: "#3a2f22", fontSize: 15, lineHeight: 1.7, margin: "4px 0 14px" }}>{pack.script.body}</p>
                  <div style={{ fontSize: 11, color: "#8a6d3b", fontWeight: 600, letterSpacing: "0.08em" }}>SIGN-OFF</div>
                  <p style={{ color: "#2c2118", fontSize: 15, lineHeight: 1.6, margin: "4px 0 0", fontStyle: "italic" }}>{pack.script.signoff}</p>
                </div>
              </Section>

              {/* Shot list */}
              <Section icon={<ListChecks size={17} />} title="Shot list" accent="#c0392b" copy={pack.shotList.map((s, i) => `${i + 1}. ${s}`).join("\n")}>
                <div className="grid gap-2">
                  {pack.shotList.map((s, i) => (
                    <label key={i} className="flex items-start gap-2" style={{ fontSize: 15, color: "#3a2f22", lineHeight: 1.5 }}>
                      <input type="checkbox" style={{ marginTop: 4, accentColor: "#2c4a3b" }} />
                      <span>{s}</span>
                    </label>
                  ))}
                </div>
              </Section>

              {/* Gear reminders */}
              <Section icon={<Backpack size={17} />} title="Gear & prep" accent="#8a6d3b" copy={(pack.gear || []).map((g, i) => `• ${g}`).join("\n")}>
                <div className="grid gap-2">
                  {(pack.gear || []).map((g, i) => (
                    <label key={i} className="flex items-start gap-2" style={{ fontSize: 15, color: "#3a2f22", lineHeight: 1.5 }}>
                      <input type="checkbox" style={{ marginTop: 4, accentColor: "#8a6d3b" }} />
                      <span>{g}</span>
                    </label>
                  ))}
                </div>
              </Section>

              {/* Captions */}
              <Section icon={<Camera size={17} />} title="Captions" accent="#8a6d3b">
                <div className="grid gap-2">
                  {pack.captions.map((c, i) => (
                    <div key={i} className="flex items-start justify-between gap-3" style={{ background: "#f7f1e3", borderRadius: 8, padding: "10px 12px" }}>
                      <span style={{ fontSize: 14, color: "#3a2f22", lineHeight: 1.5 }}>{c}</span>
                      <CopyBtn text={c} label="" />
                    </div>
                  ))}
                </div>
              </Section>

              <button
                onClick={() => { setPack(null); setLocation(""); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className="inline-flex items-center gap-2"
                style={{ marginTop: 8, fontSize: 14, color: "#8a6d3b", background: "none", border: "none", cursor: "pointer", fontFamily: "Georgia, serif" }}
              >
                <RotateCcw size={15} /> Scout another spot
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
