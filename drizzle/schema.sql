-- ============================================
-- Core Scans Table
-- ============================================
CREATE TABLE IF NOT EXISTS scans (
    id TEXT PRIMARY KEY,
    created_at INTEGER NOT NULL,
    trust_score INTEGER,
    trust_grade TEXT,
    ip_address TEXT,
    country_code TEXT,
    browser_family TEXT,
    os_family TEXT,
    has_proxy BOOLEAN DEFAULT 0,
    has_webrtc_leak BOOLEAN DEFAULT 0,
    is_bot BOOLEAN DEFAULT 0,
    report_blob TEXT
);

CREATE INDEX IF NOT EXISTS idx_created_at ON scans(created_at);
CREATE INDEX IF NOT EXISTS idx_created_at_desc ON scans(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_score ON scans(trust_score);
CREATE INDEX IF NOT EXISTS idx_country ON scans(country_code);

-- ============================================
-- reCAPTCHA Simulation Table
-- ============================================
CREATE TABLE IF NOT EXISTS recaptcha_simulations (
    id TEXT PRIMARY KEY,
    score REAL NOT NULL,
    timestamp INTEGER NOT NULL,
    ip_hash TEXT NOT NULL,
    action TEXT DEFAULT 'submit'
);

CREATE INDEX IF NOT EXISTS idx_recaptcha_timestamp ON recaptcha_simulations(timestamp);
CREATE INDEX IF NOT EXISTS idx_recaptcha_ip ON recaptcha_simulations(ip_hash);

-- ============================================
-- Behavior Sessions Table
-- ============================================
CREATE TABLE IF NOT EXISTS behavior_sessions (
    id TEXT PRIMARY KEY,
    timestamp INTEGER NOT NULL,
    ip_hash TEXT NOT NULL,
    verdict TEXT NOT NULL,
    human_probability INTEGER NOT NULL,
    bot_probability INTEGER NOT NULL,
    mouse_entropy REAL,
    click_entropy REAL,
    keyboard_entropy REAL,
    event_count INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_behavior_timestamp ON behavior_sessions(timestamp);
CREATE INDEX IF NOT EXISTS idx_behavior_ip ON behavior_sessions(ip_hash);
CREATE INDEX IF NOT EXISTS idx_behavior_verdict ON behavior_sessions(verdict);
CREATE INDEX IF NOT EXISTS idx_behavior_ip_time ON behavior_sessions(ip_hash, timestamp DESC);
