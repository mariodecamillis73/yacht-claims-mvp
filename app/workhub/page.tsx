"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/components/language-provider";
import { TranslationKey } from "@/lib/i18n";
export default function WorkHub() {
  const { t, language, tr } = useLanguage();
  const [claims, setClaims] = useState<any[]>([]),
    [actor, setActor] = useState<any>(null);
  const [filter, setFilter] = useState("all"),
    [search, setSearch] = useState(""),
    [status, setStatus] = useState(""),
    [priority, setPriority] = useState(""),
    [hull, setHull] = useState("");
  const [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [refresh, setRefresh] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    Promise.all([fetch("/api/auth/me"), fetch(`/api/claims?filter=${filter}`)])
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
  }, [filter, refresh]);
  const inside = ["director", "staff"].includes(actor?.role);
  const visible = claims.filter(
    (c) =>
      (!status || c.status === status) &&
      (!priority || c.priority === priority) &&
      (!hull || c.yachtHullNumber === hull) &&
      `${c.title} ${c.description} ${c.id} ${c.yachtHullNumber} ${c.yacht?.name}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const grouped: Record<string, any[]> = {};
  for (const claim of visible)
    (grouped[claim.yachtHullNumber] ||= []).push(claim);
  const label = (value: string) => t(value as TranslationKey) || value;
  return (
    <main className="container page-shell">
      <header className="topbar">
        <strong>YY ASM</strong>
        <nav>
          <Link href="/workhub">{t("workhub")}</Link>
          {["director", "staff", "representative"].includes(actor?.role) && (
            <Link href="/yachts">{t("yachts")}</Link>
          )}
          {actor?.role === "representative" && (
            <Link href="/my-yacht">{t("myYachts")}</Link>
          )}
          {inside && <Link href="/suppliers">{t("suppliers")}</Link>}
          {actor?.role === "director" && (
            <Link href="/users">{t("users")}</Link>
          )}
        </nav>
        <button
          className="button secondary"
          onClick={async () => {
            await fetch("/api/auth/logout", { method: "POST" });
            window.location.href = "/login";
          }}
        >
          {t("logout")}
        </button>
      </header>
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
        <div className="grid grid-2" style={{ marginTop: 16 }}>
          <label>
            {t("search")}
            <input
              className="input"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          <label>
            {t("yachts")}
            <select
              className="input"
              value={hull}
              onChange={(e) => setHull(e.target.value)}
            >
              <option value="">{t("any")}</option>
              {Array.from(new Set(claims.map((c) => c.yachtHullNumber))).map(
                (h) => (
                  <option key={h}>{h}</option>
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
              setHull("");
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
                    (c) => !["closed", "rejected"].includes(c.status),
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
                      !["closed", "rejected"].includes(c.status),
                  ).length
                }
              </strong>
            </div>
          </div>
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
                        <div className="muted">{c.id}</div>
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
        </>
      )}
    </main>
  );
}
