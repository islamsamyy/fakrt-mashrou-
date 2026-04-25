'use client';

import React, { useState } from 'react';

interface FilterOption {
  id: string;
  label: string;
  value: string | number;
}

interface DashboardFilter {
  id: string;
  label: string;
  type: 'checkbox' | 'select' | 'range' | 'date';
  options?: FilterOption[];
  value?: string | string[] | number;
  min?: number;
  max?: number;
}

interface DashboardFiltersProps {
  filters: DashboardFilter[];
  onFilterChange: (filters: Record<string, any>) => void;
  preset?: 'all' | 'active' | 'completed';
}

export function DashboardFilters({ filters, onFilterChange, preset = 'all' }: DashboardFiltersProps) {
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [isOpen, setIsOpen] = useState(false);
  const activeCount = Object.keys(activeFilters).filter(key => activeFilters[key]).length;

  const handleFilterChange = (filterId: string, value: any) => {
    const updated = { ...activeFilters, [filterId]: value };
    setActiveFilters(updated);
    onFilterChange(updated);
  };

  const clearFilters = () => {
    setActiveFilters({});
    onFilterChange({});
  };

  return (
    <div className="space-y-4">
      {/* Filter Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-6 py-3 bg-primary-container/10 border border-primary-container/30 rounded-lg text-primary-container font-headline font-bold uppercase tracking-widest text-sm hover:bg-primary-container/20 transition-all"
        >
          <span className="material-symbols-outlined">tune</span>
          الفلاتر
          {activeCount > 0 && <span className="ml-2 bg-primary-container text-background px-2 py-0.5 rounded-full text-xs font-black">{activeCount}</span>}
        </button>

        {activeCount > 0 && (
          <button
            onClick={clearFilters}
            className="text-sm text-foreground/70 hover:text-primary-container underline underline-offset-2 transition-colors"
          >
            مسح الكل
          </button>
        )}
      </div>

      {/* Filters Panel */}
      {isOpen && (
        <div className="bg-gradient-to-br from-surface-container-low/60 to-surface-container-low/30 backdrop-blur-md p-6 border border-outline-variant/20 rounded-2xl space-y-6 animate-in fade-in slide-in-from-top-2">
          {filters.map((filter) => (
            <div key={filter.id} className="space-y-2">
              <label className="text-base font-headline text-foreground/80 uppercase tracking-widest font-bold">
                {filter.label}
              </label>

              {filter.type === 'checkbox' && filter.options && (
                <div className="space-y-2">
                  {filter.options.map((option) => (
                    <label key={option.id} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={activeFilters[filter.id]?.includes(option.value) || false}
                        onChange={(e) => {
                          const current = activeFilters[filter.id] || [];
                          const updated = e.target.checked
                            ? [...current, option.value]
                            : current.filter((v: any) => v !== option.value);
                          handleFilterChange(filter.id, updated.length > 0 ? updated : null);
                        }}
                        className="w-4 h-4 rounded border border-primary-container/30 checked:bg-primary-container checked:border-primary-container cursor-pointer"
                      />
                      <span className="text-sm text-foreground/70 group-hover:text-foreground transition-colors">{option.label}</span>
                    </label>
                  ))}
                </div>
              )}

              {filter.type === 'select' && filter.options && (
                <select
                  value={activeFilters[filter.id] || ''}
                  onChange={(e) => handleFilterChange(filter.id, e.target.value || null)}
                  className="w-full px-4 py-2 bg-background border border-outline-variant/20 rounded-lg text-foreground font-body text-sm focus:border-primary-container outline-none transition-colors"
                >
                  <option value="">اختر...</option>
                  {filter.options.map((option) => (
                    <option key={option.id} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}

              {filter.type === 'range' && (
                <div className="space-y-3">
                  <input
                    type="range"
                    min={filter.min || 0}
                    max={filter.max || 100}
                    value={activeFilters[filter.id] || filter.min || 0}
                    onChange={(e) => handleFilterChange(filter.id, Number(e.target.value))}
                    className="w-full h-2 bg-foreground/10 rounded-lg appearance-none cursor-pointer accent-primary-container"
                  />
                  <div className="flex justify-between text-xs text-foreground/70">
                    <span>{filter.min || 0}</span>
                    <span className="text-primary-container font-black">{activeFilters[filter.id] || filter.min || 0}</span>
                    <span>{filter.max || 100}</span>
                  </div>
                </div>
              )}

              {filter.type === 'date' && (
                <input
                  type="date"
                  value={activeFilters[filter.id] || ''}
                  onChange={(e) => handleFilterChange(filter.id, e.target.value || null)}
                  className="w-full px-4 py-2 bg-background border border-outline-variant/20 rounded-lg text-foreground font-body text-sm focus:border-primary-container outline-none transition-colors"
                />
              )}
            </div>
          ))}

          {/* Apply Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="w-full bg-primary-container text-background py-3 rounded-lg font-headline font-black uppercase tracking-tighter hover:brightness-110 transition-all"
          >
            تطبيق الفلاتر
          </button>
        </div>
      )}

      {/* Active Filters Display */}
      {activeCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => {
            if (!activeFilters[filter.id]) return null;

            const value = activeFilters[filter.id];
            const displayValue = Array.isArray(value)
              ? value.map(v => filter.options?.find(o => o.value === v)?.label || v).join(', ')
              : filter.options?.find(o => o.value === value)?.label || value;

            return (
              <div key={filter.id} className="flex items-center gap-2 px-4 py-2 bg-primary-container/15 border border-primary-container/30 rounded-lg text-primary-container text-sm font-body">
                <span>{displayValue}</span>
                <button
                  onClick={() => handleFilterChange(filter.id, null)}
                  className="ml-2 hover:text-primary-container/60 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
