import {
  AIHealthAnalysisResult,
  StrictAIHealthAnalysis,
  StrictSeverity,
  RiskLevel,
  HealthStatus
} from '../types';

/**
 * Safely extracts JSON from model or server response that may contain
 * markdown code blocks, HTML tags, or surrounding text.
 */
export function safeExtractJson(rawText: string): any {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('Response is empty or invalid format.');
  }

  // Check if response is an HTML page (e.g. 502/504 error page from Cloud Run or Express)
  const trimmed = rawText.trim();
  if (
    trimmed.startsWith('<!DOCTYPE') ||
    trimmed.startsWith('<html') ||
    trimmed.startsWith('<body') ||
    trimmed.includes('<title>The page cannot') ||
    trimmed.includes('The page could not be loaded') ||
    trimmed.includes('The page cannot be found')
  ) {
    throw new Error('HTML_ERROR_PAGE');
  }

  // 1. Direct parse attempt
  try {
    return JSON.parse(trimmed);
  } catch {
    // Continue to fallback parsing
  }

  // 2. Remove markdown code blocks ```json ... ```
  let cleaned = trimmed.replace(/```json\s*/gi, '').replace(/```\s*$/gi, '').replace(/```/g, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    // Continue to regex extraction
  }

  // 3. Extract matching JSON object { ... }
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch {
      // Continue
    }
  }

  throw new Error('MALFORMED_JSON');
}

/**
 * Validates and strictly normalizes an AI Health Analysis response to match
 * the required Section 4 schema, while maintaining backward-compatible mappings.
 */
export function validateAndNormalizeAIResponse(
  raw: any,
  fallbackContext: {
    species?: string;
    animalName?: string;
    breed?: string;
    age?: string;
    sex?: string;
    symptoms?: string[];
  }
): AIHealthAnalysisResult {
  if (!raw || typeof raw !== 'object') {
    throw new Error('AI response data is not an object.');
  }

  // Animal Section validation
  const rawAnimal = raw.animal || {};
  const species = String(rawAnimal.species || fallbackContext.species || 'Animal').trim();
  const breed = String(rawAnimal.breed || fallbackContext.breed || '').trim();
  const name = String(rawAnimal.name || fallbackContext.animalName || '').trim();
  const age = String(rawAnimal.age || fallbackContext.age || '').trim();
  const sex = String(rawAnimal.sex || fallbackContext.sex || '').trim();

  // Analysis Section validation
  const rawAnalysis = raw.analysis || {};
  
  // Severity normalization
  let rawSeverity = String(rawAnalysis.severity || raw.severity || raw.riskLevel || 'low').toLowerCase();
  let severity: StrictSeverity = 'low';
  if (['emergency', 'critical', 'severe'].includes(rawSeverity)) severity = 'emergency';
  else if (['high'].includes(rawSeverity)) severity = 'high';
  else if (['moderate', 'medium'].includes(rawSeverity)) severity = 'moderate';
  else severity = 'low';

  // Confidence normalization (0 to 100)
  let confidence = Number(rawAnalysis.confidence ?? raw.confidence ?? 75);
  if (isNaN(confidence) || confidence < 0) confidence = 70;
  if (confidence > 100) confidence = 100;

  // Possible conditions normalization
  const rawConditions = Array.isArray(rawAnalysis.possible_conditions)
    ? rawAnalysis.possible_conditions
    : Array.isArray(raw.possibleConditions)
    ? raw.possibleConditions
    : [];

  const possible_conditions = rawConditions.map((cond: any) => {
    if (typeof cond === 'string') {
      return {
        name: cond,
        confidence: Math.round(confidence),
        reason: 'Identified based on clinical signs, species considerations, and observed symptoms.'
      };
    }
    return {
      name: String(cond.name || cond.condition || 'Observation'),
      confidence: Number(cond.confidence ?? confidence),
      reason: String(cond.reason || cond.explanation || 'Based on observed symptoms.')
    };
  });

  // Observed symptoms normalization
  const observed_symptoms: string[] = Array.isArray(rawAnalysis.observed_symptoms)
    ? rawAnalysis.observed_symptoms.map(String)
    : Array.isArray(raw.visibleSymptoms)
    ? raw.visibleSymptoms.map(String)
    : Array.isArray(fallbackContext.symptoms)
    ? fallbackContext.symptoms
    : [];

  // Summary
  const summary = String(
    rawAnalysis.summary ||
    raw.summary ||
    raw.rawAIExplanation ||
    `Health analysis performed for ${species}.`
  ).trim();

  // Recommendations
  const recommendations: string[] = Array.isArray(raw.recommendations)
    ? raw.recommendations.map(String)
    : Array.isArray(raw.generalRecommendations)
    ? raw.generalRecommendations.map(String)
    : ['Ensure access to clean drinking water and adequate ventilation.'];

  // Immediate Actions
  const immediate_actions: string[] = Array.isArray(raw.immediate_actions)
    ? raw.immediate_actions.map(String)
    : Array.isArray(raw.immediateActions)
    ? raw.immediateActions.map(String)
    : ['Isolate animal in a clean, quiet environment to reduce stress.'];

  // Warning Signs
  const warning_signs: string[] = Array.isArray(raw.warning_signs)
    ? raw.warning_signs.map(String)
    : Array.isArray(raw.warningSigns)
    ? raw.warningSigns.map(String)
    : ['Sudden collapse or inability to stand', 'Extreme respiratory distress', 'Severe dehydration'];

  // Vet requirement & Emergency
  const veterinarian_required = Boolean(
    raw.veterinarian_required ??
    raw.veterinarianRecommended ??
    severity === 'high' ??
    severity === 'emergency'
  );

  const emergency = Boolean(
    raw.emergency ??
    (severity === 'emergency')
  );

  // Strict schema bundle
  const strictAnalysis: StrictAIHealthAnalysis = {
    animal: {
      species,
      breed,
      name,
      age,
      sex
    },
    analysis: {
      possible_conditions,
      observed_symptoms,
      severity,
      confidence,
      summary
    },
    recommendations,
    immediate_actions,
    warning_signs,
    veterinarian_required,
    emergency
  };

  // Backwards-compatible mappings for existing UI & PDF generator
  const riskLevel: RiskLevel =
    severity === 'emergency' ? 'Emergency' : severity === 'high' ? 'High' : severity === 'moderate' ? 'Medium' : 'Low';

  const overallHealthStatus: HealthStatus =
    severity === 'emergency' ? 'Emergency' : severity === 'high' ? 'High Risk' : severity === 'moderate' ? 'Needs Attention' : 'Healthy';

  // Compute calculated health score (100 is pristine, lower is higher risk)
  let healthScore = 85;
  if (severity === 'emergency') healthScore = Math.max(15, 100 - confidence);
  else if (severity === 'high') healthScore = Math.max(35, 100 - Math.round(confidence * 0.7));
  else if (severity === 'moderate') healthScore = Math.max(55, 100 - Math.round(confidence * 0.45));
  else healthScore = Math.min(96, Math.max(78, 100 - Math.round(confidence * 0.2)));

  return {
    animalDetected: true,
    detectedAnimalType: species,
    overallHealthStatus,
    riskLevel,
    possibleConditions: possible_conditions.map((c) => ({
      name: c.name,
      confidence: c.confidence,
      reason: c.reason
    })),
    visibleSymptoms: observed_symptoms,
    reportedSymptoms: fallbackContext.symptoms || [],
    possibleCauses: possible_conditions.map((c) => c.name),
    generalRecommendations: recommendations,
    preventionTips: warning_signs,
    medicinesAndTreatment: {
      firstAidMedications: immediate_actions,
      veterinaryDrugs: veterinarian_required
        ? ['Consult a qualified veterinarian for prescription medication and exact dosage.']
        : ['Routine supportive care and monitoring.'],
      supportiveCare: recommendations,
      safetyPrecautions: 'Never administer prescription antibiotics or human NSAIDs without a veterinarian consultation.'
    },
    veterinarianRecommended: veterinarian_required,
    emergency,
    healthScore,
    disclaimer:
      'This assessment is powered by AI and provides preliminary guidance. It does not replace professional veterinary examination, diagnosis, or clinical prescription.',
    rawAIExplanation: summary,
    // Extra fields
    strictAnalysis,
    summary,
    immediateActions: immediate_actions,
    warningSigns: warning_signs
  };
}

/**
 * Robust fetch wrapper that prevents HTML or network errors from crashing JSON parsing
 */
export async function safeFetchJson<T = any>(
  url: string,
  options?: RequestInit
): Promise<{
  ok: boolean;
  status: number;
  data: T | null;
  errorMessage: string | null;
}> {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';
    const text = await res.text();

    // Check if body is an HTML error page
    const trimmed = text.trim();
    if (
      contentType.includes('text/html') ||
      trimmed.startsWith('<!DOCTYPE') ||
      trimmed.startsWith('<html') ||
      trimmed.startsWith('<body') ||
      trimmed.includes('The page cannot') ||
      trimmed.includes('The page could not')
    ) {
      return {
        ok: false,
        status: res.status,
        data: null,
        errorMessage: 'Unable to complete the health analysis right now. Please try again.'
      };
    }

    try {
      const parsed = safeExtractJson(text);
      if (!res.ok) {
        return {
          ok: false,
          status: res.status,
          data: parsed,
          errorMessage: parsed?.message || 'Unable to complete the health analysis right now. Please try again.'
        };
      }
      return {
        ok: true,
        status: res.status,
        data: parsed,
        errorMessage: null
      };
    } catch {
      return {
        ok: false,
        status: res.status,
        data: null,
        errorMessage: 'Unable to complete the health analysis right now. Please try again.'
      };
    }
  } catch (err: any) {
    console.error('Fetch error:', err);
    return {
      ok: false,
      status: 0,
      data: null,
      errorMessage: 'Network connection failed. Please check your internet connection and try again.'
    };
  }
}
