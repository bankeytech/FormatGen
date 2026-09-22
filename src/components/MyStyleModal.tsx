import React, { useState } from 'react';
import { X, Check, Sliders, RotateCcw } from 'lucide-react';
import type { ResellerStylePreferences } from '../types';
import { DEFAULT_STYLE_PREFERENCES } from '../services/templates';

interface MyStyleModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: ResellerStylePreferences;
  onSavePreferences: (prefs: ResellerStylePreferences) => void;
}

export const MyStyleModal: React.FC<MyStyleModalProps> = ({
  isOpen,
  onClose,
  preferences,
  onSavePreferences,
}) => {
  const [prefs, setPrefs] = useState<ResellerStylePreferences>(preferences);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSavePreferences(prefs);
    onClose();
  };

  const handleReset = () => {
    setPrefs(DEFAULT_STYLE_PREFERENCES);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-base font-bold text-white">My Style Preferences</h2>
              <p className="text-[11px] text-slate-400">
                Customize your signature WhatsApp listing format across all posts
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Title Style */}
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1.5">
              Title Formatting Style
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'wa_bold', label: '*WhatsApp Bold*', example: '*iPhone 15 Pro*' },
                { id: 'bold_unicode', label: 'Mathematical Unicode', example: '𝒊𝑷𝒉𝒐𝒏𝒆 15 𝑷𝒓𝒐' },
                { id: 'uppercase', label: 'UPPERCASE BOLD', example: '*IPHONE 15 PRO*' },
                { id: 'titlecase', label: 'Title Case Bold', example: '*Iphone 15 Pro*' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setPrefs({ ...prefs, titleStyle: item.id as any })}
                  className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                    prefs.titleStyle === item.id
                      ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300'
                      : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-semibold">{item.label}</div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">{item.example}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Specification Bullet Style */}
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1.5">
              Specification Bullet Prefix
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'tilde', label: '~ 256GB' },
                { id: 'bullet', label: '• 256GB' },
                { id: 'check', label: '✅ 256GB' },
                { id: 'dash', label: '- 256GB' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setPrefs({ ...prefs, specStyle: item.id as any })}
                  className={`p-2 rounded-xl text-center border text-xs font-semibold transition-all cursor-pointer ${
                    prefs.specStyle === item.id
                      ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300'
                      : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Emoji Level */}
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1.5">Emoji Density</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'none', label: 'None (Plain)', desc: 'No emojis at all' },
                { id: 'minimal', label: 'Minimal', desc: '1-2 key icons' },
                { id: 'moderate', label: 'Moderate', desc: 'Reseller standard' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setPrefs({ ...prefs, emojiLevel: item.id as any })}
                  className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                    prefs.emojiLevel === item.id
                      ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300'
                      : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-semibold">{item.label}</div>
                  <div className="text-[10.5px] text-slate-400">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Price Style */}
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1.5">
              Price Format Display
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'abbreviated', label: '₦770k / ₦1.2m', desc: 'Abbreviated' },
                { id: 'full', label: '₦770,000', desc: 'Full Comma' },
                { id: 'both', label: '₦770,000 (₦770k)', desc: 'Both styles' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setPrefs({ ...prefs, priceStyle: item.id as any })}
                  className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                    prefs.priceStyle === item.id
                      ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300'
                      : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-semibold">{item.label}</div>
                  <div className="text-[10.5px] text-slate-400">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Call To Action (CTA) */}
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1.5">
              Closing Call-To-Action (CTA)
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {[
                'DM to order 📲',
                'Message to order 💬',
                'Available now • DM for details',
                'Call/WhatsApp to lock this deal 📞',
              ].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setPrefs({ ...prefs, cta: preset })}
                  className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs border border-slate-700/60 cursor-pointer"
                >
                  {preset}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={prefs.cta}
              onChange={(e) => setPrefs({ ...prefs, cta: e.target.value })}
              placeholder="e.g. DM to order 📲 or Send a WhatsApp message"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-emerald-950/40 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save My Style</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
