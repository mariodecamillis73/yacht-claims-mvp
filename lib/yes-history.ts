// Render source audit metadata without exposing opaque identifiers or raw JSON.
export function yesHistoryDetails(details: string): string {
  try {
    const data = JSON.parse(details);
    const fields = data.detail?.forms?.[0]?.fields;
    if (!Array.isArray(fields)) return "";
    return fields.filter((f: {label:string;value:string}) =>
      f.value && !["Desc *", "Request ID *", "Notice"].includes(f.label) && !f.label.startsWith("???")
    ).map((f: {label:string;value:string}) => `${f.label}: ${f.value}`).join("\n");
  } catch { return ""; }
}
