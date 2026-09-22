import React from 'react';
import type { ProductCategory } from '../types';
import { Smartphone, Laptop, Tablet, Watch, Headphones, Package } from 'lucide-react';

interface ProductTypeSelectorProps {
  selectedCategory: ProductCategory;
  onSelectCategory: (category: ProductCategory) => void;
}

export const PRODUCT_CATEGORIES: { id: ProductCategory; label: string; icon: React.ReactNode; badge?: string }[] = [
  { id: 'phone', label: 'Phones', icon: <Smartphone className="w-4 h-4" /> },
  { id: 'laptop', label: 'Laptops', icon: <Laptop className="w-4 h-4" /> },
  { id: 'tablet', label: 'Tablets', icon: <Tablet className="w-4 h-4" /> },
  { id: 'watch', label: 'Watches', icon: <Watch className="w-4 h-4" /> },
  { id: 'accessory', label: 'Accessories', icon: <Headphones className="w-4 h-4" /> },
  { id: 'generic', label: 'Other', icon: <Package className="w-4 h-4" /> },
];

export const ProductTypeSelector: React.FC<ProductTypeSelectorProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
      {PRODUCT_CATEGORIES.map((cat) => {
        const isSelected = selectedCategory === cat.id;
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelectCategory(cat.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              isSelected
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-900/30 ring-1 ring-emerald-400/40'
                : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <span className={isSelected ? 'text-slate-950' : 'text-emerald-400'}>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        );
      })}
    </div>
  );
};
