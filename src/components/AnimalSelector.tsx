import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Sparkles,
  Clock,
  ChevronRight,
  Check,
  X,
  Edit3
} from 'lucide-react';
import { AnimalCategory, Language } from '../types';
import {
  ALL_SPECIES,
  ANIMAL_CATEGORIES,
  POPULAR_SPECIES,
  AnimalSpeciesDef,
  getSpeciesById
} from '../data/animals';

interface AnimalSelectorProps {
  selectedSpecies: string; // e.g. 'Cow', 'Dog', 'Chicken', or custom
  customSpeciesName: string;
  onSelectSpecies: (species: AnimalSpeciesDef | { id: string; name: string; category: AnimalCategory; emoji: string; isDairyMammal?: boolean }) => void;
  onCustomSpeciesChange: (name: string) => void;
  language: Language;
}

export const AnimalSelector: React.FC<AnimalSelectorProps> = ({
  selectedSpecies,
  customSpeciesName,
  onSelectSpecies,
  onCustomSpeciesChange,
  language
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<AnimalCategory | 'all'>('all');
  const [recentAnimalIds, setRecentAnimalIds] = useState<string[]>([]);
  const [isCustomMode, setIsCustomMode] = useState(false);

  // Load recently selected animals from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('pashucare_recent_animals');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setRecentAnimalIds(parsed.slice(0, 5));
        }
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Save selected animal to recent list
  const recordRecentAnimal = (speciesId: string) => {
    try {
      const next = [speciesId, ...recentAnimalIds.filter((id) => id !== speciesId)].slice(0, 5);
      setRecentAnimalIds(next);
      localStorage.setItem('pashucare_recent_animals', JSON.stringify(next));
    } catch {
      // Ignore storage errors
    }
  };

  const handleSelectSpecies = (species: AnimalSpeciesDef) => {
    if (species.id === 'other_custom') {
      setIsCustomMode(true);
      onSelectSpecies({
        id: 'other_custom',
        name: customSpeciesName || 'Custom Animal',
        category: 'other',
        emoji: '✨',
        isDairyMammal: false
      });
      return;
    }

    setIsCustomMode(false);
    recordRecentAnimal(species.id);
    onSelectSpecies(species);
  };

  // Filter animals based on category and search query
  const filteredSpecies = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return ALL_SPECIES.filter((s) => {
      // Category match
      if (selectedCategory !== 'all' && s.category !== selectedCategory) {
        return false;
      }
      // Search match
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.hindiName.toLowerCase().includes(q) ||
        s.marathiName.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
      );
    });
  }, [searchQuery, selectedCategory]);

  // Resolve recently selected objects
  const recentSpecies = useMemo(() => {
    return recentAnimalIds
      .map((id) => getSpeciesById(id))
      .filter((s): s is AnimalSpeciesDef => Boolean(s));
  }, [recentAnimalIds]);

  // Current selected active object for display badge
  const activeSpeciesObj = useMemo(() => {
    return ALL_SPECIES.find(
      (s) => s.name.toLowerCase() === selectedSpecies.toLowerCase() || s.id.toLowerCase() === selectedSpecies.toLowerCase()
    );
  }, [selectedSpecies]);

  return (
    <div className="space-y-4" id="comprehensive-animal-selector">
      {/* Current Selection Confirmation Bar */}
      <div className="p-3 sm:p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 flex flex-wrap items-center justify-between gap-2 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl sm:text-3xl p-1 bg-white rounded-lg border border-emerald-200 shadow-2xs">
            {isCustomMode ? '✨' : activeSpeciesObj?.emoji || '🐾'}
          </span>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
              {language === 'hi' ? 'चयनित पशु / प्रजाति' : language === 'mr' ? 'निवडलेले जनावर' : 'Selected Animal Species'}
            </span>
            <div className="flex items-center gap-2">
              <strong className="text-sm sm:text-base font-extrabold text-stone-900">
                {isCustomMode
                  ? customSpeciesName || (language === 'hi' ? 'कस्टम पशु (नाम दर्ज करें)' : 'Custom Animal')
                  : activeSpeciesObj
                  ? `${activeSpeciesObj.name} (${language === 'hi' ? activeSpeciesObj.hindiName : language === 'mr' ? activeSpeciesObj.marathiName : activeSpeciesObj.name})`
                  : selectedSpecies || 'Select an Animal'}
              </strong>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 capitalize">
                {isCustomMode ? 'Custom' : activeSpeciesObj?.category || 'Species'}
              </span>
            </div>
          </div>
        </div>

        {isCustomMode ? (
          <button
            type="button"
            onClick={() => {
              setIsCustomMode(false);
              const fallback = ALL_SPECIES[0];
              onSelectSpecies(fallback);
            }}
            className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 underline cursor-pointer"
          >
            {language === 'hi' ? 'सूची से चुनें' : 'Choose from catalog'}
          </button>
        ) : (
          <span className="text-xs text-emerald-800 font-medium hidden sm:inline-flex items-center gap-1">
            <Check className="w-3.5 h-3.5 text-emerald-700" />
            <span>{language === 'hi' ? 'जांच के लिए तैयार' : 'Ready for assessment'}</span>
          </span>
        )}
      </div>

      {/* Custom Animal Name Input (if user selects Custom/Other) */}
      {isCustomMode && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
          <label className="block text-xs font-bold text-amber-950 flex items-center gap-1.5">
            <Edit3 className="w-3.5 h-3.5 text-amber-700" />
            <span>
              {language === 'hi'
                ? 'अपने पशु या प्रजाति का नाम दर्ज करें (आवश्यक):'
                : language === 'mr'
                ? 'आपल्या प्राण्याचे नाव प्रविष्ट करा:'
                : 'Enter Custom Animal / Species Name (Required):'}
            </span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              id="custom-animal-input"
              value={customSpeciesName}
              onChange={(e) => onCustomSpeciesChange(e.target.value)}
              placeholder="e.g. Guinea Pig, Emu, Ostrich, Hedgehog, Falcon..."
              className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-amber-300 text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              autoFocus
            />
          </div>
          <p className="text-[11px] text-amber-800">
            {language === 'hi'
              ? 'इस प्रजाति के अनुसार उपयुक्त स्वास्थ्य दिशा-निर्देश लागू होंगे।'
              : 'Clinical assessment guidelines will be adjusted for this species.'}
          </p>
        </div>
      )}

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          id="animal-search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={
            language === 'hi'
              ? 'पशु खोजें (जैसे: गाय, भैंस, कुत्ता, मुर्गी, बकरा, घोड़ा)...'
              : language === 'mr'
              ? 'जनावर शोधा (उदा: गाय, म्हैस, कुत्रा, शेळी, घोडा)...'
              : 'Search animal (e.g. Cow, Dog, Chicken, Horse, Goat, Sheep, Duck)...'
          }
          className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-stone-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent placeholder:text-stone-400 shadow-2xs"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5"
            title="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Quick Access: Common Livestock */}
      {!searchQuery && (
        <div>
          <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wider block mb-2">
            {language === 'hi' ? 'सामान्य पशु (त्वरित चयन)' : 'Common Livestock'}
          </span>
          <div className="flex flex-wrap gap-2">
            {POPULAR_SPECIES.map((species) => {
              const isSelected =
                !isCustomMode &&
                (selectedSpecies.toLowerCase() === species.name.toLowerCase() ||
                  selectedSpecies.toLowerCase() === species.id.toLowerCase());
              return (
                <button
                  key={species.id}
                  type="button"
                  id={`popular-btn-${species.id}`}
                  onClick={() => handleSelectSpecies(species)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border shadow-2xs ${
                    isSelected
                      ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs scale-102'
                      : 'bg-white text-stone-700 border-stone-200 hover:border-emerald-400 hover:bg-emerald-50/40'
                  }`}
                >
                  <span className="text-base">{species.emoji}</span>
                  <span>{species.name}</span>
                  {language === 'hi' && <span className="opacity-75 font-normal">({species.hindiName})</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Access: Recently Selected Animals */}
      {!searchQuery && recentSpecies.length > 0 && (
        <div>
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-stone-400" />
            <span>{language === 'hi' ? 'हाल ही में चुने गए' : 'Recently Selected'}</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            {recentSpecies.map((species) => (
              <button
                key={`recent-${species.id}`}
                type="button"
                onClick={() => handleSelectSpecies(species)}
                className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium flex items-center gap-1 transition"
              >
                <span>{species.emoji}</span>
                <span>{species.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Category Filter Tabs / Pills */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
            {language === 'hi' ? 'श्रेणी अनुसार फ़िल्टर करें' : 'Browse by Category'}
          </span>
          <span className="text-[11px] text-stone-400">
            {filteredSpecies.length} {language === 'hi' ? 'प्रजातियां उपलब्ध' : 'species'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition border ${
              selectedCategory === 'all'
                ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
            }`}
          >
            {language === 'hi' ? 'सभी (All)' : 'All Species'}
          </button>

          {ANIMAL_CATEGORIES.map((cat) => {
            const isCatActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                id={`cat-pill-${cat.id}`}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 border ${
                  isCatActive
                    ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                <span>{cat.emoji}</span>
                <span>{language === 'hi' ? cat.hindiLabel : language === 'mr' ? cat.marathiLabel : cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Compact Categorized Species Grid */}
      <div className="max-h-64 overflow-y-auto p-1 border border-stone-200 rounded-xl bg-stone-50/50">
        {filteredSpecies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {filteredSpecies.map((species) => {
              const isSelected =
                !isCustomMode &&
                (selectedSpecies.toLowerCase() === species.name.toLowerCase() ||
                  selectedSpecies.toLowerCase() === species.id.toLowerCase());

              return (
                <button
                  key={species.id}
                  type="button"
                  id={`species-btn-${species.id}`}
                  onClick={() => handleSelectSpecies(species)}
                  className={`p-2.5 rounded-xl border transition text-left flex items-center gap-2.5 ${
                    isSelected
                      ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs font-bold'
                      : 'bg-white text-stone-800 border-stone-200 hover:border-emerald-400 hover:bg-emerald-50/40 font-medium'
                  }`}
                >
                  <span className="text-2xl flex-shrink-0">{species.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <span className="block text-xs sm:text-sm font-bold truncate leading-tight">
                      {species.name}
                    </span>
                    <span
                      className={`block text-[10px] truncate ${
                        isSelected ? 'text-emerald-100' : 'text-stone-400'
                      }`}
                    >
                      {language === 'hi' ? species.hindiName : language === 'mr' ? species.marathiName : species.category}
                    </span>
                  </div>
                </button>
              );
            })}

            {/* Custom Animal Button at end of grid */}
            <button
              type="button"
              id="species-btn-custom"
              onClick={() => {
                setIsCustomMode(true);
                onSelectSpecies({
                  id: 'other_custom',
                  name: customSpeciesName || 'Custom Animal',
                  category: 'other',
                  emoji: '✨',
                  isDairyMammal: false
                });
              }}
              className={`p-2.5 rounded-xl border border-dashed transition text-left flex items-center gap-2.5 ${
                isCustomMode
                  ? 'bg-amber-600 text-white border-amber-600 shadow-xs font-bold'
                  : 'bg-amber-50/60 text-amber-900 border-amber-300 hover:bg-amber-100 font-semibold'
              }`}
            >
              <span className="text-2xl flex-shrink-0">✨</span>
              <div className="min-w-0 flex-1">
                <span className="block text-xs sm:text-sm font-bold truncate leading-tight">
                  {language === 'hi' ? '+ अन्य पशु' : '+ Other Animal'}
                </span>
                <span className={`block text-[10px] truncate ${isCustomMode ? 'text-amber-100' : 'text-amber-700'}`}>
                  {language === 'hi' ? 'कस्टम नाम लिखें' : 'Custom entry'}
                </span>
              </div>
            </button>
          </div>
        ) : (
          <div className="p-6 text-center space-y-2">
            <p className="text-xs text-stone-500">
              {language === 'hi'
                ? `"${searchQuery}" के लिए कोई पशु नहीं मिला।`
                : `No pre-listed species found for "${searchQuery}".`}
            </p>
            <button
              type="button"
              onClick={() => {
                setIsCustomMode(true);
                onCustomSpeciesChange(searchQuery);
                onSelectSpecies({
                  id: 'other_custom',
                  name: searchQuery,
                  category: 'other',
                  emoji: '✨',
                  isDairyMammal: false
                });
              }}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 transition"
            >
              Use "{searchQuery}" as Custom Animal
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
