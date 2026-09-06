import React from 'react';
import { CheckCheck, Phone, Video, MoreVertical, Sparkles } from 'lucide-react';
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
  const currentStyleObj = TEMPLATE_STYLES.find((s) => s.id === activeStyle);

  // Current time formatted for WhatsApp message timestamp
  const currentTime = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }).format(new Date());

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
      {/* WhatsApp Simulated Header */}
      <div className="bg-[#1f2c34] text-white px-4 py-3 flex items-center justify-between border-b border-[#2a3942]">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white shadow-inner">
              {post?.category === 'phone' ? '📱' : post?.category === 'laptop' ? '💻' : post?.category === 'vehicle' ? '🚗' : post?.category === 'appliance' ? '⚡' : '🛍️'}
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
      <div className="whatsapp-chat-bg-light p-4 sm:p-6 min-h-[280px] flex flex-col justify-end">
        {/* Date pill */}
        <div className="flex justify-center mb-4">
          <span className="bg-[#ffffff]/90 text-[#54656f] text-[11px] font-medium px-3 py-1 rounded-lg shadow-sm">
            TODAY
          </span>
        </div>

        {/* Message Bubble Container (Aligned to Right for outgoing reseller message) */}
        <div className="flex justify-end relative">
          <div className="relative max-w-full sm:max-w-[85%] bg-[#d9fdd3] text-[#111b21] rounded-2xl rounded-tr-xs p-3.5 sm:p-4 shadow-[0_1px_2px_rgba(11,20,26,0.15)] transition-all">
            {/* WhatsApp Bubble Tail */}
            <div className="whatsapp-bubble-tail" />

            {/* Rendered Text with preserved line breaks */}
            {renderedText ? (
              <div className="whitespace-pre-wrap font-sans text-[14px] sm:text-[15px] leading-relaxed select-text break-words">
                {renderedText}
              </div>
            ) : (
              <div className="text-slate-500 italic text-sm py-4 text-center">
                Paste product notes above and click "Generate Post" to preview your WhatsApp message bubble.
              </div>
            )}

            {/* Bubble Footer: Timestamp & Read Checkmarks */}
            <div className="flex items-center justify-end gap-1 mt-2 text-[11px] text-[#667781] select-none font-sans">
              <span>{currentTime}</span>
              <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
            </div>
          </div>
        </div>
      </div>

      {/* Preview Footer Strip */}
      <div className="bg-slate-950/90 px-4 py-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>
            Active Style: <strong className="text-slate-200">{currentStyleObj?.name || 'Classic'}</strong>
          </span>
        </div>
        <span className="text-[11px] text-slate-500 font-mono">
          {renderedText ? `${renderedText.length} chars` : '0 chars'}
        </span>
      </div>
    </div>
  );
};
