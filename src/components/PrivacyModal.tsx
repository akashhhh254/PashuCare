import React from 'react';
import {
  X,
  ShieldCheck,
  Lock,
  Trash2,
  AlertTriangle,
  RefreshCw,
  FileText
} from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClearLocalCache: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({
  isOpen,
  onClose,
  onClearLocalCache,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-stone-200 overflow-hidden my-8">
        {/* Header */}
        <div className="p-6 bg-stone-50 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-emerald-700" />
            <div>
              <h2 className="text-lg font-extrabold text-stone-900">
                Privacy, Data Ownership & Clinical Boundaries
              </h2>
              <p className="text-xs text-stone-500">
                PashuCare AI Farmer Trust & Data Protection Charter
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto text-xs sm:text-sm text-stone-700 leading-relaxed">
          {/* Section 1: Clinical Safety Boundaries */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950">
            <h3 className="font-bold text-sm mb-1 flex items-center gap-2 text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              <span>Veterinary Clinical Boundaries</span>
            </h3>
            <p>
              PashuCare AI is an advisory and triage tool built to assist farmers in early symptom awareness. 
              <strong> It does not replace physical examination, palpation, auscultation, or laboratory diagnostics by a registered Veterinary Medical Officer.</strong>
            </p>
            <p className="mt-2">
              The AI will never prescribe prescription antibiotic dosages or unsafe drenching treatments. Always follow instructions from authorized veterinarians.
            </p>
          </div>

          {/* Section 2: Farmer Data Ownership */}
          <div>
            <h3 className="font-bold text-stone-900 text-sm mb-2 flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-700" />
              <span>Farmer Data Ownership & Storage</span>
            </h3>
            <ul className="list-disc list-inside space-y-1.5 text-stone-600">
              <li>All animal photos, ear tags, and records belong strictly to the registered farmer.</li>
              <li>Images uploaded for health analysis are sent securely via server-side SSL encryption directly to Gemini AI and are never sold to commercial third parties.</li>
              <li>Data is cached locally on your device for offline resilience in rural barns and remote pastures.</li>
            </ul>
          </div>

          {/* Section 3: Data Control Actions */}
          <div className="pt-4 border-t border-stone-100 space-y-3">
            <h3 className="font-bold text-stone-900 text-sm">
              Your Data Controls & Clear Cache
            </h3>
            <p className="text-xs text-stone-500">
              You can remove any animal profile, delete any historical health card at any time from its individual page, or purge offline cache.
            </p>

            <button
              onClick={() => {
                if (confirm('Clear local browser cache and reload? Your cloud saved animals remain safe.')) {
                  onClearLocalCache();
                  onClose();
                }
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs transition"
            >
              <RefreshCw className="w-3.5 h-3.5 text-stone-600" />
              <span>Clear Local Device Cache & Reload</span>
            </button>
          </div>
        </div>

        <div className="p-4 bg-stone-50 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-500">
          <span className="text-[11px] font-medium text-stone-600">
            © 2026 PashuCare AI • Made for people & farmers • All rights reserved
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
