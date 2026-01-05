export function getPeriodRangeISO(baseDateInput: Date | string = new Date()) {
  const baseDate = typeof baseDateInput === 'string' ? new Date(baseDateInput) : baseDateInput;
  
  // Logic: Cycle runs from 26th of previous month to 25th of current month.
  // Example: If today is Jan 10, period is Dec 26 - Jan 25.
  // Example: If today is Jan 27, period is Jan 26 - Feb 25.

  const currentDay = baseDate.getDate();
  let targetMonth = baseDate.getMonth();
  let targetYear = baseDate.getFullYear();

  // If we are before the 26th, we belong to the cycle ending this month (started previous month)
  // If we are on or after 26th, we belong to the cycle starting this month (ends next month)
  
  // However, the dashboard logic usually selects a "Period Anchor" which is typically the 1st of the month
  // or the date itself. The existing logic in app/dates.ts uses an "Anchor Date" to define the month.
  // If the user selects "Jan 2024", it implies the cycle ending in Jan 2024? Or starting?
  // Let's replicate the existing rule: "26 -> 25".
  
  // Assuming baseDate is the "Anchor" selected in the UI.
  // If anchor is Jan 2024 (e.g. 2024-01-01), the cycle is Dec 26 - Jan 25.
  // Let's stick to this convention: The period "of Jan" ends on Jan 25.
  
  // End Date: Jan 25th 23:59:59.999
  const endLocal = new Date(targetYear, targetMonth, 25, 23, 59, 59, 999);
  
  // Start Date: Dec 26th 00:00:00.000 (Month - 1)
  const startLocal = new Date(targetYear, targetMonth - 1, 26, 0, 0, 0, 0);

  return {
    startISO: startLocal.toISOString(),
    endISO: endLocal.toISOString(),
    startLocal,
    endLocal,
    currentDay,
  };
}
