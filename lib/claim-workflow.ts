export const STATUS_LABELS: Record<string, string> = {
  new: "New",
  assigned: "Assigned",
  in_progress: "In progress",
  supplier_pending: "Waiting for supplier",
  closed: "Closed",
  rejected: "Rejected",
};
const transitions: Record<string, string[]> = {
  assigned: ["in_progress", "supplier_pending", "closed"],
  in_progress: ["assigned", "supplier_pending", "closed"],
  supplier_pending: ["assigned", "in_progress", "closed"],
  closed: ["in_progress"],
};
export function nextStatuses(status: string, validation: string): string[] {
  return validation === "approved" ? transitions[status] || [] : [];
}
