interface DemoReportNoticeProps {
  scanId?: string;
}

export function DemoReportNotice({ scanId }: DemoReportNoticeProps) {
  if (scanId !== 'demo-scan-id') return null;

  return (
    <div
      className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200"
      role="status"
      aria-label="Demo report"
    >
      <strong>DEMO DATA</strong> — these values are illustrative and are not a live browser measurement.
    </div>
  );
}
