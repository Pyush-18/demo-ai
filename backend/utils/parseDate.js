export function parseDate(dateStr) {
  if (!dateStr) return new Date("Invalid");

  const cleanStr = dateStr.replace(/[.\-\s]/g, "/").trim();
  const parts = cleanStr.split("/").map(Number);

  if (parts.length !== 3) {
    console.warn("⚠️ Unrecognized date format:", dateStr);
    return new Date("Invalid");
  }

  const [day, month, year] = parts;
  const date = new Date(year, month - 1, day);

  if (isNaN(date)) {
    console.warn("⚠️ Invalid date value:", dateStr);
  }

  return date;
}
