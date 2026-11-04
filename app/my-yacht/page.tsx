"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/components/language-provider";
export default function MyYacht() {
  const { tr, language } = useLanguage();
  const [data, setData] = useState<any>(null),
    [error, setError] = useState("");
  useEffect(() => {
    fetch("/api/my-yacht")
      .then(async (r) => {
        if (!r.ok) throw new Error("Please sign in to view your yachts");
        setData(await r.json());
      })
      .catch((e) => setError(e.message));
  }, []);
  return (
    <>
      <div className="topbar">
        <strong>YY ASM</strong>
        <nav>
          <Link href="/my-yacht">{tr("My Yacht")}</Link>
          <Link href="/workhub">{tr("Work Hub")}</Link>
          <Link href="/login">{tr("Sign in")}</Link>
        </nav>
      </div>
      <main className="container page-shell">
        {error && <p role="alert">{tr(error)}</p>}
        {!data && !error && <p>{tr("Loading…")}</p>}
        {data?.yachts.map((y: any) => (
          <section className="section" key={y.hullNumber}>
            <div className="section-header">
              <div>
                <h2>
                  <Link href={`/yachts/${encodeURIComponent(y.hullNumber)}`}>
                    {y.name}
                  </Link>
                </h2>
                <p className="muted">
                  {y.hullNumber} · {y.yearBuilt}
                </p>
              </div>
              <Link
                className="button"
                href={`/claims/new?yacht=${encodeURIComponent(y.hullNumber)}`}
              >
                {tr("New claim")}
              </Link>
            </div>
            <h3>{tr("Claims")}</h3>
            <div className="grid" style={{ gap: 12 }}>
              {y.claims.map((c: any) => (
                <Link key={c.id} href={`/claims/${c.id}`} className="list-row">
                  <div>
                    <strong>{c.title}</strong>
                    <div className="muted">{c.id}</div>
                  </div>
                  <span className={`badge status-${c.status}`}>
                    {tr(c.status)}
                  </span>
                  <span className={`badge priority-${c.priority}`}>
                    {tr(c.priority)}
                  </span>
                  <span className="muted">
                    {new Date(c.updatedAt).toLocaleDateString(language)}
                  </span>
                </Link>
              ))}
            </div>
            {!y.claims.length && <p>{tr("No claims yet.")}</p>}
          </section>
        ))}
        {data?.yachts.length === 0 && (
          <p>{tr("No yachts assigned to this account.")}</p>
        )}
      </main>
    </>
  );
}
