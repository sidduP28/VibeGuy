import { describe, it, expect } from 'vitest';
import { isPrivateOrReservedIp, validateUrlForSSRF } from '../src/ssrf';

describe('SSRF Guard & IP Range Verification', () => {
  it('blocks loopback IPv4 and IPv6 addresses', () => {
    expect(isPrivateOrReservedIp('127.0.0.1')).toBe(true);
    expect(isPrivateOrReservedIp('127.0.1.20')).toBe(true);
    expect(isPrivateOrReservedIp('::1')).toBe(true);
    expect(isPrivateOrReservedIp('0.0.0.0')).toBe(true);
  });

  it('blocks RFC 1918 private IPv4 ranges', () => {
    // 10.0.0.0/8
    expect(isPrivateOrReservedIp('10.0.0.1')).toBe(true);
    expect(isPrivateOrReservedIp('10.255.255.255')).toBe(true);

    // 172.16.0.0/12
    expect(isPrivateOrReservedIp('172.16.0.1')).toBe(true);
    expect(isPrivateOrReservedIp('172.31.255.254')).toBe(true);
    expect(isPrivateOrReservedIp('172.32.0.1')).toBe(false); // public

    // 192.168.0.0/16
    expect(isPrivateOrReservedIp('192.168.1.1')).toBe(true);
    expect(isPrivateOrReservedIp('192.168.254.254')).toBe(true);
  });

  it('blocks cloud metadata / link-local addresses (169.254.169.254)', () => {
    expect(isPrivateOrReservedIp('169.254.169.254')).toBe(true);
    expect(isPrivateOrReservedIp('169.254.1.1')).toBe(true);
  });

  it('allows valid public IP addresses', () => {
    expect(isPrivateOrReservedIp('8.8.8.8')).toBe(false);
    expect(isPrivateOrReservedIp('1.1.1.1')).toBe(false);
    expect(isPrivateOrReservedIp('93.184.216.34')).toBe(false); // example.com
  });

  it('validates URLs and blocks unauthorized protocols', async () => {
    await expect(validateUrlForSSRF('ftp://example.com/file')).rejects.toThrow(/Only http and https/);
    await expect(validateUrlForSSRF('file:///etc/passwd')).rejects.toThrow(/Only http and https/);
    await expect(validateUrlForSSRF('javascript:alert(1)')).rejects.toThrow(/Only http and https/);
    await expect(validateUrlForSSRF('http://localhost:3000')).rejects.toThrow(/Blocked internal\/private destination/);
    await expect(validateUrlForSSRF('http://169.254.169.254/latest/meta-data')).rejects.toThrow(/Blocked internal\/private destination/);
  });

  it('accepts safe public HTTPS URLs', async () => {
    const valid = await validateUrlForSSRF('https://example.com/products/item-1');
    expect(valid).toBe('https://example.com/products/item-1');
  });
});
