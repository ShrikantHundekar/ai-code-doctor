"""Configuration for AI Code Doctor Backend"""
import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')
    DEBUG = os.getenv('FLASK_DEBUG', 'false').lower() == 'true'
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    MAX_CODE_LENGTH = int(os.getenv('MAX_CODE_LENGTH', 50000))
    MAX_PROVIDERS_PER_COMPARISON = int(os.getenv('MAX_PROVIDERS_PER_COMPARISON', 3))

    # AI Provider Configuration
    DEFAULT_AI_PROVIDER = os.getenv('DEFAULT_AI_PROVIDER', 'openai')
    AI_MOCK_MODE = os.getenv('AI_MOCK_MODE', 'false').lower() == 'true'
    AI_RATE_LIMIT = os.getenv('AI_RATE_LIMIT', '10/minute')

    # Supported AI Providers
    SUPPORTED_PROVIDERS = ['openai', 'claude', 'gemini']
    SUPPORTED_LANGUAGES = ['python', 'javascript', 'java', 'cpp', 'csharp']

    # Model Configuration
    OPENAI_MODEL = os.getenv('OPENAI_MODEL', 'gpt-4')
    CLAUDE_MODEL = os.getenv('CLAUDE_MODEL', 'claude-sonnet-4-20250514')
    GEMINI_MODEL = os.getenv('GEMINI_MODEL', 'gemini-1.5-pro')

    # Database
    DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///ai_code_doctor.db')

    # Frontend URL
    FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:3000')
