"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useLanguage } from "@/components/language-provider";

export default function SiteHeader() {
  const { t } = useLanguage();
  const pathname = usePathname();
  const [session, setSession] = useState({ path: "", role: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const publicPage = pathname.startsWith("/supplier/") || ["/login", "/forgot-password", "/reset-password"].includes(pathname);
  useEffect(() => {
    let active = true;
    setError(false);
    if (!publicPage) {
      fetch("/api/auth/me", { cache: "no-store" })
        .then(r => r.ok ? r.json() : null)
        .then(u => { if (active) setSession({ path: pathname, role: u?.role || "" }); })
        .catch(() => { if (active) setSession({ path: pathname, role: "" }); });
    }
    return () => { active = false; };
  }, [pathname, publicPage]);
  const role = !publicPage && session.path === pathname ? session.role : "";
  const inside = ["director", "staff"].includes(role);
  return (
    <div className="container site-header-wrap">
      <header className="topbar">
        <strong>YY ASM</strong>
        {role && <>
          <nav aria-label={t("workhub")}>
            <Link href="/workhub">{t("workhub")}</Link>
            {(inside || role === "representative") && <Link href="/yachts">{t("yachts")}</Link>}
            {role === "representative" && <Link href="/my-yacht">{t("myYachts")}</Link>}
            {inside && <Link href="/suppliers">{t("suppliers")}</Link>}
            {role === "director" && <Link href="/users">{t("users")}</Link>}
          </nav>
          <button className="button secondary" disabled={busy} onClick={async () => {
            setBusy(true); setError(false);
            try {
              const response = await fetch("/api/auth/logout", { method: "POST" });
              if (!response.ok) throw new Error();
              window.location.href = "/login";
            } catch { setError(true); setBusy(false); }
          }}>{t("logout")}</button>
        </>}
      </header>
      {error && <p role="alert">{t("error")}</p>}
    </div>
  );
}
