"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  EQUIPMENT,
  PAINTING,
  emptyTechnicalProfile,
  warrantyExpiry,
} from "@/lib/yacht-profile";
type Yacht = {
  hullNumber: string;
  name: string;
  yearBuilt: number;
  captainName: string;
  ownerId: string;
  deliveryDate?: string;
  warrantyExpiresAt?: string;
};
export default function YachtsPage({ editHull }: { editHull?: string }) {
  const router = useRouter();
  const [revision, setRevision] = useState("");
  const [editReady, setEditReady] = useState(false);
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
    deliveryDate: "",
    warrantyYears: 2,
    technicalProfile: emptyTechnicalProfile(),
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
    async function initialize() {
      const auth = await fetch("/api/auth/me");
      if (!auth.ok) throw new Error("Please sign in");
      const actor = await auth.json();
      setRole(actor.role);
      if (editHull) {
        if (actor.role !== "director")
          throw new Error("Administrator access required");
        const r = await fetch(`/api/yachts/${encodeURIComponent(editHull)}`);
        if (!r.ok) throw new Error("Unable to load yacht");
        const y = await r.json();
        const profile = emptyTechnicalProfile();
        for (const [key] of EQUIPMENT)
          profile.equipment[key] = {
            ...profile.equipment[key],
            ...y.technicalProfile?.equipment?.[key],
          };
        for (const [key] of PAINTING)
          profile.painting[key] = {
            ...profile.painting[key],
            ...y.technicalProfile?.painting?.[key],
          };
        setForm({
          hullNumber: y.hullNumber,
          name: y.name,
          yearBuilt: y.yearBuilt,
          captainName: y.captainName,
          ownerId: y.ownerId,
          deliveryDate: y.deliveryDate?.slice(0, 10) || "",
          warrantyYears: y.warrantyYears || 2,
          technicalProfile: profile,
        });
        setRevision(y.updatedAt);
        setEditReady(true);
        setOpen(true);
      } else await load();
    }
    initialize()
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [editHull]);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const r = await fetch(
        editHull
          ? `/api/yachts/${encodeURIComponent(editHull)}`
          : "/api/yachts",
        {
          method: editHull ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            ...(editHull ? { updatedAt: revision } : {}),
            deliveryDate: form.deliveryDate || undefined,
            warrantyYears: form.deliveryDate ? form.warrantyYears : undefined,
          }),
        },
      );
      const b = await r.json();
      if (!r.ok) throw new Error(b.error);
      if (editHull) {
        router.push(`/yachts/${encodeURIComponent(b.hullNumber)}`);
        router.refresh();
        return;
      }
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
        <h1>{editHull ? "Edit yacht" : "Yachts"}</h1>
        {!editHull && ["director", "staff"].includes(role) && (
          <button className="button" onClick={() => setOpen(!open)}>
            {open ? "Cancel" : "New yacht"}
          </button>
        )}
      </div>
      {error && <p role="alert">{error}</p>}
      {success && <p role="status">{success}</p>}
      {editHull && (
        <Link href={`/yachts/${encodeURIComponent(editHull)}`}>
          Cancel / Back to yacht
        </Link>
      )}
      {open && (!editHull || editReady) && (
        <form className="section form-grid" onSubmit={submit}>
          <h2>{editHull ? "Edit yacht details" : "New yacht"}</h2>
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
            <label>
              Delivery to customer
              <input
                className="input"
                type="date"
                min="1900-01-01"
                max="2200-12-31"
                value={form.deliveryDate}
                onChange={(e) =>
                  setForm({ ...form, deliveryDate: e.target.value })
                }
              />
            </label>
            <label>
              Yacht warranty duration
              <select
                className="input"
                value={form.warrantyYears}
                onChange={(e) =>
                  setForm({ ...form, warrantyYears: Number(e.target.value) })
                }
              >
                <option value={1}>1 year</option>
                <option value={2}>2 years</option>
              </select>
            </label>
            <label>
              Warranty expiry (from delivery)
              <input
                className="input"
                type="date"
                readOnly
                value={
                  form.deliveryDate
                    ? warrantyExpiry(form.deliveryDate, form.warrantyYears)
                    : ""
                }
              />
            </label>
            <p>
              Leave delivery blank if the yacht has not yet been delivered.
              Enter power with its unit, e.g. kW, hp or BTU/h.
            </p>
            {EQUIPMENT.map(([key, title]) => (
              <fieldset key={key} className="section form-grid">
                <legend>{title}</legend>
                {(
                  [
                    ["brand", "Brand"],
                    ["model", "Model"],
                    ...(key === "propellers"
                      ? []
                      : [["power", "Power (include unit)"]]),
                    ["serialNumber", "Serial Nr"],
                  ] as [string, string][]
                ).map(([field, label]) => (
                  <label key={field}>
                    {label}
                    <input
                      className="input"
                      maxLength={200}
                      value={
                        form.technicalProfile.equipment[key][
                          field as keyof (typeof form.technicalProfile.equipment)[string]
                        ]
                      }
                      onChange={(e) =>
                        setForm({
                          ...form,
                          technicalProfile: {
                            ...form.technicalProfile,
                            equipment: {
                              ...form.technicalProfile.equipment,
                              [key]: {
                                ...form.technicalProfile.equipment[key],
                                [field]: e.target.value,
                              },
                            },
                          },
                        })
                      }
                    />
                  </label>
                ))}
              </fieldset>
            ))}
            {PAINTING.map(([key, title]) => (
              <fieldset key={key} className="section form-grid">
                <legend>{title}</legend>
                {(
                  [
                    ["brand", "Product brand"],
                    ["paintType", "Paint type"],
                    ["colorCode", "Color code"],
                  ] as const
                ).map(([field, label]) => (
                  <label key={field}>
                    {label}
                    <input
                      className="input"
                      maxLength={200}
                      value={form.technicalProfile.painting[key][field]}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          technicalProfile: {
                            ...form.technicalProfile,
                            painting: {
                              ...form.technicalProfile.painting,
                              [key]: {
                                ...form.technicalProfile.painting[key],
                                [field]: e.target.value,
                              },
                            },
                          },
                        })
                      }
                    />
                  </label>
                ))}
              </fieldset>
            ))}
            <button className="button">
              {busy ? "Saving…" : editHull ? "Save changes" : "Create yacht"}
            </button>
          </fieldset>
          <p>
            Representatives receive access when assigned to this yacht in Users.
          </p>
        </form>
      )}
      {loading ? (
        <p>Loading yachts…</p>
      ) : !editHull ? (
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
              {y.deliveryDate && (
                <p>
                  Delivered: {y.deliveryDate.slice(0, 10)} · Warranty until:{" "}
                  {y.warrantyExpiresAt?.slice(0, 10)}
                </p>
              )}
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
      ) : null}
    </main>
  );
}
