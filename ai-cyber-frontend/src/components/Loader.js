import React from "react";

export default function Loader({ small }) {
  return (
    <div style={{ padding: small ? 8 : 18, textAlign: "center" }}>
      <div className="spinner" />
    </div>
  );
}
