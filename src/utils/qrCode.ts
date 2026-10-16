/** Tạo QR Code SVG (Model 2, phiên bản tự chọn theo dung lượng). Tự code, không cần dep ngoài.
 *  Tham khảo thuật toán Reed-Solomon & mask QR — rút gọn cho payload nhỏ (<200 ký tự). */

const PAD0 = 0xec;
const PAD1 = 0x11;

type Bit = 0 | 1;
type BitStream = Bit[];

function appendBits(stream: BitStream, value: number, len: number): void {
  for (let i = len - 1; i >= 0; i--) stream.push(((value >> i) & 1) as Bit);
}

function makeBytes(data: BitStream): number[] {
  const bytes: number[] = [];
  for (let i = 0; i < data.length; i += 8) {
    let b = 0;
    for (let j = 0; j < 8 && i + j < data.length; j++) b = (b << 1) | (data[i + j] as number);
    bytes.push(b);
  }
  return bytes;
}

function gfMul(a: number, b: number): number {
  let r = 0;
  for (let i = 0; i < 8; i++) {
    if (b & 1) r ^= a;
    const hi = a & 0x80;
    a = (a << 1) & 0xff;
    if (hi) a ^= 0x1d;
    b >>= 1;
  }
  return r;
}

const GF_EXP = new Array(512);
const GF_LOG = new Array(256);
(() => {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x;
    GF_LOG[x] = i;
    x = gfMul(x, 2);
  }
  for (let i = 255; i < 512; i++) GF_EXP[i] = GF_EXP[i - 255];
})();

function genPoly(degree: number): number[] {
  let poly = [1];
  for (let i = 0; i < degree; i++) {
    const next = new Array(poly.length + 1).fill(0);
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= poly[j];
      next[j + 1] ^= GF_EXP[(GF_LOG[poly[j]] + i) % 255];
    }
    poly = next;
  }
  return poly;
}

function rsEncode(data: number[], ecLen: number): number[] {
  const gen = genPoly(ecLen);
  const buf = [...data, ...new Array(ecLen).fill(0)];
  for (let i = 0; i < data.length; i++) {
    const coef = buf[i];
    if (coef === 0) continue;
    const log = GF_LOG[coef];
    for (let j = 0; j < gen.length; j++) {
      buf[i + j] ^= GF_EXP[(log + GF_LOG[gen[j]]) % 255];
    }
  }
  return buf.slice(data.length);
}

const VERSIONS = [
  null,
  { size: 21, ecPerBlock: [7, 10, 13, 17], dataCodewords: [19, 16, 13, 9] },
  { size: 25, ecPerBlock: [10, 16, 22, 28], dataCodewords: [34, 28, 22, 16] },
  { size: 29, ecPerBlock: [15, 26, 18, 22], dataCodewords: [55, 44, 34, 24] },
  { size: 33, ecPerBlock: [20, 18, 26, 16], dataCodewords: [80, 64, 48, 36] },
  { size: 37, ecPerBlock: [26, 24, 18, 22], dataCodewords: [108, 86, 62, 46] },
  { size: 41, ecPerBlock: [18, 16, 24, 28], dataCodewords: [136, 108, 76, 60] },
  { size: 45, ecPerBlock: [20, 18, 18, 26], dataCodewords: [156, 124, 88, 66] },
  { size: 49, ecPerBlock: [24, 22, 22, 26], dataCodewords: [194, 154, 110, 86] },
  { size: 53, ecPerBlock: [30, 22, 20, 24], dataCodewords: [232, 182, 132, 100] },
];

function utf8Bytes(text: string): number[] {
  return Array.from(new TextEncoder().encode(text));
}

function chooseVersion(byteLen: number): number {
  for (let v = 1; v <= 9; v++) {
    const cap = VERSIONS[v].dataCodewords[0];
    if (byteLen + 2 <= cap) return v;
  }
  return 9;
}

