import { describe, it, expect } from 'vitest';
import { makeQrSvg } from './qrCode';

describe('qrCode', () => {
  it('generates a valid SVG', () => {
    const svg = makeQrSvg('hello world', 4);
    expect(svg).toMatch(/^<svg /);
    expect(svg).toContain('viewBox=');
    expect(svg).toContain('<path d=');
  });

  it('handles short text', () => {
    expect(() => makeQrSvg('abc')).not.toThrow();
  });

  it('scales cell size', () => {
    const a = makeQrSvg('test', 2);
    const b = makeQrSvg('test', 8);
    expect(a).not.toBe(b);
  });
});
