import React, { useRef } from 'react';
import { ArrowRight, ClipboardPaste, XCircle, Sparkles, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { SampleChips } from './SampleChips';
import type { SampleInput } from '../data/sampleInputs';

interface InputCardProps {
  input: string;
  setInput: (val: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  extractionSource: 'ai' | 'fallback' | null;
  extractionProvider?: 'gemini' | 'openrouter' | 'fallback';
  extractionError?: string;
  hasApiKey: boolean;
  onSelectSample: (sample: SampleInput) => void;
}

export const InputCard: React.FC<InputCardProps> = ({
  input,
  setInput,
  onGenerate,
  isGenerating,
  extractionSource,
  extractionProvider,
  extractionError,
  hasApiKey,
  onSelectSample,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInput(text);
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }
    } catch {
      // If browser clipboard permission denied, ignore
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  };

  const handleClear = () => {
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl shadow-slate-950/50 flex flex-col gap-3">
      {/* Header of Input Card */}
      <div className="flex items-center justify-between">
        <div>
          <label htmlFor="raw-input" className="text-sm font-bold text-white flex items-center gap-2">
            <span>Paste Supplier Notes / Product Text</span>
            <span className="text-[11px] font-normal text-slate-400">
              (Raw, messy notes from WhatsApp, lists, etc.)
            </span>
          </label>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handlePaste}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700/60 transition-colors cursor-pointer"
            title="Paste from clipboard"
          >
            <ClipboardPaste className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Paste</span>
          </button>
          {input.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-400 hover:text-rose-400 bg-slate-800/60 hover:bg-slate-800 rounded-lg border border-slate-700/40 transition-colors cursor-pointer"
              title="Clear input"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Sample inputs chips */}
      <SampleChips onSelectSample={onSelectSample} disabled={isGenerating} />

      {/* Textarea */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          id="raw-input"
          rows={5}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`e.g.
iPhone 15 Pro Max / 256GB / 92% BH / Natural Titanium / ₦1.2m
or
Inverter-friendly infrared electric cooker
Double head ₦85,000 / Single head ₦45,000
Low power consumption (solar and inverter friendly)`}
          className="w-full bg-slate-950/80 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 rounded-xl p-3.5 text-sm text-slate-200 placeholder-slate-500 outline-none resize-y transition-all font-mono leading-relaxed"
        />

        {/* Character & word counter badge */}
        <div className="absolute bottom-3 right-3 text-[11px] font-mono text-slate-500 bg-slate-900/80 px-2 py-0.5 rounded pointer-events-none">
          {input.trim() ? `${input.trim().split(/\s+/).length} words` : 'Empty'}
        </div>
      </div>

      {/* Status Warning or Notice */}
      {extractionSource === 'fallback' && extractionError && (
        <div className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs leading-relaxed">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
          <div>
            <span className="font-semibold">Local Fallback Parser Used:</span> {extractionError}
          </div>
        </div>
      )}

      {extractionSource === 'ai' && (
        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium px-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>
            Extracted with {extractionProvider === 'openrouter' ? 'OpenRouter AI' : 'Google Gemini AI'}
          </span>
        </div>
      )}

      {/* Primary Action Button */}
      <div className="flex items-center justify-between pt-1">
        <div className="text-xs text-slate-400 hidden sm:block">
          {hasApiKey ? (
            <span className="text-emerald-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              AI extraction mode active ({extractionProvider === 'openrouter' ? 'OpenRouter' : 'Gemini'})
            </span>
          ) : (
            <span className="text-slate-400">
              💡 Using local regex parser. Add an OpenRouter or Gemini API key for deep AI extraction.
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onGenerate}
          disabled={!input.trim() || isGenerating}
          className="w-full sm:w-auto ml-auto px-6 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-lg shadow-emerald-900/40 hover:shadow-emerald-900/60 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Parsing Product Data...</span>
            </>
          ) : (
            <>
              <span>Generate Post</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
