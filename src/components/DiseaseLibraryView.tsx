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
  ChevronUp,
  Pill,
  Volume2,
  VolumeX,
  Stethoscope,
  ShieldAlert
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
  const [speakingId, setSpeakingId] = useState<string | null>(null);

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

  const handleSpeak = (disease: DiseaseInfo, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (speakingId === disease.id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();

    const localName =
      language === 'hi' && disease.localNames?.hi
        ? disease.localNames.hi
        : language === 'mr' && disease.localNames?.mr
        ? disease.localNames.mr
        : disease.name;

    const parts: string[] = [
      `${localName}.`,
      `गंभीरता: ${disease.severity}.`,
      `लक्षण: ${disease.commonSymptoms.slice(0, 3).join(', ')}.`,
    ];

    if (disease.medicinesAndTreatment) {
      parts.push(`प्राथमिक उपचार और दवाइयां: ${disease.medicinesAndTreatment.firstAidMedications.join('. ')}`);
      parts.push(`पशु चिकित्सक से सलाह योग्य दवाइयां: ${disease.medicinesAndTreatment.veterinaryDrugs.join('. ')}`);
      parts.push(`सावधानी: ${disease.medicinesAndTreatment.safetyPrecautions}`);
    }

    const utterance = new SpeechSynthesisUtterance(parts.join(' '));
    utterance.lang = language === 'mr' ? 'mr-IN' : language === 'hi' ? 'hi-IN' : 'en-US';
    utterance.rate = 0.95;

    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(disease.id);
    window.speechSynthesis.speak(utterance);
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

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => handleSpeak(disease, e)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      speakingId === disease.id
                        ? 'bg-amber-500 text-white animate-pulse shadow-xs'
                        : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                    }`}
                    title="रोग व दवाइयों की जानकारी सुनें / Listen audio"
                  >
                    {speakingId === disease.id ? (
                      <>
                        <VolumeX className="w-4 h-4" />
                        <span className="hidden sm:inline">रोकें (Stop)</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-4 h-4 text-emerald-700" />
                        <span className="hidden sm:inline">सुनें (Listen)</span>
                      </>
                    )}
                  </button>

                  <button className="p-2 rounded-xl text-stone-400 hover:text-stone-700">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>
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

                  {/* MEDICINES & TREATMENT SECTION (दवाइयां और उपचार) */}
                  {disease.medicinesAndTreatment && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-4">
                      <div className="flex items-center justify-between border-b border-amber-200/60 pb-2.5">
                        <h4 className="font-black text-amber-950 text-sm flex items-center gap-2">
                          <Pill className="w-4 h-4 text-amber-700" />
                          <span>
                            {language === 'hi'
                              ? 'दवाइयां और उपचार (Medicines & Treatment)'
                              : language === 'mr'
                              ? 'औषधे आणि उपचार (Medicines & Treatment)'
                              : 'Recommended Medicines & Treatment Guide'}
                          </span>
                        </h4>
                        <span className="text-[11px] font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-md">
                          Veterinary Standard
                        </span>
                      </div>

                      {/* First Aid / Immediate Medications */}
                      <div className="space-y-1.5">
                        <strong className="text-amber-950 font-bold block text-xs flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-600" />
                          {language === 'hi'
                            ? 'प्राथमिक उपचार व सुरक्षित दवाएं (First-Aid Supplies):'
                            : 'First-Aid & Immediate Supplies:'}
                        </strong>
                        <ul className="list-disc list-inside space-y-1 text-stone-700 pl-1">
                          {disease.medicinesAndTreatment.firstAidMedications.map((med, idx) => (
                            <li key={idx}>{med}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Veterinary Drugs */}
                      <div className="space-y-1.5">
                        <strong className="text-amber-950 font-bold block text-xs flex items-center gap-1.5">
                          <Stethoscope className="w-3.5 h-3.5 text-blue-700" />
                          {language === 'hi'
                            ? 'पशु चिकित्सक द्वारा दी जाने वाली मुख्य दवाएं (Veterinary Prescription):'
                            : 'Veterinary Prescription Drugs (Under Vet Supervision):'}
                        </strong>
                        <ul className="list-disc list-inside space-y-1 text-stone-700 pl-1">
                          {disease.medicinesAndTreatment.veterinaryDrugs.map((med, idx) => (
                            <li key={idx}>{med}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Supportive Nursing Care */}
                      {disease.medicinesAndTreatment.supportiveCare?.length > 0 && (
                        <div className="space-y-1.5">
                          <strong className="text-amber-950 font-bold block text-xs">
                            {language === 'hi' ? 'सहायक नर्सिंग देखभाल:' : 'Supportive Nursing Care:'}
                          </strong>
                          <ul className="list-disc list-inside space-y-1 text-stone-700 pl-1">
                            {disease.medicinesAndTreatment.supportiveCare.map((care, idx) => (
                              <li key={idx}>{care}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Safety Precautions & Withdrawal */}
                      <div className="p-3 rounded-xl bg-amber-100/70 border border-amber-300 text-amber-900 text-xs flex items-start gap-2">
                        <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                        <div>
                          <strong>{language === 'hi' ? 'सुरक्षा निर्देश: ' : 'Safety Caution: '}</strong>
                          <span>{disease.medicinesAndTreatment.safetyPrecautions}</span>
                        </div>
                      </div>
                    </div>
                  )}

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
