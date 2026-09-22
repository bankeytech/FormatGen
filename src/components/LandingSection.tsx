import { Smartphone, Laptop, Tablet, Watch, Headphones, Zap, ShieldCheck, Sparkles } from 'lucide-react';

export const LandingSection: React.FC = () => {
  return (
    <section className="mt-16 sm:mt-24 border-t border-slate-800/80 pt-12 text-slate-300">
      {/* How It Works */}
      <div className="max-w-4xl mx-auto text-center mb-16">
        <span className="text-emerald-400 text-xs font-bold tracking-widest uppercase">
          Simple Reseller Workflow
        </span>
        <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
          From Supplier Text to WhatsApp Broadcast in 4 Steps
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-8">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 text-left flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 font-bold text-sm flex items-center justify-center mb-3">
                1
              </div>
              <h4 className="font-bold text-white text-sm">Paste or Enter</h4>
              <p className="text-xs text-slate-400 mt-1">
                Paste raw supplier notes, voice note transcripts, or use the structured gadget form.
              </p>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 text-left flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 font-bold text-sm flex items-center justify-center mb-3">
                2
              </div>
              <h4 className="font-bold text-white text-sm">Pick Your Style</h4>
              <p className="text-xs text-slate-400 mt-1">
                Select from 7 tested formats including WA Sales, Minimal, Wholesale, and New Arrival.
              </p>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 text-left flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 font-bold text-sm flex items-center justify-center mb-3">
                3
              </div>
              <h4 className="font-bold text-white text-sm">Live Preview</h4>
              <p className="text-xs text-slate-400 mt-1">
                See exactly how your listing will appear inside customer WhatsApp chat bubbles.
              </p>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 text-left flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 font-bold text-sm flex items-center justify-center mb-3">
                4
              </div>
              <h4 className="font-bold text-white text-sm">1-Tap Copy & Share</h4>
              <p className="text-xs text-slate-400 mt-1">
                Tap Copy or Share to WhatsApp to broadcast immediately to customers and status updates.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Built For Resellers Categories */}
      <div className="max-w-4xl mx-auto mb-16">
        <div className="text-center mb-8">
          <span className="text-emerald-400 text-xs font-bold tracking-widest uppercase">
            Specialized Categories
          </span>
          <h3 className="text-xl font-bold text-white mt-1">Built Specifically For Gadget Dealers</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { icon: <Smartphone className="w-5 h-5 text-emerald-400" />, title: 'Phones', desc: 'BH%, SIM/eSIM, Factory Unlocked, Grade A' },
            { icon: <Laptop className="w-5 h-5 text-emerald-400" />, title: 'Laptops', desc: 'M-Series/Core i7, SSD, RAM, Touchscreen' },
            { icon: <Tablet className="w-5 h-5 text-emerald-400" />, title: 'Tablets', desc: 'Cellular/Wi-Fi, Pencil support, Battery health' },
            { icon: <Watch className="w-5 h-5 text-emerald-400" />, title: 'Watches', desc: 'GPS/LTE, 40-49mm Ultra, Condition' },
            { icon: <Headphones className="w-5 h-5 text-emerald-400" />, title: 'Accessories', desc: 'AirPods, Chargers, MagSafe & Cases' },
          ].map((c) => (
            <div
              key={c.title}
              className="bg-slate-900/50 border border-slate-800/70 rounded-2xl p-3.5 text-center flex flex-col items-center"
            >
              <div className="p-2.5 rounded-xl bg-slate-800/80 mb-2">{c.icon}</div>
              <div className="font-bold text-white text-xs">{c.title}</div>
              <div className="text-[11px] text-slate-400 mt-1 leading-snug">{c.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Trust / Utility Highlights */}
      <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 pb-12 text-center sm:text-left">
        <div className="flex items-start gap-3 p-3">
          <Zap className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-white text-xs">Instant Offline Engine</div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Works completely free and offline with zero API latency. Deep AI mode also available.
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-white text-xs">Nigerian Naira Ready</div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Natural parsing for ₦770k, ₦1.2m, and full comma groupings without errors.
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3">
          <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-white text-xs">Zero Formatting Loss</div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Clean Unicode bold, authentic WhatsApp bubble formatting, and custom CTAs.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
