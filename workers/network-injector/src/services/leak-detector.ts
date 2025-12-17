/**
 * Leak Detector Service
 * Server-side analysis of WebRTC, DNS, and IPv6 leak data
 */

import { lookupIpInfo, type IpIntelResult } from './ip-intel';

// ============================================
// Types
// ============================================

export type LeakStatus = 'SAFE' | 'LEAK' | 'WARN' | 'UNKNOWN';

export interface WebRTCLeakResult {
  status: LeakStatus;
  public_ip: string;
  leaked_ips: string[];
  local_ips: string[];
  risk_level: 'none' | 'low' | 'medium' | 'high';
  explanation: string;
}

export interface DNSLeakResult {
  status: LeakStatus;
  detected_servers: string[];
  server_locations: string[];
  is_secure_dns: boolean;
  is_isp_dns: boolean;
  risk_level: 'none' | 'low' | 'medium' | 'high';
  explanation: string;
}

export interface IPv6LeakResult {
  status: LeakStatus;
  ipv4_address: string;
  ipv6_address: string | null;
  ipv6_leaked: boolean;
  risk_level: 'none' | 'low' | 'medium' | 'high';
  explanation: string;
}

export interface LeakTestResult {
  timestamp: number;
  webrtc: WebRTCLeakResult;
  dns: DNSLeakResult;
  ipv6: IPv6LeakResult;
  overall_status: LeakStatus;
  overall_risk: 'none' | 'low' | 'medium' | 'high';
  recommendations: string[];
}

// ============================================
// IP Classification
// ============================================

function isPrivateIp(ip: string): boolean {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4) return false;

  // 10.x.x.x
  if (parts[0] === 10) return true;
  // 172.16.x.x - 172.31.x.x
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
  // 192.168.x.x
  if (parts[0] === 192 && parts[1] === 168) return true;
  // 127.x.x.x (localhost)
  if (parts[0] === 127) return true;
  // 169.254.x.x (link-local)
  if (parts[0] === 169 && parts[1] === 254) return true;

  return false;
}

function isIPv6(ip: string): boolean {
  return ip.includes(':');
}

function isLinkLocalIPv6(ip: string): boolean {
  return ip.toLowerCase().startsWith('fe80:');
}

// ============================================
// Secure DNS Server Detection
// ============================================

const SECURE_DNS_SERVERS = new Set([
  // Cloudflare
  '1.1.1.1', '1.0.0.1',
  '2606:4700:4700::1111', '2606:4700:4700::1001',
  // Google
  '8.8.8.8', '8.8.4.4',
  '2001:4860:4860::8888', '2001:4860:4860::8844',
  // Quad9
  '9.9.9.9', '149.112.112.112',
  '2620:fe::fe', '2620:fe::9',
  // OpenDNS
  '208.67.222.222', '208.67.220.220',
  // NextDNS
  '45.90.28.0', '45.90.30.0',
  // AdGuard
  '94.140.14.14', '94.140.15.15',
]);

function isSecureDnsServer(server: string): boolean {
  return SECURE_DNS_SERVERS.has(server);
}

// ============================================
// WebRTC Leak Analysis
// ============================================

export function analyzeWebRTCLeak(
  publicIp: string,
  webrtcIps: string[]
): WebRTCLeakResult {
  if (!webrtcIps || webrtcIps.length === 0) {
    return {
      status: 'UNKNOWN',
      public_ip: publicIp,
      leaked_ips: [],
      local_ips: [],
      risk_level: 'none',
      explanation: 'WebRTC detection not available or blocked'
    };
  }

  // Separate local and public IPs
  const localIps: string[] = [];
  const publicWebrtcIps: string[] = [];

  for (const ip of webrtcIps) {
    if (isPrivateIp(ip) || isLinkLocalIPv6(ip)) {
      localIps.push(ip);
    } else {
      publicWebrtcIps.push(ip);
    }
  }

  // Find leaked IPs (public IPs different from the main IP)
  const leakedIps = publicWebrtcIps.filter(ip => ip !== publicIp);

  if (leakedIps.length === 0 && publicWebrtcIps.length === 0) {
    return {
      status: 'SAFE',
      public_ip: publicIp,
      leaked_ips: [],
      local_ips: localIps,
      risk_level: 'none',
      explanation: 'No public IP addresses exposed via WebRTC'
    };
  }

  if (leakedIps.length === 0) {
    return {
      status: 'SAFE',
      public_ip: publicIp,
      leaked_ips: [],
      local_ips: localIps,
      risk_level: 'low',
      explanation: 'WebRTC shows your public IP, but no additional IPs leaked'
    };
  }

  // Determine risk level based on number and type of leaks
  let riskLevel: WebRTCLeakResult['risk_level'] = 'medium';
  let explanation = `WebRTC is leaking ${leakedIps.length} additional IP address(es)`;

  // High risk if we're leaking a completely different IP (VPN bypass)
  const firstOctetPublic = publicIp.split('.')[0];
  const differentNetwork = leakedIps.some(ip => ip.split('.')[0] !== firstOctetPublic);

  if (differentNetwork) {
    riskLevel = 'high';
    explanation = 'WebRTC is leaking your real IP address, bypassing VPN protection';
  }

  return {
    status: 'LEAK',
    public_ip: publicIp,
    leaked_ips: leakedIps,
    local_ips: localIps,
    risk_level: riskLevel,
    explanation
  };
}

// ============================================
// DNS Leak Analysis
// ============================================

