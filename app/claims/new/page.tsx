"use client";
import { useLanguage } from "@/components/language-provider";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
type Yacht = { hullNumber: string; name: string };
export default function NewClaim() {
  const { tr, language } = useLanguage();

  const router = useRouter();
  const [yachts, setYachts] = useState<Yacht[]>([]);
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [createdId, setCreatedId] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [visibility, setVisibility] = useState("shared");
  const [internal, setInternal] = useState(false);
  const [form, setForm] = useState({
    yachtHullNumber: "",
    title: "",
    description: "",
    priority: "medium",
  });
  useEffect(() => {
    async function load() {
      const u = await fetch("/api/auth/me");
      if (!u.ok) throw new Error("Please sign in");
      const actor = await u.json();
      if (!["director", "staff", "representative"].includes(actor.role))
        throw new Error("Your account cannot create claims");
      setAllowed(true);
      setInternal(["director", "staff"].includes(actor.role));
      const r = await fetch("/api/yachts");
      if (!r.ok) throw new Error("Unable to load yachts");
      const rows = (await r.json()) as Yacht[];
      setYachts(rows);
      const requested = new URLSearchParams(window.location.search).get(
        "yacht",
      );
      setForm((f) => ({
        ...f,
        yachtHullNumber:
          rows.find((y) => y.hullNumber === requested)?.hullNumber ||
          rows[0]?.hullNumber ||
          "",
      }));
    }
    load()
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (files.some((f) => f.size > 5 * 1024 * 1024 || !f.size)) {
      setError(
        tr("Each attachment must be non-empty and no larger than 5 MB."),
      );
      return;
    }
    setBusy(true);
    setError("");
    let id = createdId;
    try {
      if (!id) {
        const r = await fetch("/api/claims", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const b = await r.json();
        if (!r.ok) throw new Error(b.error);
        id = b.id;
        setCreatedId(id);
      }
      const failed: File[] = [];
      for (const file of files) {
        try {
          const body = new FormData();
          body.set("file", file);
          body.set("visibility", visibility);
          const r = await fetch(`/api/claims/${id}/documents`, {
            method: "POST",
            body,
          });
          if (!r.ok) failed.push(file);
        } catch {
          failed.push(file);
        }
      }
      setFiles(failed);
      if (failed.length) {
        setError(
          tr(
            "The claim was saved, but {count} attachment(s) could not be uploaded. Retry the remaining files below or open the claim.",
            { count: failed.length },
          ),
        );
        return;
      }
      router.push(`/claims/${id}`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="container page-shell">
      <nav className="inline-actions">
        <Link href="/workhub">{tr("Work Hub")}</Link>
        <Link href="/yachts">{tr("Yachts")}</Link>
      </nav>
      <h1>{tr("New claim")}</h1>
      {error && <p role="alert">{tr(error)}</p>}
      {loading ? (
        <p>{tr("Loading…")}</p>
      ) : (
        allowed &&
        (!yachts.length ? (
          <p>
            {tr("No yacht assigned or available.")}{" "}
            <Link href="/yachts">{tr("Open yachts")}</Link>{" "}
            {tr("or ask the yard to assign your yacht.")}
          </p>
        ) : (
          <form className="section form-grid" onSubmit={submit}>
            <fieldset disabled={busy || !!createdId} className="form-grid">
              <label>
                {tr("Yacht")}
                <select
                  className="input"
                  required
                  value={form.yachtHullNumber}
                  onChange={(e) =>
                    setForm({ ...form, yachtHullNumber: e.target.value })
                  }
                >
                  {yachts.map((y) => (
                    <option key={y.hullNumber} value={y.hullNumber}>
                      {y.name} · {y.hullNumber}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                {tr("Title")}
                <input
                  className="input"
                  required
                  maxLength={250}
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </label>
              <label>
                {tr("Description")}
                <textarea
                  className="textarea"
                  required
                  maxLength={20000}
                  rows={6}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </label>
              <label>
                {tr("Priority")}
                <select
                  className="input"
                  value={form.priority}
                  onChange={(e) =>
                    setForm({ ...form, priority: e.target.value })
                  }
                >
                  {["low", "medium", "high", "critical"].map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </label>
            </fieldset>
            {!createdId && (
              <label>
                {tr(
                  "Photos and documents (optional, max 5 MB each, up to 10 files)",
                )}
                <input
                  type="file"
                  multiple
                  disabled={busy}
                  onChange={(e) => {
                    const list = Array.from(e.target.files || []);
                    if (list.length > 10) {
                      setError(tr("Select no more than 10 attachments."));
                      e.target.value = "";
                      setFiles([]);
                    } else {
                      setFiles(list);
                      setError("");
                    }
                  }}
                />
              </label>
            )}
            {internal && (
              <label>
                {tr("Attachment visibility")}
                <select
                  className="input"
                  disabled={busy || !!createdId}
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value)}
                >
                  <option value="shared">
                    {tr("Shared with authorized participants")}
                  </option>
                  <option value="internal">{tr("Internal to yard")}</option>
                </select>
              </label>
            )}
            {!!files.length && (
              <ul>
                {files.map((f, i) => (
                  <li key={i}>
                    {f.name} ({Math.ceil(f.size / 1024)} KB)
                  </li>
                ))}
              </ul>
            )}
            <p>
              {tr(
                "The claim starts as New / Pending director validation. Attachments follow the visibility selected above.",
              )}
            </p>
            <div className="inline-actions">
              <button className="button" disabled={busy}>
                {busy
                  ? tr("Saving…")
                  : createdId
                    ? tr("Retry remaining attachments")
                    : tr("Create claim")}
              </button>
              {createdId && (
                <Link
                  className="button secondary"
                  href={`/claims/${createdId}`}
                >
                  {tr("Open saved claim")}
                </Link>
              )}
            </div>
          </form>
        ))
      )}
    </main>
  );
}
