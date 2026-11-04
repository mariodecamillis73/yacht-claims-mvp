"use client";
import { useLanguage } from "@/components/language-provider";
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
  const { tr, language } = useLanguage();

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
          ? tr("Please sign in to view yachts")
          : tr("Unable to load yachts"),
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
        profile.customFields = y.technicalProfile?.customFields || [];
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
      setSuccess(
        tr("Yacht {name} ({hull}) created.", {
          name: b.name,
          hull: b.hullNumber,
        }),
      );
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
        <Link href="/workhub">{tr("Work Hub")}</Link>
        <Link href="/my-yacht">{tr("My yachts")}</Link>
        {role === "director" && <Link href="/users">{tr("Users")}</Link>}
      </nav>
      <div className="section-header">
        <h1>{editHull ? tr("Edit yacht") : tr("Yachts")}</h1>
        {!editHull && ["director", "staff"].includes(role) && (
          <button className="button" onClick={() => setOpen(!open)}>
            {open ? tr("Cancel") : tr("New yacht")}
          </button>
        )}
      </div>
      {error && <p role="alert">{tr(error)}</p>}
      {success && <p role="status">{success}</p>}
      {editHull && (
        <Link href={`/yachts/${encodeURIComponent(editHull)}`}>
          {tr("Cancel / Back to yacht")}
        </Link>
      )}
      {open && (!editHull || editReady) && (
        <form className="section form-grid" onSubmit={submit}>
          <h2>{editHull ? tr("Edit yacht details") : tr("New yacht")}</h2>
          <fieldset disabled={busy} className="form-grid">
            <label>
              {tr("Hull number")}
              <input
                className="input"
                required
                maxLength={50}
                pattern="[A-Za-z0-9][A-Za-z0-9._\-]*"
                title={tr("Letters, numbers, dots, hyphens and underscores")}
                value={form.hullNumber}
                onChange={(e) =>
                  setForm({ ...form, hullNumber: e.target.value })
                }
              />
            </label>
            <label>
              {tr("Yacht name")}
              <input
                className="input"
                required
                maxLength={200}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </label>
            <label>
              {tr("Year built")}
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
              {tr("Captain (optional)")}
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
              {tr("Owner / company (optional)")}
              <input
                className="input"
                maxLength={200}
                value={form.ownerId}
                onChange={(e) => setForm({ ...form, ownerId: e.target.value })}
              />
            </label>
            <label>
              {tr("Delivery to customer")}
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
              {tr("Yacht warranty duration")}
              <select
                className="input"
                value={form.warrantyYears}
                onChange={(e) =>
                  setForm({ ...form, warrantyYears: Number(e.target.value) })
                }
              >
                <option value={1}>{tr("1 year")}</option>
                <option value={2}>{tr("2 years")}</option>
              </select>
            </label>
            <label>
              {tr("Warranty expiry (from delivery)")}
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
              {tr(
                "Leave delivery blank if the yacht has not yet been delivered. Enter power with its unit, e.g. kW, hp or BTU/h.",
              )}
            </p>
            {EQUIPMENT.map(([key, title]) => (
              <fieldset key={key} className="section form-grid">
                <legend>{tr(title)}</legend>
                {(
                  [
                    ["brand", tr("Brand")],
                    ["model", tr("Model")],
                    ...(key === "propellers"
                      ? []
                      : [["power", tr("Power (include unit)")]]),
                    ["serialNumber", tr("Serial Nr")],
                  ] as [string, string][]
                ).map(([field, label]) => (
                  <label key={field}>
                    {tr(label)}
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
                <legend>{tr(title)}</legend>
                {(
                  [
                    ["brand", tr("Product brand")],
                    ["paintType", tr("Paint type")],
                    ["colorCode", tr("Color code")],
                  ] as const
                ).map(([field, label]) => (
                  <label key={field}>
                    {tr(label)}
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
            <section id="technical-fields">
              <h3>{tr("Technical profile")}</h3>
              {form.technicalProfile.customFields.map((field, index) => (
                <fieldset key={field.id} className="form-grid section">
                  <label>
                    {tr("Section")}
                    <select
                      className="input"
                      value={field.section}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          technicalProfile: {
                            ...form.technicalProfile,
                            customFields:
                              form.technicalProfile.customFields.map((f, i) =>
                                i === index
                                  ? { ...f, section: e.target.value }
                                  : f,
                              ),
                          },
                        })
                      }
                    >
                      {[...EQUIPMENT, ...PAINTING].map(([key, title]) => (
                        <option value={key} key={key}>
                          {tr(title)}
                        </option>
                      ))}
                    </select>
                  </label>
                  {(
                    [
                      ["name", "Field"],
                      ["value", "Value"],
                      ["unit", "Unit"],
                    ] as const
                  ).map(([key, label]) => (
                    <label key={key}>
                      {tr(label)}
                      <input
                        className="input"
                        required={key === "name"}
                        maxLength={
                          key === "name" ? 100 : key === "unit" ? 50 : 1000
                        }
                        value={field[key]}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            technicalProfile: {
                              ...form.technicalProfile,
                              customFields:
                                form.technicalProfile.customFields.map(
                                  (f, i) =>
                                    i === index
                                      ? { ...f, [key]: e.target.value }
                                      : f,
                                ),
                            },
                          })
                        }
                      />
                    </label>
                  ))}
                  <button
                    className="button secondary"
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        technicalProfile: {
                          ...form.technicalProfile,
                          customFields:
                            form.technicalProfile.customFields.filter(
                              (_, i) => i !== index,
                            ),
                        },
                      })
                    }
                  >
                    {tr("Remove field")}
                  </button>
                </fieldset>
              ))}
              <button
                className="button secondary"
                type="button"
                disabled={form.technicalProfile.customFields.length >= 100}
                onClick={() =>
                  setForm({
                    ...form,
                    technicalProfile: {
                      ...form.technicalProfile,
                      customFields: [
                        ...form.technicalProfile.customFields,
                        {
                          id: crypto.randomUUID(),
                          section: "engine",
                          name: "",
                          value: "",
                          unit: "",
                        },
                      ],
                    },
                  })
                }
              >
                + {tr("New field")}
              </button>
            </section>
            <button className="button">
              {busy
                ? tr("Saving…")
                : editHull
                  ? tr("Save changes")
                  : tr("Create yacht")}
            </button>
          </fieldset>
          <p>
            {tr(
              "Representatives receive access when assigned to this yacht in Users.",
            )}
          </p>
        </form>
      )}
      {loading ? (
        <p>{tr("Loading yachts…")}</p>
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
                  {tr("Delivered:")}
                  {y.deliveryDate.slice(0, 10)} {tr("· Warranty until:")}{" "}
                  {y.warrantyExpiresAt?.slice(0, 10)}
                </p>
              )}
              <p>
                {tr("Captain:")}
                {y.captainName || tr("Not specified")}
              </p>
              <Link
                className="button"
                href={`/claims/new?yacht=${encodeURIComponent(y.hullNumber)}`}
              >
                {tr("New claim")}
              </Link>
            </section>
          ))}
          {!yachts.length && !error && (
            <p>
              {tr(
                "No yachts yet. Create the first yacht to start registering claims.",
              )}
            </p>
          )}
        </div>
      ) : null}
    </main>
  );
}
