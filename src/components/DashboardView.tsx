import React from 'react';
import {
  HeartPulse,
  Users,
  AlertTriangle,
  Calendar,
  PhoneCall,
  Plus,
  ArrowRight,
  ShieldCheck,
  Activity,
  FileText
} from 'lucide-react';
import { AnimalProfile, HealthReport, Language, UserProfile, Reminder } from '../types';
import { translations, getTranslation } from '../i18n/translations';

interface DashboardViewProps {
  animals: AnimalProfile[];
  reports: HealthReport[];
  reminders: Reminder[];
  user: UserProfile | null;
  language: Language;
  onNavigate: (tab: string) => void;
  onSelectReport: (report: HealthReport) => void;
  onSelectAnimal: (animal: AnimalProfile) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  animals,
  reports,
  reminders,
  user,
  language,
  onNavigate,
  onSelectReport,
  onSelectAnimal,
}) => {
  const t = (key: keyof typeof translations['en']) => getTranslation(language, key);

  // Stats calculation
  const totalAnimals = animals.length;
  const totalChecks = reports.length;
  const highRiskReports = reports.filter(
    (r) => r.result?.riskLevel === 'High' || r.result?.riskLevel === 'Emergency'
  );
  const pendingReminders = reminders.filter((r) => !r.completed);

  // Active alerts
  const highRiskAnimals = animals.filter(
    (a) => a.status === 'Critical' || a.status === 'Under Observation' || (a.healthScore && a.healthScore < 70)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      
      {/* Top Banner / Welcome */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-6 sm:p-10 shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-700/80 text-emerald-200 uppercase tracking-wider mb-3">
            {user?.farmName || 'Kisan Dairy & Livestock'}
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            {t('appName')}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-emerald-100">
            {t('heroSubheading')}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('check')}
              id="dash-cta-check-health"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-emerald-900 hover:bg-emerald-50 text-sm font-bold shadow-md transition active:scale-95"
            >
              <HeartPulse className="w-4 h-4 text-emerald-700" />
              <span>{t('heroPrimaryBtn')}</span>
            </button>
            <button
              onClick={() => onNavigate('animals')}
              id="dash-cta-add-animal"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700/60 hover:bg-emerald-700 text-white text-sm font-bold border border-emerald-600 transition"
            >
              <Plus className="w-4 h-4" />
              <span>{t('dashQuickActionAddAnimal')}</span>
            </button>
          </div>
        </div>

        {/* Decorative graphic circle */}
        <div className="absolute right-[-40px] bottom-[-40px] w-80 h-80 rounded-full bg-emerald-500/10 pointer-events-none" />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Animals */}
        <div
          onClick={() => onNavigate('animals')}
          className="p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs hover:border-emerald-500 transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              {t('dashTotalAnimals')}
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-black text-stone-900">
            {totalAnimals}
          </div>
          <span className="text-xs text-stone-500 mt-1 block">
            Cows, buffaloes, goats, sheep
          </span>
        </div>

        {/* Total Checks */}
        <div
          onClick={() => onNavigate('history')}
          className="p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs hover:border-emerald-500 transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              {t('dashHealthChecks')}
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-black text-stone-900">
            {totalChecks}
          </div>
          <span className="text-xs text-stone-500 mt-1 block">
            AI vision & symptom scans
          </span>
        </div>

        {/* High-Risk Reports */}
        <div
          onClick={() => onNavigate('history')}
          className="p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs hover:border-red-400 transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              {t('dashHighRisk')}
            </span>
            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-800 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className={`mt-3 text-2xl sm:text-3xl font-black ${highRiskReports.length > 0 ? 'text-red-700' : 'text-stone-900'}`}>
            {highRiskReports.length}
          </div>
          <span className="text-xs text-stone-500 mt-1 block">
            Require close monitoring
          </span>
        </div>

        {/* Upcoming Reminders */}
        <div
          onClick={() => onNavigate('reminders')}
          className="p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs hover:border-amber-500 transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              {t('dashUpcomingReminders')}
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-black text-stone-900">
            {pendingReminders.length}
          </div>
          <span className="text-xs text-stone-500 mt-1 block">
            Vaccines & deworming
          </span>
        </div>
      </div>

      {/* Health Alerts Card if any animal is sick */}
      {highRiskAnimals.length > 0 && (
        <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-300">
          <div className="flex items-center gap-2 text-amber-900 font-bold mb-3">
            <AlertTriangle className="w-5 h-5 text-amber-700" />
            <h3>{t('dashHealthAlerts')} ({highRiskAnimals.length})</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {highRiskAnimals.map((animal) => (
              <div
                key={animal.id}
                onClick={() => onSelectAnimal(animal)}
                className="p-3.5 rounded-xl bg-white border border-amber-200 hover:border-amber-400 transition cursor-pointer flex items-center justify-between shadow-2xs"
              >
                <div>
                  <div className="font-bold text-stone-900 text-sm">{animal.name}</div>
                  <div className="text-xs text-stone-500">{animal.type} • {animal.breed}</div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                  {animal.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Recent Health Scans (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-700" />
              <span>{t('dashRecentReports')}</span>
            </h2>
            <button
              onClick={() => onNavigate('history')}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-900 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {reports.length > 0 ? (
            <div className="space-y-3">
              {reports.slice(0, 4).map((report) => {
                const risk = report.result?.riskLevel || 'Medium';
                return (
                  <div
                    key={report.id}
                    onClick={() => onSelectReport(report)}
                    className="p-4 rounded-xl bg-white border border-stone-200 hover:border-emerald-600 transition cursor-pointer shadow-2xs flex flex-wrap sm:flex-nowrap items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-xl bg-stone-100 border border-stone-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {report.photoUrl ? (
                          <img
                            src={report.photoUrl}
                            alt={report.animalName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xl">
                            {report.animalType === 'Cow' ? '🐄' : report.animalType === 'Buffalo' ? '🐃' : report.animalType === 'Goat' ? '🐐' : '🐑'}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-sm font-bold text-stone-900">
                            {report.animalName}
                          </strong>
                          <span className="text-xs text-stone-500">
                            ({report.animalType})
                          </span>
                        </div>
                        <p className="text-xs text-stone-600 mt-0.5 line-clamp-1">
                          {report.result?.possibleConditions?.[0]?.name || 'Assessment completed'}
                        </p>
                        <span className="text-[11px] text-stone-400 mt-1 block">
                          {new Date(report.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 ml-auto">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          risk === 'Emergency' || risk === 'High'
                            ? 'bg-red-100 text-red-800'
                            : risk === 'Medium'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {risk} Risk
                      </span>
                      <ArrowRight className="w-4 h-4 text-stone-400" />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-white border border-stone-200 text-center text-stone-500">
              <HeartPulse className="w-8 h-8 mx-auto text-stone-400 mb-2" />
              <p className="text-sm">No health checks completed yet.</p>
              <button
                onClick={() => onNavigate('check')}
                className="mt-3 px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold"
              >
                Run First Health Check
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Quick Veterinary Access & Tips (1 col) */}
        <div className="space-y-6">
          {/* Emergency Helpline Box */}
          <div className="p-5 rounded-2xl bg-red-700 text-white shadow-md">
            <div className="flex items-center gap-2 font-extrabold text-sm uppercase tracking-wide text-red-100">
              <PhoneCall className="w-4 h-4" />
              <span>National Animal Helpline</span>
            </div>
            <div className="mt-2 text-3xl font-black tracking-tight">1962</div>
            <p className="mt-1 text-xs text-red-100">
              Free Government 24x7 Emergency Call Service for livestock health, calving emergencies & epidemic alerts.
            </p>
            <a
              href="tel:1962"
              className="mt-4 inline-flex items-center justify-center w-full py-2 px-4 rounded-xl bg-white text-red-800 font-bold text-xs hover:bg-red-50 transition"
            >
              Call 1962 Helpline
            </a>
          </div>

          {/* Quick Veterinary Consultation */}
          <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-3">
            <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-emerald-700" />
              <span>Local Veterinary Support</span>
            </h3>
            <p className="text-xs text-stone-600">
              Book a clinic visit or request a paravet / doctor farm inspection.
            </p>
            <button
              onClick={() => onNavigate('vet')}
              id="dash-consult-vet-btn"
              className="w-full py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold transition text-center block"
            >
              {t('dashQuickActionVet')}
            </button>
          </div>

          {/* Disease Encyclopedia Promotion */}
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
            <h3 className="font-bold text-emerald-900 text-sm">
              {t('diseaseLibTitle')}
            </h3>
            <p className="text-xs text-emerald-800">
              Read preventive care guides on Foot and Mouth Disease (FMD), Lumpy Skin Disease (LSD), Mastitis, and Bloat.
            </p>
            <button
              onClick={() => onNavigate('diseases')}
              className="text-xs font-bold text-emerald-900 hover:underline inline-flex items-center gap-1 mt-1"
            >
              <span>Explore Disease Catalog</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
