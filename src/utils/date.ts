export function getStartOfToday(): Date {
  const now = new Date();
  const jstNow = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Tokyo" }),
  );

  if (jstNow.getHours() < 7) {
    jstNow.setDate(jstNow.getDate() - 1);
  }

  jstNow.setHours(7, 0, 0, 0);
  return jstNow;
}
