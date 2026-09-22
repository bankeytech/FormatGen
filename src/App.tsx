import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { InputCard } from './components/InputCard';
import { WhatsAppPreview } from './components/WhatsAppPreview';
import { ActionBar } from './components/ActionBar';
import { TemplateSelector } from './components/TemplateSelector';
import { EditPostModal } from './components/EditPostModal';
import { SavedPostsDrawer } from './components/SavedPostsDrawer';
import { ApiKeyModal } from './components/ApiKeyModal';
import { MyStyleModal } from './components/MyStyleModal';
import { BulkGeneratorModal } from './components/BulkGeneratorModal';
import { LandingSection } from './components/LandingSection';
import type {
  ProductPost,
  TemplateStyle,
  SavedPostItem,
  ProductCategory,
  ResellerStylePreferences,
} from './types';
import {
  renderTemplate,
  TEMPLATE_STYLES,
  getStoredStylePreferences,
  setStoredStylePreferences,
} from './services/templates';
import { extractProduct, getStoredApiKey } from './services/extractor';
import { parseLocalFallback } from './services/fallbackParser';
import {
  rewriteMakeShorter,
  rewriteMakeSalesFocused,
  rewriteMakeCleaner,
} from './services/rewriter';
import type { SampleInput } from './data/sampleInputs';

const SAVED_POSTS_STORAGE_KEY = 'formatgen_saved_posts_v2';

const INITIAL_PROMPT = 'iPhone 15 Pro Max 256GB White eSIM unlocked 96% BH 9/10 clean ₦770k';

