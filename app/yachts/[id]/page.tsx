"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { EQUIPMENT, PAINTING } from "@/lib/yacht-profile";
export default function YachtOverviewPage() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((u) => setRole(u?.role || ""))
      .catch(() => {});
    fetch(`/api/yachts/${params.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Unable to load yacht");
        return res.json();
      })
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  if (loading)
    return <div className="container">Loading yacht overview...</div>;
  if (!data) return <div className="container">Yacht not found.</div>;

  return (
    <>
      <div className="topbar">
        <div>Yacht Claims MVP</div>
        <nav>
          <Link href="/workhub">Work Hub</Link>
          <Link href={`/yachts/${data.id}`}>Yacht Overview</Link>
          <Link href="/my-yacht">My Yacht</Link>
        </nav>
      </div>

      <div className="container page-shell">
        <div className="section">
          <div className="claim-header">
            <div>
              <h2>{data.name}</h2>
              <div className="muted">
                {data.yachtNumber} · {data.yearBuilt}
              </div>
            </div>
            <div className="claim-header-actions">
              {role === "director" && (
                <Link
                  className="button secondary"
                  href={`/yachts/${encodeURIComponent(data.hullNumber)}/edit`}
                >
                  Edit yacht
                </Link>
              )}
              <Link
                className="button"
                href={`/claims/new?yacht=${encodeURIComponent(data.hullNumber)}`}
              >
                New claim
              </Link>
            </div>
          </div>

          <div className="summary-cards">
            <div className="summary-card">
              <span className="muted">Open claims</span>
              <strong>
                {
                  data.claims.filter(
                    (c: any) => !["closed", "rejected"].includes(c.status),
                  ).length
                }
              </strong>
            </div>
            <div className="summary-card">
              <span className="muted">Overdue</span>
              <strong>
                {
                  data.claims.filter(
                    (c: any) =>
                      c.dueDate &&
                      new Date(c.dueDate) < new Date() &&
                      !["closed", "rejected"].includes(c.status),
                  ).length
                }
              </strong>
            </div>
            <div className="summary-card">
              <span className="muted">Supplier pending</span>
              <strong>
                {
                  data.claims.filter(
                    (c: any) => c.status === "supplier_pending",
                  ).length
                }
              </strong>
            </div>
            <div className="summary-card">
              <span className="muted">Closed</span>
              <strong>
                {data.claims.filter((c: any) => c.status === "closed").length}
              </strong>
            </div>
          </div>
        </div>

        <div className="layout-grid">
          <div className="section">
            <h3>Yacht details</h3>
            <p>Hull number: {data.hullNumber}</p>
            <p>Year built: {data.yearBuilt}</p>
            <p>
              Delivery to customer:{" "}
              {data.deliveryDate?.slice(0, 10) || "Not specified"}
            </p>
            <p>
              Yacht warranty:{" "}
              {data.warrantyYears
                ? `${data.warrantyYears} year(s)`
                : "Not specified"}
            </p>
            <p>
              Warranty expiry:{" "}
              {data.warrantyExpiresAt?.slice(0, 10) || "Not specified"}
            </p>
            <p>Captain: {data.captainName || "Not specified"}</p>
            <p>Owner / company: {data.ownerId || "Not specified"}</p>
            <p>Photos and documents can be added to each claim.</p>
            <h3>Equipment</h3>
            {EQUIPMENT.map(([key, title]) => {
              const item = data.technicalProfile?.equipment?.[key];
              return (
                <section key={key} className="section">
                  <h4>{title}</h4>
                  <p>Brand: {item?.brand || "—"}</p>
                  <p>Model: {item?.model || "—"}</p>
                  {key !== "propellers" && <p>Power: {item?.power || "—"}</p>}
                  <p>Serial Nr: {item?.serialNumber || "—"}</p>
                </section>
              );
            })}
            <h3>Painting systems</h3>
            {PAINTING.map(([key, title]) => {
              const item = data.technicalProfile?.painting?.[key];
              return (
                <section key={key} className="section">
                  <h4>{title}</h4>
                  <p>Product brand: {item?.brand || "—"}</p>
                  <p>Paint type: {item?.paintType || "—"}</p>
                  <p>Color code: {item?.colorCode || "—"}</p>
                </section>
              );
            })}
          </div>

          <div className="section">
            <h3>Claims</h3>
            {data.claims.length === 0 && <p>No claims yet.</p>}
            <div className="grid" style={{ gap: 12 }}>
              {data.claims.map((claim: any) => (
                <Link
                  key={claim.id}
                  href={`/claims/${claim.id}`}
                  className="list-row"
                >
                  <div>
                    <strong>{claim.title}</strong>
                    <div className="muted">{claim.id}</div>
                  </div>
                  <span className={`badge status-${claim.status}`}>
                    {claim.status}
                  </span>
                  <span className={`badge priority-${claim.priority}`}>
                    {claim.priority}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
