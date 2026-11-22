"use client";
import { useState } from "react";
import { useLanguage } from "./language-provider";
export default function YachtDocuments({
  id,
  documents,
  canUpload,
  onChange,
}: {
  id: string;
  documents: any[];
  canUpload: boolean;
  onChange: () => void;
}) {
  const { tr } = useLanguage();
  const [visibility, setVisibility] = useState("shared"),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <section className="section" id="yacht-documents">
      <h3>{tr("Photos and documents")}</h3>
      {error && <p role="alert">{tr(error)}</p>}
      {canUpload && (
        <>
          <label>
            {tr("Visibility")}
            <select
              className="input"
              value={visibility}
              disabled={busy}
              onChange={(e) => setVisibility(e.target.value)}
            >
              <option value="shared">
                {tr("Shared with authorized participants")}
              </option>
              <option value="internal">{tr("Internal to yard")}</option>
            </select>
          </label>
          <label>
            {tr("Add document")} (max 5 MB)
            <input
              type="file"
              disabled={busy}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (!file) return;
                setBusy(true);
                setError("");
                try {
                  const body = new FormData();
                  body.set("file", file);
                  body.set("visibility", visibility);
                  const r = await fetch(
                    `/api/yachts/${encodeURIComponent(id)}/documents`,
                    { method: "POST", body },
                  );
                  const b = await r.json();
                  if (!r.ok) throw new Error(b.error);
                  onChange();
                } catch (e) {
                  setError((e as Error).message);
                } finally {
                  setBusy(false);
                }
              }}
            />
          </label>
        </>
      )}
      {!documents.length && <p>{tr("No documents yet.")}</p>}
      {documents.map((d) => (
        <p key={d.id}>
          <a
            href={`/api/yachts/${encodeURIComponent(id)}/documents/${d.id}`}
            target="_blank"
            rel="noreferrer"
          >
            {d.fileName}
          </a>{" "}
          · {tr(d.visibility)}
        </p>
      ))}
    </section>
  );
}
