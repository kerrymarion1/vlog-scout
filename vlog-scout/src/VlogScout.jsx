import React, { useState, useRef, useEffect } from "react";
import { MapPin, Camera, Mic2, Sparkles, Copy, Check, ListChecks, Lightbulb, Clock, Hash, RotateCcw, Backpack, Plane, Compass, Printer, Bookmark, BookmarkCheck, Download, Shuffle, Trash2, FolderOpen, X, Play, Pause, Square, Volume2, Calendar, CalendarPlus, ChevronRight, CheckCircle2, Circle } from "lucide-react";

// ── Trip mode: Osaka–Kyoto–Cebu stops as quick picks ────────────────────────
const TRIP_STOPS = [
  { city: "Osaka", spots: ["Dotonbori", "Kuromon Ichiba Market", "Osaka Castle", "Umeda Sky Building"] },
  { city: "Kyoto", spots: ["Fushimi Inari Shrine", "Arashiyama Bamboo Grove", "Kiyomizu-dera", "Gion district"] },
  { city: "Nara", spots: ["Nara Deer Park", "Todai-ji Temple"] },
  { city: "Cebu", spots: ["Kawasan Falls", "Oslob whale sharks", "Mactan island hopping", "Cebu Bay sunset cruise"] },
];

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

// ── Expedition-journal palette ──────────────────────────────────────────────
const C = {
  bg: "#10130f",          // deep field green-black
  bg2: "#161a13",
  card: "#1d2119",        // aged card
  cardSoft: "#252a1f",
  line: "#3a4031",
  lineSoft: "#2c3225",
  text: "#ece4d2",        // warm parchment text
  textDim: "#a8a288",
  textFaint: "#73705c",
  gold: "#cfa349",        // brass
  goldBright: "#e6bf67",
  green: "#7faa6e",       // field sage
  red: "#cc6b4a",         // expedition orange-red
  ink: "#2c3320",
  stamp: "#b8553a",       // rubber-stamp red
};

const FONT_DISPLAY = "'Cinzel', Georgia, serif";
const FONT_TYPE = "'Special Elite', 'Courier New', monospace";
const FONT_BODY = "'Fraunces', Georgia, serif";

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

function CopyBtn({ text, label }) {
  const [done, setDone] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard?.writeText(text); setDone(true); setTimeout(() => setDone(false), 1400); }}
      className="vs-chip inline-flex items-center gap-1.5"
      style={{ fontSize: 11, fontFamily: FONT_TYPE, padding: "4px 11px", borderRadius: 3, border: `1px solid ${C.line}`, color: done ? C.green : C.gold, background: "transparent", cursor: "pointer", letterSpacing: "0.04em" }}>
      {done ? <Check size={12} /> : <Copy size={12} />}
      {done ? "COPIED" : (label || "COPY")}
    </button>
  );
}

function Section({ icon, title, accent, children, copy, delay = 0 }) {
  return (
    <div className="vs-reveal" style={{ marginBottom: 22, animationDelay: `${delay}ms` }}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span style={{ color: accent }}>{icon}</span>
          <h3 style={{ fontSize: 12, fontFamily: FONT_TYPE, color: C.textDim, letterSpacing: "0.16em", textTransform: "uppercase", margin: 0 }}>{title}</h3>
          <span style={{ flex: 1, height: 1 }} />
        </div>
        {copy && <CopyBtn text={copy} />}
      </div>
      {children}
    </div>
  );
}

const SCOUT_LINES = ["Pinpointing the location…", "Digging up the good facts…", "Reading the light and the crowds…", "Drafting your script…", "Packing the shot list…"];

function ScoutingAnimation() {
  const [line, setLine] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setLine((l) => (l + 1) % SCOUT_LINES.length), 1400);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{ marginTop: 26, background: C.card, borderRadius: 6, border: `1px solid ${C.line}`, padding: "46px 24px", textAlign: "center", position: "relative", boxShadow: "0 18px 40px rgba(0,0,0,.35)" }}>
      <div style={{ position: "absolute", inset: 6, border: `1px dashed ${C.lineSoft}`, borderRadius: 4, pointerEvents: "none" }} />
      <div style={{ position: "relative", width: 124, height: 124, margin: "0 auto 22px" }}>
        <div className="scout-ring" style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `1px solid ${C.line}` }} />
        <div className="scout-ring" style={{ position: "absolute", inset: 18, borderRadius: "50%", border: `1px solid ${C.line}` }} />
        <div className="scout-ring" style={{ position: "absolute", inset: 36, borderRadius: "50%", border: `1px solid ${C.line}` }} />
        <div className="scout-sweep" style={{ position: "absolute", inset: 0, borderRadius: "50%" }} />
        <div className="scout-ping" style={{ position: "absolute", top: "30%", left: "62%", width: 8, height: 8, borderRadius: "50%", background: C.gold }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: C.gold }}>
          <Compass size={28} className="scout-compass" />
        </div>
      </div>
      <div style={{ color: C.text, fontSize: 16, fontFamily: FONT_TYPE, letterSpacing: "0.08em" }}>SCOUTING THE LOCATION</div>
      <div key={line} className="scout-fade" style={{ color: C.textDim, fontSize: 15, marginTop: 8, fontFamily: FONT_BODY, fontStyle: "italic", minHeight: 22 }}>{SCOUT_LINES[line]}</div>
    </div>
  );
}

