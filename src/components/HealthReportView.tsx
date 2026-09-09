import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Download,
  Share2,
  Printer,
  PhoneCall,
  ChevronLeft,
  Calendar,
  Sparkles,
  Info,
  Check,
  Copy
} from 'lucide-react';
import { HealthReport, Language } from '../types';
import { translations, getTranslation } from '../i18n/translations';
import { generateHealthReportPDF } from '../utils/pdfGenerator';

interface HealthReportViewProps {
  report: HealthReport;
  language: Language;
  onBack: () => void;
  onRequestVet: (report: HealthReport) => void;
}

export const HealthReportView: React.FC<HealthReportViewProps> = ({
  report,
  language,
  onBack,
  onRequestVet,
}) => {
  const t = (key: keyof typeof translations['en']) => getTranslation(language, key);
  const [shareNotice, setShareNotice] = useState<string | null>(null);

  const { result } = report;
  const isEmergency = result?.emergency || result?.riskLevel === 'Emergency' || result?.riskLevel === 'High';
  const healthScore = result?.healthScore || 70;

  // Share handler
  const handleShare = async () => {
    const textToShare = `*PashuCare AI Animal Health Assessment*\nAnimal: ${report.animalName} (${report.animalType})\nRisk Level: ${result?.riskLevel}\nHealth Score: ${healthScore}/100\nPossible Condition: ${result?.possibleConditions?.[0]?.name || 'N/A'}\nDisclaimer: AI results are preliminary. Consult a qualified veterinarian.`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `PashuCare AI Report - ${report.animalName}`,
          text: textToShare,
          url: window.location.href,
        });
        return;
      } catch (err) {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(textToShare);
      setShareNotice('Report summary copied to clipboard! You can paste in WhatsApp.');
      setTimeout(() => setShareNotice(null), 4000);
    } catch (e) {
      setShareNotice('Could not copy report text.');
      setTimeout(() => setShareNotice(null), 3000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    generateHealthReportPDF(report);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
      {/* Top back & actions bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 print:hidden">
        <button
          onClick={onBack}
          id="report-back-btn"
          className="flex items-center gap-1.5 text-sm font-semibold text-stone-600 hover:text-stone-900 transition"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{t('btnNewCheck')}</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            id="report-share-btn"
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-stone-300 text-stone-700 bg-white hover:bg-stone-50 text-xs font-semibold shadow-2xs"
          >
            <Share2 className="w-3.5 h-3.5 text-stone-600" />
            <span>{t('btnShareReport')}</span>
          </button>
          <button
            onClick={handlePrint}
            id="report-print-btn"
            className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-lg border border-stone-300 text-stone-700 bg-white hover:bg-stone-50 text-xs font-semibold shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 text-stone-600" />
            <span>{t('btnPrintReport')}</span>
          </button>
          <button
            onClick={handleDownloadPDF}
            id="report-download-pdf-btn"
            className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-sm transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t('btnDownloadPdf')}</span>
          </button>
        </div>
      </div>

      {/* Share notification toast */}
      {shareNotice && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-xs">
          <span>{shareNotice}</span>
          <Check className="w-4 h-4 text-emerald-700" />
        </div>
      )}

      {/* Emergency Veterinary Warning Banner if applicable */}
      {isEmergency && (
        <div
          id="emergency-alert-card"
          className="mb-6 p-4 sm:p-5 rounded-2xl bg-red-50 border-2 border-red-300 text-red-900 shadow-sm"
        >
          <div className="flex items-start gap-3.5">
            <ShieldAlert className="w-7 h-7 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h2 className="text-base sm:text-lg font-extrabold text-red-900">
                {t('emergencyWarning')}
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-red-800">
                {t('emergencyDesc')}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => onRequestVet(report)}
                  id="emergency-consult-vet-btn"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs sm:text-sm font-bold shadow-xs transition"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>{t('btnContactVet')}</span>
                </button>
                <a
                  href="tel:1962"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-red-300 text-red-800 hover:bg-red-100 text-xs sm:text-sm font-bold transition"
                >
                  <span>Call Emergency 1962</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Report Card */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        
        {/* Report Card Header */}
        <div className="bg-stone-50 border-b border-stone-200 p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                Preliminary Assessment
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 mt-2">
                {t('reportTitle')}
              </h1>
              <p className="text-xs text-stone-500 mt-1 flex items-center gap-2">
                <span>Code: <strong>{report.reportCode || report.id}</strong></span>
                <span>•</span>
                <span>{new Date(report.createdAt).toLocaleDateString()} {new Date(report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </p>
            </div>

            {/* Overall Status Badge */}
            <div className="text-right">
              <span
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-extrabold border ${
                  report.result?.riskLevel === 'Emergency' || report.result?.riskLevel === 'High'
                    ? 'bg-red-100 text-red-800 border-red-200'
                    : report.result?.riskLevel === 'Medium'
                    ? 'bg-amber-100 text-amber-800 border-amber-200'
                    : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                }`}
              >
                {report.result?.overallHealthStatus || 'Healthy'}
              </span>
            </div>
          </div>

          {/* Animal Profile Overview */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-white border border-stone-200 text-xs sm:text-sm">
            <div>
              <span className="text-stone-400 block text-[11px] font-semibold">Animal Name</span>
              <strong className="text-stone-800 font-bold">{report.animalName || 'Livestock'}</strong>
            </div>
            <div>
              <span className="text-stone-400 block text-[11px] font-semibold">Category</span>
              <strong className="text-stone-800 font-bold">{report.animalType}</strong>
            </div>
            <div>
              <span className="text-stone-400 block text-[11px] font-semibold">Reported Temp</span>
              <strong className="text-stone-800 font-bold">{report.temperature || 'Normal'}</strong>
            </div>
            <div>
              <span className="text-stone-400 block text-[11px] font-semibold">Behavior</span>
              <strong className="text-stone-800 font-bold">{report.behavior || 'Active'}</strong>
            </div>
          </div>
        </div>

        {/* Report Card Body */}
        <div className="p-6 sm:p-8 space-y-8">
          
          {/* Health Score & Risk Level Visual */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 rounded-2xl bg-stone-50 border border-stone-200">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-600">
                  {t('reportHealthScore')}
                </span>
                <span className="text-lg font-black text-stone-900">
                  {healthScore} <span className="text-xs font-normal text-stone-500">/ 100</span>
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-stone-200 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    healthScore >= 75
                      ? 'bg-emerald-600'
                      : healthScore >= 50
                      ? 'bg-amber-500'
                      : 'bg-red-600'
                  }`}
                  style={{ width: `${healthScore}%` }}
                />
              </div>
              <p className="text-[11px] text-stone-500 mt-2">
                {t('reportHealthScoreSubtitle')}
              </p>
            </div>

            <div className="flex flex-col justify-center">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                {t('reportRisk')}
              </span>
              <div className="flex items-center gap-2">
                <span
                  className={`text-base font-extrabold px-3 py-1 rounded-lg ${
                    result?.riskLevel === 'Emergency' || result?.riskLevel === 'High'
                      ? 'bg-red-600 text-white'
                      : result?.riskLevel === 'Medium'
                      ? 'bg-amber-500 text-white'
                      : 'bg-emerald-700 text-white'
                  }`}
                >
                  {result?.riskLevel || 'Low'} Risk
                </span>
                <span className="text-xs text-stone-500">
                  Veterinary check: {result?.veterinarianRecommended ? 'Recommended' : 'Optional'}
                </span>
              </div>
            </div>
          </div>

          {/* Photo & Detected Findings */}
          {report.photoUrl && (
            <div>
              <h3 className="text-sm font-bold text-stone-900 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-700" />
                <span>Uploaded Photo & Visual Findings</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
                <div className="rounded-xl overflow-hidden border border-stone-200 max-h-56 bg-stone-100">
                  <img
                    src={report.photoUrl}
                    alt="Analyzed Animal"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="sm:col-span-2 space-y-2">
                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs">
                    <strong className="text-stone-700 block mb-1">Image Quality:</strong>
                    <span className="text-stone-600">
                      {result?.imageQuality?.reason || 'Clear view of animal subject.'}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs">
                    <strong className="text-stone-700 block mb-1">Signs Visible to AI:</strong>
                    <ul className="list-disc list-inside text-stone-600 space-y-0.5">
                      {result?.visibleSymptoms?.map((s, idx) => (
                        <li key={idx}>{s}</li>
                      )) || <li>No obvious exterior lesion identified.</li>}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Suspected Conditions */}
          <div>
            <h3 className="text-base font-bold text-stone-900 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>{t('reportPossibleCondition')}</span>
            </h3>

            <div className="space-y-3">
              {result?.possibleConditions?.map((cond, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 hover:bg-stone-50 transition"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm sm:text-base font-bold text-stone-900">
                      {cond.name}
                    </h4>
                    <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800">
                      AI Confidence: {cond.confidence}%
                    </span>
                  </div>
                  <p className="mt-2 text-xs sm:text-sm text-stone-600">
                    <strong>{t('reportWhySuspects')}:</strong> {cond.reason}
                  </p>
                </div>
              )) || (
                <p className="text-xs text-stone-500">No acute condition suspected.</p>
              )}
            </div>
          </div>

          {/* Symptoms Table */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-stone-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                Reported by Farmer
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {report.symptoms?.length > 0 ? (
                  report.symptoms.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md bg-stone-100 text-stone-700 text-xs font-medium"
                    >
                      {s}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-stone-400">No symptoms explicitly marked</span>
                )}
              </div>
              {report.additionalInfo && (
                <p className="mt-3 text-xs text-stone-600 border-t border-stone-100 pt-2 italic">
                  "{report.additionalInfo}"
                </p>
              )}
            </div>

            <div className="p-4 rounded-xl border border-stone-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                {t('reportPossibleCauses')}
              </h4>
              <ul className="text-xs text-stone-600 space-y-1 list-disc list-inside">
                {result?.possibleCauses?.map((cause, idx) => (
                  <li key={idx}>{cause}</li>
                )) || <li>Environmental stress, nutritional imbalance, or infectious pathogen.</li>}
              </ul>
            </div>
          </div>

          {/* General Recommendations & Safe Care */}
          <div>
            <h3 className="text-base font-bold text-stone-900 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>{t('reportNextSteps')} (Safe Care)</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {result?.generalRecommendations?.map((rec, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-100 text-xs sm:text-sm text-stone-700 flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-200 text-emerald-800 font-bold text-xs flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span>{rec}</span>
                </div>
              )) || (
                <p className="text-xs text-stone-500">Provide clean water and soft roughage.</p>
              )}
            </div>
          </div>

          {/* Prevention & Biosecurity Tips */}
          {result?.preventionTips && result.preventionTips.length > 0 && (
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm text-stone-700">
              <h4 className="font-bold text-stone-900 mb-2">
                {t('reportPrevention')}
              </h4>
              <ul className="list-disc list-inside space-y-1 text-stone-600">
                {result.preventionTips.map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Vet Recommendation section & Request CTA */}
          <div className="p-5 rounded-2xl bg-stone-900 text-white flex flex-wrap items-center justify-between gap-4">
            <div className="max-w-md">
              <h4 className="text-base font-bold flex items-center gap-2 text-emerald-400">
                <PhoneCall className="w-4 h-4" />
                <span>{t('reportVetRecommendation')}</span>
              </h4>
              <p className="text-xs text-stone-300 mt-1">
                {result?.veterinarianRecommended ? t('reportVetNeeded') : t('reportVetNotUrgent')}
              </p>
            </div>

            <button
              onClick={() => onRequestVet(report)}
              id="request-vet-from-report-btn"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-md transition active:scale-95 flex items-center gap-2"
            >
              <span>{t('btnContactVet')}</span>
            </button>
          </div>

          {/* Mandatory Disclaimer Footer */}
          <div className="p-4 rounded-xl bg-stone-100 border border-stone-200 text-stone-500 text-xs italic">
            <p>
              <strong>Disclaimer:</strong> {result?.disclaimer || t('disclaimerFull')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
