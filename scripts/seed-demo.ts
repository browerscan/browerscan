import { execSync } from 'child_process';
import { mkdtempSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { sampleReport } from '../apps/web/src/lib/sample-report';

const dbName = process.env.D1_DATABASE ?? 'browserscan-db';
const tmpDir = mkdtempSync(join(tmpdir(), 'browserscan-seed-'));
const sqlPath = join(tmpDir, 'seed.sql');

const createdAt = Math.floor(Date.now() / 1000);
const payload = JSON.stringify(sampleReport).replaceAll("'", "''");

const statement = `INSERT OR REPLACE INTO scans (
  id,
  created_at,
  trust_score,
  trust_grade,
  ip_address,
  country_code,
  browser_family,
  os_family,
  has_proxy,
  has_webrtc_leak,
  is_bot,
  report_blob
) VALUES (
  '${sampleReport.meta.scan_id}',
  ${createdAt},
  ${sampleReport.score.total},
  '${sampleReport.score.grade}',
  '${sampleReport.identity.ip}',
  'US',
  'Chrome',
  'Mac',
  ${sampleReport.network.risk.is_proxy ? 1 : 0},
  ${sampleReport.network.leaks.webrtc.status === 'LEAK' ? 1 : 0},
  0,
  '${payload}'
);`;

writeFileSync(sqlPath, statement, 'utf8');

console.log(`👣 Seeding demo scan into D1 database "${dbName}"...`);
execSync(`npx wrangler d1 execute ${dbName} --file ${sqlPath}`, { stdio: 'inherit' });
