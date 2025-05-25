-- database/init.sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Создание схем
CREATE SCHEMA IF NOT EXISTS security;
CREATE SCHEMA IF NOT EXISTS logs;

-- Таблица угроз
CREATE TABLE IF NOT EXISTS security.threats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    threat_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(20) DEFAULT 'detected',
    source_ip INET,
    target_ip INET,
    port INTEGER,
    description TEXT,
    metadata JSONB,
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Таблица логов безопасности
CREATE TABLE IF NOT EXISTS logs.security_logs (
    id BIGSERIAL PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    log_level VARCHAR(10) DEFAULT 'INFO',
    source VARCHAR(50) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    source_ip INET,
    destination_ip INET,
    port INTEGER,
    protocol VARCHAR(10),
    message TEXT,
    metadata JSONB
);

-- Индексы для производительности
CREATE INDEX IF NOT EXISTS idx_threats_type_status ON security.threats(threat_type, status);
CREATE INDEX IF NOT EXISTS idx_threats_detected_at ON security.threats(detected_at);
CREATE INDEX IF NOT EXISTS idx_security_logs_timestamp ON logs.security_logs(timestamp);

-- Тестовые данные
INSERT INTO security.threats (threat_type, severity, status, source_ip, target_ip, description) VALUES
('ddos', 'high', 'detected', '192.168.1.100', '10.0.0.1', 'DDoS attack detected from suspicious IP'),
('sql_injection', 'critical', 'investigating', '203.0.113.42', '10.0.0.2', 'SQL injection attempt on user login form'),
('malware', 'medium', 'resolved', '198.51.100.25', '10.0.0.3', 'Malware upload attempt blocked'),
('mitm', 'high', 'detected', '172.16.254.1', '10.0.0.4', 'Man-in-the-middle attack detected on network traffic');

INSERT INTO logs.security_logs (log_level, source, event_type, source_ip, message) VALUES
('WARN', 'firewall', 'blocked_connection', '192.168.1.100', 'Blocked suspicious connection attempt'),
('ERROR', 'application', 'authentication_failure', '203.0.113.42', 'Multiple failed login attempts'),
('INFO', 'ids', 'threat_detected', '198.51.100.25', 'Intrusion detection system alert'),
('WARN', 'network', 'unusual_traffic', '172.16.254.1', 'Unusual network traffic pattern detected');