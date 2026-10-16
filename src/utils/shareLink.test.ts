import { describe, it, expect } from 'vitest';
import { encodeShareLink, decodeShareLink, makeChecksum } from './shareLink';

describe('shareLink', () => {
  it('roundtrips a payload', async () => {
    const token = await encodeShareLink({ couple: { a: 1 }, letters: ['x', 'y'] });
    expect(token.startsWith('cav1-')).toBe(true);
    const decoded = (await decodeShareLink(token)) as { couple: { a: number }; letters: string[] };
    expect(decoded.couple.a).toBe(1);
    expect(decoded.letters.length).toBe(2);
  });

  it('returns null for tampered checksum', async () => {
    const token = await encodeShareLink({ x: 1 });
    const tampered = token.slice(0, -2) + '00';
    expect(await decodeShareLink(tampered)).toBeNull();
  });

  it('returns null for invalid format', async () => {
    expect(await decodeShareLink('garbage')).toBeNull();
  });

  it('checksum is 8 hex chars', () => {
    const cs = makeChecksum('hello');
    expect(cs).toMatch(/^[0-9a-f]{8}$/);
  });
});
