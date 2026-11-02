"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
export default function MyYacht() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    fetch("/api/my-yacht")
      .then(async (r) => {
        if (!r.ok) throw new Error("Please sign in to view your yachts");
        setData(await r.json());
      })
      .catch((e) => setError(e.message));
  }, []);
  return (
    <main className="container">
      <h1>My yachts</h1>
      <Link href="/login">Sign in</Link>
      {error && <p role="alert">{error}</p>}
      {data?.yachts.map((y: any) => (
        <div className="section" key={y.hullNumber}>
          <h2>
            <Link href={`/yachts/${y.hullNumber}`}>
              {y.name} · {y.hullNumber}
            </Link>
          </h2>
          {y.claims.map((c: any) => (
            <p key={c.id}>
              <Link href={`/claims/${c.id}`}>{c.title}</Link> · {c.status}
            </p>
          ))}
        </div>
      ))}
      {data?.yachts.length === 0 && <p>No yachts assigned to this account.</p>}
    </main>
  );
}
