
import React, { useState, useEffect, useRef } from 'react';
import Prism from 'prismjs';

// Core dependencies must be loaded first
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-markup-templating';

// Language definitions
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-ruby';
import 'prismjs/components/prism-php';
import 'prismjs/components/prism-swift';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-sql';

interface CodeEditorProps {
  code: string;
  language: string;
  onChange: (newCode: string) => void;
  disabled?: boolean;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code, language, onChange, disabled }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  const getPrismLang = (lang: string) => {
    const map: Record<string, string> = {
      javascript: 'javascript',
      typescript: 'typescript',
      python: 'python',
      java: 'java',
      c: 'c',
      cpp: 'cpp',
      go: 'go',
      rust: 'rust',
      csharp: 'csharp',
      ruby: 'ruby',
      php: 'php',
      swift: 'swift',
      bash: 'bash',
      sqlite3: 'sql',
    };
    return map[lang] || 'javascript';
  };

  useEffect(() => {
    if (preRef.current) {
      Prism.highlightElement(preRef.current);
    }
  }, [code, language]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const handleScroll = () => {
    if (textareaRef.current && preRef.current) {
      preRef.current.scrollTop = textareaRef.current.scrollTop;
      preRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const val = e.currentTarget.value;
      const newVal = val.substring(0, start) + '    ' + val.substring(end);
      onChange(newVal);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 4;
        }
      }, 0);
    }
  };

  return (
    <div 
      className="editor-container w-full h-full overflow-hidden border"
      style={{
        backgroundColor: 'var(--theme-bg-panel)',
        borderColor: 'var(--theme-border)',
        borderRadius: 'var(--theme-radius)',
      }}
    >
      <div className="relative w-full h-full">
        {/* Syntax Highlight Layer */}
        <pre
          ref={preRef}
          className={`editor-layer editor-highlight language-${getPrismLang(language)}`}
          aria-hidden="true"
        >
          {code + (code.endsWith('\n') ? ' ' : '')}
        </pre>

        {/* Input Layer */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={handleInput}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className="editor-layer editor-textarea focus:outline-none overflow-auto"
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
        />
      </div>
    </div>
  );
};

export default CodeEditor;
