import React from 'react';
import {
  X,
  HeartPulse,
  Calendar,
  Activity,
  Trash2,
  Edit2,
  FileText,
  Clock,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { AnimalProfile, HealthReport, Language } from '../types';
import { translations, getTranslation } from '../i18n/translations';

interface AnimalDetailModalProps {
  animal: AnimalProfile;
  reports: HealthReport[];
  language: Language;
  onClose: () => void;
  onRunHealthCheck: (animal: AnimalProfile) => void;
  onSelectReport: (report: HealthReport) => void;
  onDeleteAnimal: (animalId: string) => void;
}

export const AnimalDetailModal: React.FC<AnimalDetailModalProps> = ({
  animal,
  reports,
  language,
  onClose,
  onRunHealthCheck,
  onSelectReport,
  onDeleteAnimal,
}) => {
  const t = (key: keyof typeof translations['en']) => getTranslation(language, key);

  const animalReports = reports.filter((r) => r.animalId === animal.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-stone-200 overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="relative h-44 bg-emerald-900 overflow-hidden">
          {animal.photoUrl ? (
            <img
              src={animal.photoUrl}
              alt={animal.name}
              className="w-full h-full object-cover opacity-60"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl text-white/40">
              {animal.type === 'Cow' ? '🐄' : animal.type === 'Buffalo' ? '🐃' : animal.type === 'Goat' ? '🐐' : '🐑'}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Title & Tag in hero */}
          <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/20 text-white uppercase tracking-wider backdrop-blur-xs">
                {animal.type} • {animal.breed || 'Indigenous'}
              </span>
              <h2 className="text-2xl font-black text-white mt-1">
                {animal.name}
              </h2>
              <span className="text-xs text-stone-300">
                Tag ID: {animal.tagId || 'No Ear Tag'}
              </span>
            </div>

            <div className="text-right">
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                  animal.status === 'Critical'
                    ? 'bg-red-600 text-white'
                    : animal.status === 'Under Observation'
                    ? 'bg-amber-500 text-white'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                {animal.status}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          
          {/* Vitals Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
              <span className="text-[11px] font-semibold text-stone-400 block">Age</span>
              <strong className="text-stone-800 text-sm">{animal.age || '—'} Years</strong>
            </div>
            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
              <span className="text-[11px] font-semibold text-stone-400 block">Gender</span>
              <strong className="text-stone-800 text-sm">{animal.gender || 'Female'}</strong>
            </div>
            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
              <span className="text-[11px] font-semibold text-stone-400 block">Weight</span>
              <strong className="text-stone-800 text-sm">{animal.weight ? `${animal.weight} kg` : '—'}</strong>
            </div>
            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
              <span className="text-[11px] font-semibold text-stone-400 block">Health Score</span>
              <strong className="text-emerald-700 text-sm font-bold">{animal.healthScore || 85} / 100</strong>
            </div>
          </div>

          {/* Location / Barn notes */}
          {animal.farmLocation && (
            <div className="text-xs text-stone-600 bg-stone-50 p-3 rounded-xl border border-stone-200">
              <strong>Barn / Shed Location:</strong> {animal.farmLocation}
            </div>
          )}

          {/* Actions row */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                onClose();
                onRunHealthCheck(animal);
              }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-xs transition"
            >
              <HeartPulse className="w-4 h-4" />
              <span>Run Health Check for {animal.name}</span>
            </button>
            <button
              onClick={() => {
                if (confirm(`Are you sure you want to remove ${animal.name} from your herd?`)) {
                  onDeleteAnimal(animal.id);
                  onClose();
                }
              }}
              className="p-2.5 rounded-xl border border-stone-200 text-stone-400 hover:text-red-600 hover:bg-red-50 transition"
              title="Delete Animal Profile"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Health History Timeline */}
          <div>
            <h3 className="text-sm font-bold text-stone-900 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-700" />
              <span>Health History & Assessment Timeline ({animalReports.length})</span>
            </h3>

            {animalReports.length > 0 ? (
              <div className="space-y-2.5">
                {animalReports.map((rep) => (
                  <div
                    key={rep.id}
                    onClick={() => {
                      onClose();
                      onSelectReport(rep);
                    }}
                    className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 hover:border-emerald-600 transition cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-stone-900">
                          {rep.result?.possibleConditions?.[0]?.name || 'Routine Assessment'}
                        </span>
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            rep.result?.riskLevel === 'Emergency' || rep.result?.riskLevel === 'High'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {rep.result?.riskLevel || 'Low'} Risk
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        {new Date(rep.createdAt).toLocaleDateString()} • {rep.symptoms?.join(', ') || 'No symptoms reported'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-stone-700">
                        {rep.result?.healthScore || 75}/100
                      </span>
                      <ChevronRight className="w-4 h-4 text-stone-400" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-center text-xs text-stone-500">
                No health scans recorded yet for {animal.name}.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-stone-50 px-6 py-3 border-t border-stone-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-200 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
