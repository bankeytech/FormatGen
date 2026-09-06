import React from 'react';
import { Key, BookmarkCheck, Smartphone } from 'lucide-react';

interface NavbarProps {
  hasApiKey: boolean;
  onOpenApiKeyModal: () => void;
  savedCount: number;
  onOpenSavedDrawer: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  hasApiKey,
  onOpenApiKeyModal,
  savedCount,
  onOpenSavedDrawer,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-900/30 ring-1 ring-emerald-400/30">
            <Smartphone className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
                FormatGen
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Reseller Pro
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Messy product text &rarr; Instant high-converting WhatsApp sales posts
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* Saved posts button */}
          <button
            onClick={onOpenSavedDrawer}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700/60 transition-all cursor-pointer"
            title="View saved posts"
          >
            <BookmarkCheck className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Saved Posts</span>
            {savedCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-500 text-slate-950">
                {savedCount}
              </span>
            )}
          </button>

          {/* API Key settings button */}
          <button
            onClick={onOpenApiKeyModal}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
              hasApiKey
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/40'
                : 'bg-amber-950/30 text-amber-300 border-amber-500/30 hover:bg-amber-900/40'
            }`}
            title="Configure AI API Key (OpenRouter or Gemini)"
          >
            <Key className="w-3.5 h-3.5" />
            <span>{hasApiKey ? 'AI Active' : 'Offline Parser'}</span>
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  hasApiKey ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  hasApiKey ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
