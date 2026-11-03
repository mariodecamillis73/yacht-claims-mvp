"use client";
import { useLanguage } from "@/components/language-provider";

import Link from "next/link";
import ClaimActions from "@/components/claim-actions";
import { STATUS_LABELS } from "@/lib/claim-workflow";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function ClaimPage() {
  const { tr, language } = useLanguage();

  const params = useParams<{ id: string }>();
  const [role, setRole] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((u) => setRole(u?.role || ""))
      .catch(() => {});
    fetch(`/api/claims/${params.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Unable to load claim");
        return res.json();
      })
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  if (loading) return <div className="container">{tr("Loading claim...")}</div>;
  if (!data) return <div className="container">{tr("Claim not found.")}</div>;

  return (
    <>
      <div className="topbar">
        <div>Yacht Claims MVP</div>
        <nav>
          <Link href="/workhub">{tr("Work Hub")}</Link>
          {["director", "staff", "representative"].includes(role) && (
            <Link href={`/yachts/${data.claim.yachtHullNumber}`}>
              {tr("Yacht Overview")}
            </Link>
          )}
          {role === "representative" && (
            <Link href="/my-yacht">{tr("My Yacht")}</Link>
          )}
        </nav>
      </div>

      <div className="container page-shell">
        <div className="section">
          <div className="claim-header">
            <div>
              <h2>{data.claim.title}</h2>
              <div className="muted">
                {data.claim.id} •{" "}
                {tr(STATUS_LABELS[data.claim.status] || data.claim.status)}
              </div>
            </div>
            <div className="claim-header-actions">
              {data.previousClaimId ? (
                <Link
                  href={`/claims/${data.previousClaimId}`}
                  className="button secondary"
                >
                  {tr("Previous")}
                </Link>
              ) : (
                <button className="button secondary" disabled>
                  {tr("Previous")}
                </button>
              )}
              {data.nextClaimId ? (
                <Link href={`/claims/${data.nextClaimId}`} className="button">
                  {tr("Next")}
                </Link>
              ) : (
                <button className="button" disabled>
                  {tr("Next")}
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-3">
            <div className="summary-card">
              <span className="muted">{tr("Yacht")}</span>
              <strong>{data.claim.yachtHullNumber}</strong>
            </div>
            <div className="summary-card">
              <span className="muted">{tr("Priority")}</span>
              <strong>{tr(data.claim.priority)}</strong>
            </div>
            <div className="summary-card">
              <span className="muted">{tr("Warranty")}</span>
              <strong>{tr(data.claim.warrantyStatus || "—")}</strong>
            </div>
          </div>
        </div>

        <div className="layout-grid">
          <div className="section">
            <h3>{tr("Description")}</h3>
            <p style={{ whiteSpace: "pre-wrap" }}>{data.claim.description}</p>
            {data.claim.dueDate && (
              <p>
                {tr("Target completion:")}
                {data.claim.dueDate.slice(0, 10)} (UTC)
              </p>
            )}
            {data.claim.closedAt && (
              <p>
                {tr("Closed:")}
                {new Date(data.claim.closedAt).toLocaleString(language)}
              </p>
            )}
            {data.claim.rejectedReason && (
              <p>
                {tr("Rejection reason:")}
                {data.claim.rejectedReason}
              </p>
            )}
            {!!data.activity?.length && (
              <section>
                <h3>{tr("Internal history")}</h3>
                {data.activity.map((entry: any) => (
                  <p key={entry.id}>
                    <small>
                      {new Date(entry.createdAt).toLocaleString(language)}
                    </small>{" "}
                    ·{" "}
                    {entry.action === "status_changed"
                      ? entry.details
                          .split(" → ")
                          .map((label: string) => tr(label))
                          .join(" → ")
                      : entry.action === "updated"
                        ? tr("Claim details updated")
                        : entry.action === "approved"
                          ? tr("Director approval")
                          : entry.action === "created"
                            ? tr("Claim submitted for director validation")
                            : entry.details}
                  </p>
                ))}
              </section>
            )}

            <div style={{ marginTop: 18 }}>
              <h3>{tr("Comments")}</h3>
              <div className="grid" style={{ gap: 12 }}>
                {data.comments.map((comment: any) => (
                  <div key={comment.id} className="comment">
                    <div className="muted">
                      {tr(comment.visibility)} • {comment.userId} •{" "}
                      {new Date(comment.createdAt).toLocaleString(language)}
                    </div>
                    <div style={{ marginTop: 8 }}>{comment.message}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="section">
            <ClaimActions
              id={params.id}
              claim={data.claim}
              onChange={() => {
                fetch(`/api/claims/${params.id}`)
                  .then((r) => {
                    if (r.ok) return r.json();
                    throw new Error();
                  })
                  .then(setData)
                  .catch(() => setData(null));
              }}
            />
            <h3>{tr("Photos and documents")}</h3>
            {data.documents.map((d: any) => (
              <div key={d.id}>
                {d.mimeType.startsWith("image/") && (
                  <img
                    src={`/api/claims/${params.id}/documents/${d.id}`}
                    alt={d.fileName}
                    style={{ maxWidth: "100%" }}
                  />
                )}
                <p>
                  <a
                    href={`/api/claims/${params.id}/documents/${d.id}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {d.fileName}
                  </a>{" "}
                  · {tr(d.visibility)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
