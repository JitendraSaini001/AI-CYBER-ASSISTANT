import React from "react";

export default function ThreatFeed({ feed = [] }) {
  if (!feed || feed.length === 0) return <div className="small muted">No threats at the moment.</div>;
  return (
    <div>
      {feed.map((t, i) => (
        <div key={i} style={{ marginBottom: 10 }}>
          <div style={{ display:"flex", justifyContent:"space-between" }}>
            <strong>{t.title}</strong>
            <span className="small muted">{t.risk}</span>
          </div>
          <div className="small muted">{t.desc || t.detail || ""}</div>
        </div>
      ))}
    </div>
  );
}
