
import React, { useState, useEffect } from 'react';
import { Play, Sparkles, XCircle, Settings, Code2, ChevronDown } from 'lucide-react';
import { LANGUAGES, THEMES } from './constants';
import { LanguageMode, ExecutionResult } from './types';
import { executeCode } from './services/runtimeService';
import { analyzeRuntimeError, optimizeCode } from './services/geminiService';
import CodeEditor from './components/CodeEditor';
import Terminal from './components/Terminal';
import StatusBadge from './components/StatusBadge';

const App: React.FC = () => {
  const [language, setLanguage] = useState<LanguageMode>(LanguageMode.PYTHON);
  const [code, setCode] = useState<string>(LANGUAGES[LanguageMode.PYTHON].boilerplate);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<ExecutionResult | null>(null);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiContent, setAiContent] = useState<string>('');
  const [aiLoading, setAiLoading] = useState(false);
  
  // State to track the current theme KEY (e.g., 'COSMIC_GLASS')
  const [currentThemeKey, setCurrentThemeKey] = useState<string>('COSMIC_GLASS');
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);

  // Resolve the active theme object
  const activeTheme = THEMES[currentThemeKey] || THEMES['COSMIC_GLASS'];

  // Reliable Theme Injection via CSS Variables
  useEffect(() => {
    const root = document.documentElement;
    const colors = activeTheme.colors;
    const fonts = activeTheme.fonts;

    root.style.setProperty('--theme-bg-main', colors.bgMain);
    root.style.setProperty('--theme-bg-panel', colors.bgPanel);
    root.style.setProperty('--theme-bg-header', colors.bgHeader);
    root.style.setProperty('--theme-border', colors.border);
    root.style.setProperty('--theme-text-main', colors.textMain);
    root.style.setProperty('--theme-text-dim', colors.textDim);
    root.style.setProperty('--theme-accent', colors.accent);
    root.style.setProperty('--theme-accent-hover', colors.accentHover);
    root.style.setProperty('--theme-success', colors.success);
    root.style.setProperty('--theme-error', colors.error);
    
    root.style.setProperty('--theme-font-ui', fonts.ui);
    root.style.setProperty('--theme-font-code', fonts.code);
    
    root.style.setProperty('--theme-radius', activeTheme.radius);
    root.style.setProperty('--theme-glow', activeTheme.glow || 'none');

  }, [activeTheme]);

  const handleLanguageChange = (newLang: LanguageMode) => {
    setLanguage(newLang);
    setCode(LANGUAGES[newLang].boilerplate);
    setOutput(null);
    setShowLanguageSelector(false);
  };

  const handleRun = async () => {
    setIsRunning(true);
    setOutput(null);
    try {
      const result = await executeCode(code, language);
      setOutput(result);
    } catch (error: any) {
      setOutput({
        run: {
          stdout: '',
          stderr: error.message || 'Runtime Error',
          code: 1,
          signal: null,
          output: ''
        },
        language: language,
        version: 'unknown'
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleAiAssist = async (mode: 'error' | 'optimize') => {
    setAiModalOpen(true);
    setAiLoading(true);
    setAiContent('');

    try {
      let result = '';
      if (mode === 'error' && output) {
        const errorText = output.run.stderr || output.compile?.stderr || output.run.stdout;
        result = await analyzeRuntimeError(code, errorText, language);
      } else {
        result = await optimizeCode(code, language);
      }
      setAiContent(result);
    } catch (e) {
      setAiContent("Error connecting to AI service.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className={`flex flex-col h-screen overflow-hidden relative transition-all duration-500 ${activeTheme.isRetro ? 'scanlines' : ''}`}>
      
      {/* Mainframe Container - The "Unique" Floating UI */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div 
          className="w-full max-w-[1600px] h-full flex flex-col relative overflow-hidden transition-all duration-500 shadow-2xl"
          style={{
            backgroundColor: 'var(--theme-bg-main)',
            borderRadius: 'var(--theme-radius)',
            border: '1px solid var(--theme-border)',
            boxShadow: 'var(--theme-glow)',
          }}
        >
          
          {/* Unique Header */}
          <header 
            className="h-16 flex items-center justify-between px-6 z-20 select-none relative"
            style={{ 
              backgroundColor: 'var(--theme-bg-header)',
              borderBottom: '1px solid var(--theme-border)' 
            }}
          >
            <div className="flex items-center gap-4">
              <div 
                className="w-10 h-10 flex items-center justify-center text-xl font-bold transition-transform hover:rotate-12"
                style={{
                  backgroundColor: 'var(--theme-accent)',
                  color: 'var(--theme-bg-main)',
                  borderRadius: 'var(--theme-radius)',
                }}
              >
                <Code2 size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--theme-text-main)' }}>
                  CODE<span style={{ color: 'var(--theme-accent)' }}>FLOW</span>
                </h1>
                <div className="text-[10px] tracking-[0.2em] uppercase opacity-60" style={{ color: 'var(--theme-text-dim)' }}>
                  v1.0
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              
              {/* Language Selector */}
              <div className="relative hidden md:block">
                 <button
                   onClick={() => {
                     setShowLanguageSelector(!showLanguageSelector);
                     setShowThemeSelector(false);
                   }}
                   className="flex items-center gap-2 px-3 py-1.5 border rounded transition-all hover:brightness-110"
                   style={{
                     borderColor: showLanguageSelector ? 'var(--theme-accent)' : 'var(--theme-border)',
                     backgroundColor: showLanguageSelector ? 'var(--theme-bg-panel)' : 'transparent',
                     color: 'var(--theme-text-dim)'
                   }}
                 >
                    <span className="text-xs uppercase tracking-wider opacity-70">System:</span>
                    <span className="text-sm font-bold uppercase flex items-center gap-2" style={{ color: 'var(--theme-accent)' }}>
                      {LANGUAGES[language].name}
                      <ChevronDown size={12} className={`transition-transform ${showLanguageSelector ? 'rotate-180' : ''}`} />
                    </span>
                 </button>

                 {showLanguageSelector && (
                   <div
                     className="absolute top-full left-0 mt-2 w-64 max-h-[60vh] overflow-y-auto p-2 rounded shadow-2xl z-50 border backdrop-blur-md animate-in fade-in slide-in-from-top-2"
                     style={{
                       backgroundColor: 'var(--theme-bg-panel)',
                       borderColor: 'var(--theme-border)',
                       borderRadius: 'var(--theme-radius)',
                     }}
                   >
                      <h3 className="text-xs uppercase font-bold mb-2 px-2 opacity-50" style={{ color: 'var(--theme-text-dim)' }}>Select Runtime</h3>
                      <div className="space-y-1">
                        {Object.values(LANGUAGES).map((lang) => (
                          <button
                            key={lang.id}
                            onClick={() => handleLanguageChange(lang.id)}
                            className="w-full text-left px-3 py-2 text-sm rounded transition-all flex items-center justify-between group hover:bg-opacity-10"
                            style={{
                              backgroundColor: language === lang.id ? 'var(--theme-bg-main)' : 'transparent',
                              color: language === lang.id ? 'var(--theme-accent)' : 'var(--theme-text-main)',
                              border: language === lang.id ? '1px solid var(--theme-accent)' : '1px solid transparent'
                            }}
                          >
                            <span className="font-medium truncate">{lang.name}</span>
                             {language === lang.id && (
                                <div className="w-2 h-2 rounded-full bg-current shadow-[0_0_8px_currentColor]" />
                             )}
                          </button>
                        ))}
                      </div>
                   </div>
                 )}
              </div>

              {/* Theme Selector */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowThemeSelector(!showThemeSelector);
                    setShowLanguageSelector(false);
                  }}
                  className="p-2 rounded transition-colors hover:brightness-110"
                  style={{ color: 'var(--theme-text-dim)' }}
                  title="Change Visual Theme"
                >
                  <Settings size={20} className={showThemeSelector ? 'animate-spin' : ''} />
                </button>

                 {/* Theme Selector Dropdown */}
                {showThemeSelector && (
                  <div 
                    className="absolute top-full right-0 mt-2 w-64 p-4 rounded shadow-2xl z-50 border backdrop-blur-md animate-in fade-in slide-in-from-top-2"
                    style={{
                      backgroundColor: 'var(--theme-bg-panel)',
                      borderColor: 'var(--theme-border)',
                      borderRadius: 'var(--theme-radius)',
                    }}
                  >
                    <h3 className="text-xs uppercase font-bold mb-3 opacity-50" style={{ color: 'var(--theme-text-dim)' }}>Select Interface</h3>
                    <div className="space-y-2">
                      {Object.entries(THEMES).map(([key, theme]) => (
                        <button
                          key={key}
                          onClick={() => {
                            setCurrentThemeKey(key); // Store the dictionary KEY, not theme.id
                            setShowThemeSelector(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm rounded transition-all flex items-center justify-between group hover:bg-opacity-10"
                          style={{
                            backgroundColor: currentThemeKey === key ? 'var(--theme-bg-main)' : 'transparent',
                            color: currentThemeKey === key ? 'var(--theme-accent)' : 'var(--theme-text-main)',
                            border: currentThemeKey === key ? '1px solid var(--theme-accent)' : '1px solid transparent'
                          }}
                        >
                          <span className="font-medium">{theme.name}</span>
                          <div 
                            className="w-3 h-3 rounded-full border"
                            style={{ backgroundColor: theme.colors.accent, borderColor: theme.colors.border }}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => handleAiAssist('optimize')}
                className="hidden sm:flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider border transition-all hover:-translate-y-0.5 active:translate-y-0"
                style={{
                  color: 'var(--theme-accent)',
                  borderColor: 'var(--theme-accent)',
                  borderRadius: 'var(--theme-radius)',
                }}
              >
                <Sparkles size={14} />
                <span>Analyze</span>
              </button>

              <button
                onClick={handleRun}
                disabled={isRunning}
                className="flex items-center gap-2 px-6 py-2 text-sm font-bold uppercase tracking-wider transition-all hover:brightness-110 active:scale-95 shadow-lg"
                style={{
                  backgroundColor: 'var(--theme-accent)',
                  color: activeTheme.id === 'retro_hacker' ? '#000' : '#fff',
                  borderRadius: 'var(--theme-radius)',
                  boxShadow: `0 0 10px ${activeTheme.colors.accent}40`,
                  opacity: isRunning ? 0.7 : 1,
                  cursor: isRunning ? 'not-allowed' : 'pointer'
                }}
              >
                {isRunning ? (
                  <div className="animate-pulse">BUSY</div>
                ) : (
                  <>
                    <Play size={16} fill="currentColor" />
                    EXEC
                  </>
                )}
              </button>
            </div>
          </header>

          <StatusBadge />

          {/* Content Split */}
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
            <div className="flex-1 h-1/2 md:h-full p-4 relative">
              <CodeEditor
                code={code}
                language={language}
                onChange={setCode}
              />
            </div>
            <div className="h-1/2 md:h-full md:w-[40%] lg:w-[35%] z-10">
              <Terminal
                output={output}
                isRunning={isRunning}
                onClear={() => setOutput(null)}
                onAskAI={() => handleAiAssist('error')}
              />
            </div>
          </div>
        </div>
      </div>

      {/* AI Modal - Themed */}
      {aiModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div 
            className="w-full max-w-2xl max-h-[80vh] flex flex-col border shadow-2xl"
            style={{
              backgroundColor: 'var(--theme-bg-main)',
              borderColor: 'var(--theme-border)',
              borderRadius: 'var(--theme-radius)',
              boxShadow: 'var(--theme-glow)'
            }}
          >
            <div 
              className="flex items-center justify-between p-4 border-b"
              style={{ backgroundColor: 'var(--theme-bg-header)', borderColor: 'var(--theme-border)' }}
            >
              <div className="flex items-center gap-2 font-bold text-lg" style={{ color: 'var(--theme-accent)' }}>
                <Sparkles size={20} />
                <h3>AI ANALYSIS</h3>
              </div>
              <button 
                onClick={() => setAiModalOpen(false)}
                className="hover:opacity-80 transition-opacity"
                style={{ color: 'var(--theme-text-dim)' }}
              >
                <XCircle size={24} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {aiLoading ? (
                <div className="flex flex-col items-center justify-center py-8 gap-3 opacity-70" style={{ color: 'var(--theme-text-main)' }}>
                  <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--theme-accent)', borderTopColor: 'transparent' }}></div>
                  <p className="animate-pulse">Processing Logic...</p>
                </div>
              ) : (
                <div className="prose prose-invert max-w-none" style={{ color: 'var(--theme-text-main)', fontFamily: 'var(--theme-font-ui)' }}>
                  <div className="whitespace-pre-wrap">{aiContent}</div>
                </div>
              )}
            </div>
            <div 
              className="p-3 border-t text-xs text-center opacity-50"
              style={{ backgroundColor: 'var(--theme-bg-panel)', borderColor: 'var(--theme-border)', color: 'var(--theme-text-dim)' }}
            >
              Generative content via Google Gemini. Verify before execution.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;