-- 002_alert_rule_fields.sql
-- Adds structured fields so alert rules evaluate against live metrics.

ALTER TABLE alert_rules ADD COLUMN source TEXT DEFAULT '';
ALTER TABLE alert_rules ADD COLUMN metric TEXT DEFAULT '';
ALTER TABLE alert_rules ADD COLUMN window TEXT DEFAULT '1h';
