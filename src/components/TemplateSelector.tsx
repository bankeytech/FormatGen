import React from 'react';
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
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
      <span className="text-xs font-bold text-slate-300 flex items-center gap-1 shrink-0 mr-1">
        <Layers className="w-3.5 h-3.5 text-emerald-400" />
        Templates:
      </span>
      {TEMPLATE_STYLES.map((style) => {
        const isActive =
          activeStyle === style.id ||
          (activeStyle === 'classic' && style.id === 'standard') ||
          (activeStyle === 'catchy' && style.id === 'premium') ||
          (activeStyle === 'story' && style.id === 'sales');

        return (
          <button
            key={style.id}
            type="button"
            onClick={() => onSelectStyle(style.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              isActive
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950/40 ring-1 ring-emerald-300/40'
                : 'bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
            title={style.description}
          >
            <span>{style.name}</span>
            {style.badge && (
              <span
                className={`text-[9px] font-extrabold uppercase px-1 py-0.2 rounded ${
                  isActive
                    ? 'bg-slate-950/20 text-slate-950'
                    : 'bg-emerald-500/15 text-emerald-400'
                }`}
              >
                {style.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
