import type { ScoreCard, ScoreDeduction, ScanReport, NetworkSection, ConsistencySection } from '@browserscan/types';

/**
 * Scoring Engine - Calculates trust score based on deduction rules
 * Base Score: 100
 *
 * Deduction Rules:
 * - IP Risk (fraud_score > 75 OR is_proxy): -20
 * - WebRTC Leak (webrtc_ip != remote_ip): -25
 * - Timezone Mismatch: -15
 * - OS Consistency Fail: -15
 * - Language Mismatch: -5
 * - Open Critical Ports (22, 3389): -10
 * - Bot Detection (webdriver/headless): -30
 */

export function calculateScore(
  network?: Partial<NetworkSection>,
  consistency?: Partial<ConsistencySection>,
  openPorts?: number[]
): ScoreCard {
  let total = 100;
  const deductions: ScoreDeduction[] = [];

  // IP Risk (-20)
  if (network?.risk) {
    const { fraud_score, is_proxy, is_vpn, is_tor } = network.risk;
    if (fraud_score > 75 || is_proxy || is_tor) {
      deductions.push({
        code: 'IP_RISK',
        score: -20,
        desc: is_tor
          ? 'Tor exit node detected'
          : is_proxy
          ? 'Proxy/datacenter IP detected'
          : `High fraud score (${fraud_score})`
      });
      total -= 20;
    } else if (is_vpn) {
      deductions.push({
        code: 'VPN_DETECTED',
        score: -10,
        desc: 'VPN connection detected'
      });
      total -= 10;
    }
  }

  // WebRTC Leak (-25)
  if (network?.leaks?.webrtc?.status === 'LEAK') {
    deductions.push({
      code: 'WEBRTC_LEAK',
      score: -25,
      desc: `Real IP leaked via WebRTC (${network.leaks.webrtc.ip})`
    });
    total -= 25;
  }

  // DNS Leak (-10)
  if (network?.leaks?.dns?.status === 'LEAK') {
    deductions.push({
      code: 'DNS_LEAK',
      score: -10,
      desc: 'DNS requests not using secure resolver'
    });
    total -= 10;
  }

  // Timezone Mismatch (-15)
  if (consistency?.timezone_check?.status === 'FAIL') {
    deductions.push({
      code: 'TZ_MISMATCH',
      score: -15,
      desc: consistency.timezone_check.evidence || 'System timezone differs from IP location'
    });
    total -= 15;
  }

  // OS Consistency (-15)
  if (consistency?.os_check?.status === 'FAIL') {
    deductions.push({
      code: 'OS_MISMATCH',
      score: -15,
      desc: consistency.os_check.evidence || 'OS fingerprints inconsistent across sources'
    });
    total -= 15;
  }

  // Language Mismatch (-5)
  if (consistency?.language_check?.status === 'FAIL') {
    deductions.push({
      code: 'LANG_MISMATCH',
      score: -5,
      desc: consistency.language_check.evidence || 'Browser language inconsistent with IP country'
    });
    total -= 5;
  } else if (consistency?.language_check?.status === 'WARN') {
    deductions.push({
      code: 'LANG_WARN',
      score: -2,
      desc: consistency.language_check.evidence || 'Language settings may indicate spoofing'
    });
    total -= 2;
  }

  // Open Critical Ports (-10)
  if (openPorts && openPorts.length > 0) {
    const criticalPorts = [22, 3389, 5900]; // SSH, RDP, VNC
    const openCritical = openPorts.filter(p => criticalPorts.includes(p));
    if (openCritical.length > 0) {
      deductions.push({
        code: 'OPEN_PORTS',
        score: -10,
        desc: `Critical ports open: ${openCritical.join(', ')}`
      });
      total -= 10;
    }
  }

  // Bot Detection (-30) - handled separately in fingerprint analysis
  // This would be triggered by webdriver detection, headless browser, etc.

  // Ensure minimum score of 0
  total = Math.max(0, total);

  // Calculate grade
  const grade = getGrade(total);
  const verdict = getVerdict(total);

  return {
    total,
    grade,
    verdict,
    deductions
  };
}

function getGrade(score: number): string {
  if (score >= 95) return 'A+';
  if (score >= 90) return 'A';
  if (score >= 85) return 'A-';
  if (score >= 80) return 'B+';
  if (score >= 75) return 'B';
  if (score >= 70) return 'B-';
  if (score >= 65) return 'C+';
  if (score >= 60) return 'C';
  if (score >= 55) return 'C-';
  if (score >= 50) return 'D';
  return 'F';
}

function getVerdict(score: number): string {
  if (score >= 85) return 'Low Risk';
  if (score >= 70) return 'Moderate Risk';
  if (score >= 50) return 'Elevated Risk';
  return 'High Risk';
}

/**
 * Add bot detection deduction
 */
export function addBotDeduction(scoreCard: ScoreCard, evidence: string): ScoreCard {
  return {
    ...scoreCard,
    total: Math.max(0, scoreCard.total - 30),
    grade: getGrade(Math.max(0, scoreCard.total - 30)),
    verdict: getVerdict(Math.max(0, scoreCard.total - 30)),
    deductions: [
      ...scoreCard.deductions,
      {
        code: 'BOT_DETECTED',
        score: -30,
        desc: evidence || 'Automated browser detected'
      }
    ]
  };
}
