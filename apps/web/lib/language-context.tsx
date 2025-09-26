'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'he';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Properties Page
    'properties.title': 'EFFINITY Properties',
    'properties.addProperty': 'Add Property',
    'properties.search': 'Search properties...',
    'properties.name': 'Name',
    'properties.city': 'City',
    'properties.price': 'Price',
    'properties.rooms': 'Rooms',
    'properties.size': 'Size (sqm)',
    'properties.status': 'Status',
    'properties.actions': 'Actions',
    'properties.view': 'View',
    'properties.edit': 'Edit',
    'properties.delete': 'Delete',
    'properties.noProperties': 'No properties found.',
    
    // New Property Page
    'newProperty.title': 'Add New Property',
    'newProperty.propertyName': 'Property Name',
    'newProperty.propertyNamePlaceholder': 'e.g., 4-room apartment on Rothschild',
    'newProperty.propertyNameRequired': 'Required field. Will be highlighted if empty.',
    'newProperty.address': 'Address',
    'newProperty.addressPlaceholder': 'e.g., Rothschild 45',
    'newProperty.city': 'City',
    'newProperty.cityPlaceholder': 'Tel Aviv, Haifa, Jerusalem...',
    'newProperty.agentName': 'Agent Name',
    'newProperty.agentNamePlaceholder': 'Full name',
    'newProperty.agentPhone': 'Agent Phone',
    'newProperty.agentPhonePlaceholder': 'e.g., 0587878676',
    'newProperty.price': 'Price (₪)',
    'newProperty.pricePlaceholder': 'Enter amount',
    'newProperty.rooms': 'Rooms',
    'newProperty.roomsPlaceholder': 'Number',
    'newProperty.size': 'Size (sqm)',
    'newProperty.sizePlaceholder': 'Square meters',
    'newProperty.photos': 'Property Photos',
    'newProperty.photosDropText': 'Drop images here or click to select files',
    'newProperty.photosSupport': 'Support up to 20 images at once',
    'newProperty.removePhoto': 'Remove',
    'newProperty.cancel': 'Cancel',
    'newProperty.save': 'Save Property',
    'newProperty.saving': 'Saving...',
    
    // Production Vertical
    // Dashboard
    'production.dashboard.title': 'Production Dashboard',
    'production.dashboard.goodMorning': 'Good morning',
    'production.dashboard.activeProjects': 'Active Projects',
    'production.dashboard.completedTasks': 'Tasks Completed',
    'production.dashboard.upcomingDeadlines': 'Upcoming Deadlines',
    'production.dashboard.budgetUsed': 'Budget Used',
    'production.dashboard.manageProjects': 'Manage Projects',
    'production.dashboard.suppliers': 'Suppliers',
    'production.dashboard.newProject': 'New Project',
    'production.dashboard.tip': 'Production Tip',
    'production.dashboard.tipText': 'Use task templates to speed up new project setup',
    'production.dashboard.searchPlaceholder': 'Search projects, tasks, suppliers…',
    'production.dashboard.recentProjects': 'Recent Projects',
    'production.dashboard.viewAll': 'View all',

    // Company Dashboard
    'production.company.title': 'Company Dashboard',
    'production.company.managing': 'Managing',
    'production.company.teamMembers': 'team members',
    'production.company.withRevenue': 'with monthly revenue of',
    'production.company.manageTeam': 'Manage Team',
    'production.company.allProjects': 'All Projects',
    'production.company.monthlyRevenue': 'Monthly Revenue',
    'production.company.clientSatisfaction': 'Client Satisfaction',
    'production.company.teamOverview': 'Team Overview',
    'production.company.projectManager': 'Project Manager',
    'production.company.designer': 'Designer',
    'production.company.technician': 'Technician',
    'production.company.projects': 'Projects',
    'production.company.active': 'Active',
    'production.company.busy': 'Busy',
    'production.company.projectPerformance': 'Project Performance',
    'production.company.completedOnTime': 'Projects Completed On Time',
    'production.company.withinBudget': 'Projects Within Budget',
    'production.company.alertsUpdates': 'Alerts & Updates',
    'production.company.overdueTasks': 'Overdue Tasks',
    'production.company.immediateAttention': 'Immediate attention required',
    'production.company.inNextWeeks': 'In the next 2 weeks',
    'production.company.revenueIncrease': 'Monthly revenue increased by 12%',
    'production.company.comparedToLast': 'Compared to last month',

    // Private Dashboard
    'production.private.title': 'Freelancer Dashboard',
    'production.private.monthlyEarnings': 'monthly earnings of',
    'production.private.clientRating': 'client rating of',
    'production.private.myProjects': 'My Projects',
    'production.private.mySuppliers': 'My Suppliers',
    'production.private.hoursThisMonth': 'Hours This Month',
    'production.private.totalEarnings': 'Total Earnings This Year',
    'production.private.avgHourlyRate': 'Average Hourly Rate',
    'production.private.pendingInvoices': 'Pending Invoices',
    'production.private.completedProjects': 'Completed Projects',
    'production.private.tasksCompleted': 'Tasks Completed',
    'production.private.earningsFinance': 'Earnings & Finance',
    'production.private.newProject': 'New Project',
    'production.private.createProject': 'Create a new project',
    'production.private.manageSuppliers': 'Manage supplier list',
    'production.private.invoicing': 'Invoicing',
    'production.private.createSendInvoices': 'Create and send invoices',
    'production.private.timeTracking': 'Time Tracking',
    'production.private.trackHours': 'Track working hours',
    'production.private.upcomingDeadlines': 'Upcoming Deadlines',
    'production.private.due': 'Due',
    'production.private.inDays': 'in days',
    'production.private.urgent': 'Urgent',
    'production.private.planning': 'Planning',

    // Projects
    'production.projects.title': 'Project Management',
    'production.projects.managing': 'Managing',
    'production.projects.all': 'All',
    'production.projects.active': 'Active',
    'production.projects.planning': 'Planning',
    'production.projects.onHold': 'On Hold',
    'production.projects.done': 'Done',
    'production.projects.client': 'Client',
    'production.projects.deadline': 'Deadline',
    'production.projects.progress': 'Progress',
    'production.projects.tasks': 'Tasks',
    'production.projects.completed': 'completed',
    'production.projects.budget': 'Budget',
    'production.projects.view': 'View',
    'production.projects.edit': 'Edit',
    'production.projects.noProjects': 'No projects to show',
    'production.projects.getStarted': 'Get started by creating your first project',
    'production.projects.createNew': 'Create New Project',

    // Project Types
    'production.projectTypes.conference': 'Conference',
    'production.projectTypes.show': 'Show',
    'production.projectTypes.filming': 'Filming',
    'production.projectTypes.other': 'Other',

    // Suppliers
    'production.suppliers.title': 'Supplier Management',
    'production.suppliers.managing': 'Managing',
    'production.suppliers.suppliers': 'suppliers',
    'production.suppliers.exportList': 'Export List',
    'production.suppliers.newSupplier': 'New Supplier',
    'production.suppliers.all': 'All',
    'production.suppliers.active': 'Active',
    'production.suppliers.audioVisual': 'Audio/Visual',
    'production.suppliers.catering': 'Catering',
    'production.suppliers.venue': 'Venue',
    'production.suppliers.photography': 'Photography',
    'production.suppliers.transportation': 'Transportation',
    'production.suppliers.jobs': 'jobs',
    'production.suppliers.specialties': 'Specialties',
    'production.suppliers.more': 'more',
    'production.suppliers.priceRange': 'Price Range',
    'production.suppliers.lastWorked': 'Last worked',
    'production.suppliers.viewProfile': 'View Profile',
    'production.suppliers.contact': 'Contact',
    'production.suppliers.noSuppliers': 'No suppliers to show',
    'production.suppliers.getStartedSuppliers': 'Get started by adding suppliers to your list',
    'production.suppliers.addNew': 'Add New Supplier',

    // Team
    'production.team.title': 'Team Management',
    'production.team.managing': 'Managing',
    'production.team.teamMembers': 'team members',
    'production.team.exportData': 'Export Data',
    'production.team.inviteMember': 'Invite Member',
    'production.team.all': 'All',
    'production.team.active': 'Active',
    'production.team.admins': 'Admins',
    'production.team.managers': 'Managers',
    'production.team.members': 'Members',
    'production.team.inactive': 'Inactive',
    'production.team.owner': 'Owner',
    'production.team.admin': 'Admin',
    'production.team.manager': 'Manager',
    'production.team.member': 'Member',
    'production.team.viewer': 'Viewer',
    'production.team.skills': 'Skills',
    'production.team.moreSkills': 'more',
    'production.team.lastActive': 'Last active',
    'production.team.joined': 'Joined',
    'production.team.activeNow': 'Active now',
    'production.team.hoursAgo': 'h ago',
    'production.team.daysAgo': 'd ago',
    'production.team.viewProfile': 'View Profile',
    'production.team.message': 'Message',
    'production.team.noTeamMembers': 'No team members to show',
    'production.team.getStartedTeam': 'Get started by inviting team members to collaborate',
    'production.team.inviteFirst': 'Invite First Team Member',
    'production.team.activeTeamMembers': 'Active Team Members',
    'production.team.activeProjects': 'Active Projects',
    'production.team.completedProjects': 'Completed Projects',

    // Registration
    'production.register.production': 'Production',
    'production.register.description': 'Event & production management for businesses and freelancers',
    'production.register.chooseAccountType': 'Choose account type',
    'production.register.freelancer': 'Freelancer (Private)',
    'production.register.freelancerDesc': 'Single user - personal project management',
    'production.register.company': 'Company (Team)',
    'production.register.companyDesc': 'Admin-owner with team members',
    'production.register.accountTypeRequired': 'Account type is required',

    // Common
    'common.loading': 'Loading...',
    'common.english': 'English',
    'common.hebrew': 'Hebrew',
  },
  he: {
    // Properties Page
    'properties.title': 'נכסים EFFINITY',
    'properties.addProperty': 'הוסף נכס',
    'properties.search': 'חפש נכסים...',
    'properties.name': 'שם',
    'properties.city': 'עיר',
    'properties.price': 'מחיר',
    'properties.rooms': 'חדרים',
    'properties.size': 'גודל (מ"ר)',
    'properties.status': 'סטטוס',
    'properties.actions': 'פעולות',
    'properties.view': 'צפה',
    'properties.edit': 'ערוך',
    'properties.delete': 'מחק',
    'properties.noProperties': 'לא נמצאו נכסים.',
    
    // New Property Page
    'newProperty.title': 'הוסף נכס חדש',
    'newProperty.propertyName': 'שם הנכס',
    'newProperty.propertyNamePlaceholder': 'לדוגמה, דירת 4 חדרים ברוטשילד',
    'newProperty.propertyNameRequired': 'שדה חובה. יודגש אם ריק.',
    'newProperty.address': 'כתובת',
    'newProperty.addressPlaceholder': 'לדוגמה, רוטשילד 45',
    'newProperty.city': 'עיר',
    'newProperty.cityPlaceholder': 'תל אביב, חיפה, ירושלים...',
    'newProperty.agentName': 'שם הסוכן',
    'newProperty.agentNamePlaceholder': 'שם מלא',
    'newProperty.agentPhone': 'טלפון סוכן',
    'newProperty.agentPhonePlaceholder': 'לדוגמה: 0587878676',
    'newProperty.price': 'מחיר (₪)',
    'newProperty.pricePlaceholder': 'הכנס סכום',
    'newProperty.rooms': 'חדרים',
    'newProperty.roomsPlaceholder': 'מספר',
    'newProperty.size': 'גודל (מ"ר)',
    'newProperty.sizePlaceholder': 'מטר רבוע',
    'newProperty.photos': 'תמונות הנכס',
    'newProperty.photosDropText': 'גרור תמונות לכאן או לחץ לבחירת קבצים',
    'newProperty.photosSupport': 'תמיכה עד 20 תמונות בבת אחת',
    'newProperty.removePhoto': 'הסר',
    'newProperty.cancel': 'ביטול',
    'newProperty.save': 'שמור נכס',
    'newProperty.saving': 'שומר...',
    
    // Production Vertical - Hebrew
    // Dashboard
    'production.dashboard.title': 'דשבורד הפקה',
    'production.dashboard.goodMorning': 'בוקר טוב',
    'production.dashboard.activeProjects': 'פרויקטים פעילים',
    'production.dashboard.completedTasks': 'משימות הושלמו',
    'production.dashboard.upcomingDeadlines': 'דדליינים קרובים',
    'production.dashboard.budgetUsed': 'תקציב בשימוש',
    'production.dashboard.manageProjects': 'נהל פרויקטים',
    'production.dashboard.suppliers': 'ספקים',
    'production.dashboard.newProject': 'פרויקט חדש',
    'production.dashboard.tip': 'טיפ הפקה',
    'production.dashboard.tipText': 'השתמש בתבניות משימות כדי לזרז הקמת פרויקטים חדשים',
    'production.dashboard.searchPlaceholder': 'חיפוש פרויקטים, משימות, ספקים...',
    'production.dashboard.recentProjects': 'פרויקטים אחרונים',
    'production.dashboard.viewAll': 'הצג הכל',

    // Company Dashboard
    'production.company.title': 'דשבורד חברה',
    'production.company.managing': 'ניהול',
    'production.company.teamMembers': 'עובדים',
    'production.company.withRevenue': 'עם הכנסה חודשית של',
    'production.company.manageTeam': 'נהל צוות',
    'production.company.allProjects': 'כל הפרויקטים',
    'production.company.monthlyRevenue': 'הכנסה חודשית',
    'production.company.clientSatisfaction': 'שביעות רצון לקוח',
    'production.company.teamOverview': 'סקירת צוות',
    'production.company.projectManager': 'מנהל פרויקטים',
    'production.company.designer': 'מעצבת',
    'production.company.technician': 'טכנאי',
    'production.company.projects': 'פרויקטים',
    'production.company.active': 'פעיל',
    'production.company.busy': 'עמוס',
    'production.company.projectPerformance': 'ביצועי פרויקטים',
    'production.company.completedOnTime': 'פרויקטים הושלמו בזמן',
    'production.company.withinBudget': 'פרויקטים בתקציב',
    'production.company.alertsUpdates': 'התראות ועדכונים',
    'production.company.overdueTasks': 'משימות פגועות',
    'production.company.immediateAttention': 'נדרשת התערבות מיידית',
    'production.company.inNextWeeks': 'בשבועיים הקרובים',
    'production.company.revenueIncrease': 'הכנסה חודשית גדלה ב-12%',
    'production.company.comparedToLast': 'לעומת החודש הקודם',

    // Private Dashboard
    'production.private.title': 'דשבורד עצמאי',
    'production.private.monthlyEarnings': 'הכנסה חודשית של',
    'production.private.clientRating': 'דירוג לקוח של',
    'production.private.myProjects': 'הפרויקטים שלי',
    'production.private.mySuppliers': 'הספקים שלי',
    'production.private.hoursThisMonth': 'שעות החודש',
    'production.private.totalEarnings': 'סה"כ הכנסות השנה',
    'production.private.avgHourlyRate': 'תעריף ממוצע לשעה',
    'production.private.pendingInvoices': 'חשבוניות ממתינות',
    'production.private.completedProjects': 'פרויקטים הושלמו',
    'production.private.tasksCompleted': 'משימות הושלמו',
    'production.private.earningsFinance': 'הכנסות וכספים',
    'production.private.newProject': 'פרויקט חדש',
    'production.private.createProject': 'צור פרויקט חדש',
    'production.private.manageSuppliers': 'נהל רשימת ספקים',
    'production.private.invoicing': 'חשבוניות',
    'production.private.createSendInvoices': 'צור ושלח חשבוניות',
    'production.private.timeTracking': 'מעקב זמן',
    'production.private.trackHours': 'עקוב אחר שעות עבודה',
    'production.private.upcomingDeadlines': 'דדליינים קרובים',
    'production.private.due': 'תאריך',
    'production.private.inDays': 'בעוד ימים',
    'production.private.urgent': 'דחוף',
    'production.private.planning': 'תכנון',

    // Projects
    'production.projects.title': 'ניהול פרויקטים',
    'production.projects.managing': 'מנהל',
    'production.projects.all': 'הכל',
    'production.projects.active': 'פעיל',
    'production.projects.planning': 'תכנון',
    'production.projects.onHold': 'מושהה',
    'production.projects.done': 'הושלם',
    'production.projects.client': 'לקוח',
    'production.projects.deadline': 'דדליין',
    'production.projects.progress': 'התקדמות',
    'production.projects.tasks': 'משימות',
    'production.projects.completed': 'הושלמו',
    'production.projects.budget': 'תקציב',
    'production.projects.view': 'צפה',
    'production.projects.edit': 'ערוך',
    'production.projects.noProjects': 'אין פרויקטים להצגה',
    'production.projects.getStarted': 'התחל בצירת הפרויקט הראשון שלך',
    'production.projects.createNew': 'צור פרויקט חדש',

    // Project Types
    'production.projectTypes.conference': 'כנס',
    'production.projectTypes.show': 'מופע',
    'production.projectTypes.filming': 'צילום',
    'production.projectTypes.other': 'אחר',

    // Suppliers
    'production.suppliers.title': 'ניהול ספקים',
    'production.suppliers.managing': 'מנהל',
    'production.suppliers.suppliers': 'ספקים',
    'production.suppliers.exportList': 'ייצא רשימה',
    'production.suppliers.newSupplier': 'ספק חדש',
    'production.suppliers.all': 'הכל',
    'production.suppliers.active': 'פעיל',
    'production.suppliers.audioVisual': 'אודיו ויזואל',
    'production.suppliers.catering': 'קייטרינג',
    'production.suppliers.venue': 'מקום',
    'production.suppliers.photography': 'צילום',
    'production.suppliers.transportation': 'הסעות',
    'production.suppliers.jobs': 'עבודות',
    'production.suppliers.specialties': 'התמחויות',
    'production.suppliers.more': 'נוספות',
    'production.suppliers.priceRange': 'טווח מחירים',
    'production.suppliers.lastWorked': 'עבודה אחרונה',
    'production.suppliers.viewProfile': 'צפה בפרופיל',
    'production.suppliers.contact': 'צור קשר',
    'production.suppliers.noSuppliers': 'אין ספקים להצגה',
    'production.suppliers.getStartedSuppliers': 'התחל בהוספת ספקים לרשימה שלך',
    'production.suppliers.addNew': 'הוסף ספק חדש',

    // Team
    'production.team.title': 'ניהול צוות',
    'production.team.managing': 'מנהל',
    'production.team.teamMembers': 'חברי צוות',
    'production.team.exportData': 'ייצא נתונים',
    'production.team.inviteMember': 'הזמן חבר צוות',
    'production.team.all': 'הכל',
    'production.team.active': 'פעיל',
    'production.team.admins': 'מנהלים',
    'production.team.managers': 'מנהלי פרויקטים',
    'production.team.members': 'חברי צוות',
    'production.team.inactive': 'לא פעיל',
    'production.team.owner': 'בעלים',
    'production.team.admin': 'מנהל',
    'production.team.manager': 'מנהל פרויקטים',
    'production.team.member': 'חבר צוות',
    'production.team.viewer': 'צופה',
    'production.team.skills': 'כישורים',
    'production.team.moreSkills': 'נוספים',
    'production.team.lastActive': 'פעיל לאחרונה',
    'production.team.joined': 'הצטרף',
    'production.team.activeNow': 'פעיל כעת',
    'production.team.hoursAgo': 'שעות',
    'production.team.daysAgo': 'ימים',
    'production.team.viewProfile': 'צפה בפרופיל',
    'production.team.message': 'צור קשר',
    'production.team.noTeamMembers': 'אין חברי צוות להצגה',
    'production.team.getStartedTeam': 'התחל בהזמנת חברי צוות לעבודה משותפת',
    'production.team.inviteFirst': 'הזמן חבר צוות ראשון',
    'production.team.activeTeamMembers': 'חברי צוות פעילים',
    'production.team.activeProjects': 'פרויקטים פעילים',
    'production.team.completedProjects': 'פרויקטים שהושלמו',

    // Registration
    'production.register.production': 'הפקה',
    'production.register.description': 'ניהול אירועים והפקות לעסקים ועצמאיים',
    'production.register.chooseAccountType': 'בחר סוג חשבון',
    'production.register.freelancer': 'עצמאי (פרטי)',
    'production.register.freelancerDesc': 'משתמש יחיד - ניהול פרוייקטים אישיים',
    'production.register.company': 'חברה (צוות)',
    'production.register.companyDesc': 'מנהל-בעלים עם חברי צוות',
    'production.register.accountTypeRequired': 'חובה לבחור סוג חשבון',

    // Common
    'common.loading': 'טוען...',
    'common.english': 'אנגלית',
    'common.hebrew': 'עברית',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({
  children,
  initialLang
}: {
  children: ReactNode;
  initialLang?: Language;
}) {
  // Always start with the same state on server and client to prevent hydration mismatch
  const [language, setLanguage] = useState<Language>(initialLang || 'en');
  const [hydrated, setHydrated] = useState(false);

  // Initialize language from localStorage only on client side after hydration
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedLanguage = localStorage.getItem('language') as Language;
        if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'he')) {
          setLanguage(savedLanguage);
        }
      } catch (error) {
        console.warn('Failed to load language preference:', error);
      }
      setHydrated(true);
    }
  }, []);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'he' : 'en');
  };

  // Update localStorage when language changes (only after hydration)
  useEffect(() => {
    if (hydrated) {
      try {
        localStorage.setItem('language', language);
        // Set cookie for SSR language detection
        document.cookie = `language=${language}; path=/; max-age=${60 * 60 * 24 * 365}`;
      } catch (error) {
        console.warn('Failed to save language preference:', error);
      }
    }
  }, [language, hydrated]);

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}