"use client";
import { useLanguage } from "@/components/language-provider";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { tr, language } = useLanguage();

  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || tr("Unable to login"));
      return;
    }

    localStorage.setItem("user", JSON.stringify(data.user));

    if (data.user.role === "representative") {
      router.push("/my-yacht");
      return;
    }

    router.push("/workhub");
  };

  return (
    <div className="container">
      <div className="login-box">
        <h1>Yacht Claims MVP</h1>
        <p className="muted">
          {tr("Internal operations, customer access and supplier portal")}
        </p>

        <form className="form-grid" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email">{tr("Email")}</label>
            <input
              id="email"
              className="input"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@example.com"
            />
          </div>

          <div>
            <label htmlFor="password">{tr("Password")}</label>
            <input
              id="password"
              className="input"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={tr("Password")}
            />
          </div>

          {error ? (
            <div className="badge status-supplier_pending">{tr(error)}</div>
          ) : null}

          <button className="button" disabled={loading} type="submit">
            {loading ? tr("Logging in...") : tr("Login")}
          </button>
        </form>

        <div style={{ marginTop: 16 }} className="muted">
          {tr("Sign in with your assigned account.")}
        </div>
      </div>
    </div>
  );
}
