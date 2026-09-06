import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Check, Sparkles } from 'lucide-react';
import type { ProductPost, ProductCategory, PriceOption } from '../types';

interface EditPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: ProductPost | null;
  onSave: (updatedPost: ProductPost) => void;
}

export const EditPostModal: React.FC<EditPostModalProps> = ({
  isOpen,
  onClose,
  post,
  onSave,
}) => {
  const [formData, setFormData] = useState<ProductPost | null>(null);

  useEffect(() => {
    if (post) {
      setFormData(JSON.parse(JSON.stringify(post)));
    }
  }, [post, isOpen]);

  if (!isOpen || !formData) return null;

  const handleTitleChange = (title: string) => {
    setFormData((prev) => (prev ? { ...prev, title } : null));
  };

  const handleCategoryChange = (category: ProductCategory) => {
    setFormData((prev) => (prev ? { ...prev, category } : null));
  };

  const handleSpecChange = (index: number, val: string) => {
    setFormData((prev) => {
      if (!prev) return null;
      const specs = [...prev.specs];
      specs[index] = val;
      return { ...prev, specs };
    });
  };

  const handleAddSpec = () => {
    setFormData((prev) => (prev ? { ...prev, specs: [...prev.specs, ''] } : null));
  };

  const handleRemoveSpec = (index: number) => {
    setFormData((prev) => {
      if (!prev) return null;
      return { ...prev, specs: prev.specs.filter((_, i) => i !== index) };
    });
  };

  const handlePriceChange = (index: number, field: keyof PriceOption, val: any) => {
    setFormData((prev) => {
      if (!prev) return null;
      const priceOptions = [...prev.priceOptions];
      priceOptions[index] = {
        ...priceOptions[index],
        [field]: field === 'amount' ? (Number(val) || 0) : val,
      };
      return { ...prev, priceOptions };
    });
  };

  const handleAddPrice = () => {
    setFormData((prev) =>
      prev
        ? {
            ...prev,
            priceOptions: [...prev.priceOptions, { label: 'Option', amount: 0 }],
          }
        : null
    );
  };

  const handleRemovePrice = (index: number) => {
    setFormData((prev) => {
      if (!prev) return null;
      return { ...prev, priceOptions: prev.priceOptions.filter((_, i) => i !== index) };
    });
  };

  const handleTaglineChange = (tagline: string) => {
    setFormData((prev) => (prev ? { ...prev, tagline: tagline || null } : null));
  };

  const handleBadgesChange = (val: string) => {
    const badges = val
      .split(',')
      .map((b) => b.trim())
      .filter(Boolean);
    setFormData((prev) => (prev ? { ...prev, badges } : null));
  };

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) {
      onSave(formData);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">Tweak Parsed Post Fields</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleApply} className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Product Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleCategoryChange(e.target.value as ProductCategory)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none capitalize"
            >
              <option value="phone">📱 Phone</option>
              <option value="laptop">💻 Laptop</option>
              <option value="appliance">⚡ Appliance</option>
              <option value="vehicle">🚗 Vehicle</option>
              <option value="generic">🛍️ Generic</option>
            </select>
          </div>

          {/* Price Options */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Price Options (₦)
              </label>
              <button
                type="button"
                onClick={handleAddPrice}
                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Price Option</span>
              </button>
            </div>

            <div className="space-y-2">
              {formData.priceOptions.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Variant label (optional)"
                    value={opt.label || ''}
                    onChange={(e) => handlePriceChange(i, 'label', e.target.value || null)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:border-emerald-500 outline-none"
                  />
                  <div className="relative w-36">
                    <span className="absolute left-2.5 top-1.5 text-xs text-slate-400">₦</span>
                    <input
                      type="number"
                      placeholder="Amount"
                      value={opt.amount || ''}
                      onChange={(e) => handlePriceChange(i, 'amount', e.target.value)}
                      className="w-full pl-6 pr-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:border-emerald-500 outline-none font-mono"
                    />
                  </div>
                  {formData.priceOptions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemovePrice(i)}
                      className="text-slate-500 hover:text-rose-400 p-1.5 rounded hover:bg-slate-800"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Specs */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Specifications / Features
              </label>
              <button
                type="button"
                onClick={handleAddSpec}
                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Spec</span>
              </button>
            </div>

            <div className="space-y-1.5">
              {formData.specs.map((spec, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 select-none">•</span>
                  <input
                    type="text"
                    value={spec}
                    onChange={(e) => handleSpecChange(i, e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:border-emerald-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveSpec(i)}
                    className="text-slate-500 hover:text-rose-400 p-1.5 rounded hover:bg-slate-800"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Badges */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Badges (comma-separated, e.g. Direct Tokunbo, US Import, Clean Condition)
            </label>
            <input
              type="text"
              value={formData.badges.join(', ')}
              onChange={(e) => handleBadgesChange(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none"
            />
          </div>

          {/* Tagline */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Tagline / Closing Hook (optional)
            </label>
            <input
              type="text"
              value={formData.tagline || ''}
              onChange={(e) => handleTaglineChange(e.target.value)}
              placeholder="e.g. We're in the era of prepaid, switch to smart cooking today!"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none"
            />
          </div>
        </form>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-4 py-2 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Update Post</span>
          </button>
        </div>
      </div>
    </div>
  );
};
