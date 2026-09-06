import React, { useState } from 'react';
import { Copy, Share2, RefreshCw, Check, Edit3, Bookmark, BookmarkCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { TemplateStyle, ProductPost } from '../types';
import { TEMPLATE_STYLES } from '../services/templates';

interface ActionBarProps {
  renderedText: string;
  post: ProductPost | null;
  activeStyle: TemplateStyle;
  onCycleFormat: () => void;
  onOpenEditModal: () => void;
  onToggleSave: () => void;
  isSaved: boolean;
}

export const ActionBar: React.FC<ActionBarProps> = ({
  renderedText,
  post,
  activeStyle,
  onCycleFormat,
  onOpenEditModal,
  onToggleSave,
  isSaved,
}) => {
  const [copied, setCopied] = useState(false);

  const currentStyleIndex = TEMPLATE_STYLES.findIndex((s) => s.id === activeStyle);
  const currentStyle = TEMPLATE_STYLES[currentStyleIndex] || TEMPLATE_STYLES[0];

  const handleCopy = async () => {
    if (!renderedText) return;
    try {
      await navigator.clipboard.writeText(renderedText);
      setCopied(true);
      
      // Trigger a light confetti burst
      try {
        confetti({
          particleCount: 35,
          spread: 60,
          origin: { y: 0.85 },
          colors: ['#25D366', '#128C7E', '#34D399', '#10B981'],
        });
      } catch {
        // ignore confetti errors if unsupported
      }

      setTimeout(() => setCopied(false), 2200);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleWhatsAppShare = () => {
    if (!renderedText) return;
    const url = `https://wa.me/?text=${encodeURIComponent(renderedText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const isDisabled = !renderedText || !post;

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl shadow-slate-950/50 flex flex-col gap-3.5">
      {/* Top row: Status / Active style info and secondary tools */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">Current Format:</span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Style: {currentStyle.name} ({currentStyleIndex + 1}/{TEMPLATE_STYLES.length})
          </span>
        </div>

        {/* Tweak & Star buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenEditModal}
            disabled={isDisabled}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700/60 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            title="Edit parsed product fields"
          >
            <Edit3 className="w-3.5 h-3.5 text-teal-400" />
            <span>Tweak Fields</span>
          </button>

          <button
            type="button"
            onClick={onToggleSave}
            disabled={isDisabled}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer ${
              isSaved
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                : 'text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border-slate-700/60'
            }`}
            title={isSaved ? 'Saved to local history' : 'Save post to history'}
          >
            {isSaved ? (
              <>
                <BookmarkCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Saved</span>
              </>
            ) : (
              <>
                <Bookmark className="w-3.5 h-3.5 text-slate-400" />
                <span>Save</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Primary Action Buttons: Copy, WhatsApp, Generate another format */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {/* 1. Copy */}
        <button
          type="button"
          onClick={handleCopy}
          disabled={isDisabled}
          className={`px-4 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed ${
            copied
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700/80 hover:border-slate-600'
          }`}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-200" />
              <span>Copied to Clipboard!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-emerald-400" />
              <span>Copy Post</span>
            </>
          )}
        </button>

        {/* 2. WhatsApp Direct Share */}
        <button
          type="button"
          onClick={handleWhatsAppShare}
          disabled={isDisabled}
          className="px-4 py-3 rounded-xl font-bold text-sm bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition-all cursor-pointer active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Share2 className="w-4 h-4" />
          <span>Share to WhatsApp</span>
        </button>

        {/* 3. Generate another format (Cycle) */}
        <button
          type="button"
          onClick={onCycleFormat}
          disabled={isDisabled}
          className="px-4 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-600 hover:to-emerald-600 text-white flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed border border-emerald-500/20"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Next Format</span>
        </button>
      </div>
    </div>
  );
};
