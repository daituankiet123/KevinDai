// Generate a unique id with an optional prefix. Uses crypto.randomUUID()
// (falls back to a timestamp + random suffix for older browsers).

export function newId(prefix?: string): string {
  const uid =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  return prefix ? `${prefix}-${uid}` : uid;
}
