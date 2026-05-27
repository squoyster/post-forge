"use client";

import { useState, useEffect } from "react";

interface Proposal {
  id: string;
  proposalType: string;
  sourceMediaId: number | null;
  topic: string | null;
  title: string | null;
  body: string | null;
  score: string | null;
  status: string;
  createdAt: string;
}

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  async function fetchProposals() {
    setLoading(true);
    try {
      const res = await fetch("/api/proposals");
      const data = await res.json();
      setProposals(data.proposals ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function generate() {
    setGenerating(true);
    try {
      const res = await fetch("/api/proposals/generate", { method: "POST" });
      if (res.ok) {
        await fetchProposals();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  }

  async function approve(id: string) {
    try {
      const res = await fetch(`/api/proposals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
      });
      if (res.ok) await fetchProposals();
    } catch (e) {
      console.error(e);
    }
  }

  async function reject(id: string) {
    try {
      const res = await fetch(`/api/proposals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject" }),
      });
      if (res.ok) await fetchProposals();
    } catch (e) {
      console.error(e);
    }
  }

  async function exportProposal(id: string) {
    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposalId: id }),
      });
      if (res.ok) {
        alert("Proposal exported successfully!");
      } else {
        alert("Export failed.");
      }
    } catch (e) {
      console.error(e);
      alert("Export failed.");
    }
  }

  useEffect(() => {
    fetchProposals();
  }, []);

  return (
    <main style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Proposals</h1>
      <button onClick={generate} disabled={generating} style={{ marginBottom: "1rem" }}>
        {generating ? "Generating..." : "Generate Proposals"}
      </button>
      {loading ? (
        <p>Loading...</p>
      ) : proposals.length === 0 ? (
        <p>No proposals yet. Click Generate to create some.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {proposals.map((p) => (
            <li
              key={p.id}
              style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "1rem",
                marginBottom: "1rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong>{p.title ?? "Untitled"}</strong>
                <span
                  style={{
                    fontSize: "0.8rem",
                    padding: "0.2rem 0.5rem",
                    borderRadius: "4px",
                    background: p.status === "approved" ? "#d4edda" : p.status === "rejected" ? "#f8d7da" : "#fff3cd",
                  }}
                >
                  {p.status}
                </span>
              </div>
              <p style={{ marginTop: "0.5rem", color: "#555" }}>{p.body}</p>
              <div style={{ marginTop: "0.5rem", fontSize: "0.8rem", color: "#888" }}>
                Topic: {p.topic ?? "—"} | Media: {p.sourceMediaId ?? "—"} | Score: {p.score ?? "—"}
              </div>
              {p.status === "proposed" && (
                <div style={{ marginTop: "0.5rem" }}>
                  <button onClick={() => approve(p.id)} style={{ marginRight: "0.5rem" }}>
                    Approve
                  </button>
                  <button onClick={() => reject(p.id)}>Reject</button>
                </div>
              )}
              {p.status === "approved" && (
                <div style={{ marginTop: "0.5rem" }}>
                  <button onClick={() => exportProposal(p.id)}>Export</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
