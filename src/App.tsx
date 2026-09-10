import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles } from 'lucide-react';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { Footer } from './components/Footer';
import { OfflineIndicator } from './components/OfflineIndicator';
import { ForegroundNotificationToast } from './components/ForegroundNotificationToast';
import { NotificationCenter } from './components/NotificationCenter';
import { AuthModal } from './components/AuthModal';
import { PrivacyModal } from './components/PrivacyModal';
import { AnimalDetailModal } from './components/AnimalDetailModal';
import { AskAssistantModal } from './components/AskAssistantModal';

// Views
import { LandingView } from './components/LandingView';
import { HomeView } from './components/HomeView';
import { DashboardView } from './components/DashboardView';
import { HealthCheckForm } from './components/HealthCheckForm';
import { HealthReportView } from './components/HealthReportView';
import { AnimalsView } from './components/AnimalsView';
import { HistoryView } from './components/HistoryView';
import { DiseaseLibraryView } from './components/DiseaseLibraryView';
import { RemindersView } from './components/RemindersView';
import { VeterinarianView } from './components/VeterinarianView';
import { AdminView } from './components/AdminView';
import { ProfileView } from './components/ProfileView';

import {
  AnimalProfile,
  HealthReport,
  Reminder,
  VeterinarianRequest,
  UserProfile,
  Language,
  PushNotificationItem,
  PushPermissionStatus,
} from './types';

import {
  onAuthUserChanged,
  getUserProfileFromFirestore,
  handleRedirectAuthResult,
  logOutFromFirebase,
  subscribeToAnimals,
  addAnimalToFirestore,
  updateAnimalInFirestore,
  deleteAnimalFromFirestore,
  subscribeToReports,
  addReportToFirestore,
  deleteReportFromFirestore,
  subscribeToReminders,
  addReminderToFirestore,
  toggleReminderInFirestore,
  deleteReminderFromFirestore,
  subscribeToVetRequests,
  addVetRequestToFirestore,
  subscribeToNotifications,
  addNotificationToFirestore,
  markNotificationAsReadInFirestore,
  deleteNotificationFromFirestore,
  requestPushNotificationPermission,
  subscribeToForegroundFCM,
  dispatchVaccinationAlert,
  dispatchUrgentVetResponseAlert,
} from './lib/firebase';

