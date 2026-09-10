import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Plus,
  HeartPulse,
  ShieldCheck,
  X
} from 'lucide-react';
import { Language, UserProfile } from '../types';
import { translations, getTranslation } from '../i18n/translations';

interface OnboardingModalProps {
  user: UserProfile;
  language: Language;
  onAddFirstAnimal: () => void;
  onFinishOnboarding: () => void;
}

const COMMON_SPECIES = [
  { id: 'cow', name: 'Cow', hindi: 'गाय', emoji: '🐄' },
  { id: 'buffalo', name: 'Buffalo', hindi: 'भैंस', emoji: '🐃' },
  { id: 'goat', name: 'Goat', hindi: 'बकरी', emoji: '🐐' },
  { id: 'sheep', name: 'Sheep', hindi: 'भेड़', emoji: '🐑' },
  { id: 'dog', name: 'Dog', hindi: 'कुत्ता', emoji: '🐕' },
  { id: 'cat', name: 'Cat', hindi: 'बिल्ली', emoji: '🐈' },
  { id: 'poultry', name: 'Poultry / Chicken', hindi: 'मुर्गी', emoji: '🐔' },
  { id: 'horse', name: 'Horse', hindi: 'घोड़ा', emoji: '🐎' },
  { id: 'other', name: 'Other', hindi: 'अन्य', emoji: '🐾' },
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  user,
  language,
  onAddFirstAnimal,
  onFinishOnboarding,
}) => {
  const t = (key: keyof typeof translations['en']) => getTranslation(language, key);
  const [selectedAnimals, setSelectedAnimals] = useState<string[]>(['cow']);

  const toggleAnimal = (id: string) => {
    setSelectedAnimals((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-stone-200 overflow-hidden my-6">
        
        {/* Top Celebration Graphic */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-6 sm:p-8 text-center relative overflow-hidden">
          <div className="relative z-10 space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-white/20 text-white flex items-center justify-center mx-auto mb-3 backdrop-blur-xs">
              <Sparkles className="w-6 h-6 text-emerald-200" />
            </div>
            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-600/70 text-emerald-100 uppercase tracking-wider">
              {language === 'hi' ? 'स्वागत है' : language === 'mr' ? 'स्वागत आहे' : 'Welcome to Pashu Saathi AI'}
            </span>
            <h2 className="text-2xl font-black tracking-tight">
              {language === 'hi'
                ? `नमस्ते, ${user.name}!`
                : language === 'mr'
                ? `नमस्कार, ${user.name}!`
                : `Welcome, ${user.name}!`}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-sm mx-auto">
              {language === 'hi'
                ? 'आपका खाता सक्रिय हो गया है। आइए अपने पहले पशु का प्रोफ़ाइल बनाएं ताकि AI स्वास्थ्य निगरानी शुरू हो सके।'
                : language === 'mr'
                ? 'आपले खाते सक्रिय झाले आहे. चला आपल्या पहिल्या जनावराचे प्रोफाइल तयार करूया.'
                : 'Your account is ready. Let\'s set up your animals to enable AI vision disease screening and health tracking.'}
            </p>
          </div>
        </div>

        {/* Question: What species do you keep? */}
        <div className="p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wide">
              {language === 'hi'
                ? 'आप किन पशुओं की देखभाल करते हैं?'
                : language === 'mr'
                ? 'तुम्ही कोणत्या जनावरांची काळजी घेता?'
                : 'Which animals do you care for?'}
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              {language === 'hi'
                ? 'लागू होने वाले सभी पशुओं को चुनें:'
                : language === 'mr'
                ? 'लागू असणारे सर्व प्राणी निवडा:'
                : 'Select all that apply to tailor clinical suggestions:'}
            </p>

            <div className="grid grid-cols-3 gap-2.5 mt-3">
              {COMMON_SPECIES.map((item) => {
                const isSelected = selectedAnimals.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleAnimal(item.id)}
                    className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1 ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/80 text-emerald-900 font-bold shadow-2xs'
                        : 'border-stone-200 hover:border-stone-300 text-stone-700 font-medium'
                    }`}
                  >
                    <span className="text-2xl">{item.emoji}</span>
                    <span className="text-xs">
                      {language === 'hi' ? item.hindi : item.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-2.5 pt-2">
            <button
              type="button"
              id="onboard-add-first-animal-btn"
              onClick={onAddFirstAnimal}
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md transition active:scale-95 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>
                {language === 'hi'
                  ? 'पहला पशु जोड़ें (Add Animal)'
                  : language === 'mr'
                  ? 'पहिले जनावर जोडा'
                  : 'Add Your First Animal'}
              </span>
            </button>

            <button
              type="button"
              id="onboard-skip-to-dash-btn"
              onClick={onFinishOnboarding}
              className="w-full py-2.5 px-4 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 font-bold text-xs sm:text-sm transition"
            >
              <span>
                {language === 'hi'
                  ? 'डैशबोर्ड पर जाएं'
                  : language === 'mr'
                  ? 'डॅशबोर्डवर जा'
                  : 'Go to Dashboard Directly'}
              </span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
