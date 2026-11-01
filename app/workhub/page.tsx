'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function WorkhubPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('/api/workhub', {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined
    })
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="container">Loading Work Hub...</div>;
  if (!data) return <div className="container">Unable to load Work Hub.</div>;

  return (
    <>
      <div className="topbar">
        <div>Yacht Claims MVP</div>
        <nav>
          <Link href="/workhub">Work Hub</Link>
          <Link href="/yachts/yacht-1">Yacht Overview</Link>
          <Link href="/my-yacht">My Yacht</Link>
          <button
            className="button secondary"
            onClick={() => {
              localStorage.removeItem('token');
              window.location.href = '/login';
            }}
          >
            Logout
          </button>
        </nav>
      </div>

      <div className="container page-shell">
        <div className="section">
          <div className="section-header">
            <h2>Work Hub</h2>
            <div className="inline-actions">
              <span className="badge status-open">My Work</span>
              <span className="badge status-supplier_pending">Overdue</span>
              <span className="badge status-closed">Recently updated</span>
            </div>
          </div>

          <div className="grid grid-2">
            {data.yachts.map((yacht: any) => (
              <div key={yacht.id} className="card" style={{ padding: 16 }}>
                <div className="section-header">
                  <div>
                    <strong>{yacht.name}</strong>
                    <div className="muted">{yacht.yachtNumber}</div>
                  </div>
                  <Link href={`/yachts/${yacht.id}`} className="button secondary">Open</Link>
                </div>

                <div className="grid" style={{ gap: 10 }}>
                  {yacht.claims.map((claim: any) => (
                    <Link key={claim.id} href={`/claims/${claim.id}`} className="list-row">
                      <div>
                        <strong>{claim.title}</strong>
                        <div className="muted">{claim.id}</div>
                      </div>
                      <span className={`badge status-${claim.status}`}>{claim.status}</span>
                      <span className={`badge priority-${claim.priority}`}>{claim.priority}</span>
                      <span>{claim.assignedTo}</span>
                      <span className="muted">{new Date(claim.updatedAt).toLocaleDateString()}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
