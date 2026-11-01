'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function MyYachtPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/my-yacht')
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="container">Loading yacht...</div>;
  if (!data) return <div className="container">No yacht found.</div>;

  return (
    <>
      <div className="topbar">
        <div>Yacht Claims MVP</div>
        <nav>
          <Link href="/my-yacht">My Yacht</Link>
          <Link href="/login">Login</Link>
        </nav>
      </div>

      <div className="container page-shell">
        <div className="section">
          <h2>{data.yacht.name}</h2>
          <div className="muted">{data.yacht.yachtNumber} • {data.yacht.registrationNumber}</div>
        </div>

        <div className="section">
          <h3>Your claims</h3>
          <div className="grid" style={{ gap: 12 }}>
            {data.claims.map((claim: any) => (
              <Link key={claim.id} href={`/claims/${claim.id}`} className="list-row">
                <div>
                  <strong>{claim.title}</strong>
                  <div className="muted">{claim.id}</div>
                </div>
                <span className={`badge status-${claim.status}`}>{claim.status}</span>
                <span className={`badge priority-${claim.priority}`}>{claim.priority}</span>
                <span className="muted">{new Date(claim.updatedAt).toLocaleDateString()}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
