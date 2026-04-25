'use client';

import React, { useState, useMemo } from 'react';

interface Opportunity {
  id: string;
  title: string;
  category: string;
  status: string;
  date: string;
  round?: string;
  fullname: string;
}

interface FilteredOpportunitiesProps {
  opportunities: Opportunity[];
  onEmpty?: () => React.ReactNode;
}

export function FilteredOpportunities({ opportunities, onEmpty }: FilteredOpportunitiesProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'alphabetical'>('recent');

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(['all']);
    opportunities.forEach(opp => {
      if (opp.category) cats.add(opp.category);
    });
    return Array.from(cats);
  }, [opportunities]);

  // Filter and sort opportunities
  const filteredOpportunities = useMemo(() => {
    let filtered = opportunities;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(opp => opp.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(opp =>
        opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opp.fullname.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    if (sortBy === 'alphabetical') {
      filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title));
    }

    return filtered;
  }, [opportunities, selectedCategory, searchTerm, sortBy]);

  return (
    <div className="w-full space-y-6">
      {/* Filters */}
      <div className="bg-surface-container-low/40 p-4 rounded-lg space-y-4">
        {/* Search */}
        <div>
          <label className="text-base font-headline font-bold text-foreground/80 uppercase tracking-wider">
            بحث
          </label>
          <input
            type="text"
            placeholder="ابحث عن فرصة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full mt-2 px-4 py-2 bg-surface-container-lowest border border-foreground/10 rounded-lg text-foreground placeholder-foreground/50 focus:border-primary-container focus:outline-none"
          />
        </div>

        {/* Category Filter */}
        <div>
          <label className="text-base font-headline font-bold text-foreground/80 uppercase tracking-wider">
            التصنيف
          </label>
          <div className="flex flex-wrap gap-2 mt-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all ${
                  selectedCategory === cat
                    ? 'bg-primary-container text-background'
                    : 'bg-surface-container-highest text-foreground/70 hover:bg-foreground/10'
                }`}
              >
                {cat === 'all' ? 'الكل' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Sort */}
        <div>
          <label className="text-base font-headline font-bold text-foreground/80 uppercase tracking-wider">
            ترتيب
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'recent' | 'alphabetical')}
            className="w-full mt-2 px-4 py-2 bg-surface-container-lowest border border-foreground/10 rounded-lg text-foreground focus:border-primary-container focus:outline-none"
          >
            <option value="recent">الأحدث أولاً</option>
            <option value="alphabetical">ترتيب أبجدي</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-base text-foreground/80">
        {filteredOpportunities.length > 0 ? (
          <span>
            عرض <span className="text-primary-container font-bold">{filteredOpportunities.length}</span> من{' '}
            <span className="font-bold">{opportunities.length}</span> فرصة
          </span>
        ) : (
          <span>لم يتم العثور على فرص مطابقة</span>
        )}
      </div>

      {/* Opportunities List */}
      {filteredOpportunities.length > 0 ? (
        <div className="space-y-4">
          {filteredOpportunities.map((opp) => (
            <div
              key={opp.id}
              className="bg-surface-container-low hover:bg-surface-container-high transition-all p-4 flex flex-col md:flex-row items-center gap-6 group relative border border-foreground/10"
            >
              <div className="w-12 h-12 bg-surface-container-high flex items-center justify-center font-data text-primary-container border border-primary-container/20 shrink-0">
                {opp.id.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 text-center md:text-right">
                <h4 className="font-bold text-foreground font-headline">{opp.title}</h4>
                <div className="flex items-center justify-center md:justify-start gap-4 mt-1">
                  <span className="text-sm text-foreground/80 font-data">التاريخ: {opp.date}</span>
                  <span className="text-sm text-foreground/80 font-data">التصنيف: {opp.category}</span>
                </div>
              </div>
              <div className="px-3 py-1 bg-primary-container/10 text-primary-container text-[10px] font-bold uppercase tracking-widest border border-primary-container/20">
                {opp.status}
              </div>
            </div>
          ))}
        </div>
      ) : onEmpty ? (
        onEmpty()
      ) : (
        <div className="text-center py-8 text-foreground/60 font-body">
          لا يوجد فرص محفوظة حالياً.
        </div>
      )}
    </div>
  );
}
