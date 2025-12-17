import { describe, expect, it } from 'vitest';
import { calculateScore, addBotDeduction } from '../src/services/scoring';
import type { NetworkSection, ConsistencySection } from '@browserscan/types';

describe('Scoring Engine', () => {
  describe('Perfect Score (100)', () => {
    it('returns 100 with no deductions for clean profile', () => {
      const result = calculateScore();

      expect(result.total).toBe(100);
      expect(result.grade).toBe('A+');
      expect(result.verdict).toBe('Low Risk');
      expect(result.deductions).toHaveLength(0);
    });

    it('returns 100 when all checks pass', () => {
      const network: Partial<NetworkSection> = {
        risk: {
          fraud_score: 10,
          is_proxy: false,
          is_vpn: false,
          is_tor: false,
          is_datacenter: false,
          is_mobile: false
        },
        leaks: {
          webrtc: { status: 'NONE' },
          dns: { status: 'NONE' }
        }
      };

      const consistency: Partial<ConsistencySection> = {
        timezone_check: { status: 'PASS', evidence: 'Timezone matches IP location' },
        os_check: { status: 'PASS', evidence: 'OS consistent across sources' },
        language_check: { status: 'PASS', evidence: 'Languages match region' }
      };

      const result = calculateScore(network, consistency, []);

      expect(result.total).toBe(100);
      expect(result.grade).toBe('A+');
      expect(result.verdict).toBe('Low Risk');
      expect(result.deductions).toHaveLength(0);
    });
  });

  describe('IP Risk Deductions', () => {
    it('deducts 20 points for high fraud score', () => {
      const network: Partial<NetworkSection> = {
        risk: {
          fraud_score: 90,
          is_proxy: false,
          is_vpn: false,
          is_tor: false,
          is_datacenter: false,
          is_mobile: false
        }
      };

      const result = calculateScore(network);

      expect(result.total).toBe(80);
      expect(result.grade).toBe('B+');
      expect(result.deductions).toHaveLength(1);
      expect(result.deductions[0]?.code).toBe('IP_RISK');
      expect(result.deductions[0]?.score).toBe(-20);
      expect(result.deductions[0]?.desc).toContain('High fraud score (90)');
    });

    it('deducts 20 points for proxy detection', () => {
      const network: Partial<NetworkSection> = {
        risk: {
          fraud_score: 30,
          is_proxy: true,
          is_vpn: false,
          is_tor: false,
          is_datacenter: false,
          is_mobile: false
        }
      };

      const result = calculateScore(network);

      expect(result.total).toBe(80);
      expect(result.deductions[0]?.code).toBe('IP_RISK');
      expect(result.deductions[0]?.desc).toContain('Proxy/datacenter');
    });

    it('deducts 20 points for Tor exit node', () => {
      const network: Partial<NetworkSection> = {
        risk: {
          fraud_score: 20,
          is_proxy: false,
          is_vpn: false,
          is_tor: true,
          is_datacenter: false,
          is_mobile: false
        }
      };

      const result = calculateScore(network);

      expect(result.total).toBe(80);
      expect(result.deductions[0]?.code).toBe('IP_RISK');
      expect(result.deductions[0]?.desc).toContain('Tor exit node');
    });

    it('deducts 10 points for VPN only', () => {
      const network: Partial<NetworkSection> = {
        risk: {
          fraud_score: 20,
          is_proxy: false,
          is_vpn: true,
          is_tor: false,
          is_datacenter: false,
          is_mobile: false
        }
      };

      const result = calculateScore(network);

      expect(result.total).toBe(90);
      expect(result.grade).toBe('A');
      expect(result.deductions[0]?.code).toBe('VPN_DETECTED');
      expect(result.deductions[0]?.score).toBe(-10);
    });

    it('prioritizes Tor over VPN when both detected', () => {
      const network: Partial<NetworkSection> = {
        risk: {
          fraud_score: 20,
          is_proxy: false,
          is_vpn: true,
          is_tor: true,
          is_datacenter: false,
          is_mobile: false
        }
      };

      const result = calculateScore(network);

      expect(result.total).toBe(80);
      expect(result.deductions).toHaveLength(1);
      expect(result.deductions[0]?.code).toBe('IP_RISK');
      expect(result.deductions[0]?.desc).toContain('Tor');
    });
  });

  describe('Leak Detection Deductions', () => {
    it('deducts 25 points for WebRTC leak', () => {
      const network: Partial<NetworkSection> = {
        leaks: {
          webrtc: { status: 'LEAK', ip: '192.168.1.100' },
          dns: { status: 'NONE' }
        }
      };

      const result = calculateScore(network);

      expect(result.total).toBe(75);
      expect(result.grade).toBe('B');
      expect(result.deductions).toHaveLength(1);
      expect(result.deductions[0]?.code).toBe('WEBRTC_LEAK');
      expect(result.deductions[0]?.score).toBe(-25);
      expect(result.deductions[0]?.desc).toContain('192.168.1.100');
    });

    it('deducts 10 points for DNS leak', () => {
      const network: Partial<NetworkSection> = {
        leaks: {
          webrtc: { status: 'NONE' },
          dns: { status: 'LEAK' }
        }
      };

      const result = calculateScore(network);

      expect(result.total).toBe(90);
      expect(result.deductions[0]?.code).toBe('DNS_LEAK');
      expect(result.deductions[0]?.score).toBe(-10);
    });

    it('deducts 35 points total for both WebRTC and DNS leaks', () => {
      const network: Partial<NetworkSection> = {
        leaks: {
          webrtc: { status: 'LEAK', ip: '10.0.0.5' },
          dns: { status: 'LEAK' }
        }
      };

      const result = calculateScore(network);

      expect(result.total).toBe(65);
      expect(result.grade).toBe('C+');
      expect(result.deductions).toHaveLength(2);
    });
  });

  describe('Consistency Check Deductions', () => {
    it('deducts 15 points for timezone mismatch', () => {
      const consistency: Partial<ConsistencySection> = {
        timezone_check: {
          status: 'FAIL',
          evidence: 'Browser says US/Pacific but IP is in Germany'
        }
      };

      const result = calculateScore(undefined, consistency);

      expect(result.total).toBe(85);
      expect(result.grade).toBe('A-');
      expect(result.deductions[0]?.code).toBe('TZ_MISMATCH');
      expect(result.deductions[0]?.score).toBe(-15);
      expect(result.deductions[0]?.desc).toContain('US/Pacific');
    });

    it('deducts 15 points for OS mismatch', () => {
      const consistency: Partial<ConsistencySection> = {
        os_check: {
          status: 'FAIL',
          evidence: 'UA says Windows 11 but TLS fingerprint is macOS'
        }
      };

      const result = calculateScore(undefined, consistency);

      expect(result.total).toBe(85);
      expect(result.deductions[0]?.code).toBe('OS_MISMATCH');
      expect(result.deductions[0]?.desc).toContain('Windows 11');
    });

    it('deducts 5 points for language mismatch (FAIL)', () => {
      const consistency: Partial<ConsistencySection> = {
        language_check: {
          status: 'FAIL',
          evidence: 'Browser language is zh-CN but IP is in USA'
        }
      };

      const result = calculateScore(undefined, consistency);

      expect(result.total).toBe(95);
      expect(result.grade).toBe('A+');
      expect(result.deductions[0]?.code).toBe('LANG_MISMATCH');
      expect(result.deductions[0]?.score).toBe(-5);
    });

    it('deducts 2 points for language warning', () => {
      const consistency: Partial<ConsistencySection> = {
        language_check: {
          status: 'WARN',
          evidence: 'Unusual language settings detected'
        }
      };

      const result = calculateScore(undefined, consistency);

      expect(result.total).toBe(98);
      expect(result.deductions[0]?.code).toBe('LANG_WARN');
      expect(result.deductions[0]?.score).toBe(-2);
    });
  });

  describe('Open Port Deductions', () => {
    it('deducts 10 points for open SSH port', () => {
      const result = calculateScore(undefined, undefined, [22, 80, 443]);

      expect(result.total).toBe(90);
      expect(result.deductions[0]?.code).toBe('OPEN_PORTS');
      expect(result.deductions[0]?.score).toBe(-10);
      expect(result.deductions[0]?.desc).toContain('22');
    });

    it('deducts 10 points for multiple critical ports', () => {
      const result = calculateScore(undefined, undefined, [22, 3389, 5900]);

      expect(result.total).toBe(90);
      expect(result.deductions[0]?.desc).toContain('22, 3389, 5900');
    });

    it('does not deduct for non-critical open ports', () => {
      const result = calculateScore(undefined, undefined, [80, 443, 8080]);

      expect(result.total).toBe(100);
      expect(result.deductions).toHaveLength(0);
    });

    it('does not deduct when no ports provided', () => {
      const result = calculateScore(undefined, undefined, []);

      expect(result.total).toBe(100);
      expect(result.deductions).toHaveLength(0);
    });
  });

  describe('Complex Scenarios', () => {
    it('handles multiple deductions stacking correctly', () => {
      const network: Partial<NetworkSection> = {
        risk: {
          fraud_score: 90,
          is_proxy: false,
          is_vpn: false,
          is_tor: false,
          is_datacenter: true,
          is_mobile: false
        },
        leaks: {
          webrtc: { status: 'LEAK', ip: '192.168.1.1' },
          dns: { status: 'LEAK' }
        }
      };

      const consistency: Partial<ConsistencySection> = {
        timezone_check: { status: 'FAIL', evidence: 'TZ mismatch' },
        os_check: { status: 'FAIL', evidence: 'OS mismatch' }
      };

      const result = calculateScore(network, consistency, [22, 3389]);

      // 100 - 20 (IP risk) - 25 (WebRTC) - 10 (DNS) - 15 (TZ) - 15 (OS) - 10 (ports) = 5
      expect(result.total).toBe(5);
      expect(result.grade).toBe('F');
      expect(result.verdict).toBe('High Risk');
      expect(result.deductions).toHaveLength(6);
    });

    it('calculates worst-case scenario (score never below 0)', () => {
      const network: Partial<NetworkSection> = {
        risk: {
          fraud_score: 99,
          is_proxy: true,
          is_vpn: true,
          is_tor: true,
          is_datacenter: true,
          is_mobile: false
        },
        leaks: {
          webrtc: { status: 'LEAK', ip: '1.2.3.4' },
          dns: { status: 'LEAK' }
        }
      };

      const consistency: Partial<ConsistencySection> = {
        timezone_check: { status: 'FAIL', evidence: 'TZ fail' },
        os_check: { status: 'FAIL', evidence: 'OS fail' },
        language_check: { status: 'FAIL', evidence: 'Lang fail' }
      };

      const result = calculateScore(network, consistency, [22, 3389, 5900]);

      expect(result.total).toBe(0);
      expect(result.grade).toBe('F');
      expect(result.verdict).toBe('High Risk');
    });
  });

  describe('Grade Boundaries', () => {
    it('assigns correct grades at boundaries', () => {
      expect(calculateScore().grade).toBe('A+'); // 100

      const network95: Partial<NetworkSection> = {
        leaks: { webrtc: { status: 'NONE' }, dns: { status: 'NONE' } },
        risk: { fraud_score: 0, is_proxy: false, is_vpn: false, is_tor: false, is_datacenter: false, is_mobile: false }
      };
      const consistency95: Partial<ConsistencySection> = {
        language_check: { status: 'FAIL', evidence: 'test' }
      };
      expect(calculateScore(network95, consistency95).grade).toBe('A+'); // 95

      // Test other boundaries by creating specific deduction scenarios
      // For brevity, testing key boundaries:
      const test90 = calculateScore(undefined, undefined, [22]); // 90
      expect(test90.grade).toBe('A');

      const test80 = calculateScore({ risk: { fraud_score: 90, is_proxy: false, is_vpn: false, is_tor: false, is_datacenter: false, is_mobile: false } }); // 80
      expect(test80.grade).toBe('B+');

      const test50 = calculateScore(
        { leaks: { webrtc: { status: 'LEAK', ip: '1.1.1.1' }, dns: { status: 'LEAK' } }, risk: { fraud_score: 90, is_proxy: false, is_vpn: false, is_tor: false, is_datacenter: false, is_mobile: false } },
        { timezone_check: { status: 'FAIL', evidence: '' } }
      ); // 30
      expect(test50.grade).toBe('F');
    });
  });

  describe('Verdict Assignment', () => {
    it('assigns "Low Risk" for score >= 85', () => {
      const result = calculateScore();
      expect(result.verdict).toBe('Low Risk');
    });

    it('assigns "Moderate Risk" for score 70-84', () => {
      // Create a scenario that results in score = 75 (within 70-84 range)
      const network: Partial<NetworkSection> = {
        leaks: { webrtc: { status: 'LEAK', ip: '1.1.1.1' }, dns: { status: 'NONE' } }
      };
      const result = calculateScore(network); // 100 - 25 = 75
      expect(result.verdict).toBe('Moderate Risk');
    });

    it('assigns "Elevated Risk" for score 50-69', () => {
      // Create a scenario that results in score = 65 (within 50-69 range)
      const network: Partial<NetworkSection> = {
        risk: { fraud_score: 90, is_proxy: false, is_vpn: false, is_tor: false, is_datacenter: false, is_mobile: false }
      };
      const consistency: Partial<ConsistencySection> = {
        timezone_check: { status: 'FAIL', evidence: '' }
      };
      const result = calculateScore(network, consistency); // 100 - 20 - 15 = 65
      expect(result.verdict).toBe('Elevated Risk');
    });

    it('assigns "High Risk" for score < 50', () => {
      const network: Partial<NetworkSection> = {
        risk: { fraud_score: 90, is_proxy: false, is_vpn: false, is_tor: false, is_datacenter: false, is_mobile: false },
        leaks: { webrtc: { status: 'LEAK', ip: '1.1.1.1' }, dns: { status: 'LEAK' } }
      };
      const consistency: Partial<ConsistencySection> = {
        timezone_check: { status: 'FAIL', evidence: '' },
        os_check: { status: 'FAIL', evidence: '' },
        language_check: { status: 'FAIL', evidence: '' }
      };
      const result = calculateScore(network, consistency, [22]); // 10
      expect(result.verdict).toBe('High Risk');
    });
  });

  describe('Bot Detection', () => {
    it('adds 30-point deduction for bot detection', () => {
      const initialScore = calculateScore();
      const result = addBotDeduction(initialScore, 'Headless Chrome detected');

      expect(result.total).toBe(70);
      expect(result.grade).toBe('B-');
      expect(result.verdict).toBe('Moderate Risk');
      expect(result.deductions).toHaveLength(1);
      expect(result.deductions[0]?.code).toBe('BOT_DETECTED');
      expect(result.deductions[0]?.score).toBe(-30);
      expect(result.deductions[0]?.desc).toContain('Headless Chrome');
    });

    it('preserves existing deductions when adding bot detection', () => {
      const network: Partial<NetworkSection> = {
        risk: { fraud_score: 90, is_proxy: false, is_vpn: false, is_tor: false, is_datacenter: false, is_mobile: false }
      };
      const initialScore = calculateScore(network); // 80
      const result = addBotDeduction(initialScore, 'WebDriver detected');

      expect(result.total).toBe(50);
      expect(result.grade).toBe('D');
      expect(result.deductions).toHaveLength(2);
      expect(result.deductions[1]?.code).toBe('BOT_DETECTED');
    });

    it('enforces minimum score of 0 with bot detection', () => {
      const network: Partial<NetworkSection> = {
        risk: { fraud_score: 99, is_proxy: true, is_vpn: true, is_tor: true, is_datacenter: true, is_mobile: false },
        leaks: { webrtc: { status: 'LEAK', ip: '1.1.1.1' }, dns: { status: 'LEAK' } }
      };
      const consistency: Partial<ConsistencySection> = {
        timezone_check: { status: 'FAIL', evidence: '' },
        os_check: { status: 'FAIL', evidence: '' },
        language_check: { status: 'FAIL', evidence: '' }
      };
      const initialScore = calculateScore(network, consistency, [22]); // Should be very low already
      const result = addBotDeduction(initialScore, 'Automation detected');

      expect(result.total).toBe(0);
      expect(result.grade).toBe('F');
      expect(result.verdict).toBe('High Risk');
    });

    it('uses default evidence when none provided', () => {
      const initialScore = calculateScore();
      const result = addBotDeduction(initialScore, '');

      expect(result.deductions[0]?.desc).toBe('Automated browser detected');
    });
  });
});
