const formatter = new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" });

export const formatMoney = (cents) => formatter.format((cents ?? 0) / 100);

// "120" or "120.50" -> 12000 / 12050. Returns null for blank or invalid input.
export function parseDollars(value) {
  const trimmed = String(value ?? "").replace(/[$,\s]/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) return null;
  return Math.round(parseFloat(trimmed) * 100);
}

export const centsToDollars = (cents) => (cents === null || cents === undefined ? "" : (cents / 100).toFixed(2).replace(/\.00$/, ""));

export const formatDate = (unixSeconds) =>
  unixSeconds ? new Date(unixSeconds * 1000).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" }) : "";
