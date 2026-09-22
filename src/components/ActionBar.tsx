import React, { useState } from 'react';
import {
  Copy,
  Share2,
  RefreshCw,
  Check,
  Edit3,
  Bookmark,
  BookmarkCheck,
  Scissors,
  Flame,
  Sparkles,
  Ban,
  Sliders,
} from 'lucide-react';
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
  onRewrite: (action: 'shorter' | 'sales' | 'cleaner' | 'no_emojis') => void;
  onOpenMyStyle: () => void;
}

export const ActionBar: React.FC<ActionBarProps> = ({
  renderedText,
  post,
  activeStyle,
  onCycleFormat,
  onOpenEditModal,
  onToggleSave,
  isSaved,
  onRewrite,
  onOpenMyStyle,
}) => {
  const [copied, setCopied] = useState(false);

  const currentStyleIndex = TEMPLATE_STYLES.findIndex((s) => s.id === activeStyle);
  const currentStyle = TEMPLATE_STYLES[currentStyleIndex] || TEMPLATE_STYLES[0];

  const handleCopy = async () => {
    if (!renderedText) return;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(renderedText);
      } else {
        // Fallback for non-secure context
        const textArea = document.createElement('textarea');
        textArea.value = renderedText;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }

      setCopied(true);

      // Trigger celebratory confetti burst
      try {
        confetti({
          particleCount: 40,
          spread: 65,
          origin: { y: 0.85 },
          colors: ['#25D366', '#128C7E', '#34D399', '#10B981'],
        });
      } catch {
        // ignore confetti errors
      }

      setTimeout(() => setCopied(false), 2400);
    } catch (err) {
      console.error('Failed to copy', err);
      // Friendly fallback alert
      alert('Text ready to copy! Please select and copy directly from the Raw Output tab.');
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
      {/* Top row: Format indicator, My Style, and secondary actions */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">Current Format:</span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            {currentStyle.name}
          </span>
        </div>

        {/* Secondary buttons: My Style, Tweak, Save */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenMyStyle}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700/60 transition-all cursor-pointer"
            title="Configure your personal formatting preferences"
          >
            <Sliders className="w-3.5 h-3.5 text-emerald-400" />
            <span>My Style</span>
          </button>

          <button
            type="button"
            onClick={onOpenEditModal}
            disabled={isDisabled}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700/60 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            title="Edit parsed product fields"
          >
            <Edit3 className="w-3.5 h-3.5 text-teal-400" />
            <span>Tweak</span>
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
            title={isSaved ? 'Saved to history' : 'Save post to history'}
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

      {/* Primary Action Buttons: COPY POST (Most Prominent), WhatsApp, Next Style */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
        {/* 1. Primary Copy Post Button */}
        <button
          type="button"
          onClick={handleCopy}
          disabled={isDisabled}
          className={`sm:col-span-5 px-5 py-3.5 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed ${
            copied
              ? 'bg-emerald-500 text-slate-950 ring-2 ring-emerald-300'
              : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-950/50'
          }`}
        >
          {copied ? (
            <>
              <Check className="w-5 h-5 text-slate-950 stroke-[3]" />
              <span>✓ Copied to Clipboard!</span>
            </>
          ) : (
            <>
              <Copy className="w-5 h-5 text-slate-950" />
              <span>Copy Post</span>
            </>
          )}
        </button>

        {/* 2. WhatsApp Direct Share */}
        <button
          type="button"
          onClick={handleWhatsAppShare}
          disabled={isDisabled}
          className="sm:col-span-4 px-4 py-3.5 rounded-xl font-bold text-sm bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition-all cursor-pointer active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed"
          title="Open WhatsApp chat with prefilled listing"
        >
          <Share2 className="w-4 h-4" />
          <span>Post to WhatsApp</span>
        </button>

        {/* 3. Cycle Next Format */}
        <button
          type="button"
          onClick={onCycleFormat}
          disabled={isDisabled}
          className="sm:col-span-3 px-3 py-3.5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center gap-1.5 shadow-md border border-slate-700/80 transition-all cursor-pointer active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed"
          title="Switch to next template style"
        >
          <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
          <span>Next Style</span>
        </button>
      </div>

      {/* 1-Click Quick Rewrite / Polish Row */}
      <div className="border-t border-slate-800/80 pt-3 flex items-center justify-between flex-wrap gap-2">
        <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-teal-400" />
          <span>Quick Polish:</span>
        </span>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => onRewrite('shorter')}
            disabled={isDisabled}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/70 hover:bg-slate-700 rounded-lg border border-slate-700/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <Scissors className="w-3 h-3 text-amber-400" />
            <span>Make Shorter</span>
          </button>

          <button
            type="button"
            onClick={() => onRewrite('sales')}
            disabled={isDisabled}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/70 hover:bg-slate-700 rounded-lg border border-slate-700/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <Flame className="w-3 h-3 text-rose-400" />
            <span>More Sales Hook</span>
          </button>

          <button
            type="button"
            onClick={() => onRewrite('cleaner')}
            disabled={isDisabled}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/70 hover:bg-slate-700 rounded-lg border border-slate-700/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>Cleaner</span>
          </button>

          <button
            type="button"
            onClick={() => onRewrite('no_emojis')}
            disabled={isDisabled}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/70 hover:bg-slate-700 rounded-lg border border-slate-700/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <Ban className="w-3 h-3 text-slate-400" />
            <span>Strip Emojis</span>
          </button>
        </div>
      </div>
    </div>
  );
};
