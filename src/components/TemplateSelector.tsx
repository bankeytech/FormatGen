import { TEMPLATE_STYLES } from '../services/templates';
import type { TemplateStyle } from '../types';
import { Layers } from 'lucide-react';

interface TemplateSelectorProps {
  activeStyle: TemplateStyle;
  onSelectStyle: (style: TemplateStyle) => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  activeStyle,
  onSelectStyle,
}) => {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
      <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 shrink-0 mr-1">
        <Layers className="w-3.5 h-3.5 text-emerald-400" />
        Styles:
      </span>
      {TEMPLATE_STYLES.map((style) => {
        const isActive = activeStyle === style.id;
        return (
          <button
            key={style.id}
            type="button"
            onClick={() => onSelectStyle(style.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
              isActive
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-900/30'
                : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700/80 border border-slate-700/50'
            }`}
          >
            {style.name}
          </button>
        );
      })}
    </div>
  );
};
