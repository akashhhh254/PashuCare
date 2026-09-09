import React from 'react';
import {
  HeartPulse,
  Camera,
  Mic,
  ShieldCheck,
  PhoneCall,
  Activity,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Users
} from 'lucide-react';
import { Language } from '../types';
import { translations, getTranslation } from '../i18n/translations';

interface HomeViewProps {
  language: Language;
  onStartCheck: () => void;
  onNavigate: (tab: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  language,
  onStartCheck,
  onNavigate,
}) => {
  const t = (key: keyof typeof translations['en']) => getTranslation(language, key);

  const steps = [
    { num: '1', title: t('step1Title'), desc: t('step1Desc'), icon: Users },
    { num: '2', title: t('step2Title'), desc: t('step2Desc'), icon: Camera },
    { num: '3', title: t('step3Title'), desc: t('step3Desc'), icon: Mic },
    { num: '4', title: t('step4Title'), desc: t('step4Desc'), icon: Sparkles },
    { num: '5', title: t('step5Title'), desc: t('step5Desc'), icon: Activity },
    { num: '6', title: t('step6Title'), desc: t('step6Desc'), icon: PhoneCall },
  ];

  return (
    <div className="space-y-12 pb-16">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-emerald-900 to-stone-900 text-white pt-12 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/80 border border-emerald-600/40 text-emerald-200 text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                <span>Next-Gen Livestock Vision AI</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
                Smart Animal Disease Detection for Every Farmer
              </h1>

              <p className="text-base sm:text-lg text-emerald-100 max-w-xl leading-relaxed">
                {t('heroSubheading')}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={onStartCheck}
                  id="hero-check-health-btn"
                  className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-white text-emerald-950 hover:bg-emerald-50 font-black text-sm sm:text-base shadow-xl transition active:scale-95"
                >
                  <HeartPulse className="w-5 h-5 text-emerald-700" />
                  <span>{t('heroPrimaryBtn')}</span>
                  <ArrowRight className="w-4 h-4 text-emerald-700" />
                </button>

                <a
                  href="#how-it-works"
                  className="px-5 py-3.5 rounded-2xl bg-emerald-800/50 hover:bg-emerald-800 text-white font-bold text-sm border border-emerald-600/40 backdrop-blur-xs transition"
                >
                  {t('heroSecondaryBtn')}
                </a>
              </div>

              {/* Verified Trust Stats */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-emerald-800/50 text-xs sm:text-sm">
                <div>
                  <div className="font-extrabold text-emerald-300 text-base sm:text-lg">4 Species</div>
                  <div className="text-stone-300 text-[11px] sm:text-xs">Cow, Buffalo, Goat, Sheep</div>
                </div>
                <div>
                  <div className="font-extrabold text-emerald-300 text-base sm:text-lg">Multimodal</div>
                  <div className="text-stone-300 text-[11px] sm:text-xs">Image + Symptoms + Voice</div>
                </div>
                <div>
                  <div className="font-extrabold text-emerald-300 text-base sm:text-lg">Helpline 1962</div>
                  <div className="text-stone-300 text-[11px] sm:text-xs">National Emergency Call</div>
                </div>
              </div>
            </div>

            {/* Right Hero Card / Visual Preview */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 p-6 shadow-2xl relative overflow-hidden">
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs font-bold tracking-wider uppercase text-emerald-200">
                      Live AI Vision Analysis
                    </span>
                  </div>
                  <span className="text-[11px] text-stone-300">PashuCare Vision</span>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="p-3.5 rounded-xl bg-white/10 border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🐄</span>
                      <div>
                        <div className="text-xs font-bold text-white">Gir Cow (4 Yrs)</div>
                        <div className="text-[11px] text-emerald-200">Symptoms: Mouth erosions, salivation</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/30 text-amber-200 border border-amber-400/30">
                      FMD Suspected
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/10 border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🐃</span>
                      <div>
                        <div className="text-xs font-bold text-white">Murrah Buffalo (5 Yrs)</div>
                        <div className="text-[11px] text-emerald-200">Symptoms: Cutaneous nodules</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/30 text-red-200 border border-red-400/30">
                      LSD Suspected
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/10 border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🐐</span>
                      <div>
                        <div className="text-xs font-bold text-white">Osmanabadi Goat</div>
                        <div className="text-[11px] text-emerald-200">Status: Regular healthy herd check</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                      Healthy (88/100)
                    </span>
                  </div>
                </div>

                <div className="mt-5 p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/30 text-[11px] text-emerald-100 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Helps reduce disease spread, protect milk production, and alert veterinarians early.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MANDATORY SAFETY NOTICE */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 shadow-2xs">
          <AlertTriangle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm">
            <strong className="font-bold block text-amber-950">
              Important Safety & Clinical Disclaimer
            </strong>
            <p className="mt-0.5">
              {t('disclaimerFull')}
            </p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
            Simple 6-Step Workflow
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-2">
            How PashuCare AI Helps Your Farm
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Designed specifically for farmers and livestock owners in rural areas with voice input and multilingual guidance.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((st) => {
            const Icon = st.icon;
            return (
              <div
                key={st.num}
                className="p-6 rounded-2xl bg-white border border-stone-200 shadow-2xs hover:border-emerald-600 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center">
                      {st.num}
                    </span>
                    <Icon className="w-5 h-5 text-stone-400" />
                  </div>
                  <h3 className="font-bold text-stone-900 text-base mb-1">
                    {st.title}
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {st.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SUPPORTED LIVESTOCK SPOTLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 rounded-3xl bg-stone-900 text-white">
          <div className="max-w-2xl mb-6">
            <h2 className="text-2xl font-extrabold">
              Supported Livestock Species
            </h2>
            <p className="text-xs sm:text-sm text-stone-400 mt-1">
              PashuCare AI is tuned on veterinary literature for the major milk and meat-producing animals in India.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div
              onClick={() => onNavigate('diseases')}
              className="p-4 rounded-2xl bg-stone-800/80 hover:bg-stone-800 transition cursor-pointer border border-stone-700/60 text-center"
            >
              <div className="text-4xl mb-2">🐄</div>
              <h3 className="font-bold text-sm">{t('animalCow')}</h3>
              <span className="text-[11px] text-stone-400 block mt-0.5">Gir, Sahiwal, Red Sindhi, HF cross</span>
            </div>

            <div
              onClick={() => onNavigate('diseases')}
              className="p-4 rounded-2xl bg-stone-800/80 hover:bg-stone-800 transition cursor-pointer border border-stone-700/60 text-center"
            >
              <div className="text-4xl mb-2">🐃</div>
              <h3 className="font-bold text-sm">{t('animalBuffalo')}</h3>
              <span className="text-[11px] text-stone-400 block mt-0.5">Murrah, Jaffarabadi, Pandharpuri</span>
            </div>

            <div
              onClick={() => onNavigate('diseases')}
              className="p-4 rounded-2xl bg-stone-800/80 hover:bg-stone-800 transition cursor-pointer border border-stone-700/60 text-center"
            >
              <div className="text-4xl mb-2">🐐</div>
              <h3 className="font-bold text-sm">{t('animalGoat')}</h3>
              <span className="text-[11px] text-stone-400 block mt-0.5">Osmanabadi, Jamnapari, Sirohi</span>
            </div>

            <div
              onClick={() => onNavigate('diseases')}
              className="p-4 rounded-2xl bg-stone-800/80 hover:bg-stone-800 transition cursor-pointer border border-stone-700/60 text-center"
            >
              <div className="text-4xl mb-2">🐑</div>
              <h3 className="font-bold text-sm">{t('animalSheep')}</h3>
              <span className="text-[11px] text-stone-400 block mt-0.5">Deccani, Marwari, Nellore</span>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK CTA FOOTER BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-emerald-800 to-teal-800 text-white p-8 sm:p-12 shadow-lg flex flex-wrap items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black">
              Notice Any Change in Your Animal Today?
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-xl">
              Don't wait until symptoms get worse. Take a photo and let PashuCare AI analyze lesions, fever signs, or behavioral cues in seconds.
            </p>
          </div>

          <button
            onClick={onStartCheck}
            className="px-6 py-3.5 rounded-2xl bg-white text-emerald-950 hover:bg-emerald-50 font-black text-sm shadow-md transition active:scale-95 flex items-center gap-2"
          >
            <HeartPulse className="w-5 h-5 text-emerald-700" />
            <span>{t('heroPrimaryBtn')}</span>
          </button>
        </div>
      </section>
    </div>
  );
};
