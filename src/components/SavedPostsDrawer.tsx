import React from 'react';
import { X, Copy, Trash2, ExternalLink, BookmarkCheck } from 'lucide-react';
import type { SavedPostItem } from '../types';

interface SavedPostsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedPosts: SavedPostItem[];
  onLoadPost: (item: SavedPostItem) => void;
  onDeletePost: (id: string) => void;
  onClearAll: () => void;
}

export const SavedPostsDrawer: React.FC<SavedPostsDrawerProps> = ({
  isOpen,
  onClose,
  savedPosts,
  onLoadPost,
  onDeletePost,
  onClearAll,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookmarkCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">Saved Posts History</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
              {savedPosts.length}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {savedPosts.length === 0 ? (
            <div className="text-center py-16 px-4 text-slate-500">
              <BookmarkCheck className="w-10 h-10 mx-auto mb-3 opacity-30 text-emerald-400" />
              <p className="text-sm font-semibold text-slate-400">No saved posts yet</p>
              <p className="text-xs mt-1 text-slate-500">
                Click the "Save" bookmark button on any generated sales post to keep it here for quick re-use.
              </p>
            </div>
          ) : (
            savedPosts.map((item) => (
              <div
                key={item.id}
                className="bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-xl p-3.5 space-y-2 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-bold text-white line-clamp-1">
                      {item.post.title}
                    </h3>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span className="capitalize text-emerald-400">{item.post.category}</span>
                      <span>•</span>
                      <span>{item.activeTemplate} style</span>
                      <span>•</span>
                      <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDeletePost(item.id)}
                    className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors"
                    title="Delete item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-[12px] text-slate-300 font-mono bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60 line-clamp-3 whitespace-pre-wrap">
                  {item.renderedText}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(item.renderedText);
                    }}
                    className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1 font-medium transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy Text</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onLoadPost(item);
                      onClose();
                    }}
                    className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold transition-colors"
                  >
                    <span>Load Post</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer */}
        {savedPosts.length > 0 && (
          <div className="p-4 border-t border-slate-800 flex justify-end">
            <button
              type="button"
              onClick={onClearAll}
              className="text-xs text-rose-400 hover:text-rose-300 font-medium transition-colors"
            >
              Clear All Saved Posts
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
