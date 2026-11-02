'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function ClaimPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/claims/${params.id}`)
      .then((res) => { if (!res.ok) throw new Error('Unable to load claim'); return res.json(); })
      .then((json) => {
        setData(json);
        setLoading(false);
      }).catch(() => setLoading(false));
  }, [params.id]);

  if (loading) return <div className="container">Loading claim...</div>;
  if (!data) return <div className="container">Claim not found.</div>;

  return (
    <>
      <div className="topbar">
        <div>Yacht Claims MVP</div>
        <nav>
          <Link href="/workhub">Work Hub</Link>
          <Link href={`/yachts/${data.claim.yachtHullNumber}`}>Yacht Overview</Link>
          <Link href="/my-yacht">My Yacht</Link>
        </nav>
      </div>

      <div className="container page-shell">
        <div className="section">
          <div className="claim-header">
            <div>
              <h2>{data.claim.title}</h2>
              <div className="muted">{data.claim.id} • {data.claim.status}</div>
            </div>
            <div className="claim-header-actions">
              <Link href={data.previousClaimId ? `/claims/${data.previousClaimId}` : '#'} className="button secondary">Previous</Link>
              <Link href={data.nextClaimId ? `/claims/${data.nextClaimId}` : '#'} className="button">Next</Link>
            </div>
          </div>

          <div className="grid grid-3">
            <div className="summary-card"><span className="muted">Yacht</span><strong>{data.claim.yachtHullNumber}</strong></div>
            <div className="summary-card"><span className="muted">Priority</span><strong>{data.claim.priority}</strong></div>
            <div className="summary-card"><span className="muted">Warranty</span><strong>{data.claim.warrantyStatus}</strong></div>
          </div>
        </div>

        <div className="layout-grid">
          <div className="section">
            <h3>Description</h3>
            <p>{data.claim.description}</p>

            <div style={{ marginTop: 18 }}>
              <h3>Comments</h3>
              <div className="grid" style={{ gap: 12 }}>
                {data.comments.map((comment: any) => (
                  <div key={comment.id} className="comment">
                    <div className="muted">{comment.userId} • {new Date(comment.createdAt).toLocaleString()}</div>
                    <div style={{ marginTop: 8 }}>{comment.message}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="section">
            <h3>Actions</h3>
            <div className="grid" style={{ gap: 12 }}>
              <button className="button secondary">Update status</button>
              <button className="button secondary">Assign user</button>
              <button className="button secondary">Add note</button>
              <button className="button secondary">Upload document</button>
              <button className="button">Validate claim</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
