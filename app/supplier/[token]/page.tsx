"use client";
import { useLanguage } from "@/components/language-provider";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
export default function SupplierPortalPage() {
  const { tr, language } = useLanguage();

  const params = useParams<{ token: string }>();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const base = `/api/public/claims/${params.token}`;
  async function load() {
    const r = await fetch(base);
    if (r.ok) {
      setData(await r.json());
      setError("");
    } else if (r.status !== 401) {
      setError(tr("This invitation is unavailable or expired."));
    }
  }
  useEffect(() => {
    load().catch(() => setError(tr("Unable to connect")));
  }, [base]);
  async function verify(send: boolean) {
    setBusy(true);
    setError("");
    try {
      const r = await fetch(base + "/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(send ? {} : { code }),
      });
      const b = await r.json();
      if (!r.ok) throw new Error(b.error);
      if (send) setSent(true);
      else await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function comment() {
    setBusy(true);
    try {
      const r = await fetch(base + "/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      if (!r.ok) throw new Error((await r.json()).error);
      setMessage("");
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function upload(file: File) {
    setBusy(true);
    try {
      const body = new FormData();
      body.set("file", file);
      const r = await fetch(base + "/documents", { method: "POST", body });
      if (!r.ok) throw new Error((await r.json()).error);
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="container">
      <div className="section">
        <h1>{tr("YYachts · Claim access")}</h1>
        {error && <p role="alert">{tr(error)}</p>}
        {!data ? (
          <>
            <p>
              {tr(
                "Verify access using a code sent to the email address authorized by the yard.",
              )}
            </p>
            <button
              className="button"
              disabled={busy}
              onClick={() => verify(true)}
            >
              {tr("Send verification code")}
            </button>
            {sent && (
              <>
                <p>{tr("Check your email. The code expires in 10 minutes.")}</p>
                <input
                  className="input"
                  aria-label={tr("Verification code")}
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
                <button
                  className="button"
                  disabled={busy || code.length !== 6}
                  onClick={() => verify(false)}
                >
                  {tr("Verify and open claim")}
                </button>
              </>
            )}
          </>
        ) : (
          <>
            <h2>{data.claim.title}</h2>
            <p>
              {data.claim.status} · {data.claim.id}
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
