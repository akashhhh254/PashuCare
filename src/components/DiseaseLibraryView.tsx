import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  AlertTriangle,
  ShieldCheck,
  HeartPulse,
  PhoneCall,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { DiseaseInfo, Language } from '../types';
import { translations, getTranslation } from '../i18n/translations';
import { initialDiseases } from '../data/diseases';

interface DiseaseLibraryViewProps {
  language: Language;
  onNavigateToCheck: () => void;
}

export const DiseaseLibraryView: React.FC<DiseaseLibraryViewProps> = ({
  language,
  onNavigateToCheck,
}) => {
  const t = (key: keyof typeof translations['en']) => getTranslation(language, key);

  const [searchTerm, setSearchTerm] = useState('');
  const [animalFilter, setAnimalFilter] = useState('All');
  const [expandedDiseaseId, setExpandedDiseaseId] = useState<string | null>('fmd');

  const filteredDiseases = initialDiseases.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.localNames?.hi && d.localNames.hi.includes(searchTerm)) ||
      (d.localNames?.mr && d.localNames.mr.includes(searchTerm)) ||
      d.commonSymptoms.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesAnimal = animalFilter === 'All' || d.affectedAnimals.includes(animalFilter as any);

    return matchesSearch && matchesAnimal;
  });

  const toggleExpand = (id: string) => {
    setExpandedDiseaseId(expandedDiseaseId === id ? null : id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-7 h-7 text-emerald-700" />
            <span>{t('diseaseLibTitle')}</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Verified veterinary knowledge base for common cattle, buffalo, goat, and sheep illnesses in India.
          </p>
        </div>

        <button
          onClick={onNavigateToCheck}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold shadow-md transition"
        >
          <HeartPulse className="w-4 h-4 text-emerald-200" />
          <span>Check Suspicious Symptoms</span>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-white border border-stone-200 shadow-2xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('diseaseSearchPlaceholder')}
            className="w-full pl-9 pr-3 py-2 rounded-xl text-xs sm:text-sm border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['All', 'Cow', 'Buffalo', 'Goat', 'Sheep'].map((filter) => (
            <button
              key={filter}
              onClick={() => setAnimalFilter(filter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                animalFilter === filter
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Disease Cards */}
      <div className="space-y-4">
        {filteredDiseases.map((disease) => {
          const isExpanded = expandedDiseaseId === disease.id;
          const localName =
            language === 'hi' && disease.localNames?.hi
              ? disease.localNames.hi
              : language === 'mr' && disease.localNames?.mr
              ? disease.localNames.mr
              : disease.name;

          return (
            <div
              key={disease.id}
              className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden transition"
            >
              {/* Card Header */}
              <div
                onClick={() => toggleExpand(disease.id)}
                className="p-5 sm:p-6 cursor-pointer flex items-center justify-between gap-4 hover:bg-stone-50/70 transition"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        disease.severity === 'Emergency'
                          ? 'bg-red-100 text-red-800'
                          : disease.severity === 'High'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {disease.severity} Severity
                    </span>
                    <div className="flex items-center gap-1 text-xs text-stone-400">
                      {disease.affectedAnimals.map((a) => (
                        <span key={a} className="px-1.5 py-0.5 rounded bg-stone-100 text-stone-600">
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>

                  <h3 className="text-base sm:text-lg font-black text-stone-900">
                    {localName}
                  </h3>
                  {localName !== disease.name && (
                    <span className="text-xs text-stone-400 font-medium block">
                      {disease.name}
                    </span>
                  )}
                </div>

                <button className="p-2 rounded-xl text-stone-400 hover:text-stone-700">
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
              </div>

              {/* Card Collapsible Content */}
              {isExpanded && (
                <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-stone-100 space-y-6 text-xs sm:text-sm">
                  {/* Common Symptoms */}
                  <div>
                    <h4 className="font-bold text-stone-900 mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>{t('diseaseSymptoms')}</span>
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-stone-600">
                      {disease.commonSymptoms.map((symp, idx) => (
                        <li key={idx}>{symp}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Causes & Transmission */}
                  <div>
                    <h4 className="font-bold text-stone-900 mb-2">
                      {t('diseaseCauses')}
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-stone-600">
                      {disease.possibleCauses.map((cause, idx) => (
                        <li key={idx}>{cause}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Prevention & Management */}
                  <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100">
                    <h4 className="font-bold text-emerald-950 mb-2 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-700" />
                      <span>{t('diseasePrevention')}</span>
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-emerald-900">
                      {disease.prevention.map((prev, idx) => (
                        <li key={idx}>{prev}</li>
                      ))}
                    </ul>
                  </div>

                  {/* General Supportive Care */}
                  <div>
                    <h4 className="font-bold text-stone-900 mb-2">
                      {t('diseaseCare')}
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-stone-600">
                      {disease.generalCare.map((care, idx) => (
                        <li key={idx}>{care}</li>
                      ))}
                    </ul>
                  </div>

                  {/* When to Call the Doctor */}
                  <div className="p-4 rounded-xl bg-red-50/70 border border-red-200">
                    <h4 className="font-bold text-red-900 mb-1 flex items-center gap-2">
                      <PhoneCall className="w-4 h-4 text-red-600" />
                      <span>{t('diseaseWhenVet')}</span>
                    </h4>
                    <p className="text-red-800 text-xs">
                      {disease.whenToSeekVet}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
