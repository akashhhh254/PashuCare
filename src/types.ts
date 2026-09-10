export type SupportedAnimalType = 'Cow' | 'Buffalo' | 'Goat' | 'Sheep' | 'Other';

export type Language = 'en' | 'hi' | 'mr';

export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Emergency';

export type HealthStatus = 'Healthy' | 'Needs Attention' | 'High Risk' | 'Emergency';

export interface PossibleCondition {
  name: string;
  confidence: number;
  reason: string;
}

export interface ImageQualityCheck {
  sufficient: boolean;
  reason: string;
}

export interface MedicationItem {
  category: string;
  name: string;
  purpose: string;
  dosageGuidance: string;
  caution?: string;
}

export interface DiseaseMedications {
  firstAidMedications: string[];
  veterinaryDrugs: string[];
  supportiveCare: string[];
  safetyPrecautions: string;
}

export interface AIHealthAnalysisResult {
  animalDetected: boolean;
  detectedAnimalType?: string;
  imageQuality?: ImageQualityCheck;
  overallHealthStatus: HealthStatus;
  riskLevel: RiskLevel;
  possibleConditions: PossibleCondition[];
  visibleSymptoms: string[];
  reportedSymptoms: string[];
  possibleCauses: string[];
  generalRecommendations: string[];
  preventionTips: string[];
  medicinesAndTreatment?: DiseaseMedications;
  veterinarianRecommended: boolean;
  emergency: boolean;
  healthScore: number;
  disclaimer: string;
  rawAIExplanation?: string;
}

export interface HealthReport {
  id: string;
  reportCode: string;
  userId: string;
  animalId?: string;
  animalName: string;
  animalType: SupportedAnimalType;
  photoUrl?: string;
  createdAt: string;
  symptoms: string[];
  temperature?: string;
  behavior?: string;
  additionalInfo?: string;
  result: AIHealthAnalysisResult;
  vetConsultationRequested?: boolean;
}

export interface AnimalProfile {
  id: string;
  userId: string;
  name: string;
  tagId: string; // e.g. "IN-MH-2024-409"
  type: SupportedAnimalType;
  age: string;
  gender: 'Female' | 'Male';
  breed: string;
  weight?: string;
  farmLocation: string;
  photoUrl?: string;
  healthScore: number;
  lastCheckDate?: string;
  status: 'Healthy' | 'Under Observation' | 'Critical';
  createdAt: string;
  updatedAt: string;
}

export type ReminderType = 'vaccination' | 'medicine' | 'deworming' | 'routine_checkup';

export interface HealthReminder {
  id: string;
  userId: string;
  animalId?: string;
  animalName: string;
  title: string;
  type: ReminderType;
  dueDate: string;
  completed: boolean;
  notes?: string;
  createdAt: string;
}

export type Reminder = HealthReminder;

export interface VetRequest {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  animalId?: string;
  animalName: string;
  animalType: string;
  symptoms: string[];
  preferredDate: string;
  preferredTime: string;
  description: string;
  reportId?: string;
  status: 'Pending' | 'Accepted' | 'Completed';
  vetNotes?: string;
  vetName?: string;
  createdAt: string;
}

export type VeterinarianRequest = VetRequest;

export interface DiseaseInfo {
  id: string;
  name: string;
  localNames: {
    hi?: string;
    mr?: string;
  };
  affectedAnimals: SupportedAnimalType[];
  commonSymptoms: string[];
  possibleCauses: string[];
  prevention: string[];
  generalCare: string[];
  whenToSeekVet: string;
  severity: RiskLevel;
  medicinesAndTreatment?: DiseaseMedications;
}

export interface UserProfile {
  id: string;
  name: string;
  surname?: string;
  username?: string;
  phone: string;
  email: string;
  preferredLanguage: Language;
  farmName: string;
  farmLocation: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  role: 'farmer' | 'admin';
  photoUrl?: string;
  createdAt: string;
}

export interface AdminAnalytics {
  totalUsers: number;
  totalHealthChecks: number;
  animalTypesAnalyzed: Record<string, number>;
  highRiskReports: number;
  mostSearchedConditions: { name: string; count: number }[];
  monthlyAnalysisCount: { month: string; count: number }[];
  pendingVetRequests: number;
}

export type NotificationCategory = 'vaccination' | 'vet_response' | 'urgent_alert' | 'system';

export interface PushNotificationItem {
  id: string;
  userId: string;
  title: string;
  body: string;
  category: NotificationCategory;
  relatedId?: string; // e.g. reminderId or vetRequestId
  read: boolean;
  urgent?: boolean;
  createdAt: string;
  data?: Record<string, string>;
}

export type PushPermissionStatus = 'default' | 'granted' | 'denied' | 'unsupported';

