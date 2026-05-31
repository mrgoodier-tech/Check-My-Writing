/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PlusCircle, 
  Trash2, 
  Send, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  BookOpen, 
  RefreshCcw,
  Info,
  ChevronRight,
  Moon,
  Sun
} from 'lucide-react';
import { analyzeText, AnalysisResult, ErrorType, WritingError } from './services/analysisService';

const getColors = (isDark: boolean) => ({
  [ErrorType.SPELLING]: isDark ? 'bg-red-500/20 text-red-300 border-red-800/50' : 'bg-red-100 text-red-800 border-red-300',
  [ErrorType.FULL_STOP]: isDark ? 'bg-yellow-500/20 text-yellow-300 border-yellow-800/50' : 'bg-yellow-100 text-yellow-800 border-yellow-300',
  [ErrorType.COMMA]: isDark ? 'bg-blue-500/20 text-blue-300 border-blue-800/50' : 'bg-blue-100 text-blue-800 border-blue-300',
  [ErrorType.SPACE]: isDark ? 'bg-green-500/20 text-green-300 border-green-800/50' : 'bg-green-100 text-green-800 border-green-300',
});

const LEGEND_LABELS = {
  [ErrorType.SPELLING]: 'Spelling (UK)',
  [ErrorType.FULL_STOP]: 'Missing Full Stop',
  [ErrorType.COMMA]: 'Missing Comma',
  [ErrorType.SPACE]: 'Missing Space',
};

