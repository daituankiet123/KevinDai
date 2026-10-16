/** Mã hoá/giải mã share-link: JSON → gzip → base64url + checksum 8 ký tự hex. */

const VERSION = 1;
const CHECK_LEN = 8;

function toBase64Url(bytes: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  const b64 = btoa(bin);
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(s: string): Uint8Array {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4));
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + pad;
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function gzip(data: Uint8Array): Promise<Uint8Array> {
  if (typeof CompressionStream === 'undefined') return data;
  const cs = new CompressionStream('gzip');
  const writer = cs.writable.getWriter();
  writer.write(data as unknown as BufferSource);
  writer.close();
  const reader = cs.readable.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    chunks.push(value);
    total += value.length;
  }
  const out = new Uint8Array(total);
  let off = 0;
  for (const c of chunks) {
    out.set(c, off);
    off += c.length;
  }
  return out;
}

async function gunzip(data: Uint8Array): Promise<Uint8Array> {
  if (typeof DecompressionStream === 'undefined') return data;
  const ds = new DecompressionStream('gzip');
  const writer = ds.writable.getWriter();
  writer.write(data as unknown as BufferSource);
  writer.close();
  const reader = ds.readable.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    chunks.push(value);
    total += value.length;
  }
  const out = new Uint8Array(total);
  let off = 0;
  for (const c of chunks) {
    out.set(c, off);
    off += c.length;
  }
  return out;
}

async function sha256Hex(input: string): Promise<string> {
  if (typeof crypto === 'undefined' || !crypto.subtle) return '';
  const buf = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function makeChecksum(data: string): string {
  let h = 5381;
  for (let i = 0; i < data.length; i++) {
    h = ((h << 5) + h + data.charCodeAt(i)) | 0;
  }
  return (h >>> 0).toString(16).padStart(CHECK_LEN, '0').slice(-CHECK_LEN);
}

export async function encodeShareLink(payload: unknown): Promise<string> {
  const json = JSON.stringify({ v: VERSION, payload });
  const compressed = await gzip(new TextEncoder().encode(json));
  const body = toBase64Url(compressed);
  const checksum = await sha256Hex(body);
  return `cav1-${body}.${checksum.slice(0, CHECK_LEN)}`;
}

export async function decodeShareLink(token: string): Promise<unknown | null> {
  try {
    const stripped = token.replace(/^cav1-/, '');
    const dot = stripped.lastIndexOf('.');
    if (dot < 0) return null;
    const body = stripped.slice(0, dot);
    const checksum = stripped.slice(dot + 1);
    const expected = (await sha256Hex(body)).slice(0, CHECK_LEN);
    if (checksum !== expected && checksum !== makeChecksum(body)) return null;
    const compressed = fromBase64Url(body);
    const jsonBytes = await gunzip(compressed);
    const json = new TextDecoder().decode(jsonBytes);
    const parsed = JSON.parse(json) as { v: number; payload: unknown };
    if (parsed.v !== VERSION) return null;
    return parsed.payload;
  } catch {
    return null;
  }
}
