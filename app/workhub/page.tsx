"use client";

import { useEffect, useState } from "react";

type Claim = {
  id: string;
  yachtHullNumber: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  validationStatus: string;
  validatedBy?: string | null;
  createdAt?: string;
  yacht?: { name: string };
};

const getPriorityTone = (priority: string) => {
  switch (priority.toLowerCase()) {
    case "high":
      return { background: "#fce4e4", color: "#b54757" };
    case "medium":
      return { background: "#fdf0d0", color: "#b7791f" };
    case "low":
      return { background: "#dff7e8", color: "#2d8b5d" };
    default:
      return { background: "#eef2ff", color: "#4b5563" };
  }
};

const getStatusTone = (status: string) => {
  switch (status.toLowerCase()) {
    case "open":
      return { background: "#dfeaf8", color: "#1f2a37" };
    case "closed":
      return { background: "#dff7e8", color: "#2d8b5d" };
    case "supplier_pending":
      return { background: "#fdf0d0", color: "#b7791f" };
    default:
      return { background: "#eef2ff", color: "#4b5563" };
  }
};

export default function HomePage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [role, setRole] = useState("");
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((u) => setRole(u?.role || ""));
  }, []);
  useEffect(() => {
    const loadClaims = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/claims");
        if (!response.ok) throw new Error("Fetch failed");
        const data = await response.json();
        if (!Array.isArray(data)) throw new Error("Invalid claim response");
        setClaims(data);
      } catch {
        setError("Unable to load claims. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadClaims();
  }, []);

  const grouped: Record<string, Claim[]> = {};
  claims.forEach((claim) => {
    const key = claim.yachtHullNumber;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(claim);
  });

  const yachts = Object.entries(grouped);

  return (
    <main
      style={{
        background: "#f3f5f7",
        minHeight: "100vh",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          background: "#0f233e",
          color: "#fff",
          height: 72,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 28px",
          boxSizing: "border-box",
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 700 }}>Yacht Claims MVP</div>

        <nav
          style={{
            display: "flex",
            gap: 28,
            alignItems: "center",
            fontSize: 17,
          }}
        >
          <a href="/workhub">Work Hub</a>
          {role === "director" && <a href="/users">Users</a>}
          <a href="/my-yacht">My Yacht</a>
        </nav>

        <button
          onClick={async () => {
            await fetch("/api/auth/logout", { method: "POST" });
            localStorage.removeItem("user");
            window.location.href = "/login";
          }}
          style={{
            background: "#eef2f7",
            color: "#0f233e",
            border: "none",
            borderRadius: 10,
            padding: "10px 18px",
            fontSize: 17,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>

      {error && (
        <p role="alert" className="container">
          {error}
        </p>
      )}
      {!loading && !error && claims.length === 0 && (
        <p className="container">No claims yet.</p>
      )}
      <div style={{ padding: "24px 28px" }}>
        <div
          style={{
            maxWidth: 1320,
            margin: "0 auto",
            background: "#f0f2f4",
            borderRadius: 18,
            border: "1px solid #dfe4ea",
            padding: "18px 20px 24px",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 18,
            }}
          >
            <h1
              style={{
                margin: 0,
                fontSize: 36,
                fontWeight: 800,
                color: "#1f2a37",
              }}
            >
              Work Hub
            </h1>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <span
                style={{
                  background: "#dfeaf8",
                  color: "#2b4d77",
                  borderRadius: 999,
                  padding: "9px 16px",
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                My Work
              </span>
              <span
                style={{
                  background: "#f8e9bb",
                  color: "#7a5a14",
                  borderRadius: 999,
                  padding: "9px 16px",
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                Overdue
              </span>
              <span
                style={{
                  background: "#dff7e8",
                  color: "#2d8b5d",
                  borderRadius: 999,
                  padding: "9px 16px",
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                Recently updated
              </span>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 18,
            }}
          >
            {yachts.map(([hullNumber, items]) => (
              <div
                key={hullNumber}
                style={{
                  border: "1px solid #dfe4ea",
                  borderRadius: 16,
                  background: "#f7f9fa",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "18px 18px 12px",
                    borderBottom: "1px solid #dfe4ea",
                  }}
                >
                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 800,
                      color: "#1f2a37",
                    }}
                  >
                    {items[0]?.yacht?.name || hullNumber}
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: "#5d6b7a",
                        marginTop: 2,
                      }}
                    >
                      {hullNumber}
                    </div>
                  </div>

                  <span
                    style={{
                      ...getStatusTone(items[0]?.status || "open"),
                      borderRadius: 10,
                      padding: "8px 16px",
                      fontWeight: 700,
                      fontSize: 16,
                    }}
                  >
                    {items[0]?.status === "closed" ? "Closed" : "Open"}
                  </span>
                </div>

                <div style={{ padding: "10px 16px 16px" }}>
                  {items.map((claim) => (
                    <div
                      key={claim.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        border: "1px solid #dfe4ea",
                        borderRadius: 12,
                        padding: "18px 14px",
                        background: "#f0f4f7",
                        marginTop: 12,
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: 24,
                            lineHeight: 1.2,
                            fontWeight: 700,
                            color: "#1f2a37",
                          }}
                        >
                          <a href={`/claims/${claim.id}`}>{claim.title}</a>
                        </div>
                        <div
                          style={{
                            color: "#5d6b7a",
                            fontSize: 15,
                            marginTop: 4,
                          }}
                        >
                          {claim.id}
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          flexWrap: "wrap",
                        }}
                      >
                        <span
                          style={{
                            ...getStatusTone(claim.status),
                            borderRadius: 999,
                            padding: "6px 12px",
                            fontWeight: 700,
                            fontSize: 12,
                          }}
                        >
                          {claim.status === "supplier_pending"
                            ? "supplier_pending"
                            : claim.status}
                        </span>

                        <span
                          style={{
                            ...getPriorityTone(claim.priority),
                            borderRadius: 999,
                            padding: "6px 12px",
                            fontWeight: 700,
                            fontSize: 12,
                          }}
                        >
                          {claim.priority}
                        </span>

                        <span
                          style={{
                            background: "#e8eef7",
                            color: "#35507a",
                            borderRadius: 999,
                            padding: "6px 12px",
                            fontWeight: 700,
                            fontSize: 12,
                          }}
                        >
                          {claim.validatedBy ?? "Pending validation"}
                        </span>

                        {claim.createdAt ? (
                          <span
                            style={{
                              color: "#495a6b",
                              fontSize: 12,
                              fontWeight: 600,
                              marginLeft: 4,
                            }}
                          >
                            {new Date(claim.createdAt).toLocaleDateString(
                              "en-GB",
                            )}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div
          style={{
            textAlign: "center",
            paddingBottom: 24,
            color: "#495a6b",
          }}
        >
          Caricamento...
        </div>
      ) : null}
    </main>
  );
}
