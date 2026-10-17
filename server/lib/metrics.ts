// Live runtime metrics (in-memory ring buffers, local-first).
// Latencies are recorded by the request logger in server/index.ts.
// Alert rules resolve against these + SQLite tables (users, audit_log).

const MAX_SAMPLES = 500;
const latencies: number[] = [];

export function recordLatency(ms: number): void {
  if (!Number.isFinite(ms) || ms < 0) return;
  latencies.push(ms);
  if (latencies.length > MAX_SAMPLES) latencies.splice(0, latencies.length - MAX_SAMPLES);
}

export function getLatencies(): number[] {
  return latencies.slice();
}

export function avgLatency(): number | null {
  if (latencies.length === 0) return null;
  return latencies.reduce((a, b) => a + b, 0) / latencies.length;
}
