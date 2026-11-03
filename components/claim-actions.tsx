"use client";
import { useEffect, useState } from "react";
import { useLanguage } from "@/components/language-provider";
import ClaimEditor from "@/components/claim-editor";
import { nextStatuses, STATUS_LABELS } from "@/lib/claim-workflow";
export default function ClaimActions({
  id,
  onChange,
  claim,
}: {
  id: string;
  claim: any;
  onChange: () => void;
}) {
  const { t, tr, language } = useLanguage();
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [kind, setKind] = useState("supplier");
  const [days, setDays] = useState(30);
  const [shares, setShares] = useState<any[]>([]);
  const [link, setLink] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [visibility, setVisibility] = useState("shared");
  const [reason, setReason] = useState("");
  const [nextStatus, setNextStatus] = useState("");
  const options = nextStatuses(claim.status, claim.validationStatus || "");
  useEffect(() => {
    setNextStatus("");
  }, [claim.status, claim.validationStatus]);
  const base = `/api/claims/${id}`;
  const inside = ["director", "staff"].includes(role);
  async function loadShares() {
    const r = await fetch(base + "/shares");
    if (r.ok) setShares(await r.json());
  }
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((u) => {
        setRole(u?.role || "");
        if (u?.role === "director") loadShares();
      });
  }, [base]);
  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError("");
    try {
      await action();
      onChange();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function json(path: string, method: string, body: unknown) {
    const r = await fetch(path, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const b = await r.json();
    if (!r.ok) throw new Error(b.error);
    return b;
  }
  return (
    <section>
      <h3>{tr("Actions")}</h3>
      {error && <p role="alert">{tr(error)}</p>}
      {inside && <ClaimEditor id={id} claim={claim} onChange={onChange} />}
      {inside && (
        <section className="workflow-actions">
          <h3>{t("workflow")}</h3>
          <p>
            {tr("Current status:")}{" "}
            <strong>{tr(STATUS_LABELS[claim.status] || claim.status)}</strong>{" "}
            {tr("· Validation:")}
            {tr(claim.validationStatus || "pending")}
          </p>
          {claim.validationStatus !== "approved" ? (
            <p>
              {tr(
                "Director approval is required before this claim can advance or close.",
              )}
            </p>
          ) : (
            <>
              <label>
                {t("nextStatus")}
                <select
                  className="input"
                  value={nextStatus}
                  disabled={busy}
                  onChange={(e) => setNextStatus(e.target.value)}
                >
                  <option value="">{tr("Select next status")}</option>
                  {options.map((status) => (
                    <option key={status} value={status}>
                      {tr(STATUS_LABELS[status])}
                    </option>
                  ))}
                </select>
              </label>
              <button
                className="button"
                disabled={busy || !nextStatus}
                onClick={() =>
                  run(async () => {
                    await json(base, "PATCH", { status: nextStatus });
                  })
                }
              >
                {claim.status === "closed" ? t("reopen") : t("updateStatus")}
              </button>
            </>
          )}
        </section>
      )}

      <label>
        {t("comment")}
        <textarea
          className="textarea"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </label>
      {inside && (
        <label>
          {t("visibility")}
          <select
            className="input"
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
          >
            <option value="shared">{t("shared")}</option>
            <option value="internal">{t("internal")}</option>
          </select>
        </label>
      )}
      <button
        className="button"
        disabled={busy || !message.trim()}
        onClick={() =>
          run(async () => {
            await json(base + "/comments", "POST", { message, visibility });
            setMessage("");
          })
        }
      >
        {t("addComment")}
      </button>
      <p>
        <label>
          {tr("Upload photo or document (max 5 MB)")}
          <input
            type="file"
            disabled={busy}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f)
                run(async () => {
                  const body = new FormData();
                  body.set("file", f);
                  body.set("visibility", visibility);
                  const r = await fetch(base + "/documents", {
                    method: "POST",
                    body,
                  });
                  if (!r.ok) throw new Error((await r.json()).error);
                });
              e.target.value = "";
            }}
          />
        </label>
      </p>
      {role === "director" && (
        <>
          <h3>{tr("Director validation")}</h3>
          <label>
            {tr("Rejection reason")}
            <input
              className="input"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </label>
          <button
            className="button"
            disabled={busy || claim.validationStatus !== "pending"}
            onClick={() =>
              run(async () => {
                await json(base + "/validate", "POST", {
                  decision: "approved",
                });
              })
            }
          >
            {tr("Approve")}
          </button>{" "}
          <button
            className="button secondary"
            disabled={
              busy || !reason.trim() || claim.validationStatus !== "pending"
            }
            onClick={() =>
              run(async () => {
                await json(base + "/validate", "POST", {
                  decision: "rejected",
                  rejectionReason: reason,
                });
              })
            }
          >
            {tr("Reject")}
          </button>
          <h3>{tr("Share this claim")}</h3>
          <p>
            {tr(
              "The invitation grants access to shared comments, photos and documents only.",
            )}
          </p>
          <label>
            {tr("Email")}
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label>
            {tr("Participant")}
            <select
              className="input"
              value={kind}
              onChange={(e) => setKind(e.target.value)}
            >
              <option value="supplier">{tr("Supplier")}</option>
              <option value="dealer">{tr("Dealer")}</option>
            </select>
          </label>
          <label>
            {tr("Expires in days")}
            <input
              type="number"
              className="input"
              min={1}
              max={90}
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
            />
          </label>
          <button
            className="button"
            disabled={busy || !email}
            onClick={() =>
              run(async () => {
                const b = await json(base + "/shares", "POST", {
                  email,
                  role: kind,
                  days,
                });
                setLink(window.location.origin + b.path);
                await loadShares();
              })
            }
          >
            {tr("Create access link")}
          </button>
          {link && (
            <div>
              <p>
                {tr(
                  "Copy this link and send it to the authorized email address:",
                )}
              </p>
              <input
                className="input"
                aria-label={tr("Claim access link")}
                readOnly
                value={link}
              />
              <button
                className="button secondary"
                onClick={() =>
                  run(async () => {
                    await navigator.clipboard.writeText(link);
                  })
                }
              >
                {tr("Copy link")}
              </button>
              <p>{tr("Opening the link requires verification via email.")}</p>
            </div>
          )}
          {shares.map((s) => (
            <div className="comment" key={s.id}>
              <p>
                {s.email} · {tr(s.role)} ·{" "}
                {s.revokedAt
                  ? tr("Revoked")
                  : new Date(s.expiresAt) < new Date()
                    ? tr("Expired")
                    : tr("Expires {date}", {
                        date: new Date(s.expiresAt).toLocaleDateString(
                          language,
                        ),
                      })}
              </p>
              {!s.revokedAt && (
                <button
                  className="button secondary"
                  disabled={busy}
                  onClick={() =>
                    run(async () => {
                      await json(base + "/shares", "DELETE", { id: s.id });
                      await loadShares();
                    })
                  }
                >
                  {tr("Revoke access")}
                </button>
              )}
            </div>
          ))}
        </>
      )}
    </section>
  );
}
