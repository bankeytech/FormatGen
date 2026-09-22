import React, { useState } from 'react';
import { CheckCheck, Phone, Video, MoreVertical, Sparkles, Eye, Code2, Copy, Check } from 'lucide-react';
import type { ProductPost, TemplateStyle } from '../types';
import { TEMPLATE_STYLES } from '../services/templates';

interface WhatsAppPreviewProps {
  post: ProductPost | null;
  renderedText: string;
  activeStyle: TemplateStyle;
}

export const WhatsAppPreview: React.FC<WhatsAppPreviewProps> = ({
  post,
  renderedText,
  activeStyle,
}) => {
  const [viewTab, setViewTab] = useState<'preview' | 'raw'>('preview');
  const [copiedRaw, setCopiedRaw] = useState(false);

  const currentStyleObj = TEMPLATE_STYLES.find((s) => s.id === activeStyle);

  // Current time formatted for WhatsApp message timestamp
  const currentTime = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }).format(new Date());

  const handleCopyRaw = async () => {
    if (!renderedText) return;
    try {
      await navigator.clipboard.writeText(renderedText);
      setCopiedRaw(true);
      setTimeout(() => setCopiedRaw(false), 2000);
    } catch {
      // ignore
    }
  };

  const getAvatarIcon = (category?: string) => {
    switch (category) {
      case 'phone':
        return '📱';
      case 'laptop':
        return '💻';
      case 'tablet':
        return '📱';
      case 'watch':
        return '⌚';
      case 'accessory':
        return '🎧';
      case 'appliance':
        return '⚡';
      case 'vehicle':
        return '🚗';
      default:
        return '🛍️';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
      {/* Top Bar: View Mode Switcher [Preview] vs [Raw Output] */}
      <div className="bg-slate-950 px-4 py-2.5 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={() => setViewTab('preview')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
              viewTab === 'preview'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>WhatsApp Preview</span>
          </button>

          <button
            type="button"
            onClick={() => setViewTab('raw')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
              viewTab === 'raw'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Raw Copy Text</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="hidden sm:inline">Format:</span>
          <span className="font-semibold text-slate-200">
            {currentStyleObj?.name || 'Standard'}
          </span>
        </div>
      </div>

      {viewTab === 'preview' ? (
        <>
          {/* WhatsApp Simulated Header */}
          <div className="bg-[#1f2c34] text-white px-4 py-3 flex items-center justify-between border-b border-[#2a3942]">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white shadow-inner text-base">
                  {getAvatarIcon(post?.category)}
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#1f2c34]" />
              </div>
              <div>
                <div className="font-semibold text-sm text-slate-100 flex items-center gap-1.5">
                  <span>Customer / Broadcast Preview</span>
                </div>
                <div className="text-[11px] text-emerald-400 font-medium">
                  online • previewing
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-slate-300">
              <Video className="w-4 h-4 hover:text-white cursor-pointer opacity-80" />
              <Phone className="w-4 h-4 hover:text-white cursor-pointer opacity-80" />
              <MoreVertical className="w-4 h-4 hover:text-white cursor-pointer opacity-80" />
            </div>
          </div>

          {/* WhatsApp Chat Body */}
          <div className="whatsapp-chat-bg-light p-4 sm:p-6 min-h-[300px] flex flex-col justify-end">
            {/* Date pill */}
            <div className="flex justify-center mb-4">
              <span className="bg-[#ffffff]/95 text-[#54656f] text-[11px] font-medium px-3 py-1 rounded-lg shadow-sm">
                TODAY
              </span>
            </div>

            {/* Message Bubble Container */}
            {renderedText ? (
              <div className="flex justify-end relative">
                <div className="relative max-w-full sm:max-w-[88%] bg-[#d9fdd3] text-[#111b21] rounded-2xl rounded-tr-xs p-3.5 sm:p-4 shadow-[0_1px_2px_rgba(11,20,26,0.15)] transition-all">
                  {/* WhatsApp Bubble Tail */}
                  <div className="whatsapp-bubble-tail" />

                  {/* Rendered Text with preserved line breaks */}
                  <div className="whitespace-pre-wrap font-sans text-[14px] sm:text-[15px] leading-relaxed select-text break-words">
                    {renderedText}
                  </div>

                  {/* Bubble Footer: Timestamp & Read Checkmarks */}
                  <div className="flex items-center justify-end gap-1 mt-2 text-[11px] text-[#667781] select-none font-sans">
                    <span>{currentTime}</span>
                    <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
                  </div>
                </div>
              </div>
            ) : (
              /* Intentional Empty State */
              <div className="bg-white/80 backdrop-blur-xs border border-emerald-900/10 rounded-2xl p-6 text-center shadow-sm max-w-sm mx-auto my-auto">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto mb-3 text-xl">
                  📱
                </div>
                <h4 className="text-sm font-bold text-slate-800">Your Generated Post Appears Here</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Paste specs on the left and tap &quot;Generate Post&quot; to see the exact WhatsApp chat bubble.
                </p>
              </div>
            )}
          </div>
        </>
      ) : (
        /* Raw Copy Text View */
        <div className="p-4 sm:p-6 min-h-[360px] bg-slate-950 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400">
                Exact Clipboard Content (Preserves Unicode bold &amp; line breaks)
              </span>
              <button
                type="button"
                onClick={handleCopyRaw}
                className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-medium cursor-pointer"
              >
                {copiedRaw ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedRaw ? 'Copied!' : 'Copy Raw Text'}</span>
              </button>
            </div>

            <textarea
              readOnly
              rows={10}
              value={renderedText}
              placeholder="Your raw post text will appear here..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 font-mono leading-relaxed outline-none resize-none select-all"
            />
          </div>

          <div className="text-[11px] text-slate-500 font-mono mt-3">
            Tip: What you see above is the exact byte representation sent to WhatsApp when you copy.
          </div>
        </div>
      )}

      {/* Preview Footer Strip */}
      <div className="bg-slate-950/90 px-4 py-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>
            Active Style: <strong className="text-slate-200">{currentStyleObj?.name || 'Standard'}</strong>
          </span>
        </div>
        <span className="text-[11px] text-slate-500 font-mono">
          {renderedText ? `${renderedText.length} characters` : '0 chars'}
        </span>
      </div>
    </div>
  );
};
