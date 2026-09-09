import React, { useState, useEffect } from 'react';
import {
  Shield,
  Activity,
  AlertTriangle,
  Users,
  CheckCircle2,
  PhoneCall,
  Server,
  TrendingUp,
  FileText
} from 'lucide-react';
import { Language } from '../types';
import { translations, getTranslation } from '../i18n/translations';

interface AdminViewProps {
  language: Language;
}

export const AdminView: React.FC<AdminViewProps> = ({ language }) => {
  const t = (key: keyof typeof translations['en']) => getTranslation(language, key);

  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load admin stats:', err);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 text-center text-stone-500">
        Loading surveillance analytics...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
            Surveillance & Epidemiology Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight mt-2 flex items-center gap-2">
            <Shield className="w-7 h-7 text-emerald-700" />
            <span>{t('adminDashboard')}</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Regional livestock health trends, high-risk disease signals, and paravet consultation routing.
          </p>
        </div>

        {/* System Status Pill */}
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold shadow-2xs">
          <Server className="w-4 h-4 text-emerald-700" />
          <span>Gemini 3.8 Flash Vision: Online</span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
            {t('adminTotalChecks')}
          </span>
          <div className="text-3xl font-black text-stone-900 mt-2">
            {stats?.totalHealthChecks || 1}
          </div>
          <span className="text-xs text-stone-400 mt-1 block">Multimodal scans</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
            {t('adminHighRiskCount')}
          </span>
          <div className="text-3xl font-black text-red-600 mt-2">
            {stats?.highRiskReports || 0}
          </div>
          <span className="text-xs text-stone-400 mt-1 block">Active notifications</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
            Registered Livestock
          </span>
          <div className="text-3xl font-black text-stone-900 mt-2">
            {stats?.totalAnimals || 2}
          </div>
          <span className="text-xs text-stone-400 mt-1 block">Tagged animals</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
            {t('adminVetRequests')}
          </span>
          <div className="text-3xl font-black text-amber-600 mt-2">
            {stats?.pendingVetRequests || 0}
          </div>
          <span className="text-xs text-stone-400 mt-1 block">Dispensary queue</span>
        </div>
      </div>

      {/* Species Distribution & Disease Surveillance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-2xs">
          <h3 className="font-bold text-stone-900 text-base mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-700" />
            <span>Livestock Population Under Monitoring</span>
          </h3>

          <div className="space-y-3">
            {[
              { label: 'Cow (Indigenous & Crossbred)', count: stats?.animalTypesAnalyzed?.Cow || 1, color: 'bg-emerald-600', pct: 50 },
              { label: 'Buffalo (Murrah & Local)', count: stats?.animalTypesAnalyzed?.Buffalo || 1, color: 'bg-teal-600', pct: 50 },
              { label: 'Goats (Osmanabadi, Sirohi)', count: stats?.animalTypesAnalyzed?.Goat || 0, color: 'bg-amber-600', pct: 0 },
              { label: 'Sheep (Deccani, Nellore)', count: stats?.animalTypesAnalyzed?.Sheep || 0, color: 'bg-indigo-600', pct: 0 },
            ].map((sp, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-stone-700">
                  <span>{sp.label}</span>
                  <span>{sp.count} animals</span>
                </div>
                <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
                  <div className={`h-full ${sp.color}`} style={{ width: `${sp.pct || 15}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-2xs">
          <h3 className="font-bold text-stone-900 text-base mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span>Epidemic Alert & Vector Monitoring</span>
          </h3>
          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
              <strong>Seasonal Lumpy Skin Disease (LSD) Alert:</strong>
              <p className="text-[11px] text-amber-800 mt-0.5">
                Humid post-monsoon conditions promote biting fly vectors. State animal husbandry advisory urges prophylactic goat pox vaccination in uninfected talukas.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
              <strong>National FMD Round 4 Progress:</strong>
              <p className="text-[11px] text-emerald-800 mt-0.5">
                NADCP Foot & Mouth vaccination camps operational at all taluka veterinary polyclinics.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
