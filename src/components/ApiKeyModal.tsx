import React, { useState, useEffect } from 'react';
import { X, Key, ExternalLink, ShieldCheck, Check, Trash2, Cpu, Sparkles, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import {
  getStoredApiKey,
  setStoredApiKey,
  getStoredProvider,
  setStoredProvider,
  resolveProvider,
  testApiKey,
} from '../services/extractor';
import type { AIProvider } from '../types';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyUpdated: (key: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  onKeyUpdated,
}) => {
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [provider, setProvider] = useState<AIProvider>('auto');
  const [showSavedMsg, setShowSavedMsg] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setApiKeyInput(getStoredApiKey());
      setProvider(getStoredProvider());
      setShowSavedMsg(false);
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const detectedProvider = resolveProvider(apiKeyInput, provider);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = apiKeyInput.trim();
    setStoredApiKey(cleanKey);
    setStoredProvider(provider);
    onKeyUpdated(cleanKey);
    setShowSavedMsg(true);
    setTimeout(() => {
      onClose();
    }, 900);
  };

  const handleClear = () => {
    setApiKeyInput('');
    setStoredApiKey('');
    setStoredProvider('auto');
    onKeyUpdated('');
    setTestResult(null);
    setShowSavedMsg(true);
    setTimeout(() => {
      onClose();
    }, 800);
  };

  const handleTestConnection = async () => {
    if (!apiKeyInput.trim()) {
      setTestResult({ success: false, message: 'Please enter an API key first.' });
      return;
    }
    setIsTesting(true);
    setTestResult(null);

    const res = await testApiKey(apiKeyInput.trim(), provider);
    setIsTesting(false);
    setTestResult({ success: res.success, message: res.message });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">AI Provider & API Key</h2>
              <p className="text-[11px] text-slate-400">Support for OpenRouter and Google Gemini</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-5 space-y-4">
          <p className="text-xs text-slate-300 leading-relaxed">
            FormatGen works completely offline with a smart regex parser. To unlock deep AI reasoning for complex Nigerian marketplace terms (BH, tokunbo variants, messy abbreviations), you can use an <strong>OpenRouter</strong> or <strong>Google Gemini</strong> key.
          </p>

          {/* Provider Selection Tabs */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              AI Provider
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setProvider('auto')}
                className={`py-1.5 px-2 rounded-lg font-medium transition-all text-center cursor-pointer ${
                  provider === 'auto'
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Auto Detect
              </button>
              <button
                type="button"
                onClick={() => setProvider('openrouter')}
                className={`py-1.5 px-2 rounded-lg font-medium transition-all text-center cursor-pointer ${
                  provider === 'openrouter'
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                OpenRouter
              </button>
              <button
                type="button"
                onClick={() => setProvider('gemini')}
                className={`py-1.5 px-2 rounded-lg font-medium transition-all text-center cursor-pointer ${
                  provider === 'gemini'
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Google Gemini
              </button>
            </div>
          </div>

          {/* Key Input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  {provider === 'openrouter'
                    ? 'OpenRouter API Key'
                    : provider === 'gemini'
                    ? 'Gemini API Key'
                    : 'API Key (OpenRouter or Gemini)'}
                </span>
              </label>
              {apiKeyInput && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-emerald-400 font-mono border border-slate-700">
                  Target: {detectedProvider === 'openrouter' ? 'OpenRouter' : 'Google Gemini'}
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => {
                  setApiKeyInput(e.target.value);
                  setTestResult(null);
                }}
                placeholder={
                  provider === 'openrouter'
                    ? 'sk-or-v1-...'
                    : provider === 'gemini'
                    ? 'AIzaSy...'
                    : 'sk-or-... or AIzaSy...'
                }
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white outline-none transition-all"
              />
            </div>
          </div>

          {/* Test connection button & result */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={!apiKeyInput.trim() || isTesting}
              className="w-full py-2 px-3 rounded-xl text-xs font-semibold border border-slate-800 bg-slate-950/70 hover:bg-slate-800 hover:text-white text-slate-300 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {isTesting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                  <span>Verifying API Key with Provider...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Test Key Connection</span>
                </>
              )}
            </button>

            {testResult && (
              <div
                className={`flex items-start gap-2 p-2.5 rounded-xl border text-xs leading-relaxed ${
                  testResult.success
                    ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-950/30 border-rose-500/30 text-rose-300'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                )}
                <div>{testResult.message}</div>
              </div>
            )}
          </div>

          {/* Privacy Note */}
          <div className="flex items-start gap-2 p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/15 text-emerald-300 text-xs">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
            <div className="leading-relaxed">
              Your key stays safely stored strictly in your local browser storage. It is sent directly to{' '}
              <strong className="text-white">{detectedProvider === 'openrouter' ? 'OpenRouter' : 'Google AI'}</strong> with zero intermediary servers.
            </div>
          </div>

          {/* Quick links to get keys */}
          <div className="pt-1 text-xs space-y-1.5">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Need a key?
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 p-2 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white inline-flex items-center justify-between text-[11px] transition-colors"
              >
                <span>Get an OpenRouter key</span>
                <ExternalLink className="w-3 h-3 text-emerald-400" />
              </a>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 p-2 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white inline-flex items-center justify-between text-[11px] transition-colors"
              >
                <span>Get a Google AI key</span>
                <ExternalLink className="w-3 h-3 text-emerald-400" />
              </a>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            {apiKeyInput ? (
              <button
                type="button"
                onClick={handleClear}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-medium cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Key</span>
              </button>
            ) : (
              <span />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer active:scale-98 transition-all"
              >
                {showSavedMsg ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-slate-950" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <span>Save Key</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