export const App: React.FC = () => {
  // Primary application state
  const [rawInput, setRawInput] = useState<string>(INITIAL_PROMPT);
  const [inputMode, setInputMode] = useState<'quick' | 'structured'>('quick');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('phone');
  const [parsedPost, setParsedPost] = useState<ProductPost | null>(null);
  const [activeStyle, setActiveStyle] = useState<TemplateStyle>('sales');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [extractionSource, setExtractionSource] = useState<'ai' | 'fallback' | null>(null);
  const [extractionProvider, setExtractionProvider] = useState<'gemini' | 'openrouter' | 'fallback' | undefined>(undefined);
  const [extractionError, setExtractionError] = useState<string | undefined>(undefined);

  // Style Preferences State
  const [stylePreferences, setStylePreferences] = useState<ResellerStylePreferences>(
    getStoredStylePreferences()
  );

  // Modals & Drawers
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState<boolean>(false);
  const [isMyStyleModalOpen, setIsMyStyleModalOpen] = useState<boolean>(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState<boolean>(false);

  // API Key state
  const [apiKey, setApiKey] = useState<string>('');

  // Saved Posts state
  const [savedPosts, setSavedPosts] = useState<SavedPostItem[]>([]);

  // Initialize on mount
  useEffect(() => {
    const key = getStoredApiKey();
    setApiKey(key);

    try {
      const storedSaved = localStorage.getItem(SAVED_POSTS_STORAGE_KEY) || localStorage.getItem('formatgen_saved_posts');
      if (storedSaved) {
        setSavedPosts(JSON.parse(storedSaved));
      }
    } catch (err) {
      console.error('Failed to load saved posts', err);
    }

    // Initialize with default reseller input parsed immediately
    const initialPost = parseLocalFallback(INITIAL_PROMPT);
    setParsedPost(initialPost);
    setExtractionSource('fallback');
    setSelectedCategory(initialPost.category);
  }, []);

  // Sync saved posts to localStorage
  const savePostsToStorage = (posts: SavedPostItem[]) => {
    setSavedPosts(posts);
    try {
      localStorage.setItem(SAVED_POSTS_STORAGE_KEY, JSON.stringify(posts));
    } catch (err) {
      console.error('Failed to write to localStorage', err);
    }
  };

  // Pure template rendering
  const renderedText = useMemo(() => {
    if (!parsedPost) return '';
    return renderTemplate(parsedPost, activeStyle, stylePreferences);
  }, [parsedPost, activeStyle, stylePreferences]);

  // Handle Generate Post button click
  const handleGenerate = async () => {
    if (!rawInput.trim() || isGenerating) return;

    setIsGenerating(true);
    setExtractionError(undefined);

    try {
      const result = await extractProduct(rawInput, apiKey);
      setParsedPost(result.post);
      setExtractionSource(result.source);
      setExtractionProvider(result.provider);
      setExtractionError(result.error);
      if (result.post.category) {
        setSelectedCategory(result.post.category);
      }
    } catch (err: any) {
      console.error('Extraction error', err);
      const fallbackPost = parseLocalFallback(rawInput);
      setParsedPost(fallbackPost);
      setExtractionSource('fallback');
      setExtractionProvider('fallback');
      setExtractionError(err?.message || 'Error parsing product data.');
      if (fallbackPost.category) {
        setSelectedCategory(fallbackPost.category);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle generation directly from structured form
  const handleGenerateFromForm = (post: ProductPost) => {
    setParsedPost(post);
    setExtractionSource('fallback');
    setExtractionError(undefined);
    setSelectedCategory(post.category);

    // Also populate rawInput so switching modes is intuitive
    const specsString = post.specs.join(' / ');
    const priceStr = post.priceOptions[0] ? `₦${post.priceOptions[0].amount.toLocaleString()}` : '';
    setRawInput(`${post.title} / ${specsString} / ${priceStr}`.trim());
  };

  // Cycle through available template formats
  const handleCycleFormat = () => {
    const currentIndex = TEMPLATE_STYLES.findIndex((s) => s.id === activeStyle);
    const nextIndex = (currentIndex + 1) % TEMPLATE_STYLES.length;
    setActiveStyle(TEMPLATE_STYLES[nextIndex].id);
  };

  // Sample quick-selection
  const handleSelectSample = (sample: SampleInput) => {
    setRawInput(sample.rawText);
    const post = parseLocalFallback(sample.rawText);
    setParsedPost(post);
    setExtractionSource('fallback');
    setExtractionError(undefined);
    setSelectedCategory(post.category);
  };

  // Handle category tab change
  const handleCategoryChange = (cat: ProductCategory) => {
    setSelectedCategory(cat);
    if (parsedPost) {
      setParsedPost({ ...parsedPost, category: cat });
    }
  };

  // Quick 1-click rewrites
  const handleRewrite = (action: 'shorter' | 'sales' | 'cleaner' | 'no_emojis') => {
    if (!parsedPost) return;

    if (action === 'shorter') {
      setParsedPost(rewriteMakeShorter(parsedPost));
    } else if (action === 'sales') {
      setParsedPost(rewriteMakeSalesFocused(parsedPost));
    } else if (action === 'cleaner') {
      setParsedPost(rewriteMakeCleaner(parsedPost));
    } else if (action === 'no_emojis') {
      const updatedPrefs: ResellerStylePreferences = {
        ...stylePreferences,
        emojiLevel: 'none',
      };
      setStylePreferences(updatedPrefs);
      setStoredStylePreferences(updatedPrefs);
    }
  };

  // Update parsed post from manual tweak modal
  const handleUpdateParsedPost = (updated: ProductPost) => {
    setParsedPost(updated);
    if (updated.category) {
      setSelectedCategory(updated.category);
    }
  };

  // Save / Update My Style preferences
  const handleSaveStylePreferences = (prefs: ResellerStylePreferences) => {
    setStylePreferences(prefs);
    setStoredStylePreferences(prefs);
  };

  // Toggle bookmark / save current post
  const isCurrentPostSaved = useMemo(() => {
    if (!parsedPost) return false;
    return savedPosts.some((item) => item.post.title === parsedPost.title && item.activeTemplate === activeStyle);
  }, [savedPosts, parsedPost, activeStyle]);

  const handleToggleSave = () => {
    if (!parsedPost || !renderedText) return;

    if (isCurrentPostSaved) {
      const filtered = savedPosts.filter(
        (item) => !(item.post.title === parsedPost.title && item.activeTemplate === activeStyle)
      );
      savePostsToStorage(filtered);
    } else {
      const newItem: SavedPostItem = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        post: parsedPost,
        renderedText,
        activeTemplate: activeStyle,
      };
      savePostsToStorage([newItem, ...savedPosts]);
    }
  };

  // Load a saved post from drawer
  const handleLoadSavedPost = (item: SavedPostItem) => {
    setParsedPost(item.post);
    setActiveStyle(item.activeTemplate);
    if (item.post.category) {
      setSelectedCategory(item.post.category);
    }
    if (item.post.title) {
      setRawInput(item.post.title + '\n' + item.post.specs.join('\n'));
    }
  };

  const handleDeleteSavedPost = (id: string) => {
    savePostsToStorage(savedPosts.filter((p) => p.id !== id));
  };

  const handleClearAllSavedPosts = () => {
    savePostsToStorage([]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Navigation */}
      <Navbar
        hasApiKey={Boolean(apiKey)}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        savedCount={savedPosts.length}
        onOpenSavedDrawer={() => setIsSavedDrawerOpen(true)}
        onOpenBulkModal={() => setIsBulkModalOpen(true)}
        onOpenMyStyle={() => setIsMyStyleModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Reseller Hero Header Banner */}
        <div className="mb-6 sm:mb-8 text-center sm:text-left flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-emerald-400 text-xs font-bold tracking-widest uppercase mb-1 block">
              Nigerian Reseller Sales Generator
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Turn Gadget Specs into Ready-to-Post WhatsApp Listings
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Paste messy supplier notes, voice note transcripts, or specs. Get a polished, high-converting WhatsApp broadcast post in one tap.
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              ⚡ 7 Tested Styles
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-400 border border-teal-500/20">
              🇳🇬 Naira Ready
            </span>
          </div>
        </div>

        {/* 2-Column Responsive Layout: Left: Input & Details, Right: WhatsApp Bubble Preview & Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left Column: Input Card (Mode A & B) */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <InputCard
              input={rawInput}
              setInput={setRawInput}
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
              extractionSource={extractionSource}
              extractionProvider={extractionProvider}
              extractionError={extractionError}
              hasApiKey={Boolean(apiKey)}
              onSelectSample={handleSelectSample}
              selectedCategory={selectedCategory}
              onSelectCategory={handleCategoryChange}
              onGenerateFromForm={handleGenerateFromForm}
              inputMode={inputMode}
              setInputMode={setInputMode}
            />

            {/* Quick Reseller Helper Tip */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 text-xs text-slate-400 space-y-1">
              <div className="font-semibold text-slate-300">💡 Reseller Pro-tips:</div>
              <ul className="list-disc list-inside space-y-0.5 text-slate-400 text-[11.5px]">
                <li>
                  Abbreviations like <code className="text-emerald-400">96% BH</code>, <code className="text-emerald-400">eSIM</code>, <code className="text-emerald-400">Clean 9/10</code>, and <code className="text-emerald-400">₦770k</code> are automatically recognized.
                </li>
                <li>
                  Need to post a batch? Click <strong>Bulk Mode</strong> in the navigation to format multiple products at once.
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: Style Selector, WhatsApp Preview Bubble & Action Controls */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            {/* Style Switcher Bar */}
            <TemplateSelector
              activeStyle={activeStyle}
              onSelectStyle={setActiveStyle}
            />

            {/* Simulated WhatsApp Bubble */}
            <WhatsAppPreview
              post={parsedPost}
              renderedText={renderedText}
              activeStyle={activeStyle}
            />

            {/* Dev / Parse Source Indicator */}
            <div className="flex items-center justify-between px-2 -mt-2 text-xs">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
                <span
                  className={`w-2 h-2 rounded-full ${
                    extractionSource === 'ai'
                      ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]'
                      : 'bg-teal-400'
                  }`}
                />
                <span>
                  {extractionSource === 'ai'
                    ? 'Parsed by AI Engine'
                    : 'Instant Offline Nigerian Reseller Engine'}
                </span>
              </span>
              {extractionSource === 'ai' && extractionProvider && (
                <span className="text-[10px] text-slate-500 font-mono">
                  ({extractionProvider === 'openrouter' ? 'OpenRouter' : 'Google Gemini'})
                </span>
              )}
            </div>

            {/* Action Bar: Prominent Copy Post, WhatsApp Share, Quick Rewrites, Tweak, Save */}
            <ActionBar
              renderedText={renderedText}
              post={parsedPost}
              activeStyle={activeStyle}
              onCycleFormat={handleCycleFormat}
              onOpenEditModal={() => setIsEditModalOpen(true)}
              onToggleSave={handleToggleSave}
              isSaved={isCurrentPostSaved}
              onRewrite={handleRewrite}
              onOpenMyStyle={() => setIsMyStyleModalOpen(true)}
            />
          </div>
        </div>

        {/* Landing Section (Unobtrusive & educational below generator) */}
        <LandingSection />
      </main>

      {/* Modals & Drawers */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onKeyUpdated={(k) => setApiKey(k)}
      />

      <EditPostModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        post={parsedPost}
        onSave={handleUpdateParsedPost}
      />

      <SavedPostsDrawer
        isOpen={isSavedDrawerOpen}
        onClose={() => setIsSavedDrawerOpen(false)}
        savedPosts={savedPosts}
        onLoadPost={handleLoadSavedPost}
        onDeletePost={handleDeleteSavedPost}
        onClearAll={handleClearAllSavedPosts}
      />

      <MyStyleModal
        isOpen={isMyStyleModalOpen}
        onClose={() => setIsMyStyleModalOpen(false)}
        preferences={stylePreferences}
        onSavePreferences={handleSaveStylePreferences}
      />

      <BulkGeneratorModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        activeStyle={activeStyle}
        preferences={stylePreferences}
      />
    </div>
  );
};

export default App;
