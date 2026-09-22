import React from 'react';
import { Key, BookmarkCheck, Smartphone, Layers, Sliders } from 'lucide-react';

interface NavbarProps {
  hasApiKey: boolean;
  onOpenApiKeyModal: () => void;
  savedCount: number;
  onOpenSavedDrawer: () => void;
  onOpenBulkModal: () => void;
  onOpenMyStyle: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  hasApiKey,
  onOpenApiKeyModal,
  savedCount,
  onOpenSavedDrawer,
  onOpenBulkModal,
  onOpenMyStyle,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-900/30 ring-1 ring-emerald-400/30">
            <Smartphone className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-extrabold text-white tracking-tight flex items-center gap-1.5">
                FormatGen
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Reseller Pro
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 hidden md:block">
              Turn gadget specs into ready-to-post WhatsApp sales listings in seconds
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Bulk Generator Button */}
          <button
            type="button"
            onClick={onOpenBulkModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border border-slate-700/60 transition-all cursor-pointer"
            title="Generate posts for multiple products at once"
          >
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Bulk Mode</span>
          </button>

          {/* My Style Button */}
          <button
            type="button"
            onClick={onOpenMyStyle}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border border-slate-700/60 transition-all cursor-pointer"
            title="Configure personal title, bullet, and emoji style"
          >
            <Sliders className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden sm:inline">My Style</span>
          </button>

          {/* Saved Posts Drawer Button */}
          <button
            type="button"
            onClick={onOpenSavedDrawer}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border border-slate-700/60 transition-all cursor-pointer"
            title="View saved posts history"
          >
            <BookmarkCheck className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">History</span>
            {savedCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-500 text-slate-950">
                {savedCount}
              </span>
            )}
          </button>

          {/* API Key settings button */}
          <button
            type="button"
            onClick={onOpenApiKeyModal}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              hasApiKey
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/40'
                : 'bg-slate-800/80 text-slate-400 border-slate-700/50 hover:bg-slate-800 hover:text-slate-200'
            }`}
            title="Configure AI API Key (OpenRouter or Gemini)"
          >
            <Key className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{hasApiKey ? 'AI Active' : 'Offline Engine'}</span>
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  hasApiKey ? 'bg-emerald-400' : 'bg-slate-500'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  hasApiKey ? 'bg-emerald-500' : 'bg-slate-400'
                }`}
              />
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
