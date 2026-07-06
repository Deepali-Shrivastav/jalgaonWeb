"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  addToSearchHistory,
  getSearchHistory,
  removeFromSearchHistory,
  clearSearchHistory,
} from '@/lib/searchHistory';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '';
const DEBOUNCE_MS = 150;

interface AutocompleteResult {
  businesses: Array<{
    business_name: string;
    slug: string;
    main_category__main_category: string;
  }>;
  categories: Array<{
    main_category: string;
    slug: string;
  }>;
}

interface SearchBarProps {
  placeholder?: string;
  defaultValue?: string;
  onSearch?: (query: string) => void; // override for in-page search
  compact?: boolean; // true for header, false for hero
  flat?: boolean; // true to remove border/shadow/bg when nested
}

export default function SearchBar({
  placeholder = 'Search businesses, services, shops…',
  defaultValue = '',
  onSearch,
  compact = false,
  flat = false,
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<AutocompleteResult | null>(null);
  const [popularSearches, setPopularSearches] = useState<string[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load popular searches once on mount
  useEffect(() => {
    fetch(`${API_BASE}/api/v1/search/popular/?limit=8`)
      .then((r) => r.json())
      .then((data) => setPopularSearches(data.popular ?? []))
      .catch(() => {});
  }, []);

  // Load search history on focus
  useEffect(() => {
    if (isFocused) {
      setHistory(getSearchHistory());
    }
  }, [isFocused]);

  // Debounced autocomplete
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query || query.trim().length < 2) {
      setSuggestions(null);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoadingSuggestions(true);
      try {
        const res = await fetch(
          `${API_BASE}/api/v1/search/autocomplete/?q=${encodeURIComponent(query)}&limit=6`
        );
        const data: AutocompleteResult = await res.json();
        setSuggestions(data);
      } catch {
        setSuggestions(null);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const executeSearch = useCallback(
    (q: string) => {
      const trimmed = q.trim();
      if (!trimmed) return;
      addToSearchHistory(trimmed);
      setIsFocused(false);
      setQuery(trimmed);
      if (onSearch) {
        onSearch(trimmed);
      } else {
        router.push(`/search?q=${encodeURIComponent(trimmed)}`);
      }
    },
    [onSearch, router]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allSuggestions: string[] = [
      ...(suggestions?.businesses.map((b) => b.business_name) ?? []),
      ...(suggestions?.categories.map((c) => c.main_category) ?? []),
    ];

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((i) => Math.min(i + 1, allSuggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && allSuggestions[highlightedIndex]) {
        executeSearch(allSuggestions[highlightedIndex]);
      } else {
        executeSearch(query);
      }
    } else if (e.key === 'Escape') {
      setIsFocused(false);
      inputRef.current?.blur();
    }
  };

  const showDropdown =
    isFocused &&
    (suggestions !== null ||
      (!query && (history.length > 0 || popularSearches.length > 0)));

  return (
    <div ref={containerRef} className={`relative w-full ${compact ? '' : 'max-w-2xl mx-auto'}`}>
      {/* Search Input */}
      <div
        className={`flex items-center gap-2 transition-all ${
          flat
            ? 'bg-transparent border-none shadow-none w-full px-2'
            : `bg-white border rounded-full px-4 shadow-sm ${
                isFocused ? 'border-primary ring-2 ring-primary/20' : 'border-outline-variant'
              }`
        } ${compact ? 'h-10 text-sm' : 'h-12 text-base'}`}
      >
        <span className="material-symbols-outlined text-slate-400 text-xl shrink-0">search</span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setHighlightedIndex(-1); }}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 bg-transparent border-none outline-none font-medium text-on-surface placeholder:text-outline"
          aria-label="Search"
          aria-autocomplete="list"
          aria-haspopup="listbox"
          autoComplete="off"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setSuggestions(null); inputRef.current?.focus(); }}
            className="p-1 rounded-full hover:bg-slate-100 transition-colors shrink-0"
            aria-label="Clear search"
          >
            <span className="material-symbols-outlined text-slate-400 text-lg">close</span>
          </button>
        )}
        {!compact && (
          <button
            onClick={() => executeSearch(query)}
            className="bg-primary text-white rounded-full font-bold shrink-0 hover:bg-primary-deep transition-colors px-5 py-2 text-sm"
          >
            Search
          </button>
        )}
      </div>

      {/* Dropdown Panel */}
      {showDropdown && (
        <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white border border-outline-variant rounded-2xl shadow-2xl z-50 py-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          
          {/* Autocomplete suggestions when typing */}
          {query.length >= 2 && (
            <>
              {isLoadingSuggestions ? (
                <div className="px-4 py-3 text-sm text-secondary">Loading…</div>
              ) : (
                <>
                  {/* Business suggestions */}
                  {suggestions && suggestions.businesses.length > 0 && (
                    <div>
                      <div className="px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Businesses
                      </div>
                      {suggestions.businesses.map((b, i) => (
                        <button
                          key={b.slug}
                          onClick={() => executeSearch(b.business_name)}
                          className={`w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-primary/5 transition-colors text-sm ${
                            highlightedIndex === i ? 'bg-primary/5' : ''
                          }`}
                        >
                          <span className="material-symbols-outlined text-slate-400 text-base shrink-0">
                            storefront
                          </span>
                          <div>
                            <div className="font-semibold text-ink-deep text-left">{b.business_name}</div>
                            <div className="text-xs text-secondary text-left">{b.main_category__main_category}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Category suggestions */}
                  {suggestions && suggestions.categories.length > 0 && (
                    <div>
                      <div className="px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-t border-hairline-soft mt-1">
                        Categories
                      </div>
                      {suggestions.categories.map((c, i) => {
                        const idx = (suggestions?.businesses.length ?? 0) + i;
                        return (
                          <button
                            key={c.slug}
                            onClick={() => executeSearch(c.main_category)}
                            className={`w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-primary/5 transition-colors text-sm ${
                              highlightedIndex === idx ? 'bg-primary/5' : ''
                            }`}
                          >
                            <span className="material-symbols-outlined text-slate-400 text-base shrink-0">
                              category
                            </span>
                            <span className="font-semibold text-ink-deep">{c.main_category}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* No suggestions fallback */}
                  {suggestions &&
                    suggestions.businesses.length === 0 &&
                    suggestions.categories.length === 0 && (
                      <div className="px-4 py-3 text-sm text-secondary">
                        No suggestions for &quot;{query}&quot;
                      </div>
                    )}
                </>
              )}
            </>
          )}

          {/* Empty state: show history + popular */}
          {!query && (
            <>
              {history.length > 0 && (
                <div>
                  <div className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex justify-between">
                    <span>Recent Searches</span>
                    <button
                      className="text-primary hover:underline normal-case font-bold"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearSearchHistory();
                        setHistory([]);
                      }}
                    >
                      Clear
                    </button>
                  </div>
                  {history.slice(0, 10).map((h) => (
                    <button
                      key={h}
                      onClick={() => executeSearch(h)}
                      className="w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-primary/5 transition-colors text-sm group"
                    >
                      <span className="material-symbols-outlined text-slate-400 text-base shrink-0">history</span>
                      <span className="flex-1 font-medium text-ink-deep">{h}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromSearchHistory(h);
                          setHistory((prev) => prev.filter((x) => x !== h));
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-100 rounded-full transition-all"
                        aria-label="Remove from history"
                      >
                        <span className="material-symbols-outlined text-xs text-slate-400">close</span>
                      </button>
                    </button>
                  ))}
                </div>
              )}

              {popularSearches.length > 0 && (
                <div className={history.length > 0 ? 'border-t border-hairline-soft mt-1 pt-1' : ''}>
                  <div className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Popular in Jalgaon
                  </div>
                  <div className="flex flex-wrap gap-2 px-4 pb-3 pt-1">
                    {popularSearches.map((p) => (
                      <button
                        key={p}
                        onClick={() => executeSearch(p)}
                        className="bg-surface-container-low hover:bg-primary/10 text-ink-deep hover:text-primary text-xs font-semibold px-3 py-1.5 rounded-full transition-colors cursor-pointer"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
