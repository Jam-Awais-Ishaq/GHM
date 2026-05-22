/** Build Nominatim search variants (e.g. "Shop 4/735" → "735 Beams Rd"). */
export function buildGeocodeQueries(address: string): string[] {
  const trimmed = address.trim();
  if (!trimmed) return [];

  const queries: string[] = [];
  const add = (q: string) => {
    const t = q.trim();
    if (t.length >= 5 && !queries.includes(t)) queries.push(t);
  };

  const stripAustralia = (s: string) => s.replace(/,?\s*Australia\s*$/i, "").trim();
  const normalizeUnits = (s: string) =>
    s
      .replace(/\b(?:shop|unit|suite|level|lot)\s*#?\s*\d+\s*\/\s*/gi, "")
      .replace(/\b\d+\s*\/\s*(\d+)\s+(?=[A-Za-z])/gi, "$1 ");

  add(trimmed);
  add(stripAustralia(trimmed));
  add(normalizeUnits(trimmed));
  add(stripAustralia(normalizeUnits(trimmed)));

  const parts = trimmed.split(",").map((p) => p.trim()).filter(Boolean);
  const streetPart = parts.find(
    (p) =>
      /\d/.test(p) &&
      /\b(rd|road|st|street|ave|avenue|drive|dr|way|blvd|boulevard|parade|pde|court|ct|lane|ln|crescent|cres|highway|hwy|beams)\b/i.test(
        p,
      ),
  );
  const locPart = parts.find(
    (p) => /\b(qld|queensland)\b/i.test(p) || /\b\d{4}\b/.test(p),
  );

  if (streetPart && locPart) {
    const street = normalizeUnits(streetPart);
    add(`${street}, ${locPart}`);
    add(`${street}, ${locPart}, Australia`);
  }

  for (const part of parts) {
    const cleaned = normalizeUnits(part);
    if (
      /\d/.test(cleaned) &&
      /\b(rd|road|st|street|ave|avenue|drive|dr|way|blvd|parade|court|lane|crescent|highway|hwy)\b/i.test(
        cleaned,
      )
    ) {
      add(cleaned);
      if (locPart && !cleaned.includes(locPart)) {
        add(`${cleaned}, ${locPart}`);
        add(`${cleaned}, ${locPart}, Australia`);
      }
    }
  }

  if (parts.length >= 2 && streetPart) {
    const withoutFirst = parts.slice(1).join(", ");
    add(withoutFirst);
    add(normalizeUnits(withoutFirst));
    add(stripAustralia(normalizeUnits(withoutFirst)));
  }

  return queries;
}
