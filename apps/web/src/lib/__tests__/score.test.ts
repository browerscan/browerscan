import { describe, expect, it } from 'vitest';
import { sampleReport } from '../sample-report';

describe('sample report integrity', () => {
  it('keeps deductions sorted by severity', () => {
    const scores = sampleReport.score.deductions.map((deduction) => deduction.score);
    const sorted = [...scores].sort((a, b) => a - b);
    expect(scores).toEqual(sorted);
  });

  it('calculates final score from deductions', () => {
    const total = 100 + sampleReport.score.deductions.reduce((sum, item) => sum + item.score, 0);
    expect(sampleReport.score.total).toBe(total);
  });
});
