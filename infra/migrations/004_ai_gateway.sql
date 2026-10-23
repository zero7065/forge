-- 004_ai_gateway.sql
-- AI Gateway lifecycle logging table (One Door architecture)

CREATE TABLE IF NOT EXISTS ai_lifecycle (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  intent TEXT NOT NULL,
  intent_confidence REAL NOT NULL,
  intent_reasoning TEXT,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  request_tokens INTEGER DEFAULT 0,
  response_tokens INTEGER DEFAULT 0,
  estimated_cost REAL DEFAULT 0,
  actual_cost REAL DEFAULT 0,
  latency_ms INTEGER DEFAULT 0,
  input_scrubbed INTEGER DEFAULT 0,
  output_scrubbed INTEGER DEFAULT 0,
  pii_found_input INTEGER DEFAULT 0,
  pii_found_output INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'success',
  error_message TEXT,
  raw_input_hash TEXT,
  raw_output_hash TEXT,
  metadata TEXT DEFAULT '{}',
  FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_ai_lifecycle_user ON ai_lifecycle(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_lifecycle_timestamp ON ai_lifecycle(timestamp);
CREATE INDEX IF NOT EXISTS idx_ai_lifecycle_intent ON ai_lifecycle(intent);
CREATE INDEX IF NOT EXISTS idx_ai_lifecycle_provider ON ai_lifecycle(provider);
CREATE INDEX IF NOT EXISTS idx_ai_lifecycle_status ON ai_lifecycle(status);