export const App: React.FC = () => {
  // 1. Language State
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pashucare_lang') as Language;
      if (saved && (saved === 'en' || saved === 'hi' || saved === 'mr')) {
        return saved;
      }
    }
    return 'en';
  });

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('pashucare_lang', lang);
    }
  };

  // 2. User & Auth State
  const [user, setUser] = useState<UserProfile | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('pashucare_user');
        if (cached) return JSON.parse(cached);
      } catch {
        // ignore
      }
    }
    return null;
  });

  // 3. Navigation State
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [activeReport, setActiveReport] = useState<HealthReport | null>(null);
  const [selectedAnimal, setSelectedAnimal] = useState<AnimalProfile | null>(null);
  const [preselectedAnimalForCheck, setPreselectedAnimalForCheck] = useState<AnimalProfile | null>(null);
  const [preselectedReportForVet, setPreselectedReportForVet] = useState<HealthReport | null>(null);

  // 4. Modals State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authInitialTab, setAuthInitialTab] = useState<'signin' | 'register'>('register');
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const [isAskAssistantOpen, setIsAskAssistantOpen] = useState(false);
  const [assistantAnimal, setAssistantAnimal] = useState<AnimalProfile | null>(null);

  // 5. Data Collections State
  const [animals, setAnimals] = useState<AnimalProfile[]>([]);
  const [reports, setReports] = useState<HealthReport[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [vetRequests, setVetRequests] = useState<VeterinarianRequest[]>([]);
  const [notifications, setNotifications] = useState<PushNotificationItem[]>([]);
  const [foregroundToast, setForegroundToast] = useState<PushNotificationItem | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<PushPermissionStatus>('default');

  // Load initial fallback data from local API backend
  const fetchBackendData = useCallback(async (userId?: string) => {
    try {
      const q = userId ? `?userId=${encodeURIComponent(userId)}` : '';
      const [animRes, repRes, remRes, vetRes] = await Promise.allSettled([
        fetch(`/api/animals${q}`).then((r) => (r.ok ? r.json() : [])),
        fetch(`/api/reports${q}`).then((r) => (r.ok ? r.json() : [])),
        fetch(`/api/reminders${q}`).then((r) => (r.ok ? r.json() : [])),
        fetch(`/api/vet-requests${q}`).then((r) => (r.ok ? r.json() : [])),
      ]);

      if (animRes.status === 'fulfilled' && Array.isArray(animRes.value) && animRes.value.length > 0) {
        setAnimals((prev) => (prev.length === 0 ? animRes.value : prev));
      }
      if (repRes.status === 'fulfilled' && Array.isArray(repRes.value) && repRes.value.length > 0) {
        setReports((prev) => (prev.length === 0 ? repRes.value : prev));
      }
      if (remRes.status === 'fulfilled' && Array.isArray(remRes.value) && remRes.value.length > 0) {
        setReminders((prev) => (prev.length === 0 ? remRes.value : prev));
      }
      if (vetRes.status === 'fulfilled' && Array.isArray(vetRes.value) && vetRes.value.length > 0) {
        setVetRequests((prev) => (prev.length === 0 ? vetRes.value : prev));
      }
    } catch (e) {
      console.warn('Initial backend fetch note:', e);
    }
  }, []);

  // Handle Firebase redirect authentication results (e.g. mobile Google sign-in)
  useEffect(() => {
    handleRedirectAuthResult().then((profile) => {
      if (profile) {
        setUser(profile);
        localStorage.setItem('pashucare_user', JSON.stringify(profile));
      }
    });
  }, []);

  // Subscribe to Firebase Auth state
  useEffect(() => {
    const unsubscribeAuth = onAuthUserChanged(async (fbUser) => {
      if (fbUser) {
        try {
          const profile = await getUserProfileFromFirestore(fbUser.uid);
          if (profile) {
            setUser(profile);
            localStorage.setItem('pashucare_user', JSON.stringify(profile));
          } else {
            const fallbackProfile: UserProfile = {
              id: fbUser.uid,
              name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Farmer',
              email: fbUser.email || '',
              phone: fbUser.phoneNumber || '',
              preferredLanguage: language,
              farmName: `${fbUser.displayName || 'Farmer'}'s Livestock Farm`,
              farmLocation: 'Maharashtra, India',
              role: fbUser.email?.toLowerCase().includes('admin') ? 'admin' : 'farmer',
              createdAt: new Date().toISOString(),
            };
            setUser(fallbackProfile);
            localStorage.setItem('pashucare_user', JSON.stringify(fallbackProfile));
          }
        } catch {
          // If offline, preserve cached user
        }
      } else {
        const cached = localStorage.getItem('pashucare_user');
        if (!cached) {
          setUser(null);
        }
      }
    });

    return () => unsubscribeAuth();
  }, [language]);

  // Real-time Firestore sync & API fallback for active user
  useEffect(() => {
    const effectiveUserId = user?.id || 'farmer-1';

    // Fetch initial backend data
    fetchBackendData(effectiveUserId);

    // If user is authenticated, subscribe to Firestore real-time snapshots
    if (user?.id) {
      const unsubAnimals = subscribeToAnimals(user.id, (list) => {
        if (list.length > 0) setAnimals(list);
      });
      const unsubReports = subscribeToReports(user.id, (list) => {
        if (list.length > 0) setReports(list);
      });
      const unsubReminders = subscribeToReminders(user.id, (list) => {
        if (list.length > 0) setReminders(list);
      });
      const unsubVet = subscribeToVetRequests(user.id, (list) => {
        if (list.length > 0) setVetRequests(list);
      });
      const unsubNotifs = subscribeToNotifications(user.id, (list) => {
        setNotifications(list);
      });

      return () => {
        unsubAnimals();
        unsubReports();
        unsubReminders();
        unsubVet();
        unsubNotifs();
      };
    }
  }, [user?.id, fetchBackendData]);

  // Subscribe to FCM Foreground Messages
  useEffect(() => {
    const unsubFCM = subscribeToForegroundFCM((payload) => {
      const notifItem: PushNotificationItem = {
        id: `toast-${Date.now()}`,
        userId: user?.id || 'guest',
        title: payload.title,
        body: payload.body,
        category: payload.data?.category || 'general',
        read: false,
        urgent: payload.data?.urgent === 'true',
        createdAt: new Date().toISOString(),
        data: payload.data,
      };
      setForegroundToast(notifItem);
      setNotifications((prev) => [notifItem, ...prev]);
    });

    return () => unsubFCM();
  }, [user?.id]);

  // Check push permission status on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermissionStatus(Notification.permission as PushPermissionStatus);
    }
  }, []);

  // Navigation Helper
  const navigateTo = (tab: string) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Auth Modal Handlers
  const handleOpenAuth = (tab: 'signin' | 'register' = 'register') => {
    setAuthInitialTab(tab);
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = (authenticatedUser: UserProfile) => {
    setUser(authenticatedUser);
    localStorage.setItem('pashucare_user', JSON.stringify(authenticatedUser));
    setIsAuthModalOpen(false);
  };

  const handleSignOut = async () => {
    try {
      await logOutFromFirebase();
    } catch {
      // ignore
    }
    localStorage.removeItem('pashucare_user');
    setUser(null);
    setCurrentTab('home');
  };

  // Livestock Management Handlers
  const handleAddAnimal = async (animalData: Partial<AnimalProfile>) => {
    const newAnimal: AnimalProfile = {
      id: `animal-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      userId: user?.id || 'farmer-1',
      name: animalData.name || 'Unnamed Animal',
      tagId: animalData.tagId || `IN-${Date.now().toString().slice(-4)}`,
      type: animalData.type || 'Cow',
      breed: animalData.breed || 'Indigenous',
      age: animalData.age || '3',
      gender: (animalData.gender as 'Female' | 'Male') || 'Female',
      weight: animalData.weight,
      farmLocation: animalData.farmLocation || user?.farmLocation || 'Maharashtra, India',
      photoUrl: animalData.photoUrl,
      healthScore: animalData.healthScore || 85,
      lastCheckDate: new Date().toISOString().split('T')[0],
      status: animalData.status || 'Healthy',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Update local state
    setAnimals((prev) => [newAnimal, ...prev]);

    // Save to Firestore if user is authenticated
    if (user?.id) {
      try {
        await addAnimalToFirestore(newAnimal);
      } catch (err) {
        console.warn('Firestore animal add note:', err);
      }
    }

    // Also persist to local Express API
    try {
      await fetch('/api/animals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAnimal),
      });
    } catch (e) {
      console.warn('API animal add note:', e);
    }
  };

  const handleUpdateAnimal = async (updatedAnimal: AnimalProfile) => {
    setAnimals((prev) => prev.map((a) => (a.id === updatedAnimal.id ? updatedAnimal : a)));
    if (selectedAnimal?.id === updatedAnimal.id) {
      setSelectedAnimal(updatedAnimal);
    }

    if (user?.id) {
      try {
        await updateAnimalInFirestore(updatedAnimal);
      } catch (err) {
        console.warn('Firestore animal update note:', err);
      }
    }

    try {
      await fetch(`/api/animals/${updatedAnimal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedAnimal),
      });
    } catch (e) {
      console.warn('API animal update note:', e);
    }
  };

  const handleDeleteAnimal = async (animalId: string) => {
    setAnimals((prev) => prev.filter((a) => a.id !== animalId));
    if (selectedAnimal?.id === animalId) {
      setSelectedAnimal(null);
    }

    if (user?.id) {
      try {
        await deleteAnimalFromFirestore(animalId);
      } catch (err) {
        console.warn('Firestore animal delete note:', err);
      }
    }

    try {
      await fetch(`/api/animals/${animalId}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('API animal delete note:', e);
    }
  };

  // Health Check & Report Handlers
  const handleStartHealthCheck = (animal?: AnimalProfile) => {
    if (animal) {
      setPreselectedAnimalForCheck(animal);
    } else {
      setPreselectedAnimalForCheck(null);
    }
    setCurrentTab('check');
  };

  const handleReportGenerated = async (report: HealthReport) => {
    const enrichedReport: HealthReport = {
      ...report,
      userId: user?.id || 'farmer-1',
    };

    setActiveReport(enrichedReport);
    setReports((prev) => [enrichedReport, ...prev]);
    setCurrentTab('report');

    // Update the animal's lastCheckDate and status
    if (enrichedReport.animalId) {
      setAnimals((prev) =>
        prev.map((a) =>
          a.id === enrichedReport.animalId
            ? {
                ...a,
                lastCheckDate: new Date().toISOString().split('T')[0],
                healthScore: enrichedReport.result?.healthScore || a.healthScore,
                status:
                  enrichedReport.result?.riskLevel === 'Low'
                    ? 'Healthy'
                    : enrichedReport.result?.riskLevel === 'Emergency' || enrichedReport.result?.riskLevel === 'High'
                    ? 'Critical'
                    : 'Under Observation',
                updatedAt: new Date().toISOString(),
              }
            : a
        )
      );
    }

    if (user?.id) {
      try {
        await addReportToFirestore(enrichedReport);
      } catch (err) {
        console.warn('Firestore report save note:', err);
      }
    }

    try {
      await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(enrichedReport),
      });
    } catch (e) {
      console.warn('API report save note:', e);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    setReports((prev) => prev.filter((r) => r.id !== reportId));
    if (activeReport?.id === reportId) {
      setActiveReport(null);
      setCurrentTab('history');
    }

    if (user?.id) {
      try {
        await deleteReportFromFirestore(reportId);
      } catch (err) {
        console.warn('Firestore report delete note:', err);
      }
    }

    try {
      await fetch(`/api/reports/${reportId}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('API report delete note:', e);
    }
  };

  // Reminders Handlers
  const handleAddReminder = async (reminderData: Partial<Reminder>) => {
    const newReminder: Reminder = {
      id: `rem-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      userId: user?.id || 'farmer-1',
      title: reminderData.title || 'Vaccination Reminder',
      animalId: reminderData.animalId,
      animalName: reminderData.animalName || 'General Herd',
      type: reminderData.type || 'vaccination',
      dueDate: reminderData.dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      completed: false,
      notes: reminderData.notes,
      createdAt: new Date().toISOString(),
    };

    setReminders((prev) => [...prev, newReminder]);

    if (user?.id) {
      try {
        await addReminderToFirestore(newReminder);
      } catch (err) {
        console.warn('Firestore reminder add note:', err);
      }
    }

    try {
      await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReminder),
      });
    } catch (e) {
      console.warn('API reminder add note:', e);
    }
  };

  const handleToggleReminder = async (reminderId: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    setReminders((prev) =>
      prev.map((r) => (r.id === reminderId ? { ...r, completed: nextStatus } : r))
    );

    if (user?.id) {
      try {
        await toggleReminderInFirestore(reminderId, nextStatus);
      } catch (err) {
        console.warn('Firestore reminder toggle note:', err);
      }
    }

    try {
      await fetch(`/api/reminders/${reminderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: nextStatus }),
      });
    } catch (e) {
      console.warn('API reminder toggle note:', e);
    }
  };

  const handleDeleteReminder = async (reminderId: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== reminderId));

    if (user?.id) {
      try {
        await deleteReminderFromFirestore(reminderId);
      } catch (err) {
        console.warn('Firestore reminder delete note:', err);
      }
    }

    try {
      await fetch(`/api/reminders/${reminderId}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('API reminder delete note:', e);
    }
  };

  // Veterinarian Handlers
  const handleRequestVet = (report: HealthReport) => {
    setPreselectedReportForVet(report);
    setCurrentTab('vet');
  };

  const handleSubmitVetRequest = async (requestData: Partial<VeterinarianRequest>) => {
    const newRequest: VeterinarianRequest = {
      id: `vet-req-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      userId: user?.id || 'farmer-1',
      userName: requestData.userName || user?.name || 'Local Farmer',
      userPhone: requestData.userPhone || user?.phone || '9876543210',
      animalId: requestData.animalId,
      animalName: requestData.animalName || 'Livestock',
      animalType: requestData.animalType || 'Cow',
      symptoms: requestData.symptoms || [],
      preferredDate: requestData.preferredDate || new Date().toISOString().split('T')[0],
      preferredTime: requestData.preferredTime || 'Morning (8AM - 12PM)',
      description: requestData.description || 'Clinical consultation requested.',
      reportId: requestData.reportId,
      status: requestData.status || 'Pending',
      createdAt: new Date().toISOString(),
    };

    setVetRequests((prev) => [newRequest, ...prev]);

    if (user?.id) {
      try {
        await addVetRequestToFirestore(newRequest);
      } catch (err) {
        console.warn('Firestore vet request add note:', err);
      }
    }

    try {
      await fetch('/api/vet-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRequest),
      });
    } catch (e) {
      console.warn('API vet request add note:', e);
    }
  };

  // Push Notifications Handlers
  const handleEnablePush = async () => {
    const res = await requestPushNotificationPermission(user?.id);
    setPermissionStatus(res.status);
  };

  const handleMarkNotifAsRead = async (notifId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
    );
    if (user?.id) {
      try {
        await markNotificationAsReadInFirestore(notifId);
      } catch (e) {
        console.warn('Firestore mark read note:', e);
      }
    }
  };

  const handleMarkAllNotifsAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleDeleteNotification = async (notifId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notifId));
    if (user?.id) {
      try {
        await deleteNotificationFromFirestore(notifId);
      } catch (e) {
        console.warn('Firestore delete notif note:', e);
      }
    }
  };

  const handleTestVaccinationAlert = async () => {
    const sampleAnimal = animals[0]?.name || 'Gauri (HF Cow)';
    const item = await dispatchVaccinationAlert(
      user?.id || 'farmer-1',
      sampleAnimal,
      'Foot & Mouth Disease (FMD) Booster',
      new Date(Date.now() + 5 * 86400000).toLocaleDateString()
    );
    setNotifications((prev) => [item, ...prev]);
    setForegroundToast(item);
  };

  const handleTestUrgentVetAlert = async () => {
    const sampleAnimal = animals[0]?.name || 'Bhima (Murrah Buffalo)';
    const item = await dispatchUrgentVetResponseAlert(
      user?.id || 'farmer-1',
      sampleAnimal,
      'Dr. Rajesh Sharma (Veterinary Officer)',
      'Observed symptoms indicate high risk of acute respiratory distress. Quarantine animal in shaded barn and ensure clean hydration.',
      'Emergency Triage Active'
    );
    setNotifications((prev) => [item, ...prev]);
    setForegroundToast(item);
  };

  const handleClearCache = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('pashucare_user');
      localStorage.removeItem('pashucare_lang');
    }
    setUser(null);
    setCurrentTab('home');
    window.location.reload();
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  // View Router
  const renderCurrentView = () => {
    // If activeReport is set and tab is 'report', show report detail
    if (currentTab === 'report' && activeReport) {
      return (
        <HealthReportView
          report={activeReport}
          language={language}
          onBack={() => setCurrentTab('history')}
          onRequestVet={handleRequestVet}
        />
      );
    }

    switch (currentTab) {
      case 'home':
        // If user is not authenticated, show LandingView with full features and account prompt
        if (!user) {
          return (
            <LandingView
              language={language}
              onOpenAuth={handleOpenAuth}
              onOpenPrivacy={() => setIsPrivacyModalOpen(true)}
            />
          );
        }
        // If authenticated, show HomeView with livestock status & quick triage entry points
        return (
          <HomeView
            animals={animals}
            reports={reports}
            reminders={reminders}
            language={language}
            onNavigate={navigateTo}
            onSelectAnimal={(animal) => {
              setSelectedAnimal(animal);
            }}
            onSelectReport={(report) => {
              setActiveReport(report);
              setCurrentTab('report');
            }}
            onOpenAuth={handleOpenAuth}
            user={user}
          />
        );

      case 'dashboard':
        return (
          <DashboardView
            user={user}
            animals={animals}
            reports={reports}
            reminders={reminders}
            language={language}
            onNavigate={navigateTo}
            onRunHealthCheck={handleStartHealthCheck}
            onSelectAnimal={(animal) => {
              setSelectedAnimal(animal);
            }}
            onSelectReport={(report) => {
              setActiveReport(report);
              setCurrentTab('report');
            }}
            onToggleReminder={handleToggleReminder}
            onDeleteReminder={handleDeleteReminder}
            onOpenAuth={handleOpenAuth}
          />
        );

      case 'check':
        return (
          <HealthCheckForm
            language={language}
            animals={animals}
            preselectedAnimal={preselectedAnimalForCheck}
            onReportGenerated={handleReportGenerated}
            onCancel={() => setCurrentTab('home')}
          />
        );

      case 'animals':
        return (
          <AnimalsView
            animals={animals}
            language={language}
            onAddAnimal={handleAddAnimal}
            onSelectAnimal={(animal) => {
              setSelectedAnimal(animal);
            }}
            onRunHealthCheck={handleStartHealthCheck}
          />
        );

      case 'history':
        return (
          <HistoryView
            reports={reports}
            language={language}
            onSelectReport={(report) => {
              setActiveReport(report);
              setCurrentTab('report');
            }}
            onDeleteReport={handleDeleteReport}
            onStartNewCheck={() => handleStartHealthCheck()}
          />
        );

      case 'diseases':
        return (
          <DiseaseLibraryView
            language={language}
            onNavigateToCheck={() => handleStartHealthCheck()}
          />
        );

      case 'reminders':
        return (
          <RemindersView
            reminders={reminders}
            animals={animals}
            language={language}
            onAddReminder={handleAddReminder}
            onToggleComplete={handleToggleReminder}
            onDeleteReminder={handleDeleteReminder}
          />
        );

      case 'vet':
        return (
          <VeterinarianView
            animals={animals}
            reports={reports}
            user={user}
            language={language}
            preselectedReport={preselectedReportForVet}
            onSubmitVetRequest={handleSubmitVetRequest}
            pendingRequests={vetRequests}
          />
        );

      case 'admin':
        return <AdminView language={language} />;

      case 'profile':
        return (
          <ProfileView
            user={user}
            animals={animals}
            reports={reports}
            reminders={reminders}
            language={language}
            onLanguageChange={handleLanguageChange}
            onOpenAuth={handleOpenAuth}
            onSignOut={handleSignOut}
            onOpenPrivacy={() => setIsPrivacyModalOpen(true)}
            onNavigate={navigateTo}
            onClearCache={handleClearCache}
          />
        );

      default:
        return (
          <HomeView
            animals={animals}
            reports={reports}
            reminders={reminders}
            language={language}
            onNavigate={navigateTo}
            onSelectAnimal={(animal) => setSelectedAnimal(animal)}
            onSelectReport={(report) => {
              setActiveReport(report);
              setCurrentTab('report');
            }}
            onOpenAuth={handleOpenAuth}
            user={user}
          />
        );
    }
  };

  return (
    <div id="pashucare-app" className="min-h-screen bg-stone-100 text-stone-900 flex flex-col font-sans antialiased selection:bg-emerald-200 selection:text-emerald-900">
      {/* Top Navigation Header */}
      <Header
        language={language}
        user={user}
        onLanguageChange={handleLanguageChange}
        onNavigate={navigateTo}
        onOpenAuth={handleOpenAuth}
        onSignOut={handleSignOut}
        unreadNotificationsCount={unreadNotificationsCount}
        onOpenNotifications={() => setIsNotificationCenterOpen(true)}
        onOpenPrivacy={() => setIsPrivacyModalOpen(true)}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 w-full pb-20 md:pb-8">
        {renderCurrentView()}
      </main>

      {/* App Footer */}
      <Footer
        language={language}
        user={user}
        onNavigate={navigateTo}
        onOpenAuth={handleOpenAuth}
        onOpenPrivacy={() => setIsPrivacyModalOpen(true)}
      />

      {/* Bottom Navigation for Mobile Devices */}
      <BottomNav
        currentTab={currentTab}
        language={language}
        onNavigate={navigateTo}
        onOpenAuth={handleOpenAuth}
        user={user}
        unreadNotificationsCount={unreadNotificationsCount}
        onOpenNotifications={() => setIsNotificationCenterOpen(true)}
      />

      {/* Floating Ask Pashu Saathi AI Assistant Button */}
      <button
        id="btn-floating-ask-ai"
        onClick={() => {
          setAssistantAnimal(null);
          setIsAskAssistantOpen(true);
        }}
        className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-40 flex items-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 font-medium text-sm border border-emerald-400"
        title={language === 'hi' ? 'पशू साथी AI सहायक से पूछें' : language === 'mr' ? 'पशू साथी AI सहाय्यकाला विचारा' : 'Ask Pashu Saathi AI Assistant'}
      >
        <Sparkles className="w-5 h-5 text-amber-300" />
        <span className="font-semibold">
          {language === 'hi' ? 'AI सहायक' : language === 'mr' ? 'AI सहाय्यक' : 'AI Assistant'}
        </span>
      </button>

      {/* Real-time Foreground Push Notification Banner / Toast */}
      <ForegroundNotificationToast
        notification={foregroundToast}
        onDismiss={() => setForegroundToast(null)}
        onNavigateTab={(tab) => {
          setForegroundToast(null);
          navigateTo(tab);
        }}
        language={language}
      />

      {/* Push Notification Drawer / Center */}
      <NotificationCenter
        isOpen={isNotificationCenterOpen}
        onClose={() => setIsNotificationCenterOpen(false)}
        notifications={notifications}
        unreadCount={unreadNotificationsCount}
        permissionStatus={permissionStatus}
        onEnablePush={handleEnablePush}
        onMarkAsRead={handleMarkNotifAsRead}
        onMarkAllAsRead={handleMarkAllNotifsAsRead}
        onDeleteNotification={handleDeleteNotification}
        onTestVaccinationAlert={handleTestVaccinationAlert}
        onTestUrgentVetAlert={handleTestUrgentVetAlert}
        onNavigateTab={(tab) => {
          setIsNotificationCenterOpen(false);
          navigateTo(tab);
        }}
        language={language}
      />

      {/* Animal Detail Modal */}
      {selectedAnimal && (
        <AnimalDetailModal
          animal={selectedAnimal}
          reports={reports}
          language={language}
          onClose={() => setSelectedAnimal(null)}
          onRunHealthCheck={(animal) => {
            setSelectedAnimal(null);
            handleStartHealthCheck(animal);
          }}
          onSelectReport={(report) => {
            setSelectedAnimal(null);
            setActiveReport(report);
            setCurrentTab('report');
          }}
          onDeleteAnimal={(animalId) => {
            handleDeleteAnimal(animalId);
          }}
          onUpdateAnimal={handleUpdateAnimal}
          onAskAI={(animal) => {
            setAssistantAnimal(animal);
            setIsAskAssistantOpen(true);
          }}
        />
      )}

      {/* Pashu Saathi AI Clinical Assistant Modal */}
      {isAskAssistantOpen && (
        <AskAssistantModal
          language={language}
          selectedAnimal={assistantAnimal}
          activeReport={activeReport}
          onClose={() => {
            setIsAskAssistantOpen(false);
            setAssistantAnimal(null);
          }}
        />
      )}

      {/* Farmer Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        language={language}
        initialTab={authInitialTab}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Privacy, Trust & Clinical Boundaries Charter Modal */}
      <PrivacyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        onClearLocalCache={handleClearCache}
      />

      {/* Offline Connectivity Indicator */}
      <OfflineIndicator />
    </div>
  );
};

export default App;
