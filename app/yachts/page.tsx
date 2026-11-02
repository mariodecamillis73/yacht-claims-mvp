"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
type Yacht = {
  hullNumber: string;
  name: string;
  yearBuilt: number;
  captainName: string;
  ownerId: string;
};
export default function YachtsPage() {
  const [yachts, setYachts] = useState<Yacht[]>([]);
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const empty = {
    hullNumber: "",
    name: "",
    yearBuilt: new Date().getFullYear(),
    captainName: "",
    ownerId: "",
  };
  const [form, setForm] = useState(empty);
  async function load() {
    const r = await fetch("/api/yachts");
    if (!r.ok)
      throw new Error(
        r.status === 401
          ? "Please sign in to view yachts"
          : "Unable to load yachts",
      );
    setYachts(await r.json());
  }
  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then(async (r) => {
        if (!r.ok) throw new Error("Please sign in");
        setRole((await r.json()).role);
      }),
      load(),
    ])
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const r = await fetch("/api/yachts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const b = await r.json();
      if (!r.ok) throw new Error(b.error);
      setForm(empty);
      setOpen(false);
      setSuccess(`Yacht ${b.name} (${b.hullNumber}) created.`);
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="container page-shell">
      <nav className="inline-actions">
        <Link href="/workhub">Work Hub</Link>
        <Link href="/my-yacht">My yachts</Link>
        {role === "director" && <Link href="/users">Users</Link>}
      </nav>
      <div className="section-header">
        <h1>Yachts</h1>
        {["director", "staff"].includes(role) && (
          <button className="button" onClick={() => setOpen(!open)}>
            {open ? "Cancel" : "New yacht"}
          </button>
        )}
      </div>
      {error && <p role="alert">{error}</p>}
      {success && <p role="status">{success}</p>}
      {open && (
        <form className="section form-grid" onSubmit={submit}>
          <h2>New yacht</h2>
          <fieldset disabled={busy} className="form-grid">
            <label>
              Hull number
              <input
                className="input"
                required
                maxLength={50}
                pattern="[A-Za-z0-9][A-Za-z0-9._\-]*"
                title="Letters, numbers, dots, hyphens and underscores"
                value={form.hullNumber}
                onChange={(e) =>
                  setForm({ ...form, hullNumber: e.target.value })
                }
              />
            </label>
            <label>
              Yacht name
              <input
                className="input"
                required
                maxLength={200}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </label>
            <label>
              Year built
              <input
                type="number"
                className="input"
                min={1900}
                max={2200}
                required
                value={form.yearBuilt}
                onChange={(e) =>
                  setForm({ ...form, yearBuilt: Number(e.target.value) })
                }
              />
            </label>
            <label>
              Captain (optional)
              <input
                className="input"
                maxLength={200}
                value={form.captainName}
                onChange={(e) =>
                  setForm({ ...form, captainName: e.target.value })
                }
              />
            </label>
            <label>
              Owner / company (optional)
              <input
                className="input"
                maxLength={200}
                value={form.ownerId}
                onChange={(e) => setForm({ ...form, ownerId: e.target.value })}
              />
            </label>
            <button className="button">
              {busy ? "Saving…" : "Create yacht"}
            </button>
          </fieldset>
          <p>
            Representatives receive access when assigned to this yacht in Users.
          </p>
        </form>
      )}
      {loading ? (
        <p>Loading yachts…</p>
      ) : (
        <div className="grid grid-2">
          {yachts.map((y) => (
            <section
              className="card"
              style={{ padding: 20 }}
              key={y.hullNumber}
            >
              <h2>
                <Link href={`/yachts/${encodeURIComponent(y.hullNumber)}`}>
                  {y.name}
                </Link>
              </h2>
              <p>
                {y.hullNumber} · {y.yearBuilt}
              </p>
              <p>Captain: {y.captainName || "Not specified"}</p>
              <Link
                className="button"
                href={`/claims/new?yacht=${encodeURIComponent(y.hullNumber)}`}
              >
                New claim
              </Link>
            </section>
          ))}
          {!yachts.length && !error && (
            <p>
              No yachts yet. Create the first yacht to start registering claims.
            </p>
          )}
        </div>
      )}
    </main>
  );
}
