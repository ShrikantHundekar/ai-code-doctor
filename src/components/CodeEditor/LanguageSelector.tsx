import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import type { Language } from '../../types';

const languages: { value: Language; label: string; color: string }[] = [
  { value: 'python', label: 'Python', color: 'text-yellow-500' },
  { value: 'javascript', label: 'JavaScript', color: 'text-yellow-400' },
  { value: 'java', label: 'Java', color: 'text-red-500' },
  { value: 'cpp', label: 'C++', color: 'text-blue-500' },
  { value: 'csharp', label: 'C#', color: 'text-purple-500' },
];

const languageColors: Record<string, string> = {
  python: 'bg-yellow-500',
  javascript: 'bg-yellow-400',
  java: 'bg-red-500',
  cpp: 'bg-blue-500',
  csharp: 'bg-purple-500',
};

interface LanguageSelectorProps {
  value?: Language;
  onChange?: (lang: Language) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ value, onChange }) => {
  const [internalLanguage, setInternalLanguage] = useState<Language>('python');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const language = value ?? internalLanguage;
  const setLanguage = (lang: Language) => {
    if (value !== undefined) {
      onChange?.(lang);
    } else {
      setInternalLanguage(lang);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedLanguage = languages.find(l => l.value === language);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg border border-gray-700 hover:border-blue-400 transition-colors text-sm font-medium"
        aria-label="Select programming language"
        aria-expanded={isOpen}
      >
        <span className={`w-2 h-2 rounded-full ${languageColors[language]}`} />
        <span>{selectedLanguage?.label}</span>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1">
          {languages.map((lang) => (
            <button
              key={lang.value}
              onClick={() => {
                setLanguage(lang.value);
                setIsOpen(false);
              }}
              className={`flex items-center gap-2 w-full px-4 py-2 text-sm transition-colors ${
                language === lang.value
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${languageColors[lang.value]}`} />
              {lang.label}
              {language === lang.value && (
                <span className="ml-auto text-blue-500">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;