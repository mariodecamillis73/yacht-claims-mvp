"use client";
import { useLanguage } from "@/components/language-provider";

import YachtDocuments from "@/components/yacht-documents";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { EQUIPMENT, PAINTING } from "@/lib/yacht-profile";
export default function YachtOverviewPage() {
  const { tr, language } = useLanguage();

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
    return <div className="container">{tr("Loading yacht overview...")}</div>;
  if (!data) return <div className="container">{tr("Yacht not found.")}</div>;

  return (
    <>
      <div className="topbar">
        <div>Yacht Claims MVP</div>
        <nav>
          <Link href="/workhub">{tr("Work Hub")}</Link>
          <Link href={`/yachts/${data.id}`}>{tr("Yacht Overview")}</Link>
          <Link href="/my-yacht">{tr("My Yacht")}</Link>
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
              {["director", "staff"].includes(role) && (
                <a className="button secondary" href="#yacht-documents">
                  {tr("Add document")}
                </a>
              )}
              {role === "director" && (
                <Link
                  className="button secondary"
                  href={`/yachts/${encodeURIComponent(data.hullNumber)}/edit`}
                >
                  {tr("Edit yacht")}
                </Link>
              )}
              <Link
                className="button"
                href={`/claims/new?yacht=${encodeURIComponent(data.hullNumber)}`}
              >
                {tr("New claim")}
              </Link>
            </div>
          </div>

          <div className="summary-cards">
            <div className="summary-card">
              <span className="muted">{tr("Open claims")}</span>
              <strong>
                {
                  data.claims.filter(
                    (c: any) => !["closed", "rejected"].includes(c.status),
                  ).length
                }
              </strong>
            </div>
            <div className="summary-card">
              <span className="muted">{tr("Overdue")}</span>
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
              <span className="muted">{tr("Supplier pending")}</span>
              <strong>
                {
                  data.claims.filter(
                    (c: any) => c.status === "supplier_pending",
                  ).length
                }
              </strong>
            </div>
            <div className="summary-card">
              <span className="muted">{tr("Closed")}</span>
              <strong>
                {data.claims.filter((c: any) => c.status === "closed").length}
              </strong>
            </div>
          </div>
        </div>

        <div className="layout-grid">
          <div className="section">
            <h3>{tr("Yacht details")}</h3>
            <p>
              {tr("Hull number:")}
              {data.hullNumber}
            </p>
            <p>
              {tr("Year built:")}
              {data.yearBuilt}
            </p>
            <p>
              {tr("Delivery to customer:")}{" "}
              {data.deliveryDate?.slice(0, 10) || tr("Not specified")}
            </p>
            <p>
              {tr("Yacht warranty:")}{" "}
              {data.warrantyYears
                ? tr(data.warrantyYears === 1 ? "1 year" : "2 years")
                : tr("Not specified")}
            </p>
            <p>
              {tr("Warranty expiry:")}{" "}
              {data.warrantyExpiresAt?.slice(0, 10) || tr("Not specified")}
            </p>
            <p>
              {tr("Captain:")}
              {data.captainName || tr("Not specified")}
            </p>
            <p>
              {tr("Owner / company:")}
              {data.ownerId || tr("Not specified")}
            </p>
            <p>{tr("Photos and documents can be added to each claim.")}</p>
            <div className="section-header">
              <h3>{tr("Technical profile")}</h3>
              {role === "director" && (
                <Link
                  className="button secondary"
                  href={`/yachts/${encodeURIComponent(data.hullNumber)}/edit#technical-fields`}
                >
                  + {tr("New field")}
                </Link>
              )}
            </div>
            {[...EQUIPMENT, ...PAINTING].map(([key, title]) => {
              const item =
                data.technicalProfile?.equipment?.[key] ||
                data.technicalProfile?.painting?.[key] ||
                {};
              const rows = key.endsWith("Painting")
                ? [
                    [tr("Product brand"), item.brand],
                    [tr("Paint type"), item.paintType],
                    [tr("Color code"), item.colorCode],
                  ]
                : [
                    [tr("Brand"), item.brand],
                    [tr("Model"), item.model],
                    ...(key === "propellers"
                      ? []
                      : [[tr("Power"), item.power]]),
                    [tr("Serial Nr"), item.serialNumber],
                  ];
              return (
                <section className="section" key={key}>
                  <h4>{tr(title)}</h4>
                  <table className="mini-table">
                    <thead>
                      <tr>
                        <th>{tr("Field")}</th>
                        <th>{tr("Value")}</th>
                        <th>{tr("Unit")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map(([name, value]) => (
                        <tr key={name}>
                          <td>{name}</td>
                          <td>{value || "—"}</td>
                          <td>—</td>
                        </tr>
                      ))}
                      {(data.technicalProfile?.customFields || [])
                        .filter((f: any) => f.section === key)
                        .map((f: any) => (
                          <tr key={f.id}>
                            <td>{f.name}</td>
                            <td>{f.value}</td>
                            <td>{f.unit || "—"}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </section>
              );
            })}
            <YachtDocuments
              id={data.hullNumber}
              documents={data.documents || []}
              canUpload={["director", "staff"].includes(role)}
              onChange={() =>
                fetch(`/api/yachts/${encodeURIComponent(data.hullNumber)}`)
                  .then((r) => r.json())
                  .then(setData)
              }
            />
          </div>

          <div className="section">
            <h3>{tr("Claims")}</h3>
            {data.claims.length === 0 && <p>{tr("No claims yet.")}</p>}
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
                    {tr(claim.status)}
                  </span>
                  <span className={`badge priority-${claim.priority}`}>
                    {tr(claim.priority)}
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
