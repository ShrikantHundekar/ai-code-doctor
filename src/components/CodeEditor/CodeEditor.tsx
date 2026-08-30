import React, { useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useAppContext } from '../../context/AppContext';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  height?: string;
  readOnly?: boolean;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  language,
  height = '400px',
  readOnly = false,
}) => {
  const { state } = useAppContext();

  const editorRef = useRef<any>(null);

  const handleEditorMount = (editor: any) => {
    editorRef.current = editor;
  };

  return (
    <div className="overflow-hidden rounded-lg border border-gray-700 dark:border-gray-700 bg-gray-900 dark:bg-gray-800 h-full">
      <Editor
        height={height}
        language={language}
        value={value}
        onChange={(value) => onChange(value || '')}
        onMount={handleEditorMount}
        theme="vs-dark"
        options={{
          fontSize: state.editorFontSize,
          tabSize: state.editorTabSize,
          wordWrap: state.editorWordWrap ? 'on' : 'off',
          // autoIndent is read from state
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          readOnly: readOnly,
          lineNumbers: 'on',
          renderLineHighlight: 'all',
          automaticLayout: true,
          folding: true,
          fontFamily: "'Fira Code', monospace",
        }}
      />
    </div>
  );
};

export default CodeEditor;
