'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function YachtOverviewPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/yachts/${params.id}`)
      .then((res) => { if (!res.ok) throw new Error('Unable to load yacht'); return res.json(); })
      .then((json) => {
        setData(json);
        setLoading(false);
      }).catch(() => setLoading(false));
  }, [params.id]);

  if (loading) return <div className="container">Loading yacht overview...</div>;
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
              <div className="muted">{data.yachtNumber} • {data.registrationNumber}</div>
            </div>
            <div className="claim-header-actions">
              <button className="button secondary">New claim</button>
              <button className="button">Add document</button>
            </div>
          </div>

          <div className="summary-cards">
            <div className="summary-card"><span className="muted">Open claims</span><strong>{data.claims.filter((c: any) => c.status !== 'closed').length}</strong></div>
            <div className="summary-card"><span className="muted">Overdue</span><strong>—</strong></div>
            <div className="summary-card"><span className="muted">Supplier pending</span><strong>{data.claims.filter((c: any) => c.status === 'supplier_pending').length}</strong></div>
            <div className="summary-card"><span className="muted">Closed</span><strong>{data.claims.filter((c: any) => c.status === 'closed').length}</strong></div>
          </div>
        </div>

        <div className="layout-grid">
          <div className="section">
            <h3>Technical profile</h3>
            {data.technicalProfile.map((section: any) => (
              <div key={section.sectionName} style={{ marginTop: 18 }}>
                <div className="section-header">
                  <strong>{section.displayName}</strong>
                  <button className="button secondary">+ New field</button>
                </div>
                <table className="mini-table">
                  <thead>
                    <tr>
                      <th>Field</th>
                      <th>Value</th>
                      <th>Unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {section.fields.map((field: any) => (
                      <tr key={field.id}>
                        <td>{field.displayName}</td>
                        <td>{field.value}</td>
                        <td>{field.unit || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>

          <div className="section">
            <h3>Claims</h3>
            <div className="grid" style={{ gap: 12 }}>
              {data.claims.map((claim: any) => (
                <Link key={claim.id} href={`/claims/${claim.id}`} className="list-row">
                  <div>
                    <strong>{claim.title}</strong>
                    <div className="muted">{claim.id}</div>
                  </div>
                  <span className={`badge status-${claim.status}`}>{claim.status}</span>
                  <span className={`badge priority-${claim.priority}`}>{claim.priority}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
