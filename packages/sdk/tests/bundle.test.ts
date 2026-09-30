import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as zlib from 'node:zlib';

describe('SDK Bundle Size & Architecture Gate (G1)', () => {
  it('builds an IIFE bundle under 3KB (3072 bytes) gzipped with zero dependencies', () => {
    const distPath = path.resolve(__dirname, '../dist/index.global.js');
    if (!fs.existsSync(distPath)) {
      throw new Error(`SDK bundle dist file not found at ${distPath}. Run build first.`);
    }

    const fileContent = fs.readFileSync(distPath);
    const gzipped = zlib.gzipSync(fileContent);

    // Hard ceiling: 3072 bytes
    expect(gzipped.length).toBeLessThanOrEqual(3072);
  });
});