export function analyzeDNSLeak(
  dnsServers: string[],
  expectedCountry?: string
): DNSLeakResult {
  if (!dnsServers || dnsServers.length === 0) {
    return {
      status: 'UNKNOWN',
      detected_servers: [],
      server_locations: [],
      is_secure_dns: false,
      is_isp_dns: true,
      risk_level: 'none',
      explanation: 'DNS server detection not available'
    };
  }

  // Check if using secure DNS
  const secureCount = dnsServers.filter(isSecureDnsServer).length;
  const isSecureDns = secureCount > 0;
  const isIspDns = secureCount === 0;

  if (isSecureDns && secureCount === dnsServers.length) {
    return {
      status: 'SAFE',
      detected_servers: dnsServers,
      server_locations: ['Encrypted DNS'],
      is_secure_dns: true,
      is_isp_dns: false,
      risk_level: 'none',
      explanation: 'Using encrypted DNS service - your DNS queries are protected'
    };
  }

  if (isIspDns) {
    return {
      status: 'WARN',
      detected_servers: dnsServers,
      server_locations: ['ISP DNS'],
      is_secure_dns: false,
      is_isp_dns: true,
      risk_level: 'medium',
      explanation: 'Using ISP DNS servers - your DNS queries may reveal your location and browsing activity'
    };
  }

  // Mixed secure and ISP DNS
  return {
    status: 'WARN',
    detected_servers: dnsServers,
    server_locations: ['Mixed DNS'],
    is_secure_dns: true,
    is_isp_dns: true,
    risk_level: 'low',
    explanation: 'Using a mix of secure and ISP DNS servers - some queries may leak'
  };
}

// ============================================
// IPv6 Leak Analysis
// ============================================

export function analyzeIPv6Leak(
  ipv4Address: string,
  ipv6Address: string | null,
  isVpnActive: boolean
): IPv6LeakResult {
  if (!ipv6Address) {
    return {
      status: 'SAFE',
      ipv4_address: ipv4Address,
      ipv6_address: null,
      ipv6_leaked: false,
      risk_level: 'none',
      explanation: 'No IPv6 address detected - no IPv6 leak possible'
    };
  }

  if (isLinkLocalIPv6(ipv6Address)) {
    return {
      status: 'SAFE',
      ipv4_address: ipv4Address,
      ipv6_address: ipv6Address,
      ipv6_leaked: false,
      risk_level: 'none',
      explanation: 'Only link-local IPv6 detected - not a privacy concern'
    };
  }

  // If VPN is active but IPv6 is showing, it might be a leak
  if (isVpnActive) {
    return {
      status: 'LEAK',
      ipv4_address: ipv4Address,
      ipv6_address: ipv6Address,
      ipv6_leaked: true,
      risk_level: 'high',
      explanation: 'IPv6 address exposed while VPN is active - your real location may be revealed'
    };
  }

  return {
    status: 'SAFE',
    ipv4_address: ipv4Address,
    ipv6_address: ipv6Address,
    ipv6_leaked: false,
    risk_level: 'none',
    explanation: 'IPv6 address detected but no VPN bypass detected'
  };
}

// ============================================
// Combined Leak Test
// ============================================

export async function performLeakTest(
  publicIp: string,
  webrtcIps: string[],
  dnsServers: string[],
  ipv6Address: string | null,
  ipInfoToken?: string,
  cache?: KVNamespace
): Promise<LeakTestResult> {
  // Get IP intelligence to determine VPN status
  let ipIntel: IpIntelResult | null = null;
  if (ipInfoToken) {
    try {
      ipIntel = await lookupIpInfo(publicIp, ipInfoToken, cache);
    } catch (e) {
      // Continue without IP intel
    }
  }

  const isVpnActive = ipIntel?.isVpn || ipIntel?.isProxy || false;

  // Run all leak analyses
  const webrtc = analyzeWebRTCLeak(publicIp, webrtcIps);
  const dns = analyzeDNSLeak(dnsServers, ipIntel?.countryCode);
  const ipv6 = analyzeIPv6Leak(publicIp, ipv6Address, isVpnActive);

  // Determine overall status
  const statuses = [webrtc.status, dns.status, ipv6.status];
  let overallStatus: LeakStatus = 'SAFE';
  if (statuses.includes('LEAK')) {
    overallStatus = 'LEAK';
  } else if (statuses.includes('WARN')) {
    overallStatus = 'WARN';
  } else if (statuses.includes('UNKNOWN')) {
    overallStatus = 'UNKNOWN';
  }

  // Determine overall risk
  const risks = [webrtc.risk_level, dns.risk_level, ipv6.risk_level];
  let overallRisk: LeakTestResult['overall_risk'] = 'none';
  if (risks.includes('high')) {
    overallRisk = 'high';
  } else if (risks.includes('medium')) {
    overallRisk = 'medium';
  } else if (risks.includes('low')) {
    overallRisk = 'low';
  }

  // Generate recommendations
  const recommendations: string[] = [];

  if (webrtc.status === 'LEAK') {
    recommendations.push('Disable WebRTC in your browser or use a browser extension to block WebRTC leaks');
    recommendations.push('Consider using Firefox with media.peerconnection.enabled set to false');
  }

  if (dns.is_isp_dns) {
    recommendations.push('Switch to a secure DNS provider like Cloudflare (1.1.1.1) or Google (8.8.8.8)');
    recommendations.push('Enable DNS-over-HTTPS (DoH) in your browser settings');
  }

  if (ipv6.ipv6_leaked) {
    recommendations.push('Disable IPv6 in your network settings or ensure your VPN supports IPv6');
    recommendations.push('Check if your VPN has IPv6 leak protection enabled');
  }

  if (recommendations.length === 0) {
    recommendations.push('Your privacy protection is working well. Continue using secure practices.');
  }

  return {
    timestamp: Math.floor(Date.now() / 1000),
    webrtc,
    dns,
    ipv6,
    overall_status: overallStatus,
    overall_risk: overallRisk,
    recommendations
  };
}
