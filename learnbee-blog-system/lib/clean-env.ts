/** Trim env values and strip one layer of surrounding quotes (common in .env files). */
export function cleanEnv(value: string | undefined | null): string {
  let s = String(value ?? "").trim();
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    s = s.slice(1, -1).trim();
  }
  return s;
}