function buildBitstream(version: number, bytes: number[]): BitStream {
  const stream: BitStream = [];
  appendBits(stream, 0b0100, 4);
  appendBits(stream, bytes.length, 8);
  for (const b of bytes) appendBits(stream, b, 8);
  const cap = VERSIONS[version].dataCodewords[0] * 8;
  while (stream.length % 8 !== 0) stream.push(0);
  while (stream.length < cap - 4) stream.push(0);
  appendBits(stream, 0, 4);
  const dataBytes = makeBytes(stream);
  const padBytes = [PAD0, PAD1];
  for (let i = 0; dataBytes.length < VERSIONS[version].dataCodewords[0]; i++) dataBytes.push(padBytes[i % 2]);
  const ecBytes = rsEncode(dataBytes, VERSIONS[version].ecPerBlock[0]);
  const finalBits: BitStream = [];
  for (const b of [...dataBytes, ...ecBytes]) appendBits(finalBits, b, 8);
  return finalBits;
}

function makeMatrix(version: number, bits: BitStream) {
  const size = VERSIONS[version].size;
  const m: (0 | 1 | null)[][] = Array.from({ length: size }, () => Array(size).fill(null));
  const reserved: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  const placeFinder = (r: number, c: number) => {
    for (let i = -1; i <= 7; i++) {
      for (let j = -1; j <= 7; j++) {
        const rr = r + i;
        const cc = c + j;
        if (rr < 0 || cc < 0 || rr >= size || cc >= size) continue;
        let v: 0 | 1;
        if (i >= 0 && i <= 6 && j >= 0 && j <= 6) {
          if (i === 0 || i === 6 || j === 0 || j === 6) v = 1;
          else if (i >= 2 && i <= 4 && j >= 2 && j <= 4) v = 1;
          else v = 0;
        } else {
          v = 0;
        }
        m[rr][cc] = v;
        reserved[rr][cc] = true;
      }
    }
  };

  placeFinder(0, 0);
  placeFinder(0, size - 7);
  placeFinder(size - 7, 0);

  for (let i = 8; i < size - 8; i++) {
    m[6][i] = i % 2 === 0 ? 1 : 0;
    m[i][6] = i % 2 === 0 ? 1 : 0;
    reserved[6][i] = true;
    reserved[i][6] = true;
  }

  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (m[i][j] === null) m[i][j] = 0;
      if (m[size - 1 - i][j] === null) m[size - 1 - i][j] = 0;
      if (m[i][size - 1 - j] === null) m[i][size - 1 - j] = 0;
    }
  }

  let bitIdx = 0;
  let upward = true;
  for (let col = size - 1; col > 0; col -= 2) {
    if (col === 6) col--;
    for (let i = 0; i < size; i++) {
      const r = upward ? size - 1 - i : i;
      for (let c = 0; c < 2; c++) {
        const cc = col - c;
        if (reserved[r][cc]) continue;
        const v = bitIdx < bits.length ? (bits[bitIdx++] as 0 | 1) : 0;
        m[r][cc] = v;
      }
    }
    upward = !upward;
  }
  if (bitIdx < bits.length) {
    for (let r = size - 1; r >= 0 && bitIdx < bits.length; r--) {
      for (let c = 0; c < size && bitIdx < bits.length; c++) {
        if (m[r][c] === null) m[r][c] = (bits[bitIdx++] as 0 | 1) || 0;
      }
    }
  }
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (m[r][c] === null) m[r][c] = 0;
    }
  }
  return { matrix: m, size };
}

export function makeQrSvg(text: string, cell = 4): string {
  const bytes = utf8Bytes(text);
  const version = chooseVersion(bytes.length);
  const bits = buildBitstream(version, bytes);
  const { matrix, size } = makeMatrix(version, bits);
  const px = cell;
  const parts: string[] = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (matrix[r][c]) parts.push(`M${c * px},${r * px}h${px}v${px}h-${px}z`);
    }
  }
  const total = size * px;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}" width="${total}" height="${total}" shape-rendering="crispEdges"><rect width="${total}" height="${total}" fill="#ffffff"/><path d="${parts.join('')}" fill="#14161f"/></svg>`;
}
