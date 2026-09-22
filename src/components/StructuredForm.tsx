import React, { useState } from 'react';
import type { ProductCategory, ProductPost, StructuredGadgetSpecs } from '../types';
import { normalizeNigerianPriceInput, formatPrice } from '../utils/price';
import { Sparkles } from 'lucide-react';

interface StructuredFormProps {
  category: ProductCategory;
  onGenerateFromForm: (post: ProductPost) => void;
  isGenerating?: boolean;
}

export const StructuredForm: React.FC<StructuredFormProps> = ({
  category,
  onGenerateFromForm,
  isGenerating = false,
}) => {
  // Common fields
  const [brand, setBrand] = useState('Apple');
  const [model, setModel] = useState('');
  const [storage, setStorage] = useState('256GB');
  const [ram, setRam] = useState('8GB RAM');
  const [priceInput, setPriceInput] = useState('');
  const [condition, setCondition] = useState('Clean 9/10');
  const [color, setColor] = useState('Natural Titanium');

  // Phone/Tablet specific
  const [batteryHealth, setBatteryHealth] = useState<string>('95');
  const [simConfig, setSimConfig] = useState('Physical + eSIM');
  const [lockStatus, setLockStatus] = useState('Factory Unlocked');
  const [region, setRegion] = useState('US / LL/A');

  // Laptop specific
  const [processor, setProcessor] = useState('M2 Chip');
  const [gpu, setGpu] = useState('');
  const [screenSize, setScreenSize] = useState('14"');

  // Watch specific
  const [watchSize, setWatchSize] = useState('45mm');
  const [connectivity, setConnectivity] = useState('GPS + Cellular');

  // Validation state
  const [errors, setErrors] = useState<{ bh?: string; price?: string; model?: string }>({});

  const normalizedPrice = normalizeNigerianPriceInput(priceInput);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { bh?: string; price?: string; model?: string } = {};

    if (!model.trim()) {
      newErrors.model = 'Please enter product model (e.g. iPhone 15 Pro Max or MacBook Air)';
    }

    if (batteryHealth) {
      const bhNum = parseInt(batteryHealth, 10);
      if (isNaN(bhNum) || bhNum < 0 || bhNum > 100) {
        newErrors.bh = 'Battery health must be between 0% and 100%';
      }
    }

    if (priceInput && !normalizedPrice) {
      newErrors.price = 'Please enter a valid price (e.g. 770k or ₦770,000)';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    // Compile Title
    const fullTitle = `${brand} ${model}`.trim();

    // Compile Specs list based on category
    const specs: string[] = [];

    if (category === 'phone') {
      if (storage) specs.push(storage);
      if (simConfig) specs.push(simConfig);
      if (batteryHealth) specs.push(`${batteryHealth}% Battery Health`);
      if (condition) specs.push(condition);
      if (color) specs.push(`Colour: ${color}`);
      if (lockStatus) specs.push(lockStatus);
      if (region) specs.push(region);
    } else if (category === 'laptop') {
      if (processor) specs.push(processor);
      if (ram) specs.push(ram);
      if (storage) specs.push(`${storage} SSD`);
      if (screenSize) specs.push(`${screenSize} Display`);
      if (gpu) specs.push(gpu);
      if (condition) specs.push(condition);
      if (color) specs.push(`Colour: ${color}`);
    } else if (category === 'tablet') {
      if (storage) specs.push(storage);
      if (simConfig) specs.push(simConfig);
      if (batteryHealth) specs.push(`${batteryHealth}% Battery Health`);
      if (condition) specs.push(condition);
      if (color) specs.push(`Colour: ${color}`);
    } else if (category === 'watch') {
      if (watchSize) specs.push(watchSize);
      if (connectivity) specs.push(connectivity);
      if (batteryHealth) specs.push(`${batteryHealth}% Battery Health`);
      if (condition) specs.push(condition);
      if (color) specs.push(`Colour: ${color}`);
    } else {
      if (condition) specs.push(condition);
      if (color) specs.push(`Colour: ${color}`);
    }

    const gadgetSpecs: StructuredGadgetSpecs = {
      brand,
      model,
      storage,
      ram,
      batteryHealth: batteryHealth ? parseInt(batteryHealth, 10) : null,
      simConfig,
      condition,
      color,
      lockStatus,
      processor,
      gpu,
      screenSize,
    };

    const post: ProductPost = {
      title: fullTitle,
      category,
      specs,
      priceOptions: normalizedPrice ? [{ label: null, amount: normalizedPrice }] : [],
      tagline: null,
      badges: condition ? [condition] : [],
      gadgetSpecs,
    };

    onGenerateFromForm(post);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
      {/* Brand & Model */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-4">
          <label className="block text-xs font-semibold text-slate-300 mb-1">Brand</label>
          <select
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 outline-none"
          >
            <option value="Apple">Apple</option>
            <option value="Samsung">Samsung</option>
            <option value="Google Pixel">Google Pixel</option>
            <option value="HP">HP</option>
            <option value="Dell">Dell</option>
            <option value="Lenovo">Lenovo</option>
            <option value="Asus">Asus</option>
            <option value="Xiaomi / Redmi">Xiaomi / Redmi</option>
            <option value="Tecno">Tecno</option>
            <option value="Infinix">Infinix</option>
            <option value="Sony">Sony</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="sm:col-span-8">
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Model Name <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder={
              category === 'phone'
                ? 'e.g. 15 Pro Max or S24 Ultra'
                : category === 'laptop'
                ? 'e.g. MacBook Pro M3 or EliteBook 840 G8'
                : category === 'watch'
                ? 'e.g. Series 9 or Ultra 2'
                : 'e.g. iPad Pro 11" M2'
            }
            className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2 text-sm text-white focus:ring-1 focus:ring-emerald-500/30 outline-none ${
              errors.model ? 'border-rose-500' : 'border-slate-800 focus:border-emerald-500'
            }`}
          />
          {errors.model && <p className="text-[11px] text-rose-400 mt-1">{errors.model}</p>}
        </div>
      </div>

      {/* Dynamic Fields for PHONES & TABLETS */}
      {(category === 'phone' || category === 'tablet') && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Storage */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Storage</label>
            <select
              value={storage}
              onChange={(e) => setStorage(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:border-emerald-500 outline-none"
            >
              <option value="64GB">64GB</option>
              <option value="128GB">128GB</option>
              <option value="256GB">256GB</option>
              <option value="512GB">512GB</option>
              <option value="1TB">1TB</option>
            </select>
          </div>

          {/* Battery Health */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Battery Health (BH)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="100"
                value={batteryHealth}
                onChange={(e) => setBatteryHealth(e.target.value)}
                placeholder="100"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white pr-7 focus:border-emerald-500 outline-none"
              />
              <span className="absolute right-2.5 top-2 text-xs text-slate-400 pointer-events-none">%</span>
            </div>
            {errors.bh && <p className="text-[10px] text-rose-400 mt-0.5">{errors.bh}</p>}
          </div>

          {/* SIM Configuration */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">SIM Setup</label>
            <select
              value={simConfig}
              onChange={(e) => setSimConfig(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:border-emerald-500 outline-none"
            >
              <option value="Physical + eSIM">Physical + eSIM</option>
              <option value="eSIM">eSIM (No Tray)</option>
              <option value="Dual eSIM">Dual eSIM</option>
              <option value="Physical SIM">Physical SIM</option>
              <option value="Dual Physical SIM">Dual Physical SIM</option>
            </select>
          </div>

          {/* Lock Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Lock Status</label>
            <select
              value={lockStatus}
              onChange={(e) => setLockStatus(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:border-emerald-500 outline-none"
            >
              <option value="Factory Unlocked">Factory Unlocked</option>
              <option value="Chip Unlocked">Chip Unlocked</option>
              <option value="Carrier Locked">Carrier Locked</option>
            </select>
          </div>

          {/* Region / Spec */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Region</label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:border-emerald-500 outline-none"
            >
              <option value="US / LL/A">US (LL/A)</option>
              <option value="UK / B/A">UK (B/A)</option>
              <option value="Japan / J/A">Japan (J/A)</option>
              <option value="Nigeria / ZA/A">Nigeria (ZA/A)</option>
              <option value="Canada / VC/A">Canada (VC/A)</option>
            </select>
          </div>
        </div>
      )}

      {/* Dynamic Fields for LAPTOPS */}
      {category === 'laptop' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Processor</label>
            <input
              type="text"
              value={processor}
              onChange={(e) => setProcessor(e.target.value)}
              placeholder="e.g. M2 Chip / Core i7 11th Gen"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:border-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">RAM</label>
            <select
              value={ram}
              onChange={(e) => setRam(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:border-emerald-500 outline-none"
            >
              <option value="8GB RAM">8GB RAM</option>
              <option value="16GB RAM">16GB RAM</option>
              <option value="24GB RAM">24GB RAM</option>
              <option value="32GB RAM">32GB RAM</option>
              <option value="64GB RAM">64GB RAM</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Storage</label>
            <select
              value={storage}
              onChange={(e) => setStorage(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:border-emerald-500 outline-none"
            >
              <option value="256GB">256GB SSD</option>
              <option value="512GB">512GB SSD</option>
              <option value="1TB">1TB SSD</option>
              <option value="2TB">2TB SSD</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Screen Size</label>
            <input
              type="text"
              value={screenSize}
              onChange={(e) => setScreenSize(e.target.value)}
              placeholder='e.g. 13.3", 14", 16"'
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:border-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">GPU (Optional)</label>
            <input
              type="text"
              value={gpu}
              onChange={(e) => setGpu(e.target.value)}
              placeholder="e.g. Intel Iris / RTX 3060"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:border-emerald-500 outline-none"
            />
          </div>
        </div>
      )}

      {/* Dynamic Fields for WATCHES */}
      {category === 'watch' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Size</label>
            <select
              value={watchSize}
              onChange={(e) => setWatchSize(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:border-emerald-500 outline-none"
            >
              <option value="40mm">40mm</option>
              <option value="41mm">41mm</option>
              <option value="44mm">44mm</option>
              <option value="45mm">45mm</option>
              <option value="49mm Ultra">49mm (Ultra)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Connectivity</label>
            <select
              value={connectivity}
              onChange={(e) => setConnectivity(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:border-emerald-500 outline-none"
            >
              <option value="GPS Only">GPS Only</option>
              <option value="GPS + Cellular">GPS + Cellular</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Battery Health</label>
            <input
              type="number"
              min="0"
              max="100"
              value={batteryHealth}
              onChange={(e) => setBatteryHealth(e.target.value)}
              placeholder="100%"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:border-emerald-500 outline-none"
            />
          </div>
        </div>
      )}

      {/* Condition & Colour */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Condition / Grade</label>
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none"
          >
            <option value="Clean 9/10">Clean 9/10 (Pristine)</option>
            <option value="Sealed & Active">Sealed & Active</option>
            <option value="Brand New Non-Active">Brand New Non-Active</option>
            <option value="Open Box">Open Box</option>
            <option value="UK Used Grade A">UK Used (Grade A)</option>
            <option value="Direct Intact 🇺🇸">Direct Intact 🇺🇸</option>
            <option value="Direct Tokunbo">Direct Tokunbo</option>
            <option value="London Used">London Used</option>
            <option value="Brand New">Brand New</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Colour</label>
          <input
            type="text"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            placeholder="e.g. Natural Titanium, Space Black, Silver"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none"
          />
        </div>
      </div>

      {/* Price Input with Nigerian Shorthand helper */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-semibold text-slate-300">Price (₦)</label>
          {normalizedPrice ? (
            <span className="text-xs text-emerald-400 font-mono font-semibold">
              Preview: {formatPrice(normalizedPrice, 'full')} ({formatPrice(normalizedPrice, 'abbreviated')})
            </span>
          ) : (
            <span className="text-[11px] text-slate-500">e.g. 770k, 1.2m, or 770,000</span>
          )}
        </div>
        <div className="relative">
          <span className="absolute left-3.5 top-2.5 text-sm text-emerald-400 font-bold">₦</span>
          <input
            type="text"
            value={priceInput}
            onChange={(e) => setPriceInput(e.target.value)}
            placeholder="770k or 1.2m or 770000"
            className={`w-full bg-slate-950 border rounded-xl pl-8 pr-3 py-2 text-sm text-white font-mono focus:ring-1 focus:ring-emerald-500/30 outline-none ${
              errors.price ? 'border-rose-500' : 'border-slate-800 focus:border-emerald-500'
            }`}
          />
        </div>
        {errors.price && <p className="text-[11px] text-rose-400 mt-1">{errors.price}</p>}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isGenerating}
        className="w-full py-2.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 disabled:opacity-50"
      >
        <Sparkles className="w-4 h-4" />
        <span>Generate WhatsApp Post</span>
      </button>
    </form>
  );
};