export default function App() {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('linguist-dark-mode');
      return saved ? JSON.parse(saved) : false;
    }
    return false;
  });
  const resultsRef = useRef<HTMLDivElement>(null);

  const colors = getColors(isDarkMode);

  useEffect(() => {
    localStorage.setItem('linguist-dark-mode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await analyzeText(inputText);
      setResult(data);
      // Wait for re-render then scroll to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setInputText('');
    setResult(null);
    setError(null);
  };

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-[#FDFCFB] text-slate-900'} font-sans selection:bg-indigo-100 selection:text-indigo-900 dark:selection:bg-indigo-900 dark:selection:text-indigo-100`}>
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20">
              <BookOpen className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Aldwyn Primary <span className="text-indigo-600 dark:text-indigo-400">School</span></h1>
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Check My Writing</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleDarkMode}
              className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all text-slate-500 dark:text-slate-400"
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            {result && (
              <button 
                onClick={handleClear}
                className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                title="Clear all"
              >
                <RefreshCcw className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12 space-y-12">
        {/* Input Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <PlusCircle className="text-indigo-600 dark:text-indigo-400 w-6 h-6" />
              Initial Draft
            </h2>
            <div className="text-xs font-mono text-slate-400 dark:text-slate-500">
              {inputText.length} characters
            </div>
          </div>
          
          <div className="relative group">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste your writing here to see how it could be improved..."
              className="w-full h-80 p-8 rounded-3xl border-2 border-slate-200 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50/50 dark:focus:ring-indigo-900/20 bg-white dark:bg-slate-900 shadow-xl shadow-slate-100/50 dark:shadow-none resize-none transition-all outline-none text-lg leading-relaxed text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600"
            />
            {inputText && !loading && !result && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-6 right-6"
              >
                <button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white px-8 py-4 rounded-2xl font-semibold flex items-center gap-3 shadow-xl shadow-indigo-200 dark:shadow-indigo-900/40 transition-all active:scale-95 disabled:opacity-50"
                >
                  {loading ? 'Analyzing...' : 'Analyze Writing'}
                  <Send className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-4 rounded-2xl flex items-center gap-3"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Loading State */}
        {loading && (
          <section className="flex flex-col items-center justify-center py-20 space-y-6">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-indigo-100 dark:border-slate-800 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin"></div>
              <Sparkles className="absolute inset-0 m-auto text-indigo-400 w-6 h-6 animate-pulse" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold">Performing Linguistic Check</h3>
              <p className="text-slate-500 dark:text-slate-400">Checking UK spelling, grammar, and structure...</p>
            </div>
          </section>
        )}

        {/* Results Section */}
        {result && !loading && (
          <motion.div 
            ref={resultsRef}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12 pb-24"
          >
            <hr className="border-slate-200 dark:border-slate-800" />
            
            {/* Top Stats & Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-100 dark:shadow-none space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Quality Score</span>
                  <CheckCircle2 className="text-emerald-500 w-5 h-5" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-black text-indigo-900 dark:text-indigo-400 leading-none">{result.score}</span>
                  <span className="text-xl font-bold text-slate-300 dark:text-slate-700">/100</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${result.score}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className={`h-full ${result.score > 70 ? 'bg-emerald-500' : result.score > 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                  />
                </div>
              </div>

              <div className="md:col-span-2 bg-indigo-900 dark:bg-indigo-950 text-white p-8 rounded-3xl shadow-xl shadow-indigo-100 dark:shadow-none space-y-4">
                <div className="flex items-center gap-2">
                  <Info className="text-indigo-300 dark:text-indigo-400 w-5 h-5" />
                  <span className="text-xs font-bold text-indigo-200 dark:text-indigo-500 uppercase tracking-widest">Summary</span>
                </div>
                <p className="text-xl font-medium leading-relaxed italic opacity-90">
                  "{result.summary}"
                </p>
                <div className="pt-4 flex items-center gap-6">
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-indigo-300 dark:text-indigo-500 uppercase tracking-widest">Mistakes Found</div>
                    <div className="text-2xl font-bold">{result.totalMistakes}</div>
                  </div>
                  <div className="h-8 w-px bg-indigo-700 dark:bg-indigo-800" />
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-indigo-300 dark:text-indigo-500 uppercase tracking-widest">Focus Area</div>
                    <div className="text-lg font-bold">
                      {result.errors.length > 0 
                        ? LEGEND_LABELS[result.errors.reduce((a, b) => 
                            result.errors.filter(e => e.type === a.type).length >= 
                            result.errors.filter(e => e.type === b.type).length ? a : b
                          ).type]
                        : 'None'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Annotated Text */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold">Marked Manuscript</h3>
                <div className="flex flex-wrap gap-4">
                  {Object.entries(LEGEND_LABELS).map(([type, label]) => (
                    <div key={type} className="flex items-center gap-1.5">
                      <div className={`w-3 h-3 rounded-full ${colors[type as ErrorType].split(' ')[0]}`} />
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-10 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none leading-[2.2] text-xl font-light text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                <HighlightedText text={inputText} errors={result.errors} colors={colors} />
              </div>
            </section>

            {/* Detailed Feedback */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <section className="space-y-6">
                <h3 className="text-2xl font-semibold flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                   </div>
                   Improvement Roadmap
                </h3>
                <div className="space-y-4">
                  {result.suggestions.map((suggestion, idx) => (
                    <motion.div 
                      key={idx}
                      whileHover={{ x: 4 }}
                      className="group flex gap-5 p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-indigo-100 dark:hover:border-indigo-900 transition-all shadow-sm"
                    >
                      <div className="text-3xl font-black text-slate-100 dark:text-slate-800 group-hover:text-indigo-100 dark:group-hover:text-indigo-950 transition-colors leading-none">
                        0{idx + 1}
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed">{suggestion}</p>
                    </motion.div>
                  ))}
                </div>
              </section>

              <section className="space-y-6">
                <h3 className="text-2xl font-semibold flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5" />
                   </div>
                   What You Got Wrong
                </h3>
                <div className="space-y-4 max-h-[800px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 scrollbar-track-transparent">
                  {result.errors.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500">
                      No errors identified. Outstanding!
                    </div>
                  ) : (
                    result.errors.map((error, idx) => (
                      <div 
                        key={idx}
                        className={`p-6 rounded-2xl border-l-4 ${colors[error.type]} bg-white dark:bg-slate-900/40 shadow-sm space-y-3`}
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">
                            {LEGEND_LABELS[error.type]}
                          </span>
                          <span className="font-mono text-[10px] opacity-40">Pos: {error.offset}</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                             <span className="text-sm line-through opacity-40 text-slate-900 dark:text-slate-100">{error.fragment || '...'}</span>
                             <ChevronRight className="w-4 h-4 opacity-30" />
                             <span className="text-lg font-bold">{error.correction}</span>
                          </div>
                          <p className="text-sm italic opacity-80 leading-relaxed font-medium">"{error.reason}"</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>
          </motion.div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-6 py-12 border-t border-slate-100 dark:border-slate-900">
        <p className="text-center text-slate-400 dark:text-slate-600 text-sm font-medium">
          Powered by Gemini 3 Flash • Strictly UK English Standards
        </p>
      </footer>
    </div>
  );
}

function HighlightedText({ text, errors, colors }: { text: string, errors: WritingError[], colors: Record<ErrorType, string> }) {
  // Sort errors by offset to process them in order
  const sortedErrors = [...errors].sort((a, b) => a.offset - b.offset);
  
  const segments: React.ReactNode[] = [];
  let lastIndex = 0;

  sortedErrors.forEach((error, idx) => {
    // If there's content between the last error and this one, add it as plain text
    if (error.offset > lastIndex) {
      segments.push(text.substring(lastIndex, error.offset));
    }

    // Add the highlighted fragment
    // If the fragment length is 0 (missing char), we'll highlight the next character or space
    const start = error.offset;
    const end = error.offset + (error.length || 1);
    const fragment = text.substring(start, end);

    segments.push(
      <span 
        key={idx} 
        className={`px-1 py-0.5 rounded-md font-semibold border-b-2 cursor-help transition-all hover:brightness-95 dark:hover:brightness-110 ${colors[error.type]}`}
        title={`${LEGEND_LABELS[error.type]}: ${error.reason}`}
      >
        {fragment || ' '}
      </span>
    );
    
    lastIndex = end;
  });

  // Add remaining text
  if (lastIndex < text.length) {
    segments.push(text.substring(lastIndex));
  }

  return <>{segments}</>;
}
