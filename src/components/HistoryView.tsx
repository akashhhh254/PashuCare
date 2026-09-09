import React, { useState } from 'react';
import {
  Clock,
  Search,
  Filter,
  FileText,
  Download,
  Trash2,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  PhoneCall
} from 'lucide-react';
import { HealthReport, Language } from '../types';
import { translations, getTranslation } from '../i18n/translations';
import { generateHealthReportPDF } from '../utils/pdfGenerator';

interface HistoryViewProps {
  reports: HealthReport[];
  language: Language;
  onSelectReport: (report: HealthReport) => void;
  onDeleteReport: (reportId: string) => Promise<void>;
  onStartNewCheck: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  reports,
  language,
  onSelectReport,
  onDeleteReport,
  onStartNewCheck,
}) => {
  const t = (key: keyof typeof translations['en']) => getTranslation(language, key);

  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('All');
  const [animalFilter, setAnimalFilter] = useState<string>('All');

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      (report.animalName && report.animalName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (report.reportCode && report.reportCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (report.symptoms && report.symptoms.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()))) ||
      (report.result?.possibleConditions &&
        report.result.possibleConditions.some((c) => c.name.toLowerCase().includes(searchTerm.toLowerCase())));

    const matchesRisk = riskFilter === 'All' || report.result?.riskLevel === riskFilter;
    const matchesAnimal = animalFilter === 'All' || report.animalType === animalFilter;

    return matchesSearch && matchesRisk && matchesAnimal;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2.5">
            <Clock className="w-7 h-7 text-emerald-700" />
            <span>{t('navHistory')}</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Historical record of all AI health checks, image analyses, and veterinary advisories.
          </p>
        </div>

        <button
          onClick={onStartNewCheck}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold shadow-md transition"
        >
          <Sparkles className="w-4 h-4 text-emerald-200" />
          <span>{t('btnNewCheck')}</span>
        </button>
      </div>

      {/* Search & Filter bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-white border border-stone-200 shadow-2xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by animal name, condition, or symptom..."
            className="w-full pl-9 pr-3 py-2 rounded-xl text-xs sm:text-sm border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Risk Level Filter */}
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="text-xs font-semibold px-2.5 py-2 rounded-xl border border-stone-300 bg-stone-50 text-stone-700"
          >
            <option value="All">All Risk Levels</option>
            <option value="Low">Low Risk</option>
            <option value="Medium">Medium Risk</option>
            <option value="High">High Risk</option>
            <option value="Emergency">Emergency</option>
          </select>

          {/* Animal Type Filter */}
          <select
            value={animalFilter}
            onChange={(e) => setAnimalFilter(e.target.value)}
            className="text-xs font-semibold px-2.5 py-2 rounded-xl border border-stone-300 bg-stone-50 text-stone-700"
          >
            <option value="All">All Animals</option>
            <option value="Cow">Cow</option>
            <option value="Buffalo">Buffalo</option>
            <option value="Goat">Goat</option>
            <option value="Sheep">Sheep</option>
          </select>
        </div>
      </div>

      {/* Reports List */}
      {filteredReports.length > 0 ? (
        <div className="space-y-3">
          {filteredReports.map((report) => {
            const risk = report.result?.riskLevel || 'Medium';
            const healthScore = report.result?.healthScore || 70;

            return (
              <div
                key={report.id}
                className="bg-white rounded-2xl border border-stone-200 hover:border-emerald-600 transition shadow-2xs p-4 sm:p-5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-4"
              >
                {/* Left: Thumbnail & Details */}
                <div
                  onClick={() => onSelectReport(report)}
                  className="flex items-center gap-4 cursor-pointer flex-1"
                >
                  <div className="w-14 h-14 rounded-2xl bg-stone-100 border border-stone-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {report.photoUrl ? (
                      <img
                        src={report.photoUrl}
                        alt={report.animalName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl">
                        {report.animalType === 'Cow' ? '🐄' : report.animalType === 'Buffalo' ? '🐃' : report.animalType === 'Goat' ? '🐐' : '🐑'}
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-sm sm:text-base text-stone-900">
                        {report.animalName || 'Livestock'}
                      </h3>
                      <span className="text-xs text-stone-500">
                        ({report.animalType})
                      </span>
                      <span className="text-[11px] font-mono text-stone-400">
                        {report.reportCode || report.id}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-emerald-800 mt-0.5">
                      {report.result?.possibleConditions?.[0]?.name || 'Assessment Complete'}
                    </p>

                    <div className="text-[11px] text-stone-500 mt-1 flex flex-wrap items-center gap-2">
                      <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{report.symptoms?.slice(0, 3).join(', ') || 'General check'}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Score, Risk Badge & Actions */}
                <div className="flex items-center gap-3 sm:gap-4 ml-auto">
                  <div className="text-right hidden sm:block">
                    <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                      Health
                    </span>
                    <strong className="text-sm font-black text-stone-800">
                      {healthScore}/100
                    </strong>
                  </div>

                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      risk === 'Emergency' || risk === 'High'
                        ? 'bg-red-100 text-red-800'
                        : risk === 'Medium'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {risk} Risk
                  </span>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => generateHealthReportPDF(report)}
                      className="p-2 rounded-xl border border-stone-200 text-stone-600 hover:text-emerald-700 hover:bg-emerald-50 transition"
                      title="Download PDF"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onSelectReport(report)}
                      className="p-2 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition font-bold text-xs flex items-center gap-1"
                    >
                      <span>View</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Delete this health report?')) {
                          onDeleteReport(report.id);
                        }
                      }}
                      className="p-2 rounded-xl text-stone-400 hover:text-red-600 hover:bg-red-50 transition"
                      title="Delete Report"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 rounded-3xl bg-white border border-stone-200 text-center max-w-md mx-auto">
          <FileText className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="font-bold text-stone-900 text-base">No Reports Found</h3>
          <p className="text-xs text-stone-500 mt-1">
            {searchTerm ? 'No reports match your filters.' : 'Run your first animal health check to start accumulating history.'}
          </p>
          <button
            onClick={onStartNewCheck}
            className="mt-4 px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold shadow-xs hover:bg-emerald-800 transition"
          >
            {t('heroPrimaryBtn')}
          </button>
        </div>
      )}
    </div>
  );
};
