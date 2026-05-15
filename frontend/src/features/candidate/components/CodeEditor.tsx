import { Editor } from '@monaco-editor/react';
import type { SupportedLanguage } from '../services/compiler.service';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: SupportedLanguage;
}

const MONACO_LANGUAGE_MAP: Record<SupportedLanguage, string> = {
  javascript: 'javascript',
  python: 'python',
};

const CodeEditor = ({ value, onChange, language }: CodeEditorProps) => {
  return (
    <Editor
      height="100%"
      language={MONACO_LANGUAGE_MAP[language]}
      value={value}
      onChange={(val) => onChange(val || '')}
      theme="vs-dark"
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        fontFamily: 'JetBrains Mono, Consolas, monospace',
        padding: { top: 16 },
        scrollBeyondLastLine: false,
        renderLineHighlight: 'all',
        lineNumbers: 'on',
        glyphMargin: false,
        folding: true,
        lineDecorationsWidth: 10,
        lineNumbersMinChars: 3,
        automaticLayout: true,
      }}
    />
  );
};

export default CodeEditor;