// ── ScriptReader: built-in speech-synth voice mode ─────────────────────────
function ScriptReader({ text }) {
  const [state, setState] = useState("idle"); // idle | playing | paused
  const [rate, setRate] = useState(1);        // 0.85 / 1 / 1.2
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;
  const uttRef = useRef(null);

  // Stop any in-flight reading when the script changes or the component unmounts
  useEffect(() => {
    return () => { if (supported) window.speechSynthesis.cancel(); };
  }, [text, supported]);

  function play() {
    if (!supported || !text) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = rate;
    u.pitch = 1;
    u.onend = () => setState("idle");
    u.onerror = () => setState("idle");
    uttRef.current = u;
    window.speechSynthesis.speak(u);
    setState("playing");
  }
  function pause() { if (!supported) return; window.speechSynthesis.pause(); setState("paused"); }
  function resume() { if (!supported) return; window.speechSynthesis.resume(); setState("playing"); }
  function stop() { if (!supported) return; window.speechSynthesis.cancel(); setState("idle"); }
  function setSpeed(r) {
    setRate(r);
    if (state !== "idle") { stop(); setTimeout(() => { setRate(r); play(); }, 50); }
  }

  if (!supported) return null;

  const speeds = [
    { id: 0.85, label: "Slow" },
    { id: 1,    label: "Natural" },
    { id: 1.2,  label: "Quick" },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 mb-3" style={{ paddingBottom: 12, borderBottom: `1px dashed ${C.lineSoft}` }}>
      <span className="inline-flex items-center gap-1.5" style={{ fontSize: 11, fontFamily: FONT_TYPE, color: C.gold, letterSpacing: "0.08em" }}>
        <Volume2 size={13} /> READ ALOUD
      </span>
      {state === "idle" && (
        <button onClick={play} className="vs-chip inline-flex items-center gap-1.5"
          style={{ fontSize: 11, fontFamily: FONT_TYPE, color: C.green, background: "transparent", border: `1px solid ${C.green}`, borderRadius: 999, padding: "4px 11px", cursor: "pointer", letterSpacing: "0.05em" }}>
          <Play size={11} /> PLAY
        </button>
      )}
      {state === "playing" && (
        <>
          <button onClick={pause} className="vs-chip inline-flex items-center gap-1.5"
            style={{ fontSize: 11, fontFamily: FONT_TYPE, color: C.gold, background: "transparent", border: `1px solid ${C.gold}`, borderRadius: 999, padding: "4px 11px", cursor: "pointer", letterSpacing: "0.05em" }}>
            <Pause size={11} /> PAUSE
          </button>
          <button onClick={stop} className="vs-chip inline-flex items-center gap-1.5"
            style={{ fontSize: 11, fontFamily: FONT_TYPE, color: C.textDim, background: "transparent", border: `1px solid ${C.line}`, borderRadius: 999, padding: "4px 11px", cursor: "pointer", letterSpacing: "0.05em" }}>
            <Square size={10} /> STOP
          </button>
        </>
      )}
      {state === "paused" && (
        <>
          <button onClick={resume} className="vs-chip inline-flex items-center gap-1.5"
            style={{ fontSize: 11, fontFamily: FONT_TYPE, color: C.green, background: "transparent", border: `1px solid ${C.green}`, borderRadius: 999, padding: "4px 11px", cursor: "pointer", letterSpacing: "0.05em" }}>
            <Play size={11} /> RESUME
          </button>
          <button onClick={stop} className="vs-chip inline-flex items-center gap-1.5"
            style={{ fontSize: 11, fontFamily: FONT_TYPE, color: C.textDim, background: "transparent", border: `1px solid ${C.line}`, borderRadius: 999, padding: "4px 11px", cursor: "pointer", letterSpacing: "0.05em" }}>
            <Square size={10} /> STOP
          </button>
        </>
      )}
      <span style={{ flex: 1 }} />
      <div className="flex items-center gap-1">
        {speeds.map((s) => {
          const on = rate === s.id;
          return (
            <button key={s.id} onClick={() => setSpeed(s.id)}
              style={{ fontSize: 10, fontFamily: FONT_TYPE, padding: "3px 9px", borderRadius: 999, cursor: "pointer", letterSpacing: "0.06em",
                border: on ? `1px solid ${C.gold}` : `1px solid ${C.lineSoft}`, background: on ? "#2a2418" : "transparent", color: on ? C.gold : C.textDim }}>
              {s.label.toUpperCase()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function VlogScout() {
  const [location, setLocation] = useState("");
  const [vibe, setVibe] = useState("casual");
  const [length, setLength] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [rerolling, setRerolling] = useState(false);
  const [error, setError] = useState("");
  const [pack, setPack] = useState(null);
  const [saved, setSaved] = useState([]);
  const [showSaved, setShowSaved] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  // Itinerary state
  const [view, setView] = useState("scout"); // "scout" | "itinerary"
  const [itinerary, setItinerary] = useState([]); // [{ id, date, city, spots: [{ id, name, done }] }]
  const [pickerDayId, setPickerDayId] = useState(null); // day awaiting a spot pick from saved list
  const resultRef = useRef(null);
  const STORAGE_KEY = "vlogScoutSavedPacks";
  const ITIN_KEY = "vlogScoutItinerary";

  useEffect(() => {
    try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) setSaved(JSON.parse(raw)); } catch {}
    try { const raw2 = localStorage.getItem(ITIN_KEY); if (raw2) setItinerary(JSON.parse(raw2)); } catch {}
  }, []);

  function persist(list) { setSaved(list); try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch {} }
  function persistItin(list) { setItinerary(list); try { localStorage.setItem(ITIN_KEY, JSON.stringify(list)); } catch {} }

  // Itinerary helpers
  function addDay() {
    const lastDate = itinerary.length ? new Date(itinerary[itinerary.length - 1].date) : new Date("2026-08-12");
    const next = new Date(lastDate); if (itinerary.length) next.setDate(next.getDate() + 1);
    const iso = next.toISOString().slice(0, 10);
    persistItin([...itinerary, { id: Date.now(), date: iso, city: "", spots: [] }]);
  }
  function updateDay(id, patch) { persistItin(itinerary.map((d) => d.id === id ? { ...d, ...patch } : d)); }
  function deleteDay(id) { persistItin(itinerary.filter((d) => d.id !== id)); }
  function addSpotToDay(dayId, spotName) {
    persistItin(itinerary.map((d) => d.id === dayId ? { ...d, spots: [...d.spots, { id: Date.now(), name: spotName, done: false }] } : d));
    setPickerDayId(null);
  }
  function toggleSpotDone(dayId, spotId) {
    persistItin(itinerary.map((d) => d.id !== dayId ? d : { ...d, spots: d.spots.map((s) => s.id === spotId ? { ...s, done: !s.done } : s) }));
  }
  function removeSpot(dayId, spotId) {
    persistItin(itinerary.map((d) => d.id !== dayId ? d : { ...d, spots: d.spots.filter((s) => s.id !== spotId) }));
  }
  function openSpotFromItinerary(spotName) {
    const matched = saved.find((p) => p.place === spotName);
    if (matched) { openSaved(matched); setView("scout"); }
    else { setLocation(spotName); setView("scout"); setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100); }
  }
  function formatDate(iso) {
    if (!iso) return "";
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  }

  function savePack() {
    if (!pack) return;
    const entry = { ...pack, _id: Date.now(), _vibe: vibe, _length: length, _savedAt: new Date().toISOString() };
    persist([entry, ...saved.filter((p) => p.place !== entry.place)]);
    setJustSaved(true); setTimeout(() => setJustSaved(false), 1600);
  }
  function deleteSaved(id) { persist(saved.filter((p) => p._id !== id)); }
  function openSaved(p) {
    setPack(p); setVibe(p._vibe || "casual"); setLength(p._length || "medium"); setLocation(p.place || ""); setShowSaved(false);
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  }

  async function run() {
    if (!location.trim()) return;
    setLoading(true); setError(""); setPack(null);
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    try {
      const result = await generatePrep(location.trim(), vibe, length);
      setPack(result);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch (e) { setError("Couldn't build the prep pack — try again, or tweak the location name."); }
    finally { setLoading(false); }
  }

  async function reroll() {
    if (!pack) return;
    setRerolling(true); setError("");
    try { const result = await generatePrep(pack.place, vibe, length); setPack((prev) => ({ ...result, place: prev.place })); }
    catch (e) { setError("Couldn't re-roll — try again."); }
    finally { setRerolling(false); }
  }

  const fullScript = pack ? `${pack.script.hook}\n\n${pack.script.body}\n\n${pack.script.signoff}` : "";
  const readTime = (() => {
    if (!pack) return "";
    const words = fullScript.trim().split(/\s+/).length;
    return `~${Math.round((words / 150) * 60)}s read`;
  })();

  function packAsText(p = pack) {
    if (!p) return "";
    return [p.place, p.oneLiner, "", "WORTH KNOWING", ...(p.facts || []).map((f) => `- ${f}`), "",
      `BEST TIME: ${p.bestTime}`, `ETIQUETTE: ${p.etiquette}`, "", "SCRIPT", p.script.hook, "", p.script.body, "", p.script.signoff,
      "", "SHOT LIST", ...(p.shotList || []).map((s, i) => `${i + 1}. ${s}`), "", "GEAR & PREP", ...(p.gear || []).map((g) => `- ${g}`),
      "", "CAPTIONS", ...(p.captions || []).map((c) => `- ${c}`)].join("\n");
  }
  function copyAll() { navigator.clipboard?.writeText(packAsText()); setCopiedAll(true); setTimeout(() => setCopiedAll(false), 1600); }

  function printPack() {
    if (!pack) return;
    const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const li = (arr) => (arr || []).map((x) => `<li>${esc(x)}</li>`).join("");
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${esc(pack.place)} — Vlog Prep</title>
      <style>body{font-family:Georgia,serif;color:#222;max-width:720px;margin:24px auto;padding:0 24px;line-height:1.6}
      h1{font-size:24px;margin:0 0 2px}.one{font-style:italic;color:#555;margin:0 0 18px}
      h2{font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:#8a6d3b;border-bottom:1px solid #ddd;padding-bottom:3px;margin:18px 0 8px}
      ul{margin:4px 0;padding-left:20px}li{margin-bottom:3px}.meta{display:flex;gap:24px;margin:8px 0}.meta div{flex:1}
      .label{font-weight:bold}.script p{margin:4px 0 12px}.tag{font-size:11px;font-weight:bold;letter-spacing:.06em;color:#8a6d3b}
      .check{list-style:none;padding-left:0}.check li:before{content:"\\2610  "}
      .foot{margin-top:28px;padding-top:10px;border-top:1px solid #ddd;font-size:11px;color:#999;text-align:center}@media print{body{margin:0}}</style></head><body>
      <h1>${esc(pack.place)}</h1><p class="one">${esc(pack.oneLiner)}</p>
      <h2>Worth knowing</h2><ul>${li(pack.facts)}</ul>
      <div class="meta"><div><span class="label">Best time to film:</span> ${esc(pack.bestTime)}</div><div><span class="label">Local etiquette:</span> ${esc(pack.etiquette)}</div></div>
      <h2>Script</h2><div class="script"><div class="tag">HOOK</div><p>${esc(pack.script.hook)}</p><div class="tag">BODY</div><p>${esc(pack.script.body)}</p><div class="tag">SIGN-OFF</div><p>${esc(pack.script.signoff)}</p></div>
      <h2>Shot list</h2><ul class="check">${li(pack.shotList)}</ul><h2>Gear &amp; prep</h2><ul class="check">${li(pack.gear)}</ul><h2>Captions</h2><ul>${li(pack.captions)}</ul>
      <div class="foot">Vlog Scout — Developed by Kerry Marion</div></body></html>`;
    const w = window.open("", "_blank"); if (!w) return;
    w.document.write(html); w.document.close(); w.focus(); setTimeout(() => w.print(), 350);
  }

  function downloadAll() {
    const list = saved.length ? saved : (pack ? [pack] : []);
    if (!list.length) return;
    const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const li = (arr) => (arr || []).map((x) => `<li>${esc(x)}</li>`).join("");
    const sections = list.map((p) => `<article><h1>${esc(p.place)}</h1><p class="one">${esc(p.oneLiner)}</p>
      <h2>Worth knowing</h2><ul>${li(p.facts)}</ul><p><b>Best time:</b> ${esc(p.bestTime)}<br><b>Etiquette:</b> ${esc(p.etiquette)}</p>
      <h2>Script</h2><div class="tag">HOOK</div><p>${esc(p.script?.hook)}</p><div class="tag">BODY</div><p>${esc(p.script?.body)}</p><div class="tag">SIGN-OFF</div><p>${esc(p.script?.signoff)}</p>
      <h2>Shot list</h2><ul class="check">${li(p.shotList)}</ul><h2>Gear &amp; prep</h2><ul class="check">${li(p.gear)}</ul><h2>Captions</h2><ul>${li(p.captions)}</ul></article>`).join('<hr>');
    const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>My Vlog Prep — Osaka · Kyoto · Cebu</title>
      <style>body{font-family:Georgia,serif;color:#222;max-width:760px;margin:0 auto;padding:24px;line-height:1.6}
      .head{text-align:center;margin-bottom:24px}article{margin:24px 0}h1{font-size:24px;margin:0 0 2px}.one{font-style:italic;color:#555;margin:0 0 16px}
      h2{font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:#8a6d3b;border-bottom:1px solid #ddd;padding-bottom:3px;margin:16px 0 8px}
      ul{margin:4px 0;padding-left:20px}li{margin-bottom:3px}.tag{font-size:11px;font-weight:bold;letter-spacing:.06em;color:#8a6d3b}
      .check{list-style:none;padding-left:0}.check li:before{content:"\\2610  "}hr{border:none;border-top:2px dashed #ddd;margin:32px 0}
      .foot{margin-top:32px;padding-top:12px;border-top:1px solid #ddd;font-size:11px;color:#999;text-align:center}.toc{background:#f7f1e3;border-radius:8px;padding:12px 18px}@media print{body{margin:0}}</style></head><body>
      <div class="head"><div style="font-size:13px;letter-spacing:.2em;color:#8a6d3b">VLOG SCOUT · FIELD KIT</div><h1 style="border:none">My Prep Packs</h1>
      <p class="one">${list.length} location${list.length > 1 ? "s" : ""} · saved for offline use</p></div>
      <div class="toc"><b>Inside:</b> ${list.map((p) => esc(p.place)).join(" · ")}</div>${sections}
      <div class="foot">Vlog Scout — Developed by Kerry Marion</div></body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "vlog-prep-packs.html";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  const actionBtn = (onClick, icon, label, color, on) => (
    <button onClick={onClick} className="vs-action inline-flex items-center gap-2"
      style={{ fontSize: 13, fontFamily: FONT_TYPE, letterSpacing: "0.04em", color: on ? C.green : (color || C.gold), background: "none", border: "none", cursor: "pointer" }}>
      {icon} {label}
    </button>
  );

  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: FONT_BODY, position: "relative", overflow: "hidden", color: C.text }}>
      {/* Background atmosphere */}
      <div aria-hidden="true" style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% -10%, ${C.bg2}, ${C.bg} 60%)` }} />
        <div style={{ position: "absolute", inset: 0, opacity: 0.8 }}>
          <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
            <defs>
              <pattern id="dots" width="34" height="34" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill={C.line} opacity="0.4" /></pattern>
              <pattern id="grid" width="64" height="64" patternUnits="userSpaceOnUse"><path d="M64 0 H0 V64" fill="none" stroke={C.lineSoft} strokeWidth="0.5" opacity="0.5" /></pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
          <svg viewBox="0 0 100 100" style={{ position: "absolute", top: "3%", right: "-3%", width: 240, height: 240, opacity: 0.1 }}>
            <circle cx="50" cy="50" r="46" fill="none" stroke={C.gold} strokeWidth="1.2" /><circle cx="50" cy="50" r="38" fill="none" stroke={C.gold} strokeWidth="0.5" />
            {Array.from({ length: 24 }).map((_, i) => { const a = (i * 15) * Math.PI / 180, r1 = i % 2 ? 44 : 41; return <line key={i} x1={50 + 46 * Math.cos(a)} y1={50 + 46 * Math.sin(a)} x2={50 + r1 * Math.cos(a)} y2={50 + r1 * Math.sin(a)} stroke={C.gold} strokeWidth="0.5" />; })}
            <polygon points="50,16 55,50 50,84 45,50" fill={C.gold} /><circle cx="50" cy="50" r="2.5" fill={C.gold} />
          </svg>
          <svg viewBox="0 0 120 90" style={{ position: "absolute", top: "40%", left: "-4%", width: 200, height: 150, opacity: 0.08 }}>
            <rect x="8" y="22" width="104" height="60" rx="8" fill="none" stroke={C.green} strokeWidth="2" /><rect x="40" y="12" width="34" height="14" rx="3" fill="none" stroke={C.green} strokeWidth="2" />
            <circle cx="60" cy="52" r="18" fill="none" stroke={C.green} strokeWidth="2" /><circle cx="60" cy="52" r="9" fill="none" stroke={C.green} strokeWidth="1.5" /><circle cx="96" cy="34" r="3" fill={C.green} />
          </svg>
          <svg viewBox="0 0 160 60" style={{ position: "absolute", bottom: "7%", right: "1%", width: 280, height: 105, opacity: 0.08, transform: "rotate(-12deg)" }}>
            <rect x="2" y="8" width="156" height="44" rx="3" fill="none" stroke={C.red} strokeWidth="2" />
            {[14, 40, 66, 92, 118, 144].map((x) => <g key={x}><rect x={x - 5} y="11" width="10" height="6" fill={C.red} opacity="0.7" /><rect x={x - 5} y="43" width="10" height="6" fill={C.red} opacity="0.7" /></g>)}
          </svg>
          <svg viewBox="0 0 80 70" style={{ position: "absolute", top: "11%", left: "7%", width: 120, height: 105, opacity: 0.08 }}>
            <path d="M4 34 L76 6 L46 64 L38 42 Z" fill="none" stroke={C.green} strokeWidth="2" strokeLinejoin="round" /><path d="M38 42 L76 6" fill="none" stroke={C.green} strokeWidth="1.2" />
          </svg>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp { from { opacity:0; transform: translateY(14px);} to {opacity:1; transform:none;} }
        @keyframes stampIn { 0% { opacity:0; transform: scale(1.4) rotate(-14deg);} 60% { opacity:1; } 100% { opacity:1; transform: scale(1) rotate(-7deg);} }
        .vs-reveal { animation: fadeUp .5s ease both; }
        .scout-fade { animation: fadeUp .4s ease both; }
        .vs-stamp { animation: stampIn .5s cubic-bezier(.2,1.3,.5,1) both; }
        input::placeholder { color:${C.textFaint}; }
        @keyframes sweep { to { transform: rotate(360deg); } }
        .scout-sweep { background: conic-gradient(from 0deg, transparent 0deg, ${C.gold}33 40deg, transparent 80deg); animation: sweep 2s linear infinite; }
        @keyframes ringPulse { 0%,100% { opacity:.5; } 50% { opacity:1; } }
        .scout-ring { animation: ringPulse 2s ease-in-out infinite; }
        @keyframes ping { 0% { transform: scale(.6); opacity:1; } 70%,100% { transform: scale(2.4); opacity:0; } }
        .scout-ping { animation: ping 1.6s ease-out infinite; box-shadow: 0 0 0 2px ${C.gold}66; }
        @keyframes bob { 0%,100% { transform: translateY(0) rotate(-6deg);} 50% { transform: translateY(-3px) rotate(6deg);} }
        .scout-compass { animation: bob 2.4s ease-in-out infinite; }
        .vs-tile { transition: transform .15s ease, border-color .15s ease, background .15s ease, box-shadow .15s ease; }
        .vs-tile:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,.3); }
        .vs-chip { transition: all .14s ease; } .vs-chip:hover { border-color:${C.gold}; color:${C.goldBright}; transform: translateY(-1px); }
        .vs-action { transition: all .14s ease; } .vs-action:hover { filter: brightness(1.25); transform: translateY(-1px); }
        .vs-cta { transition: all .18s ease; } .vs-cta:hover:not(:disabled) { box-shadow: 0 10px 26px rgba(207,163,73,.22); transform: translateY(-1px); }
        .vs-check { appearance:none; -webkit-appearance:none; width:17px; height:17px; border:1.5px solid ${C.line}; border-radius:3px; margin-top:3px; cursor:pointer; position:relative; flex:none; transition: all .14s; background:${C.bg}; }
        .vs-check:hover { border-color:${C.gold}; }
        .vs-check:checked { background:${C.green}; border-color:${C.green}; }
        .vs-check:checked:after { content:"✓"; position:absolute; top:-2px; left:2px; color:${C.bg}; font-size:13px; font-weight:bold; }
        @media (prefers-reduced-motion: reduce) { .scout-sweep,.scout-ring,.scout-ping,.scout-compass,.vs-reveal,.vs-stamp,.scout-fade { animation:none; } }
      `}</style>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "30px 20px 56px", position: "relative", zIndex: 1 }}>
        {/* HERO HEADER */}
        <div style={{ textAlign: "center", marginBottom: 30, position: "relative" }}>
          <div className="flex items-center justify-center gap-3" style={{ marginBottom: 14 }}>
            <span style={{ flex: 1, maxWidth: 70, height: 1, background: `linear-gradient(90deg, transparent, ${C.line})` }} />
            <span style={{ fontFamily: FONT_TYPE, fontSize: 11, letterSpacing: "0.34em", color: C.gold }}>FIELD KIT №1</span>
            <span style={{ flex: 1, maxWidth: 70, height: 1, background: `linear-gradient(90deg, ${C.line}, transparent)` }} />
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 12, color: C.gold }}>
            <Compass size={30} strokeWidth={1.4} />
            <h1 style={{ fontSize: 46, fontFamily: FONT_DISPLAY, fontWeight: 700, color: C.text, margin: 0, letterSpacing: "0.04em", lineHeight: 1 }}>VLOG SCOUT</h1>
            <Camera size={30} strokeWidth={1.4} />
          </div>
          <p style={{ color: C.textDim, marginTop: 12, fontSize: 15, fontFamily: FONT_BODY, fontStyle: "italic" }}>Research the place. Write the script. Shoot it cold.</p>
          <div className="flex flex-wrap items-center justify-center gap-2" style={{ marginTop: 16 }}>
            <div className="flex" style={{ background: C.cardSoft, border: `1px solid ${C.line}`, borderRadius: 999, padding: 3 }}>
              <button onClick={() => setView("scout")} className="vs-chip inline-flex items-center gap-1.5"
                style={{ fontSize: 11, fontFamily: FONT_TYPE, color: view === "scout" ? C.ink : C.textDim, background: view === "scout" ? C.gold : "transparent", border: "none", borderRadius: 999, padding: "5px 13px", cursor: "pointer", letterSpacing: "0.08em" }}>
                <Compass size={12} /> SCOUT
              </button>
              <button onClick={() => setView("itinerary")} className="vs-chip inline-flex items-center gap-1.5"
                style={{ fontSize: 11, fontFamily: FONT_TYPE, color: view === "itinerary" ? C.ink : C.textDim, background: view === "itinerary" ? C.gold : "transparent", border: "none", borderRadius: 999, padding: "5px 13px", cursor: "pointer", letterSpacing: "0.08em" }}>
                <Calendar size={12} /> ITINERARY
              </button>
            </div>
            {saved.length > 0 && (
              <button onClick={() => setShowSaved(true)} className="vs-chip inline-flex items-center gap-2"
                style={{ fontSize: 11, fontFamily: FONT_TYPE, color: C.gold, background: "transparent", border: `1px solid ${C.line}`, borderRadius: 999, padding: "6px 13px", cursor: "pointer", letterSpacing: "0.08em" }}>
                <FolderOpen size={13} /> MY SPOTS · {saved.length}
              </button>
            )}
          </div>
        </div>

        {/* Saved panel */}
        {showSaved && (
          <div className="vs-reveal" style={{ background: C.card, borderRadius: 6, border: `1px solid ${C.line}`, padding: 20, marginBottom: 20, position: "relative", boxShadow: "0 16px 36px rgba(0,0,0,.35)" }}>
            <div style={{ position: "absolute", inset: 6, border: `1px dashed ${C.lineSoft}`, borderRadius: 4, pointerEvents: "none" }} />
            <div className="flex items-center justify-between mb-3" style={{ position: "relative" }}>
              <h3 style={{ fontSize: 13, fontFamily: FONT_TYPE, color: C.textDim, letterSpacing: "0.14em", textTransform: "uppercase", margin: 0 }}>My Scouted Spots</h3>
              <button onClick={() => setShowSaved(false)} style={{ background: "none", border: "none", color: C.textFaint, cursor: "pointer" }}><X size={18} /></button>
            </div>
            <div className="grid gap-2" style={{ position: "relative" }}>
              {saved.map((p) => (
                <div key={p._id} className="vs-tile flex items-center justify-between gap-3" style={{ background: C.cardSoft, borderRadius: 4, padding: "11px 13px", border: `1px solid ${C.lineSoft}` }}>
                  <button onClick={() => openSaved(p)} style={{ flex: 1, textAlign: "left", background: "none", border: "none", cursor: "pointer", fontFamily: FONT_BODY }}>
                    <div style={{ color: C.text, fontSize: 16, fontWeight: 600 }}>{p.place}</div>
                    <div style={{ color: C.textFaint, fontSize: 13, fontStyle: "italic" }}>{p.oneLiner}</div>
                  </button>
                  <button onClick={() => deleteSaved(p._id)} title="Remove" style={{ background: "none", border: "none", color: C.textFaint, cursor: "pointer" }}><Trash2 size={15} /></button>
                </div>
              ))}
            </div>
            <button onClick={downloadAll} className="vs-chip inline-flex items-center gap-2"
              style={{ marginTop: 14, position: "relative", fontSize: 12, fontFamily: FONT_TYPE, color: C.green, background: "transparent", border: `1px solid ${C.green}`, borderRadius: 4, padding: "9px 15px", cursor: "pointer", letterSpacing: "0.05em" }}>
              <Download size={15} /> DOWNLOAD ALL FOR OFFLINE · {saved.length}
            </button>
            <p style={{ color: C.textFaint, fontSize: 12, marginTop: 9, position: "relative", fontFamily: FONT_BODY }}>Saves one file to your device with every pack — open it anytime, no signal needed.</p>
          </div>
        )}

        {/* SCOUT VIEW */}
        {view === "scout" && (<>
        {/* INPUT CARD */}
        <div style={{ background: C.card, borderRadius: 6, border: `1px solid ${C.line}`, padding: 26, position: "relative", boxShadow: "0 18px 44px rgba(0,0,0,.4)" }}>
          <div style={{ position: "absolute", inset: 7, border: `1px dashed ${C.lineSoft}`, borderRadius: 4, pointerEvents: "none" }} />
          <div style={{ position: "relative" }}>
            <label style={{ fontSize: 12, fontFamily: FONT_TYPE, color: C.textDim, letterSpacing: "0.14em", textTransform: "uppercase" }}>Where are you filming?</label>
            <div className="flex gap-2 mt-2 mb-5">
              <div className="flex items-center gap-2 flex-1 px-3" style={{ border: `1px solid ${C.line}`, borderRadius: 4, background: C.bg }}>
                <MapPin size={18} style={{ color: C.red }} />
                <input value={location} onChange={(e) => setLocation(e.target.value)} onKeyDown={(e) => e.key === "Enter" && run()} placeholder="e.g. Fushimi Inari Shrine, Kyoto"
                  style={{ flex: 1, border: "none", outline: "none", background: "transparent", padding: "12px 0", fontSize: 16, color: C.text, fontFamily: FONT_BODY }} />
              </div>
            </div>

            <div style={{ marginBottom: 22 }}>
              <div className="flex items-center gap-1.5 mb-2" style={{ fontSize: 12, fontFamily: FONT_TYPE, color: C.gold, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                <Plane size={13} /> Trip Mode — August 2026
              </div>
              {TRIP_STOPS.map((g) => (
                <div key={g.city} style={{ marginBottom: 9 }}>
                  <div style={{ fontSize: 12, color: C.textFaint, marginBottom: 5, fontFamily: FONT_TYPE, letterSpacing: "0.08em" }}>{g.city.toUpperCase()}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {g.spots.map((s) => { const on = location === s; return (
                      <button key={s} onClick={() => setLocation(s)} className="vs-chip"
                        style={{ fontSize: 13, padding: "5px 12px", borderRadius: 999, cursor: "pointer", fontFamily: FONT_BODY,
                          border: on ? `1.5px solid ${C.green}` : `1px solid ${C.line}`, background: on ? "#222b1d" : C.bg, color: on ? C.green : C.textDim }}>{s}</button>
                    ); })}
                  </div>
                </div>
              ))}
            </div>

            <label style={{ fontSize: 12, fontFamily: FONT_TYPE, color: C.textDim, letterSpacing: "0.14em", textTransform: "uppercase" }}>Vibe for this spot</label>
            <div className="grid grid-cols-2 gap-2 mt-2 mb-5">
              {VIBES.map((v) => { const on = vibe === v.id; return (
                <button key={v.id} onClick={() => setVibe(v.id)} className="vs-tile"
                  style={{ textAlign: "left", padding: "11px 13px", borderRadius: 4, cursor: "pointer",
                    border: on ? `1.5px solid ${C.green}` : `1px solid ${C.line}`, background: on ? "#222b1d" : C.bg }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: on ? C.green : C.text, fontFamily: FONT_BODY }}>{v.label}</div>
                  <div style={{ fontSize: 12, color: C.textFaint, marginTop: 2 }}>{v.blurb}</div>
                </button>
              ); })}
            </div>

            <label style={{ fontSize: 12, fontFamily: FONT_TYPE, color: C.textDim, letterSpacing: "0.14em", textTransform: "uppercase" }}>Clip length</label>
            <div className="flex gap-2 mt-2 mb-6">
              {LENGTHS.map((l) => { const on = length === l.id; return (
                <button key={l.id} onClick={() => setLength(l.id)} className="vs-tile"
                  style={{ flex: 1, padding: "9px 0", borderRadius: 4, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: FONT_TYPE, letterSpacing: "0.05em",
                    border: on ? `1.5px solid ${C.red}` : `1px solid ${C.line}`, background: on ? "#2b2018" : C.bg, color: on ? C.red : C.textDim }}>{l.label}</button>
              ); })}
            </div>

            <button onClick={run} disabled={loading || !location.trim()} className="vs-cta"
              style={{ width: "100%", padding: "15px", borderRadius: 4, border: `1px solid ${loading || !location.trim() ? C.line : C.gold}`,
                background: loading || !location.trim() ? C.cardSoft : `linear-gradient(${C.gold}, #b88d35)`,
                color: loading || !location.trim() ? C.textFaint : C.ink, fontSize: 15, fontWeight: 600, fontFamily: FONT_TYPE, letterSpacing: "0.08em",
                cursor: loading || !location.trim() ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 9 }}>
              <Sparkles size={17} /> {loading ? "SCOUTING…" : "BUILD MY PREP PACK"}
            </button>
            {error && <p style={{ color: C.red, fontSize: 14, marginTop: 12, textAlign: "center", fontFamily: FONT_BODY }}>{error}</p>}
          </div>
        </div>

        {loading && <div ref={resultRef}><ScoutingAnimation /></div>}

        {/* RESULTS */}
        {pack && !loading && (
          <div ref={resultRef} style={{ marginTop: 26 }}>
            {/* Luggage-tag banner */}
            <div className="vs-reveal" style={{ position: "relative", background: `linear-gradient(135deg, ${C.ink}, #232a18)`, color: C.text, borderRadius: 6, padding: "22px 26px", marginBottom: 22, border: `1px solid ${C.line}`, boxShadow: "0 14px 32px rgba(0,0,0,.4)", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 14, left: 14, width: 12, height: 12, borderRadius: "50%", border: `2px solid ${C.gold}`, background: C.bg }} />
              <div style={{ position: "absolute", inset: 7, border: `1px dashed ${C.lineSoft}`, borderRadius: 4, pointerEvents: "none" }} />
              <div className="vs-stamp" style={{ position: "absolute", top: 16, right: 18, border: `2px solid ${C.stamp}`, color: C.stamp, borderRadius: 4, padding: "3px 9px", fontFamily: FONT_TYPE, fontSize: 10, letterSpacing: "0.12em", opacity: 0.85, transform: "rotate(-7deg)" }}>SCOUTED</div>
              <div style={{ paddingLeft: 22 }}>
                <div style={{ fontSize: 11, fontFamily: FONT_TYPE, letterSpacing: "0.22em", color: C.gold }}>NOW FILMING</div>
                <div style={{ fontSize: 27, fontFamily: FONT_DISPLAY, fontWeight: 700, marginTop: 5, letterSpacing: "0.02em" }}>{pack.place}</div>
                <div style={{ fontSize: 15, fontStyle: "italic", marginTop: 7, opacity: 0.92, fontFamily: FONT_BODY, maxWidth: "90%" }}>{pack.oneLiner}</div>
              </div>
            </div>

            <div style={{ background: C.card, borderRadius: 6, border: `1px solid ${C.line}`, padding: 26, position: "relative", boxShadow: "0 18px 44px rgba(0,0,0,.4)" }}>
              <div style={{ position: "absolute", inset: 7, border: `1px dashed ${C.lineSoft}`, borderRadius: 4, pointerEvents: "none" }} />
              <div style={{ position: "relative" }}>
                <Section icon={<Lightbulb size={17} />} title="Worth knowing" accent={C.red} delay={0}>
                  <ul style={{ margin: 0, paddingLeft: 18, color: C.text, fontSize: 15, lineHeight: 1.75, fontFamily: FONT_BODY }}>
                    {pack.facts.map((f, i) => <li key={i} style={{ marginBottom: 5 }}>{f}</li>)}
                  </ul>
                </Section>

                <div className="vs-reveal flex flex-wrap gap-4 mb-5" style={{ animationDelay: "80ms" }}>
                  <div className="vs-tile" style={{ flex: "1 1 220px", background: C.cardSoft, borderRadius: 4, padding: "13px 15px", border: `1px solid ${C.lineSoft}` }}>
                    <div className="flex items-center gap-1.5" style={{ color: C.gold, fontSize: 11, fontFamily: FONT_TYPE, letterSpacing: "0.1em", textTransform: "uppercase" }}><Clock size={13} /> Best time to film</div>
                    <div style={{ color: C.text, fontSize: 14, marginTop: 5, lineHeight: 1.55, fontFamily: FONT_BODY }}>{pack.bestTime}</div>
                  </div>
                  <div className="vs-tile" style={{ flex: "1 1 220px", background: C.cardSoft, borderRadius: 4, padding: "13px 15px", border: `1px solid ${C.lineSoft}` }}>
                    <div className="flex items-center gap-1.5" style={{ color: C.gold, fontSize: 11, fontFamily: FONT_TYPE, letterSpacing: "0.1em", textTransform: "uppercase" }}><Hash size={13} /> Local etiquette</div>
                    <div style={{ color: C.text, fontSize: 14, marginTop: 5, lineHeight: 1.55, fontFamily: FONT_BODY }}>{pack.etiquette}</div>
                  </div>
                </div>

                <Section icon={<Mic2 size={17} />} title="Your script" accent={C.green} copy={fullScript} delay={160}>
                  <div style={{ background: C.cardSoft, borderRadius: 4, padding: 17, borderLeft: `3px solid ${C.green}`, border: `1px solid ${C.lineSoft}` }}>
                    <ScriptReader text={fullScript} />
                    <div className="flex items-center justify-between mb-2">
                      <span className="inline-flex items-center gap-1" style={{ fontSize: 12, color: C.gold, fontFamily: FONT_TYPE, letterSpacing: "0.05em" }}><Clock size={12} /> {readTime}</span>
                      <button onClick={reroll} disabled={rerolling} className="vs-chip inline-flex items-center gap-1.5"
                        style={{ fontSize: 11, fontFamily: FONT_TYPE, color: rerolling ? C.textFaint : C.green, background: "transparent", border: `1px solid ${C.line}`, borderRadius: 999, padding: "4px 11px", cursor: rerolling ? "default" : "pointer", letterSpacing: "0.05em" }}>
                        <Shuffle size={12} /> {rerolling ? "RE-ROLLING…" : "ANOTHER TAKE"}
                      </button>
                    </div>
                    <div style={{ fontSize: 10, color: C.gold, fontFamily: FONT_TYPE, letterSpacing: "0.12em" }}>HOOK</div>
                    <p style={{ color: C.text, fontSize: 16, lineHeight: 1.6, margin: "4px 0 14px", fontWeight: 600, fontFamily: FONT_BODY }}>{pack.script.hook}</p>
                    <div style={{ fontSize: 10, color: C.gold, fontFamily: FONT_TYPE, letterSpacing: "0.12em" }}>BODY</div>
                    <p style={{ color: C.text, fontSize: 15, lineHeight: 1.75, margin: "4px 0 14px", fontFamily: FONT_BODY }}>{pack.script.body}</p>
                    <div style={{ fontSize: 10, color: C.gold, fontFamily: FONT_TYPE, letterSpacing: "0.12em" }}>SIGN-OFF</div>
                    <p style={{ color: C.text, fontSize: 15, lineHeight: 1.6, margin: "4px 0 0", fontStyle: "italic", fontFamily: FONT_BODY }}>{pack.script.signoff}</p>
                  </div>
                </Section>

                <Section icon={<ListChecks size={17} />} title="Shot list" accent={C.red} copy={pack.shotList.map((s, i) => `${i + 1}. ${s}`).join("\n")} delay={240}>
                  <div className="grid gap-2">
                    {pack.shotList.map((s, i) => (
                      <label key={i} className="flex items-start gap-2" style={{ fontSize: 15, color: C.text, lineHeight: 1.5, fontFamily: FONT_BODY, cursor: "pointer" }}>
                        <input type="checkbox" className="vs-check" /><span>{s}</span>
                      </label>
                    ))}
                  </div>
                </Section>

                <Section icon={<Backpack size={17} />} title="Gear & prep" accent={C.gold} copy={(pack.gear || []).map((g) => `• ${g}`).join("\n")} delay={320}>
                  <div className="grid gap-2">
                    {(pack.gear || []).map((g, i) => (
                      <label key={i} className="flex items-start gap-2" style={{ fontSize: 15, color: C.text, lineHeight: 1.5, fontFamily: FONT_BODY, cursor: "pointer" }}>
                        <input type="checkbox" className="vs-check" /><span>{g}</span>
                      </label>
                    ))}
                  </div>
                </Section>

                <Section icon={<Camera size={17} />} title="Captions" accent={C.gold} delay={400}>
                  <div className="grid gap-2">
                    {pack.captions.map((c, i) => (
                      <div key={i} className="vs-tile flex items-start justify-between gap-3" style={{ background: C.cardSoft, borderRadius: 4, padding: "11px 13px", border: `1px solid ${C.lineSoft}` }}>
                        <span style={{ fontSize: 14, color: C.text, lineHeight: 1.5, fontFamily: FONT_BODY }}>{c}</span>
                        <CopyBtn text={c} label="" />
                      </div>
                    ))}
                  </div>
                </Section>

                <div className="vs-reveal flex flex-wrap items-center gap-5" style={{ marginTop: 12, paddingTop: 16, borderTop: `1px dashed ${C.line}`, animationDelay: "480ms" }}>
                  {actionBtn(savePack, justSaved ? <BookmarkCheck size={15} /> : <Bookmark size={15} />, justSaved ? "SAVED" : "SAVE SPOT", C.gold, justSaved)}
                  {actionBtn(copyAll, copiedAll ? <Check size={15} /> : <Copy size={15} />, copiedAll ? "COPIED ALL" : "COPY ALL", C.gold, copiedAll)}
                  {actionBtn(printPack, <Printer size={15} />, "PRINT", C.green)}
                  {actionBtn(downloadAll, <Download size={15} />, "DOWNLOAD", C.green)}
                  {actionBtn(() => { setPack(null); setLocation(""); window.scrollTo({ top: 0, behavior: "smooth" }); }, <RotateCcw size={15} />, "NEW SCOUT", C.textDim)}
                </div>
              </div>
            </div>
          </div>
        )}
        </>)}

        {/* ITINERARY VIEW */}
        {view === "itinerary" && (
          <div className="vs-reveal">
            <div style={{ background: C.card, borderRadius: 6, border: `1px solid ${C.line}`, padding: 26, position: "relative", boxShadow: "0 18px 44px rgba(0,0,0,.4)" }}>
              <div style={{ position: "absolute", inset: 7, border: `1px dashed ${C.lineSoft}`, borderRadius: 4, pointerEvents: "none" }} />
              <div style={{ position: "relative" }}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div style={{ fontSize: 11, fontFamily: FONT_TYPE, color: C.gold, letterSpacing: "0.16em" }}>EXPEDITION LOG</div>
                    <h2 style={{ fontSize: 26, fontFamily: FONT_DISPLAY, color: C.text, margin: "4px 0 0", letterSpacing: "0.02em" }}>My Itinerary</h2>
                  </div>
                  <button onClick={addDay} className="vs-chip inline-flex items-center gap-2"
                    style={{ fontSize: 11, fontFamily: FONT_TYPE, color: C.green, background: "transparent", border: `1px solid ${C.green}`, borderRadius: 4, padding: "8px 13px", cursor: "pointer", letterSpacing: "0.08em" }}>
                    <CalendarPlus size={13} /> ADD DAY
                  </button>
                </div>

                {itinerary.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "30px 12px", color: C.textFaint, fontFamily: FONT_BODY, fontStyle: "italic", fontSize: 15 }}>
                    No days yet — tap <b style={{ color: C.green, fontStyle: "normal" }}>Add Day</b> to start planning your trip.
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {itinerary.map((day, idx) => (
                      <div key={day.id} style={{ background: C.cardSoft, border: `1px solid ${C.lineSoft}`, borderRadius: 4, padding: 16 }}>
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <div style={{ fontFamily: FONT_DISPLAY, color: C.gold, fontSize: 22, fontWeight: 700, letterSpacing: "0.04em" }}>DAY {idx + 1}</div>
                          <input type="date" value={day.date || ""} onChange={(e) => updateDay(day.id, { date: e.target.value })}
                            style={{ background: C.bg, color: C.text, border: `1px solid ${C.line}`, borderRadius: 4, padding: "5px 9px", fontFamily: FONT_TYPE, fontSize: 12, letterSpacing: "0.04em" }} />
                          <input value={day.city} onChange={(e) => updateDay(day.id, { city: e.target.value })} placeholder="City or area"
                            style={{ background: C.bg, color: C.text, border: `1px solid ${C.line}`, borderRadius: 4, padding: "5px 9px", fontFamily: FONT_BODY, fontSize: 14, flex: 1, minWidth: 120 }} />
                          <button onClick={() => deleteDay(day.id)} title="Remove day" style={{ background: "none", border: "none", color: C.textFaint, cursor: "pointer" }}><Trash2 size={15} /></button>
                        </div>
                        {day.date && <div style={{ fontSize: 12, color: C.textFaint, fontStyle: "italic", marginBottom: 8, fontFamily: FONT_BODY }}>{formatDate(day.date)}</div>}

                        {/* Spots in this day */}
                        <div className="grid gap-1.5" style={{ marginBottom: 10 }}>
                          {day.spots.length === 0 && <div style={{ fontSize: 13, color: C.textFaint, fontStyle: "italic", fontFamily: FONT_BODY, padding: "4px 0" }}>No spots yet for this day.</div>}
                          {day.spots.map((s) => (
                            <div key={s.id} className="flex items-center gap-2" style={{ background: C.bg, border: `1px solid ${C.lineSoft}`, borderRadius: 4, padding: "8px 11px" }}>
                              <button onClick={() => toggleSpotDone(day.id, s.id)} style={{ background: "none", border: "none", cursor: "pointer", color: s.done ? C.green : C.textFaint, display: "flex" }}>
                                {s.done ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                              </button>
                              <button onClick={() => openSpotFromItinerary(s.name)} style={{ flex: 1, textAlign: "left", background: "none", border: "none", cursor: "pointer", fontFamily: FONT_BODY, fontSize: 15, color: s.done ? C.textFaint : C.text, textDecoration: s.done ? "line-through" : "none" }}>
                                {s.name}
                              </button>
                              {saved.find((p) => p.place === s.name) && (
                                <span style={{ fontSize: 9, fontFamily: FONT_TYPE, letterSpacing: "0.1em", color: C.green, border: `1px solid ${C.green}`, borderRadius: 3, padding: "2px 6px" }}>SCOUTED</span>
                              )}
                              <button onClick={() => openSpotFromItinerary(s.name)} title="Open" style={{ background: "none", border: "none", color: C.gold, cursor: "pointer", display: "flex" }}><ChevronRight size={16} /></button>
                              <button onClick={() => removeSpot(day.id, s.id)} title="Remove" style={{ background: "none", border: "none", color: C.textFaint, cursor: "pointer", display: "flex" }}><X size={14} /></button>
                            </div>
                          ))}
                        </div>

                        {/* Add-spot picker */}
                        {pickerDayId === day.id ? (
                          <div style={{ background: C.bg, border: `1px dashed ${C.line}`, borderRadius: 4, padding: 11 }}>
                            <div style={{ fontSize: 11, fontFamily: FONT_TYPE, color: C.gold, letterSpacing: "0.08em", marginBottom: 6 }}>PICK A SPOT</div>
                            {saved.length > 0 && (
                              <div style={{ marginBottom: 9 }}>
                                <div style={{ fontSize: 11, color: C.textFaint, fontStyle: "italic", marginBottom: 4 }}>From your scouted spots:</div>
                                <div className="flex flex-wrap gap-1.5">
                                  {saved.map((p) => (
                                    <button key={p._id} onClick={() => addSpotToDay(day.id, p.place)} className="vs-chip"
                                      style={{ fontSize: 12, padding: "4px 10px", borderRadius: 999, cursor: "pointer", fontFamily: FONT_BODY, border: `1px solid ${C.line}`, background: "transparent", color: C.green }}>
                                      {p.place}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                            <div style={{ fontSize: 11, color: C.textFaint, fontStyle: "italic", marginBottom: 4 }}>From trip mode:</div>
                            <div className="flex flex-wrap gap-1.5" style={{ marginBottom: 9 }}>
                              {TRIP_STOPS.flatMap((g) => g.spots).map((s) => (
                                <button key={s} onClick={() => addSpotToDay(day.id, s)} className="vs-chip"
                                  style={{ fontSize: 12, padding: "4px 10px", borderRadius: 999, cursor: "pointer", fontFamily: FONT_BODY, border: `1px solid ${C.line}`, background: "transparent", color: C.textDim }}>{s}</button>
                              ))}
                            </div>
                            <div className="flex gap-2 items-center">
                              <input id={`custom-${day.id}`} placeholder="Or type any place name…" onKeyDown={(e) => {
                                if (e.key === "Enter" && e.target.value.trim()) { addSpotToDay(day.id, e.target.value.trim()); e.target.value = ""; }
                              }} style={{ flex: 1, background: C.cardSoft, color: C.text, border: `1px solid ${C.line}`, borderRadius: 4, padding: "6px 10px", fontFamily: FONT_BODY, fontSize: 14 }} />
                              <button onClick={() => setPickerDayId(null)} style={{ background: "none", border: "none", color: C.textFaint, cursor: "pointer", fontSize: 12, fontFamily: FONT_TYPE, letterSpacing: "0.08em" }}>CANCEL</button>
                            </div>
                          </div>
                        ) : (
                          <button onClick={() => setPickerDayId(day.id)} className="vs-chip inline-flex items-center gap-1.5"
                            style={{ fontSize: 11, fontFamily: FONT_TYPE, color: C.gold, background: "transparent", border: `1px dashed ${C.line}`, borderRadius: 4, padding: "6px 11px", cursor: "pointer", letterSpacing: "0.08em" }}>
                            + ADD SPOT
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {itinerary.length > 0 && (
                  <div style={{ marginTop: 18, paddingTop: 14, borderTop: `1px dashed ${C.line}`, fontSize: 12, color: C.textFaint, fontFamily: FONT_BODY }}>
                    Tap a spot to open its prep pack. Tap the circle to mark it filmed.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* FOOTER */}
        <div style={{ textAlign: "center", marginTop: 44, paddingTop: 20 }}>
          <div className="flex items-center justify-center gap-3">
            <span style={{ flex: 1, maxWidth: 80, height: 1, background: `linear-gradient(90deg, transparent, ${C.line})` }} />
            <Compass size={14} style={{ color: C.textFaint }} />
            <span style={{ flex: 1, maxWidth: 80, height: 1, background: `linear-gradient(90deg, ${C.line}, transparent)` }} />
          </div>
          <div style={{ color: C.textFaint, fontSize: 12, fontFamily: FONT_TYPE, letterSpacing: "0.14em", marginTop: 12 }}>DEVELOPED BY KERRY MARION</div>
        </div>
      </div>
    </div>
  );
}
