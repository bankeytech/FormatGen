import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { InputCard } from './components/InputCard';
import { WhatsAppPreview } from './components/WhatsAppPreview';
import { ActionBar } from './components/ActionBar';
import { TemplateSelector } from './components/TemplateSelector';
import { EditPostModal } from './components/EditPostModal';
import { SavedPostsDrawer } from './components/SavedPostsDrawer';
import { ApiKeyModal } from './components/ApiKeyModal';
import type { ProductPost, TemplateStyle, SavedPostItem } from './types';
import { renderTemplate } from './services/templates';
import { extractProduct, getStoredApiKey } from './services/extractor';
import { parseLocalFallback } from './services/fallbackParser';
import { SAMPLE_INPUTS } from './data/sampleInputs';
import type { SampleInput } from './data/sampleInputs';


const SAVED_POSTS_STORAGE_KEY = 'formatgen_saved_posts';

export const App: React.FC = () => {
  // Primary application state
  const [rawInput, setRawInput] = useState<string>(SAMPLE_INPUTS[0].rawText);
  const [parsedPost, setParsedPost] = useState<ProductPost | null>(null);
  const [activeStyle, setActiveStyle] = useState<TemplateStyle>('catchy');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [extractionSource, setExtractionSource] = useState<'ai' | 'fallback' | null>(null);
  const [extractionProvider, setExtractionProvider] = useState<'gemini' | 'openrouter' | 'fallback' | undefined>(undefined);
  const [extractionError, setExtractionError] = useState<string | undefined>(undefined);

  // Modals & Drawers
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState<boolean>(false);

  // API Key state
  const [apiKey, setApiKey] = useState<string>('');

  // Saved Posts state
  const [savedPosts, setSavedPosts] = useState<SavedPostItem[]>([]);

  // Initialize on mount
  useEffect(() => {
    const key = getStoredApiKey();
    setApiKey(key);

    try {
      const storedSaved = localStorage.getItem(SAVED_POSTS_STORAGE_KEY);
      if (storedSaved) {
        setSavedPosts(JSON.parse(storedSaved));
      }
    } catch (err) {
      console.error('Failed to load saved posts', err);
    }

    // Initialize with first sample parsed using local fallback
    const initialPost = parseLocalFallback(SAMPLE_INPUTS[0].rawText);
    setParsedPost(initialPost);
    setExtractionSource('fallback');
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
    return renderTemplate(parsedPost, activeStyle);
  }, [parsedPost, activeStyle]);

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
    } catch (err: any) {
      console.error('Extraction error', err);
      const fallbackPost = parseLocalFallback(rawInput);
      setParsedPost(fallbackPost);
      setExtractionSource('fallback');
      setExtractionProvider('fallback');
      setExtractionError(err?.message || 'Error parsing product data.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Cycle through available template formats: Catchy -> Classic -> Minimal -> back to Catchy
  const CYCLE_STYLES: TemplateStyle[] = ['catchy', 'classic', 'minimal'];
  const handleCycleFormat = () => {
    const currentIndex = CYCLE_STYLES.indexOf(activeStyle);
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % CYCLE_STYLES.length;
    setActiveStyle(CYCLE_STYLES[nextIndex]);
  };

  // Sample quick-selection
  const handleSelectSample = (sample: SampleInput) => {
    setRawInput(sample.rawText);
    // Parse immediately with fallback for instant UI response
    const post = parseLocalFallback(sample.rawText);
    setParsedPost(post);
    setExtractionSource('fallback');
    setExtractionError(undefined);
  };

  // Update parsed post from manual tweak modal
  const handleUpdateParsedPost = (updated: ProductPost) => {
    setParsedPost(updated);
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
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Intro Hero Banner */}
        <div className="mb-6 sm:mb-8 text-center sm:text-left flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-emerald-400 text-xs font-bold tracking-widest uppercase mb-1 block">
              Reseller Sales Engine
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              WhatsApp Sales Post Generator
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Turn messy supplier spec sheets, voice note transcripts, and rough reseller notes into high-converting, styled WhatsApp broadcast posts in one tap.
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              ⚡ 4 Pre-built Styles
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-400 border border-teal-500/20">
              📲 1-Tap WA Share
            </span>
          </div>
        </div>

        {/* 2-Column Responsive Layout: Input on Left, WhatsApp Preview & Actions on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left Column: Input Box & Sample Selectors */}
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
            />

            {/* Quick helper tip */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 text-xs text-slate-400 space-y-1">
              <div className="font-semibold text-slate-300">💡 Reseller Pro-tips:</div>
              <ul className="list-disc list-inside space-y-0.5 text-slate-400 text-[11.5px]">
                <li>Pasting raw notes with abbreviations like <code className="text-emerald-400">92% BH</code>, <code className="text-emerald-400">₦1.2m</code>, or <code className="text-emerald-400">Direct Tokunbo</code> are automatically parsed.</li>
                <li>Tap <strong>Next Format</strong> to rotate between Classic, Catchy, Minimal, and Story styles without calling AI again.</li>
              </ul>
            </div>
          </div>

          {/* Right Column: WhatsApp Bubble Preview & Action Controls */}
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

            {/* Dev-mode parse-source indicator */}
            <div className="flex items-center justify-between px-2 -mt-2 text-xs">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
                <span
                  className={`w-2 h-2 rounded-full ${
                    extractionSource === 'ai'
                      ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]'
                      : 'bg-amber-400'
                  }`}
                />
                <span>
                  {extractionSource === 'ai'
                    ? 'Parsed by AI'
                    : 'Parsed by fallback (AI unavailable)'}
                </span>
              </span>
              {extractionSource === 'ai' && extractionProvider && (
                <span className="text-[10px] text-slate-500 font-mono">
                  ({extractionProvider === 'openrouter' ? 'OpenRouter' : 'Google Gemini'})
                </span>
              )}
            </div>

            {/* Action Bar: Copy, WhatsApp Share, Cycle Format, Tweak */}
            <ActionBar
              renderedText={renderedText}
              post={parsedPost}
              activeStyle={activeStyle}
              onCycleFormat={handleCycleFormat}
              onOpenEditModal={() => setIsEditModalOpen(true)}
              onToggleSave={handleToggleSave}
              isSaved={isCurrentPostSaved}
            />
          </div>
        </div>
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
    </div>
  );
};

export default App;
