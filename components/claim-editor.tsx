"use client";
import { useEffect, useState } from "react";
import { useLanguage } from "@/components/language-provider";
import Link from "next/link";
export default function ClaimEditor({
  id,
  claim,
  onChange,
}: {
  id: string;
  claim: any;
  onChange: () => void;
}) {
  const { t, tr, language } = useLanguage();
  const [team, setTeam] = useState<any[]>([]),
    [suppliers, setSuppliers] = useState<any[]>([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    assignedTo: "",
    supplierId: "",
    warrantyStatus: "pending",
    dueDate: "",
  });
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [saved, setSaved] = useState(false);
  useEffect(() => {
    setForm({
      title: claim.title || "",
      description: claim.description || "",
      priority: claim.priority,
      assignedTo: claim.assignedTo || "",
      supplierId: claim.supplierId || "",
      warrantyStatus: claim.warrantyStatus || "pending",
      dueDate: claim.dueDate?.slice(0, 10) || "",
    });
  }, [claim]);
  useEffect(() => {
    Promise.all([fetch("/api/team"), fetch("/api/suppliers")])
      .then(async ([a, b]) => {
        if (!a.ok || !b.ok)
          throw new Error("Unable to load assignment options");
        setTeam(await a.json());
        setSuppliers(await b.json());
      })
      .catch((e) => setError(e.message));
  }, []);
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setSaved(false);
    try {
      const r = await fetch(`/api/claims/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          assignedTo: form.assignedTo || null,
          supplierId: form.supplierId || null,
          dueDate: form.dueDate || null,
        }),
      });
      const b = await r.json();
      if (!r.ok) throw new Error(b.error);
      setSaved(true);
      onChange();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <details className="section">
      <summary>{t("editClaim")}</summary>
      <form onSubmit={save} className="form-grid">
        {error && <p role="alert">{tr(error)}</p>}
        {saved && <p role="status">{t("saved")}</p>}
        <fieldset disabled={busy} className="form-grid">
          <label>
            {t("title")}
            <input
              className="input"
              required
              maxLength={250}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </label>
          <label>
            {t("description")}
            <textarea
              className="textarea"
              required
              maxLength={20000}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </label>
          <label>
            {t("priority")}
            <select
              className="input"
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
            >
              {["low", "medium", "high", "critical"].map((v) => (
                <option key={v} value={v}>
                  {t(v as "low" | "medium" | "high" | "critical")}
                </option>
              ))}
            </select>
          </label>
          <label>
            {t("responsible")}
            <select
              className="input"
              value={form.assignedTo}
              onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
            >
              <option value="">{t("unassigned")}</option>
              {team.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.firstName} {u.lastName}
                </option>
              ))}
              {form.assignedTo &&
                !team.some((u) => u.id === form.assignedTo) && (
                  <option value={form.assignedTo}>
                    {tr("Inactive member — choose another")}
                  </option>
                )}
            </select>
          </label>
          <label>
            {t("supplier")}
            <select
              className="input"
              value={form.supplierId}
              onChange={(e) => setForm({ ...form, supplierId: e.target.value })}
            >
              <option value="">{t("noSupplier")}</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.companyName} · {s.name}
                </option>
              ))}
            </select>
          </label>
          <p>
            {tr(
              "Supplier assignment records responsibility. To grant access, use Share this claim separately.",
            )}{" "}
            <Link href="/suppliers">{tr("Supplier directory")}</Link>
          </p>
          <label>
            {t("warranty")}
            <select
              className="input"
              value={form.warrantyStatus}
              onChange={(e) =>
                setForm({ ...form, warrantyStatus: e.target.value })
              }
            >
              {[
                ["pending", tr("Pending assessment")],
                ["covered", tr("Covered")],
                ["not_covered", tr("Not covered")],
                ["goodwill", tr("Goodwill")],
              ].map(([v, label]) => (
                <option key={v} value={v}>
                  {t(v as "pending" | "covered" | "not_covered" | "goodwill")}
                </option>
              ))}
            </select>
          </label>
          <label>
            {t("deadline")} (UTC)
            <input
              className="input"
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            />
          </label>
          <button className="button">{busy ? t("saving") : t("save")}</button>
        </fieldset>
      </form>
    </details>
  );
}
