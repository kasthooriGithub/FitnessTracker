export function getStartDateString(range) {
  const date = new Date();
  if (range === "today") return date.toISOString().split("T")[0];
  if (range === "7days") date.setDate(date.getDate() - 7);
  else if (range === "30days") date.setDate(date.getDate() - 30);
  else if (range === "3months") date.setDate(date.getDate() - 90);
  else if (range === "1year") date.setDate(date.getDate() - 365);
  else if (range === "alltime") return null;
  return date.toISOString().split("T")[0];
}
