'use client';

import { useEffect, useState } from 'react';

export default function SupplierPortalPage({ params }: { params: { token: string } }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/public/claims/${params.token}`)
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      });
  }, [params.token]);

  if (loading) return <div className="container">Loading supplier portal...</div>;
  if (!data) return <div className="container">This claim is not available.</div>;

  return (
    <div className="container">
      <div className="section">
        <h2>{data.title}</h2>
        <div className="muted">Claim ID: {data.id}</div>
        <div style={{ marginTop: 20 }}>
          <strong>Description</strong>
          <p>{data.description}</p>
        </div>

        <div style={{ marginTop: 20 }}>
          <strong>Response</strong>
          <textarea className="textarea" rows={6} placeholder="Provide your response here..." />
        </div>

        <div style={{ marginTop: 20 }}>
          <button className="button">Submit response</button>
        </div>
      </div>
    </div>
  );
}
