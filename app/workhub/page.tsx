"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/components/language-provider";
import { TranslationKey } from "@/lib/i18n";
function isOpen(status: string) {
  return !["closed", "rejected"].includes(status);
}

export default function WorkHub() {
  const router = useRouter();
  const [yachts, setYachts] = useState<{ hullNumber: string; name: string }[]>([]);
  const { t, language, tr } = useLanguage();
  const [claims, setClaims] = useState<any[]>([]),
    [actor, setActor] = useState<any>(null);
  const [filter, setFilter] = useState("all"),
    [search, setSearch] = useState(""),
    [status, setStatus] = useState(""),
    [priority, setPriority] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  useEffect(() => { const timer = setTimeout(() => setSearchQuery(search.trim()), 250); return () => clearTimeout(timer); }, [search]);
  const [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [refresh, setRefresh] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    Promise.all([fetch("/api/auth/me"), fetch(`/api/claims?filter=${filter}&q=${encodeURIComponent(searchQuery)}`)])
      .then(async ([a, b]) => {
        if (!a.ok || !b.ok) throw new Error();
        const [u, rows] = await Promise.all([a.json(), b.json()]);
        if (active) {
          setActor(u);
          setClaims(rows);
        }
      })
      .catch(() => {
        if (active) {
          setClaims([]);
          setError(t("error"));
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [filter, refresh, searchQuery]);
  useEffect(() => {
    if (!["director", "staff", "representative"].includes(actor?.role)) return;
    fetch("/api/yachts").then(async response => {
      if (!response.ok) throw new Error();
      setYachts(await response.json());
    }).catch(() => setError(t("error")));
  }, [actor?.role, refresh]);
  const inside = ["director", "staff"].includes(actor?.role);
  const visible = claims.filter(
    (c) =>
      (!status || (status === "open" ? isOpen(c.status) : c.status === status)) &&
      (!priority || c.priority === priority),
  );
  const grouped: Record<string, any[]> = {};
  for (const claim of visible)
    (grouped[claim.yachtHullNumber] ||= []).push(claim);
  const label = (value: string) => t(value as TranslationKey) || value;
  return (
    <main className="container page-shell">

      <div className="section-header">
        <h1>{t("workhub")}</h1>
        <div className="inline-actions">
          {["director", "staff", "representative"].includes(actor?.role) && (
            <Link className="button" href="/claims/new">
              {t("newClaim")}
            </Link>
          )}
          {inside && (
            <Link className="button secondary" href="/yachts">
              {t("newYacht")}
            </Link>
          )}
        </div>
      </div>
      <section className="section">
        <div className="inline-actions" aria-label={tr("Claim filters")}>
          {[
            "all",
            ...(["director", "staff", "representative"].includes(actor?.role)
              ? ["mine"]
              : []),
            "overdue",
            "recent",
          ].map((v) => (
            <button
              className={filter === v ? "button" : "button secondary"}
              aria-pressed={filter === v}
              key={v}
              onClick={() => setFilter(v)}
            >
              {t(v as TranslationKey)}
            </button>
          ))}
        </div>
        <div className="grid grid-2 workhub-filters" style={{ marginTop: 16 }}>
          <label>
            {t("search")}
            <input
              className="input"
              type="search"
              maxLength={200}
              placeholder={tr("Search claims, comments, yacht names or YES IDs")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          <label>
            {t("yachts")}
            <select
              className="input"
              value=""
              onChange={(e) => { if (e.target.value) router.push(`/yachts/${encodeURIComponent(e.target.value)}`); }}
            >
              <option value="">{t("any")}</option>
              {yachts.map(
                (yacht) => (
                  <option key={yacht.hullNumber} value={yacht.hullNumber}>{yacht.name} · {yacht.hullNumber}</option>
                ),
              )}
            </select>
          </label>
          <label>
            {t("status")}
            <select
              className="input"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">{t("any")}</option>
              <option value="open">{t("open")}</option>
              {[
                "new",
                "assigned",
                "in_progress",
                "supplier_pending",
                "closed",
                "rejected",
              ].map((v) => (
                <option key={v} value={v}>
                  {label(v)}
                </option>
              ))}
            </select>
          </label>
          <label>
            {t("priority")}
            <select
              className="input"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="">{t("any")}</option>
              {["low", "medium", "high", "critical"].map((v) => (
                <option key={v} value={v}>
                  {label(v)}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="inline-actions" style={{ marginTop: 16 }}>
          <button
            className="button secondary"
            onClick={() => {
              setSearch("");
              setStatus("");
              setPriority("");
              setFilter("all");
            }}
          >
            {t("clear")}
          </button>
          <button
            className="button secondary"
            disabled={loading}
            onClick={() => setRefresh(refresh + 1)}
          >
            {t("refresh")}
          </button>
        </div>
      </section>
      {error && (
        <p role="alert">
          {tr(error)} <Link href="/login">{t("signIn")}</Link>
        </p>
      )}
      {loading ? (
        <p>{t("loading")}</p>
      ) : (
        <>
          <div className="summary-cards">
            <div className="summary-card">
              {t("total")}
              <strong>{visible.length}</strong>
            </div>
            <div className="summary-card">
              {t("open")}
              <strong>
                {
                  visible.filter(
                    (c) => isOpen(c.status),
                  ).length
                }
              </strong>
            </div>
            <div className="summary-card">
              {t("overdue")}
              <strong>
                {
                  visible.filter(
                    (c) =>
                      c.dueDate &&
                      new Date(c.dueDate) < new Date() &&
                      isOpen(c.status),
                  ).length
                }
              </strong>
            </div>
          </div>
          {(Boolean(status) || Boolean(search.trim())) && searchQuery === search.trim() && <>
          {!visible.length && !error && <p>{t("empty")}</p>}
          <div className="grid grid-2">
            {Object.entries(grouped).map(([key, items]) => (
              <section className="card" style={{ padding: 16 }} key={key}>
                <h2>
                  {["director", "staff", "representative"].includes(
                    actor?.role,
                  ) ? (
                    <Link href={`/yachts/${encodeURIComponent(key)}`}>
                      {items?.[0]?.yacht?.name || key} · {key}
                    </Link>
                  ) : (
                    <>
                      {items?.[0]?.yacht?.name || key} · {key}
                    </>
                  )}
                </h2>
                <div className="grid" style={{ gap: 10 }}>
                  {items?.map((c) => (
                    <Link
                      href={`/claims/${c.id}`}
                      className="list-row"
                      key={c.id}
                    >
                      <div>
                        <strong>{c.title}</strong>
                        <div className="muted">
                          {tr("#YES ID")} {c.yesId || "—"}
                        </div>
                        {c.comments?.map((comment: {message:string;createdAt:string}, i:number) => {
                          const index=comment.message.toLowerCase().indexOf(searchQuery.toLowerCase());
                          const start=Math.max(0,index-65);
                          return <p className="muted" key={i}>{tr("Comment match")}: {start>0?"…":""}{comment.message.slice(start,start+230)}{comment.message.length>start+230?"…":""}</p>;
                        })}
                        {c.dueDate && (
                          <small>
                            {t("deadline")}:{" "}
                            {new Date(c.dueDate).toLocaleDateString(language, {
                              timeZone: "UTC",
                            })}
                          </small>
                        )}
                      </div>
                      <span className={`badge status-${c.status}`}>
                        {label(c.status)}
                      </span>
                      <span className={`badge priority-${c.priority}`}>
                        {label(c.priority)}
                      </span>
                      {inside && (
                        <span>{c.assignedName || t("unassigned")}</span>
                      )}
                      <span className="muted">
                        {new Date(c.updatedAt).toLocaleDateString(language)}
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
          </>}
        </>
      )}
    </main>
  );
}
