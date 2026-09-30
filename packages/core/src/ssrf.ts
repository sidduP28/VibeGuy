import dns from 'node:dns';

/**
 * Checks whether an IPv4 or IPv6 address is in a private, loopback, or reserved range.
 */
export function isPrivateOrReservedIp(ip: string): boolean {
  const cleanIp = ip.trim().toLowerCase();

  // IPv4 Loopback (127.0.0.0/8) or 0.0.0.0
  if (cleanIp === '0.0.0.0' || cleanIp.startsWith('127.')) {
    return true;
  }

  // IPv6 Loopback or unspecified
  if (cleanIp === '::1' || cleanIp === '::' || cleanIp === '0:0:0:0:0:0:0:1') {
    return true;
  }

  // IPv6 Unique Local Address (fc00::/7) or Link-Local (fe80::/10)
  if (cleanIp.startsWith('fc') || cleanIp.startsWith('fd') || cleanIp.startsWith('fe8') || cleanIp.startsWith('fe9') || cleanIp.startsWith('fea') || cleanIp.startsWith('feb')) {
    return true;
  }

  // Parse IPv4 octets
  const ipv4Match = cleanIp.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4Match) {
    const [_, octet1Str, octet2Str] = ipv4Match;
    const o1 = Number.parseInt(octet1Str, 10);
    const o2 = Number.parseInt(octet2Str, 10);

    // 10.0.0.0/8 (Private network)
    if (o1 === 10) return true;

    // 172.16.0.0/12 (Private network: 172.16.0.0 - 172.31.255.255)
    if (o1 === 172 && o2 >= 16 && o2 <= 31) return true;

    // 192.168.0.0/16 (Private network)
    if (o1 === 192 && o2 === 168) return true;

    // 169.254.0.0/16 (Link-local / Cloud metadata: 169.254.169.254)
    if (o1 === 169 && o2 === 254) return true;

    // 100.64.0.0/10 (Carrier-grade NAT)
    if (o1 === 100 && o2 >= 64 && o2 <= 127) return true;
  }

  return false;
}

/**
 * Validates a target URL against SSRF attacks before any server-side fetch.
 * Resolves DNS to guard against DNS rebinding.
 */
export async function validateUrlForSSRF(targetUrl: string): Promise<string> {
  let parsed: URL;
  try {
    parsed = new URL(targetUrl);
  } catch {
    throw new Error('Invalid URL format');
  }

  const protocol = parsed.protocol.toLowerCase();
  if (protocol !== 'http:' && protocol !== 'https:') {
    throw new Error(`Only http and https protocols are permitted; received: ${protocol}`);
  }

  const hostname = parsed.hostname.toLowerCase();

  // Block obvious localhost aliases
  if (
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal')
  ) {
    throw new Error(`Blocked internal/private destination: ${hostname}`);
  }

  // Check if hostname is directly an IP literal
  if (isPrivateOrReservedIp(hostname)) {
    throw new Error(`Blocked internal/private destination: ${hostname}`);
  }

  // Perform DNS lookup to prevent DNS rebinding attacks
  try {
    const lookupResult = await dns.promises.lookup(hostname, { all: true });
    for (const entry of lookupResult) {
      if (isPrivateOrReservedIp(entry.address)) {
        throw new Error(`Blocked internal/private destination resolved to IP: ${entry.address}`);
      }
    }
  } catch (err: any) {
    if (err.message.includes('Blocked internal/private destination')) {
      throw err;
    }
    // DNS resolution failure (domain not found)
    throw new Error(`DNS resolution failed for hostname: ${hostname}`);
  }

  return targetUrl;
}
