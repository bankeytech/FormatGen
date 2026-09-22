import React, { useState } from 'react';
import { X, Layers, Copy, Check, Sparkles, CheckCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { TemplateStyle, BulkProductItem, ResellerStylePreferences } from '../types';
import { parseLocalFallback } from '../services/fallbackParser';
import { renderTemplate, TEMPLATE_STYLES } from '../services/templates';

interface BulkGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeStyle: TemplateStyle;
  preferences: ResellerStylePreferences;
}

const SAMPLE_BULK = `iPhone 15 128GB 92% BH ₦600k
Samsung S24 Ultra 512GB 95% BH ₦900k
MacBook Air M2 8/256 13" ₦900k
Apple Watch Ultra 2 49mm ₦680k`;

export const BulkGeneratorModal: React.FC<BulkGeneratorModalProps> = ({
  isOpen,
  onClose,
  activeStyle,
  preferences,
}) => {
  const [bulkInput, setBulkInput] = useState<string>(SAMPLE_BULK);
  const [selectedStyle, setSelectedStyle] = useState<TemplateStyle>(activeStyle);
  const [items, setItems] = useState<BulkProductItem[]>([]);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerateBulk = () => {
    if (!bulkInput.trim()) return;

    // Split by newlines
    const rawLines = bulkInput
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 3);

    const generated: BulkProductItem[] = rawLines.map((line, idx) => {
      try {
        const post = parseLocalFallback(line);
        const rendered = renderTemplate(post, selectedStyle, preferences);
        return {
          id: `bulk-${idx}-${Date.now()}`,
          rawText: line,
          post,
          renderedText: rendered,
          copied: false,
        };
      } catch (err: any) {
        return {
          id: `bulk-${idx}-${Date.now()}`,
          rawText: line,
          post: {
            title: line,
            category: 'generic',
            specs: [],
            priceOptions: [],
            tagline: null,
            badges: [],
          },
          renderedText: `*${line}*`,
          copied: false,
          error: err?.message || 'Error parsing line',
        };
      }
    });

    setItems(generated);
  };

  const handleCopySingle = async (item: BulkProductItem) => {
    try {
      await navigator.clipboard.writeText(item.renderedText);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // ignore
    }
  };

  const handleCopyAll = async () => {
    if (items.length === 0) return;
    const combined = items.map((it) => it.renderedText).join('\n\n-------------------------\n\n');
    try {
      await navigator.clipboard.writeText(combined);
      setCopiedAll(true);
      try {
        confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
      } catch {
        // ignore
      }
      setTimeout(() => setCopiedAll(false), 2500);
    } catch {
      // ignore
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Bulk Listing Generator</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                  Multi-Post
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Paste 1 product per line to instantly generate ready-to-copy WhatsApp listings
              </p>
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

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Controls: Template Selector & Sample Paste */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-xs font-semibold text-slate-400 mr-1 shrink-0">Style:</span>
              {TEMPLATE_STYLES.map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setSelectedStyle(st.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                    selectedStyle === st.id
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {st.name}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setBulkInput(SAMPLE_BULK)}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium self-end sm:self-auto cursor-pointer"
            >
              Load Sample Batch
            </button>
          </div>

          {/* Bulk Textarea */}
          <div>
            <textarea
              rows={4}
              value={bulkInput}
              onChange={(e) => setBulkInput(e.target.value)}
              placeholder="Paste one gadget spec per line e.g.:
iPhone 15 128GB 92% BH ₦600k
S24 Ultra 512GB 95% BH ₦900k
MacBook Air M2 8/256 ₦900k"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono focus:border-emerald-500 outline-none resize-y"
            />
          </div>

          {/* Action Trigger */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleGenerateBulk}
              disabled={!bulkInput.trim()}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-1.5 shadow-md shadow-emerald-950/40 cursor-pointer transition-all active:scale-98 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate Batch ({bulkInput.split('\n').filter((l) => l.trim()).length} items)</span>
            </button>
          </div>

          {/* Generated Listings Cards */}
          {items.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">
                  Generated Posts ({items.length})
                </span>
                <button
                  type="button"
                  onClick={handleCopyAll}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow ${
                    copiedAll
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:from-emerald-400 hover:to-teal-400'
                  }`}
                >
                  {copiedAll ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedAll ? 'All Copied to Clipboard!' : 'Copy All Posts'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {items.map((item, idx) => {
                  const isCopied = copiedId === item.id;
                  return (
                    <div
                      key={item.id}
                      className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-800 text-[10px] font-bold text-slate-300 flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-bold text-white">{item.post.title}</span>
                          <span className="text-[10px] text-emerald-400 font-mono">
                            {item.post.priceOptions[0] ? `₦${item.post.priceOptions[0].amount.toLocaleString()}` : ''}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleCopySingle(item)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                            isCopied
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                          }`}
                        >
                          {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3 text-emerald-400" />}
                          <span>{isCopied ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>

                      <div className="bg-slate-900/90 rounded-lg p-2.5 border border-slate-800/80 text-[11.5px] font-mono text-slate-300 whitespace-pre-wrap leading-relaxed max-h-32 overflow-y-auto">
                        {item.renderedText}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Reseller tip: Use &quot;Copy All Posts&quot; to paste directly into your reseller broadcast list.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
