import React, { useState, useEffect } from 'react';
import { Shield, ShieldAlert, Loader2, AlertCircle } from 'lucide-react';
import LanguageSelector from '../components/CodeEditor/LanguageSelector';
import CodeEditor from '../components/CodeEditor/CodeEditor';
import EditorToolbar from '../components/CodeEditor/EditorToolbar';
import ProviderSelector from '../components/Common/ProviderSelector';
import { getProviders, securityScan, type Provider } from '../services/api';
import type { Language, SecurityResult } from '../types';

const defaultSecuritySnippet = `import sqlite3

def find_user_by_name(username):
    # Vulnerable to SQL injection
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    query = f"SELECT * FROM users WHERE name = '{username}'"
    cursor.execute(query)
    return cursor.fetchall()`;

const SecurityScan: React.FC = () => {
  const [code, setCode] = useState(defaultSecuritySnippet);
  const [language, setLanguage] = useState<Language>('python');
  const [provider, setProvider] = useState('openai');
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<SecurityResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    getProviders()
      .then((data) => {
        setProviders(data.providers);
        if (data.default) setProvider(data.default);
      })
      .catch(() => {});
  }, []);

  const handleScan = async () => {
    if (!code.trim()) {
      setErrorMsg('Please provide code to scan for security vulnerabilities.');
      return;
    }

    setErrorMsg(null);
    setIsScanning(true);

    try {
      const res = await securityScan(language, code, provider);
      setResult(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Security scan failed.');
    } finally {
      setIsScanning(false);
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'critical':
        return 'bg-red-600 text-white border-red-700';
      case 'high':
        return 'bg-orange-500 text-white border-orange-600';
      case 'medium':
        return 'bg-yellow-500 text-white border-yellow-600';
      default:
        return 'bg-green-600 text-white border-green-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-red-500 uppercase tracking-wider mb-1">
          <Shield className="w-4 h-4" />
          Vulnerability & SAST Scanner
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Security Scan</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Detect hardcoded secrets, SQL/command injection, unsafe deserialization, and dangerous operations.
        </p>
      </div>

      {/* Configuration */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
              Programming Language
            </label>
            <LanguageSelector
              value={language}
              onChange={(lang) => setLanguage(lang as Language)}
            />
          </div>

          <div>
            <ProviderSelector
              providers={providers}
              mode="single"
              selectedProvider={provider}
              onSelectProvider={setProvider}
              disabled={providers.length === 0}
            />
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
          <p className="text-sm font-medium text-red-700 dark:text-red-300">{errorMsg}</p>
        </div>
      )}

      {/* Code Editor */}
      <div className={`bg-gray-900 rounded-lg overflow-hidden ${isMaximized ? 'fixed inset-0 z-50' : ''}`}>
        <EditorToolbar
          language={language.toUpperCase()}
          lineCount={code.split('\n').length}
          charCount={code.length}
          isMaximized={isMaximized}
          onToggleMaximize={() => setIsMaximized(!isMaximized)}
          onCopy={() => navigator.clipboard.writeText(code)}
          onClear={() => setCode('')}
        />
        <div className={isMaximized ? 'h-[calc(100vh-120px)]' : 'h-[320px]'}>
          <CodeEditor
            value={code}
            onChange={setCode}
            language={language}
            height={isMaximized ? 'calc(100vh - 120px)' : '320px'}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleScan}
          disabled={isScanning || !code.trim()}
          className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors text-sm shadow-md shadow-red-500/20"
        >
          {isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
          {isScanning ? 'Scanning...' : 'Run Security Scan'}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          {/* Overall Risk Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Overall Code Risk Assessment
              </span>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 max-w-xl">
                {result.summary}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border shadow-sm ${getRiskBadge(
                  result.overallRisk
                )}`}
              >
                {result.overallRisk} Risk
              </span>
            </div>
          </div>

          {/* Issues List */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Vulnerabilities & Findings ({result.issues.length})
            </h3>

            {result.issues.map((issue, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                        issue.severity?.toLowerCase() === 'critical'
                          ? 'bg-red-500/15 text-red-700 dark:text-red-300'
                          : issue.severity?.toLowerCase() === 'high'
                          ? 'bg-orange-500/15 text-orange-700 dark:text-orange-300'
                          : issue.severity?.toLowerCase() === 'medium'
                          ? 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-300'
                          : 'bg-blue-500/15 text-blue-700 dark:text-blue-300'
                      }`}
                    >
                      {issue.severity}
                    </span>
                    {issue.category && (
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                        {issue.category}
                      </span>
                    )}
                    {issue.line && (
                      <span className="text-xs font-mono text-gray-400">
                        Line {issue.line}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                    {issue.title || issue.category}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                    {issue.description}
                  </p>
                </div>

                {issue.impact && (
                  <div className="p-3 rounded-lg bg-red-50/60 dark:bg-red-950/20 text-xs text-red-900 dark:text-red-300">
                    <strong className="font-semibold">Potential Impact: </strong>
                    {issue.impact}
                  </div>
                )}

                {issue.recommendation && (
                  <div className="p-3 rounded-lg bg-blue-50/60 dark:bg-blue-950/20 text-xs text-blue-900 dark:text-blue-300">
                    <strong className="font-semibold">Remediation: </strong>
                    {issue.recommendation}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Security Disclaimer */}
          <p className="text-[11px] text-gray-500 dark:text-gray-400 text-center italic py-2">
            Notice: AI-powered security analysis assists developers during development and does not replace formal penetration testing or dedicated compliance auditing.
          </p>
        </div>
      )}
    </div>
  );
};

export default SecurityScan;
