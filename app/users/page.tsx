"use client";
import { useLanguage } from "@/components/language-provider";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  isValidPassword,
  PASSWORD_HELP,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
} from "@/lib/password-policy";
export default function Users() {
  const { tr, language } = useLanguage();

  const [users, setUsers] = useState<any[]>([]);
  const [yachts, setYachts] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "representative",
    yachts: [] as string[],
  });
  async function refresh() {
    const r = await fetch("/api/users");
    if (!r.ok) throw new Error("Director access required");
    setUsers(await r.json());
    setAllowed(true);
  }
  useEffect(() => {
    refresh()
      .then(() => fetch("/api/yachts"))
      .then((r) => r?.json())
      .then((y) => {
        if (y) setYachts(y);
      })
      .catch((e) => setError(e.message));
  }, []);
  async function action(path: string, method: string, body: unknown) {
    setBusy(true);
    setError("");
    try {
      const r = await fetch(path, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const b = await r.json();
      if (!r.ok) throw new Error(b.error);
      await refresh();
      if (method === "POST")
        setForm({
          ...form,
          email: "",
          password: "",
          firstName: "",
          lastName: "",
          yachts: [],
        });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="container">
      <Link href="/workhub">{tr("Work Hub")}</Link>
      <h1>{tr("Users and yacht access")}</h1>
      {error && <p role="alert">{tr(error)}</p>}
      {allowed && (
        <>
          <form
            className="section form-grid"
            onSubmit={(e) => {
              e.preventDefault();
              if (!isValidPassword(form.password)) {
                setError(PASSWORD_HELP);
                return;
              }
              action("/api/users", "POST", form);
            }}
          >
            <h2>{tr("Create account")}</h2>
            {(["firstName", "lastName", "email", "password"] as const).map(
              (key) => (
                <label key={key}>
                  {tr(
                    {
                      firstName: "First name",
                      lastName: "Last name",
                      email: "Email",
                      password: "Password",
                    }[key],
                  )}
                  <input
                    className="input"
                    required
                    type={
                      key === "password"
                        ? "password"
                        : key === "email"
                          ? "email"
                          : "text"
                    }
                    autoComplete={key === "password" ? "new-password" : "off"}
                    minLength={key === "password" ? PASSWORD_MIN_LENGTH : 1}
                    maxLength={
                      key === "password" ? PASSWORD_MAX_LENGTH : undefined
                    }
                    aria-describedby={
                      key === "password" ? "password-help" : undefined
                    }
                    value={form[key]}
                    onChange={(e) =>
                      setForm({ ...form, [key]: e.target.value })
                    }
                  />
                  {key === "password" && (
                    <small id="password-help">{tr(PASSWORD_HELP)}</small>
                  )}
                </label>
              ),
            )}
            <label>
              {tr("Role")}
              <select
                className="input"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                {[
                  "director",
                  "staff",
                  "representative",
                  "supplier",
                  "dealer",
                ].map((r) => (
                  <option key={r} value={r}>
                    {tr(r)}
                  </option>
                ))}
              </select>
            </label>
            {form.role === "representative" && (
              <fieldset>
                <legend>{tr("Assigned yachts")}</legend>
                {yachts.map((y) => (
                  <label key={y.hullNumber}>
                    <input
                      type="checkbox"
                      checked={form.yachts.includes(y.hullNumber)}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          yachts: e.target.checked
                            ? [...form.yachts, y.hullNumber]
                            : form.yachts.filter((h) => h !== y.hullNumber),
                        })
                      }
                    />
                    {y.name} · {y.hullNumber}
                  </label>
                ))}
              </fieldset>
            )}
            <button className="button" disabled={busy}>
              {tr("Create account")}
            </button>
          </form>
          {users.map((u) => (
            <section className="section" key={u.id}>
              <strong>{u.email}</strong>
              <p>
                {tr(u.role)} · {u.isActive ? tr("Active") : tr("Inactive")}
              </p>
              <button
                className="button secondary"
                disabled={busy}
                onClick={() =>
                  action("/api/users", "PATCH", {
                    id: u.id,
                    isActive: !u.isActive,
                  })
                }
              >
                {u.isActive ? tr("Deactivate") : tr("Activate")}
              </button>
              {u.role === "representative" && (
                <fieldset>
                  <legend>{tr("Assigned yachts")}</legend>
                  {yachts.map((y) => (
                    <label key={y.hullNumber}>
                      <input
                        type="checkbox"
                        disabled={busy}
                        checked={u.yachts.includes(y.hullNumber)}
                        onChange={(e) =>
                          action("/api/users", "PATCH", {
                            id: u.id,
                            yachts: e.target.checked
                              ? [...u.yachts, y.hullNumber]
                              : u.yachts.filter(
                                  (h: string) => h !== y.hullNumber,
                                ),
                          })
                        }
                      />
                      {y.name} · {y.hullNumber}
                    </label>
                  ))}
                </fieldset>
              )}
            </section>
          ))}
        </>
      )}
    </main>
  );
}
