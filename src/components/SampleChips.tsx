import { SAMPLE_INPUTS } from '../data/sampleInputs';
import type { SampleInput } from '../data/sampleInputs';
import { Sparkles } from 'lucide-react';

interface SampleChipsProps {
  onSelectSample: (sample: SampleInput) => void;
  disabled?: boolean;
}

export const SampleChips: React.FC<SampleChipsProps> = ({ onSelectSample, disabled }) => {
  return (
    <div className="flex flex-wrap items-center gap-2 pt-1 pb-2">
      <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
        <Sparkles className="w-3 h-3 text-emerald-400" />
        Try sample:
      </span>
      {SAMPLE_INPUTS.map((sample) => (
        <button
          key={sample.id}
          type="button"
          disabled={disabled}
          onClick={() => onSelectSample(sample)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800/90 hover:bg-slate-700/90 text-slate-300 hover:text-white border border-slate-700/60 hover:border-emerald-500/50 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          <span>{sample.icon}</span>
          <span>{sample.label}</span>
        </button>
      ))}
    </div>
  );
};
