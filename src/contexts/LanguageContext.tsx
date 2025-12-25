'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'

// ============================================================================
// Types
// ============================================================================

export type Locale = 'en' | 'es' | 'tl'

export interface LocaleInfo {
  code: Locale
  name: string
  nativeName: string
}

export const SUPPORTED_LOCALES: LocaleInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Espanol' },
  { code: 'tl', name: 'Tagalog', nativeName: 'Tagalog' },
]

interface LanguageContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, params?: Record<string, string | number>) => string
  isLoading: boolean
}

// ============================================================================
// Translation Files
// ============================================================================

const translations: Record<Locale, Record<string, string>> = {
  en: {
    // Navigation
    'nav.organize': 'Organize',
    'nav.reading': 'Reading',
    'nav.mutualAid': 'Mutual Aid',
    'nav.tools': 'Tools',
    'nav.profile': 'Profile',
    'nav.login': 'Login',
    'nav.messages': 'Messages',
    'nav.menu': 'Menu',
    'nav.mainSite': 'Main site',

    // Header
    'header.title': 'RSTU',
    'header.subtitle': 'Connect',

    // Messages
    'messages.title': 'Messages',
    'messages.private': 'Private conversations',
    'messages.noMessages': 'No messages yet',
    'messages.startConversation': 'Start a conversation with a building member or organizer.',
    'messages.newMessage': 'New Message',
    'messages.typeMessage': 'Type a message...',
    'messages.sayHello': 'No messages yet. Say hello!',
    'messages.directMessage': 'Direct Message',
    'messages.members': '{count} members',
    'messages.blocChannel': 'Bloc Channel',
    'messages.today': 'Today',
    'messages.yesterday': 'Yesterday',

    // Profile
    'profile.signInRequired': 'Sign In Required',
    'profile.createProfile': 'Please create a profile to use direct messaging.',
    'profile.close': 'Close',

    // Buildings
    'buildings.search': 'Search properties...',
    'buildings.units': 'units',
    'buildings.owner': 'Owner',
    'buildings.noResults': 'No properties found',
    'buildings.loading': 'Loading properties...',

    // Tools
    'tools.unitTracker': 'Unit Tracker',
    'tools.intakeForm': 'Intake Form',
    'tools.canvassing': 'Canvassing',

    // Reading
    'reading.library': 'Reading Library',
    'reading.documents': 'documents',
    'reading.searchDocs': 'Search documents...',
    'reading.allCategories': 'All Categories',

    // Notifications
    'notifications.notSupported': 'Push notifications are not supported in this browser.',
    'notifications.blocked': 'Notifications are blocked',
    'notifications.blockedHelp': 'To enable notifications, please update your browser settings to allow notifications from this site.',
    'notifications.pushNotifications': 'Push Notifications',
    'notifications.enabled': 'Notifications are enabled',
    'notifications.disabled': 'Notifications are disabled',
    'notifications.turnOff': 'Turn Off',
    'notifications.enable': 'Enable',
    'notifications.directMessages': 'Direct Messages',
    'notifications.directMessagesDesc': 'Get notified when you receive a new message',
    'notifications.mentions': '@Mentions',
    'notifications.mentionsDesc': 'Get notified when someone mentions you in chat',
    'notifications.events': 'Event Reminders',
    'notifications.eventsDesc': 'Get reminded about upcoming events',
    'notifications.alerts': 'Strike & Action Alerts',
    'notifications.alertsDesc': 'Get important union announcements',

    // Common
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.close': 'Close',
    'common.submit': 'Submit',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.connected': 'Connected',
    'common.disconnected': 'Disconnected',
  },
  es: {
    // Navigation
    'nav.organize': 'Organizar',
    'nav.reading': 'Lectura',
    'nav.mutualAid': 'Ayuda Mutua',
    'nav.tools': 'Herramientas',
    'nav.profile': 'Perfil',
    'nav.login': 'Iniciar Sesion',
    'nav.messages': 'Mensajes',
    'nav.menu': 'Menu',
    'nav.mainSite': 'Sitio principal',

    // Header
    'header.title': 'RSTU',
    'header.subtitle': 'Connect',

    // Messages
    'messages.title': 'Mensajes',
    'messages.private': 'Conversaciones privadas',
    'messages.noMessages': 'Sin mensajes todavia',
    'messages.startConversation': 'Inicia una conversacion con un miembro del edificio u organizador.',
    'messages.newMessage': 'Nuevo Mensaje',
    'messages.typeMessage': 'Escribe un mensaje...',
    'messages.sayHello': 'Sin mensajes todavia. Di hola!',
    'messages.directMessage': 'Mensaje Directo',
    'messages.members': '{count} miembros',
    'messages.blocChannel': 'Canal del Bloque',
    'messages.today': 'Hoy',
    'messages.yesterday': 'Ayer',

    // Profile
    'profile.signInRequired': 'Inicio de Sesion Requerido',
    'profile.createProfile': 'Por favor crea un perfil para usar mensajes directos.',
    'profile.close': 'Cerrar',

    // Buildings
    'buildings.search': 'Buscar propiedades...',
    'buildings.units': 'unidades',
    'buildings.owner': 'Propietario',
    'buildings.noResults': 'No se encontraron propiedades',
    'buildings.loading': 'Cargando propiedades...',

    // Tools
    'tools.unitTracker': 'Rastreador de Unidades',
    'tools.intakeForm': 'Formulario de Ingreso',
    'tools.canvassing': 'Canvassing',

    // Reading
    'reading.library': 'Biblioteca de Lectura',
    'reading.documents': 'documentos',
    'reading.searchDocs': 'Buscar documentos...',
    'reading.allCategories': 'Todas las Categorias',

    // Notifications
    'notifications.notSupported': 'Las notificaciones push no son compatibles con este navegador.',
    'notifications.blocked': 'Las notificaciones estan bloqueadas',
    'notifications.blockedHelp': 'Para habilitar las notificaciones, actualiza la configuracion de tu navegador para permitir notificaciones de este sitio.',
    'notifications.pushNotifications': 'Notificaciones Push',
    'notifications.enabled': 'Notificaciones habilitadas',
    'notifications.disabled': 'Notificaciones deshabilitadas',
    'notifications.turnOff': 'Desactivar',
    'notifications.enable': 'Habilitar',
    'notifications.directMessages': 'Mensajes Directos',
    'notifications.directMessagesDesc': 'Recibe notificaciones cuando recibas un nuevo mensaje',
    'notifications.mentions': '@Menciones',
    'notifications.mentionsDesc': 'Recibe notificaciones cuando alguien te mencione en el chat',
    'notifications.events': 'Recordatorios de Eventos',
    'notifications.eventsDesc': 'Recibe recordatorios sobre proximos eventos',
    'notifications.alerts': 'Alertas de Huelga y Accion',
    'notifications.alertsDesc': 'Recibe anuncios importantes del sindicato',

    // Common
    'common.loading': 'Cargando...',
    'common.error': 'Ocurrio un error',
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.close': 'Cerrar',
    'common.submit': 'Enviar',
    'common.back': 'Atras',
    'common.next': 'Siguiente',
    'common.connected': 'Conectado',
    'common.disconnected': 'Desconectado',
  },
  tl: {
    // Navigation
    'nav.organize': 'Organisahin',
    'nav.reading': 'Pagbabasa',
    'nav.mutualAid': 'Tulong-Tulong',
    'nav.tools': 'Mga Kasangkapan',
    'nav.profile': 'Profile',
    'nav.login': 'Mag-login',
    'nav.messages': 'Mga Mensahe',
    'nav.menu': 'Menu',
    'nav.mainSite': 'Pangunahing site',

    // Header
    'header.title': 'RSTU',
    'header.subtitle': 'Connect',

    // Messages
    'messages.title': 'Mga Mensahe',
    'messages.private': 'Pribadong usapan',
    'messages.noMessages': 'Wala pang mga mensahe',
    'messages.startConversation': 'Magsimula ng usapan sa isang miyembro ng gusali o organizer.',
    'messages.newMessage': 'Bagong Mensahe',
    'messages.typeMessage': 'Mag-type ng mensahe...',
    'messages.sayHello': 'Wala pang mga mensahe. Magbati ka!',
    'messages.directMessage': 'Direktang Mensahe',
    'messages.members': '{count} mga miyembro',
    'messages.blocChannel': 'Channel ng Bloc',
    'messages.today': 'Ngayon',
    'messages.yesterday': 'Kahapon',

    // Profile
    'profile.signInRequired': 'Kailangang Mag-login',
    'profile.createProfile': 'Mangyaring gumawa ng profile para magamit ang direktang mensahe.',
    'profile.close': 'Isara',

    // Buildings
    'buildings.search': 'Maghanap ng property...',
    'buildings.units': 'mga unit',
    'buildings.owner': 'May-ari',
    'buildings.noResults': 'Walang nahanap na property',
    'buildings.loading': 'Naglo-load ng mga property...',

    // Tools
    'tools.unitTracker': 'Unit Tracker',
    'tools.intakeForm': 'Intake Form',
    'tools.canvassing': 'Canvassing',

    // Reading
    'reading.library': 'Reading Library',
    'reading.documents': 'mga dokumento',
    'reading.searchDocs': 'Maghanap ng dokumento...',
    'reading.allCategories': 'Lahat ng Kategorya',

    // Notifications
    'notifications.notSupported': 'Ang push notifications ay hindi suportado sa browser na ito.',
    'notifications.blocked': 'Naka-block ang mga notification',
    'notifications.blockedHelp': 'Para ma-enable ang mga notification, i-update ang settings ng iyong browser para payagan ang mga notification mula sa site na ito.',
    'notifications.pushNotifications': 'Push Notifications',
    'notifications.enabled': 'Naka-enable ang mga notification',
    'notifications.disabled': 'Naka-disable ang mga notification',
    'notifications.turnOff': 'I-off',
    'notifications.enable': 'I-enable',
    'notifications.directMessages': 'Direktang Mensahe',
    'notifications.directMessagesDesc': 'Maging alerto kapag may bagong mensahe',
    'notifications.mentions': '@Mga Mention',
    'notifications.mentionsDesc': 'Maging alerto kapag may nag-mention sa iyo sa chat',
    'notifications.events': 'Paalala ng Event',
    'notifications.eventsDesc': 'Maging alerto tungkol sa mga paparating na event',
    'notifications.alerts': 'Mga Alerto ng Welga at Aksyon',
    'notifications.alertsDesc': 'Tumanggap ng mahahalagang anunsyo ng unyon',

    // Common
    'common.loading': 'Naglo-load...',
    'common.error': 'May naganap na error',
    'common.save': 'I-save',
    'common.cancel': 'Kanselahin',
    'common.close': 'Isara',
    'common.submit': 'Isumite',
    'common.back': 'Bumalik',
    'common.next': 'Susunod',
    'common.connected': 'Konektado',
    'common.disconnected': 'Hindi konektado',
  },
}

// ============================================================================
// Context
// ============================================================================

const LanguageContext = createContext<LanguageContextType | null>(null)

const STORAGE_KEY = 'rstu-locale'

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en')
  const [isLoading, setIsLoading] = useState(true)

  // Load saved locale on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY) as Locale
      if (saved && SUPPORTED_LOCALES.some(l => l.code === saved)) {
        setLocaleState(saved)
        document.documentElement.lang = saved
      }
      setIsLoading(false)
    }
  }, [])

  // Set locale and persist
  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem(STORAGE_KEY, newLocale)
    document.documentElement.lang = newLocale
  }, [])

  // Translation function with parameter interpolation
  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    const translation = translations[locale][key] || translations['en'][key] || key

    if (!params) return translation

    // Replace {param} placeholders with values
    return Object.entries(params).reduce(
      (result, [param, value]) => result.replace(`{${param}}`, String(value)),
      translation
    )
  }, [locale])

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, isLoading }}>
      {children}
    </LanguageContext.Provider>
  )
}

// ============================================================================
// Hook
// ============================================================================

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
