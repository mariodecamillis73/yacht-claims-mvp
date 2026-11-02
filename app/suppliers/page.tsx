"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
export default function Suppliers() {
  const empty = { name: "", companyName: "", email: "", phone: "" };
  const [rows, setRows] = useState<any[]>([]),
    [form, setForm] = useState(empty),
    [id, setId] = useState("");
  const [role, setRole] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function load() {
    const r = await fetch("/api/suppliers");
    if (!r.ok) throw new Error("Yard access required");
    setRows(await r.json());
  }
  useEffect(() => {
    load().catch((e) => setError(e.message));
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((u) => setRole(u?.role || ""));
  }, []);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/suppliers", {
        method: id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, ...(id ? { id } : {}) }),
      });
      const b = await r.json();
      if (!r.ok) throw new Error(b.error);
      setForm(empty);
      setId("");
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="container page-shell">
      <Link href="/workhub">Work Hub</Link>
      <h1>Supplier directory</h1>
      {error && <p role="alert">{error}</p>}
      {role === "director" && (
        <form className="section form-grid" onSubmit={submit}>
          <h2>{id ? "Edit supplier" : "New supplier"}</h2>
          <fieldset disabled={busy} className="form-grid">
            {(
              [
                ["name", "Contact name"],
                ["companyName", "Company"],
                ["email", "Email"],
                ["phone", "Phone (optional)"],
              ] as const
            ).map(([key, label]) => (
              <label key={key}>
                {label}
                <input
                  className="input"
                  required={key !== "phone"}
                  maxLength={
                    key === "email" ? 254 : key === "phone" ? 100 : 200
                  }
                  type={key === "email" ? "email" : "text"}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                />
              </label>
            ))}
            <button className="button">Save supplier</button>
            {id && (
              <button
                type="button"
                className="button secondary"
                onClick={() => {
                  setId("");
                  setForm(empty);
                }}
              >
                Cancel
              </button>
            )}
          </fieldset>
        </form>
      )}
      {rows.map((s) => (
        <section className="section" key={s.id}>
          <h2>{s.companyName}</h2>
          <p>
            {s.name} · {s.email} · {s.phone}
          </p>
          {role === "director" && (
            <button
              className="button secondary"
              onClick={() => {
                setId(s.id);
                setForm({
                  name: s.name,
                  companyName: s.companyName,
                  email: s.email,
                  phone: s.phone || "",
                });
                window.scrollTo(0, 0);
              }}
            >
              Edit supplier
            </button>
          )}
        </section>
      ))}
      {!rows.length && ["director", "staff"].includes(role) && (
        <p>No suppliers registered.</p>
      )}
    </main>
  );
}
