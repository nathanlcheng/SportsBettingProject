import { useState, useEffect } from 'react'

const API_URL = import.meta.env.VITE_API_BASE;

function evLevel(ev) {
  if (ev > 0.03) return "positive";
  if (ev > -0.03) return "neutral";
  return "negative";
}
 
const EV_STYLE = {
  positive: { bg: "#EAF3DE", text: "#3B6D11", border: "#97C459" },
  neutral:  { bg: "#FAEEDA", text: "#854F0B", border: "#EF9F27" },
  negative: { bg: "#FCEBEB", text: "#A32D2D", border: "#F09595" },
};
 
function EVBadge({ ev }) {
  const level = evLevel(ev);
  const c = EV_STYLE[level];
  const sign = ev > 0 ? "+" : "";
  return (
    <span style={{
      background: c.bg, color: c.text, border: `1px solid ${c.border}`,
      borderRadius: 6, padding: "2px 10px", fontSize: 12, fontWeight: 500, whiteSpace: "nowrap",
    }}>
      EV {sign}{(ev * 100).toFixed(1)}%
    </span>
  );
}
 
function formatOdds(n) { return n > 0 ? `+${n}` : `${n}`; }
 
function formatTime(iso) {
  return new Date(iso).toLocaleString("en-US", {
    weekday: "short", month: "short", day: "numeric",
    hour: "numeric", minute: "2-digit",
  });
}
 
function formatBook(key) {
  const map = {
    draftkings: "DraftKings", fanduel: "FanDuel", betmgm: "BetMGM",
    caesars: "Caesars", pointsbet: "PointsBet", barstool: "Barstool",
    wynnbet: "WynnBet", betrivers: "BetRivers", unibet: "Unibet",
  };
  return map[key] ?? key;
}
 
function BetCard({ bet }) {
  return (
    <div style={{
      background: "#ffffff",
      border: "1px solid #e5e5e5",
      borderRadius: 12, padding: "1rem 1.25rem",
      display: "flex", flexDirection: "column", gap: 10,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 11, color: "#888", marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {formatTime(bet.commenceTime)} · {bet.bookAmount} books sampled
          </div>
          <div style={{ fontWeight: 500, fontSize: 15 }}>
            {bet.team} <span style={{ color: "#999", fontWeight: 400 }}>vs</span> {bet.enemyTeam}
          </div>
        </div>
        <EVBadge ev={bet.ev} />
      </div>
 
      <div style={{
        background: "#f7f7f7",
        borderRadius: 8, padding: "10px 14px",
        display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8,
      }}>
        <div>
          <div style={{ fontSize: 11, color: "#888", marginBottom: 2 }}>Bet</div>
          <div style={{ fontWeight: 500, fontSize: 13 }}>{bet.team}</div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: "#888", marginBottom: 2 }}>Best odds</div>
          <div style={{ fontWeight: 500, fontSize: 13, fontFamily: "monospace" }}>{formatOdds(bet.bestOdds)}</div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: "#888", marginBottom: 2 }}>Best book</div>
          <div style={{ fontWeight: 500, fontSize: 13 }}>{formatBook(bet.bestBook)}</div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: "#888", marginBottom: 2 }}>Fair prob</div>
          <div style={{ fontWeight: 500, fontSize: 13, fontFamily: "monospace" }}>{(bet.noVigProb * 100).toFixed(1)}%</div>
        </div>
      </div>
    </div>
  );
}
 
export default function App() {
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
 
  const fetchBets = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/odds`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setBets(data.bets ?? []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };
 
  useEffect(() => { fetchBets(); }, []);
 
  const displayed = bets.filter(b =>
    filter === "positive" ? b.ev > 0.03 :
    filter === "negative" ? b.ev < -0.03 : true
  );
 
  const posCount = bets.filter(b => b.ev > 0.03).length;
  const avgBooks = bets.length ? Math.round(bets.reduce((s, b) => s + b.bookAmount, 0) / bets.length) : 0;
 
  return (
    <div style={{ minHeight: "100vh", background: "#fafafa", padding: "2rem 1rem", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
 
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "#888", marginBottom: 6 }}>
            MLB · Moneyline · Consensus model
          </div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 600 }}>EV Predictor</h1>
          <p style={{ margin: "6px 0 0", color: "#666", fontSize: 14 }}>
            Fair probability calculated from consensus across all available books
          </p>
        </div>
 
        {!loading && bets.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12, marginBottom: "1.5rem" }}>
            {[
              { label: "Games today", value: Math.round(bets.length / 2) },
              { label: "+EV bets", value: posCount },
              { label: "Avg books sampled", value: avgBooks },
            ].map(s => (
              <div key={s.label} style={{ background: "#f0f0f0", borderRadius: 8, padding: "12px 16px" }}>
                <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 22, fontWeight: 600 }}>{s.value}</div>
              </div>
            ))}
          </div>
        )}
 
        {!loading && bets.length > 0 && (
          <div style={{ display: "flex", gap: 6, marginBottom: "1rem", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "#888", marginRight: 4 }}>Show:</span>
            {[["all", "All bets"], ["positive", "+EV only"], ["negative", "−EV only"]].map(([val, label]) => (
              <button key={val} onClick={() => setFilter(val)} style={{
                padding: "4px 12px", borderRadius: 6, fontSize: 12, cursor: "pointer",
                background: filter === val ? "#fff" : "transparent",
                border: filter === val ? "1px solid #999" : "1px solid #ddd",
                color: "#333",
              }}>{label}</button>
            ))}
            <button onClick={fetchBets} style={{
              marginLeft: "auto", padding: "4px 12px", borderRadius: 6,
              fontSize: 12, cursor: "pointer", background: "transparent",
              border: "1px solid #ddd", color: "#666",
            }}>
              Refresh ↻
            </button>
          </div>
        )}
 
        {loading && (
          <div style={{ textAlign: "center", padding: "4rem 0", color: "#666", fontSize: 14 }}>
            Fetching live MLB odds...
          </div>
        )}
 
        {error && (
          <div style={{ background: "#FCEBEB", border: "1px solid #E24B4A", borderRadius: 8, padding: "12px 16px", fontSize: 14, color: "#A32D2D" }}>
            {error} — make sure the backend is running and your ODDS_API_KEY is set in .env
          </div>
        )}
 
        {!loading && !error && (
          <div style={{ display: "grid", gap: 12 }}>
            {displayed.map((bet) => (
              <BetCard key={`${bet.gameId}-${bet.team}`} bet={bet} />
            ))}
            {displayed.length === 0 && bets.length > 0 && (
              <div style={{ textAlign: "center", padding: "3rem 0", color: "#999", fontSize: 14 }}>
                No bets match this filter.
              </div>
            )}
          </div>
        )}
 
        <div style={{ marginTop: "2rem", fontSize: 11, color: "#999", textAlign: "center" }}>
          For entertainment purposes only. Please gamble responsibly.
        </div>
      </div>
    </div>
  );
}