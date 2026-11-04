"use client";
import { useLanguage } from "@/components/language-provider";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
export default function SupplierPortalPage() {
  const { tr, language } = useLanguage();

  const params = useParams<{ token: string }>();
  const [resource, setResource] = useState<{ scope: string; value: any } | null>(null);
  const activeBase = useRef<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const base = `/api/public/claims/${params.token}`;
  const data = resource?.scope === base ? resource.value : null;
  function setData(value: any) {
    setResource(value ? { scope: base, value } : null);
  }
  async function load() {
    const r = await fetch(base);
    const value = r.ok ? await r.json() : null;
    if (activeBase.current !== base) return;
    if (r.ok) {
      setData(value);
      setError("");
    } else {
      setData(null);
      setError("This invitation is unavailable or expired.");
    }
  }
  useEffect(() => {
    activeBase.current = base;
    setMessage("");
    setBusy(false);
    setLoading(true);
    setData(null);
    setError("");
    load()
      .catch(() => { if (activeBase.current === base) setError("Unable to connect"); })
      .finally(() => { if (activeBase.current === base) setLoading(false); });
    return () => { activeBase.current = null; };
  }, [base]);
  async function comment() {
    setBusy(true);
    try {
      const r = await fetch(base + "/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      if (activeBase.current !== base) return;
      if (!r.ok) {
        if (r.status === 404) {
          setData(null);
          throw new Error("This invitation is unavailable or expired.");
        }
        throw new Error((await r.json()).error);
      }
      setMessage("");
      await load();
    } catch (e) {
      if (activeBase.current === base) setError((e as Error).message);
    } finally {
      if (activeBase.current === base) setBusy(false);
    }
  }
  async function upload(file: File) {
    setBusy(true);
    try {
      const body = new FormData();
      body.set("file", file);
      const r = await fetch(base + "/documents", { method: "POST", body });
      if (activeBase.current !== base) return;
      if (!r.ok) {
        if (r.status === 404) {
          setData(null);
          throw new Error("This invitation is unavailable or expired.");
        }
        throw new Error((await r.json()).error);
      }
      await load();
    } catch (e) {
      if (activeBase.current === base) setError((e as Error).message);
    } finally {
      if (activeBase.current === base) setBusy(false);
    }
  }
  return (
    <main className="container">
      <div className="section">
        <h1>{tr("YYachts · Claim access")}</h1>
        {error && <p role="alert">{tr(error)}</p>}
        {!data ? (
          loading ? (
            <p>{tr("Loading claim...")}</p>
          ) : null
        ) : (
          <>
            <h2>{data.claim.title}</h2>
            <p>
              {tr(data.claim.status)} · {data.claim.id}
            </p>
            <p>{data.claim.description}</p>
            <h3>{tr("Comments")}</h3>
            {data.comments.map((c: any) => (
              <div className="comment" key={c.id}>
                <small>{new Date(c.createdAt).toLocaleString(language)}</small>
                <p>{c.message}</p>
              </div>
            ))}
            <textarea
              className="textarea"
              aria-label={tr("Response")}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
            <button
              className="button"
              disabled={busy || !message.trim()}
              onClick={comment}
            >
              {tr("Submit response")}
            </button>
            <h3>{tr("Photos and documents")}</h3>
            {data.documents.map((d: any) => (
              <div key={d.id}>
                {d.mimeType.startsWith("image/") && (
                  <img
                    src={`${base}/documents/${d.id}`}
                    alt={d.fileName}
                    style={{ maxWidth: 300, maxHeight: 220 }}
                  />
                )}
                <p>
                  <a
                    href={`${base}/documents/${d.id}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {d.fileName}
                  </a>
                </p>
              </div>
            ))}
            <label>
              {tr("Upload photo or document (max 5 MB)")}
              <input
                type="file"
                disabled={busy}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) upload(f);
                  e.target.value = "";
                }}
              />
            </label>
          </>
        )}
      </div>
    </main>
  );
}
