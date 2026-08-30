CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    review_name TEXT,
    language TEXT NOT NULL,
    original_code TEXT NOT NULL,
    score INTEGER,
    bug_count INTEGER DEFAULT 0,
    warning_count INTEGER DEFAULT 0,
    security_count INTEGER DEFAULT 0,
    suggestion_count INTEGER DEFAULT 0,
    review_result TEXT,
    fixed_code TEXT,
    provider TEXT,
    model TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);