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
    'common.edit': 'Edit',

    // Elections
    'elections.noActive': 'No Active Election',
    'elections.noActiveDesc': 'There is no election currently in progress. Check back later.',
    'elections.nominationsOpen': 'Nominations Open',
    'elections.votingOpen': 'Voting Open',
    'elections.closed': 'Closed',
    'elections.upcoming': 'Upcoming',
    'elections.draft': 'Draft',
    'elections.nominationsEnd': 'Nominations end',
    'elections.votingEnds': 'Voting ends',
    'elections.startsOn': 'Starts on',
    'elections.youveBeenNominated': 'You have been nominated!',
    'elections.nominatedFor': 'You have been nominated for {position}',
    'elections.by': 'by',
    'elections.accept': 'Accept',
    'elections.decline': 'Decline',
    'elections.currentCandidates': 'Current Candidates',
    'elections.candidates': 'candidates',
    'elections.noCandidates': 'No candidates yet',
    'elections.nominateSomeone': 'Nominate Someone',
    'elections.submitNomination': 'Submit Nomination',
    'elections.position': 'Position',
    'elections.selectPosition': 'Select a position',
    'elections.nominateMyself': 'I am nominating myself',
    'elections.nomineeName': 'Nominee Name',
    'elections.enterNomineeName': 'Enter nominee name',
    'elections.candidateStatement': 'Candidate Statement',
    'elections.optional': 'optional',
    'elections.statementPlaceholder': 'Why should members vote for this candidate?',
    'elections.alreadyNominated': 'This person is already nominated for this position',
    'elections.alreadyNominatedSomeone': 'You have already nominated someone for this position',
    'elections.yourProgress': 'Your Progress',
    'elections.positionsVoted': 'positions voted',
    'elections.votingComplete': 'You have voted for all positions!',
    'elections.selectCandidate': 'Please select a candidate',
    'elections.voted': 'Voted',
    'elections.nominatedBy': 'Nominated by',
    'elections.castVote': 'Cast Vote',
    'elections.electionResults': 'Election Results',
    'elections.totalVoters': 'Total Voters',
    'elections.turnout': 'Turnout',
    'elections.quorumRequired': 'Quorum Required',
    'elections.quorumStatus': 'Quorum Status',
    'elections.quorumMet': 'Met',
    'elections.quorumNotMet': 'Not Met',
    'elections.votingEnded': 'Voting ended',
    'elections.votes': 'votes',
    'elections.winner': 'Winner',
    'elections.runoffNeeded': 'No candidate received >50%. A runoff election may be needed.',
    'elections.noMajority': 'No candidate received a majority',
    'elections.resultsUnavailable': 'Results are not yet available',
    'elections.quorumNotMetTitle': 'Quorum Not Met',
    'elections.quorumNotMetDesc': 'This election required {required}% participation but only achieved {actual}%. Results may not be valid.',
    'elections.manageElections': 'Manage Elections',
    'elections.createNew': 'Create New',
    'elections.noElections': 'No elections created yet',
    'elections.positions': 'positions',
    'elections.nominations': 'Nominations',
    'elections.voting': 'Voting',
    'elections.closeEarly': 'Close Early',
    'elections.editElection': 'Edit Election',
    'elections.createElection': 'Create Election',
    'elections.electionTitle': 'Election Title',
    'elections.titlePlaceholder': 'e.g., 2025 Officer Elections',
    'elections.quorumPercent': 'Quorum Percentage',
    'elections.quorumHelp': 'Minimum percentage of members that must vote for results to be valid',
    'elections.nominationStart': 'Nominations Start',
    'elections.nominationEnd': 'Nominations End',
    'elections.votingEnd': 'Voting End',
    'elections.addPosition': 'Add Position',
    'elections.positionTitle': 'Position title',
    'elections.positionDescription': 'Position description',
    'elections.termLength': 'Term Length',
    'elections.maxTerms': 'Max Terms',
    'elections.months': 'months',
    'elections.year': 'year',
    'elections.years': 'years',
    'elections.unlimited': 'Unlimited',
    'elections.create': 'Create',
    'elections.enterTitle': 'Please enter an election title',
    'elections.setDates': 'Please set all dates',
    'elections.positionNeedsTitle': 'All positions need a title',
    'elections.nominationEndAfterStart': 'Nomination end must be after start',
    'elections.votingEndAfterNomination': 'Voting end must be after nomination end',

    // Tasks
    'tasks.board': 'Task Board',
    'tasks.myTasks': 'My Tasks',
    'tasks.allTasks': 'All Tasks',
    'tasks.addTask': 'Add Task',
    'tasks.todo': 'To Do',
    'tasks.inProgress': 'In Progress',
    'tasks.blocked': 'Blocked',
    'tasks.done': 'Done',
    'tasks.noTasks': 'No tasks yet',
    'tasks.title': 'Title',
    'tasks.description': 'Description',
    'tasks.type': 'Type',
    'tasks.priority': 'Priority',
    'tasks.dueDate': 'Due Date',
    'tasks.assignees': 'Assignees',
    'tasks.campaign': 'Campaign',
    'tasks.building': 'Building',
    'tasks.low': 'Low',
    'tasks.medium': 'Medium',
    'tasks.high': 'High',
    'tasks.urgent': 'Urgent',
    'tasks.outreachPhone': 'Phone Outreach',
    'tasks.outreachDoor': 'Door Knocking',
    'tasks.outreachFlyer': 'Flyer Distribution',
    'tasks.eventPlanning': 'Event Planning',
    'tasks.eventLogistics': 'Event Logistics',
    'tasks.legalResearch': 'Legal Research',
    'tasks.mediaPress': 'Media/Press',
    'tasks.adminPaperwork': 'Admin/Paperwork',
    'tasks.meetingPrep': 'Meeting Prep',
    'tasks.followUp': 'Follow Up',
    'tasks.other': 'Other',
    'tasks.assignToMe': 'Assign to Me',
    'tasks.unassign': 'Unassign',
    'tasks.delete': 'Delete',
    'tasks.overdue': 'Overdue',
    'tasks.dueSoon': 'Due Soon',
    'tasks.taskDetails': 'Task Details',
    'tasks.editTask': 'Edit Task',
    'tasks.deleteTask': 'Delete Task',
    'tasks.confirmDelete': 'Are you sure you want to delete this task?',
    'tasks.createdBy': 'Created by',
    'tasks.createdAt': 'Created',
    'tasks.completedAt': 'Completed',
    'tasks.manage': 'Manage',
    'tasks.unassigned': 'Unassigned',
    'tasks.assignSelf': 'Assign myself',
    'tasks.assignTask': 'Assign Task',
    'tasks.assign': 'Assign',
    'tasks.noProfiles': 'No profiles available',
    'tasks.newTask': 'New Task',
    'tasks.titlePlaceholder': 'Enter task title...',
    'tasks.descriptionPlaceholder': 'Add task description...',
    'tasks.linkToCampaign': 'Link to Campaign',
    'tasks.noCampaign': 'No campaign',
    'tasks.linkedToCampaign': 'Linked to campaign',
    'tasks.linkedToBuilding': 'Linked to building',
    'tasks.createTask': 'Create Task',
    'tasks.loginRequired': 'Please create a profile to add tasks.',
    'tasks.allPriorities': 'All Priorities',
    'tasks.allTypes': 'All Types',
    'tasks.status': 'Status',
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
    'common.edit': 'Editar',

    // Elections
    'elections.noActive': 'Sin Eleccion Activa',
    'elections.noActiveDesc': 'No hay ninguna eleccion en curso. Vuelve mas tarde.',
    'elections.nominationsOpen': 'Nominaciones Abiertas',
    'elections.votingOpen': 'Votacion Abierta',
    'elections.closed': 'Cerrada',
    'elections.upcoming': 'Proxima',
    'elections.draft': 'Borrador',
    'elections.nominationsEnd': 'Nominaciones terminan',
    'elections.votingEnds': 'Votacion termina',
    'elections.startsOn': 'Comienza el',
    'elections.youveBeenNominated': 'Has sido nominado!',
    'elections.nominatedFor': 'Has sido nominado para {position}',
    'elections.by': 'por',
    'elections.accept': 'Aceptar',
    'elections.decline': 'Rechazar',
    'elections.currentCandidates': 'Candidatos Actuales',
    'elections.candidates': 'candidatos',
    'elections.noCandidates': 'Sin candidatos todavia',
    'elections.nominateSomeone': 'Nominar a Alguien',
    'elections.submitNomination': 'Enviar Nominacion',
    'elections.position': 'Cargo',
    'elections.selectPosition': 'Selecciona un cargo',
    'elections.nominateMyself': 'Me nomino a mi mismo',
    'elections.nomineeName': 'Nombre del Nominado',
    'elections.enterNomineeName': 'Ingresa el nombre del nominado',
    'elections.candidateStatement': 'Declaracion del Candidato',
    'elections.optional': 'opcional',
    'elections.statementPlaceholder': 'Por que deberian votar por este candidato?',
    'elections.alreadyNominated': 'Esta persona ya esta nominada para este cargo',
    'elections.alreadyNominatedSomeone': 'Ya nominaste a alguien para este cargo',
    'elections.yourProgress': 'Tu Progreso',
    'elections.positionsVoted': 'cargos votados',
    'elections.votingComplete': 'Has votado por todos los cargos!',
    'elections.selectCandidate': 'Por favor selecciona un candidato',
    'elections.voted': 'Votado',
    'elections.nominatedBy': 'Nominado por',
    'elections.castVote': 'Emitir Voto',
    'elections.electionResults': 'Resultados de la Eleccion',
    'elections.totalVoters': 'Total de Votantes',
    'elections.turnout': 'Participacion',
    'elections.quorumRequired': 'Quorum Requerido',
    'elections.quorumStatus': 'Estado del Quorum',
    'elections.quorumMet': 'Alcanzado',
    'elections.quorumNotMet': 'No Alcanzado',
    'elections.votingEnded': 'Votacion termino',
    'elections.votes': 'votos',
    'elections.winner': 'Ganador',
    'elections.runoffNeeded': 'Ningun candidato recibio mas del 50%. Puede ser necesaria una segunda vuelta.',
    'elections.noMajority': 'Ningun candidato recibio mayoria',
    'elections.resultsUnavailable': 'Los resultados aun no estan disponibles',
    'elections.quorumNotMetTitle': 'Quorum No Alcanzado',
    'elections.quorumNotMetDesc': 'Esta eleccion requeria {required}% de participacion pero solo alcanzo {actual}%. Los resultados pueden no ser validos.',
    'elections.manageElections': 'Gestionar Elecciones',
    'elections.createNew': 'Crear Nueva',
    'elections.noElections': 'No hay elecciones creadas',
    'elections.positions': 'cargos',
    'elections.nominations': 'Nominaciones',
    'elections.voting': 'Votacion',
    'elections.closeEarly': 'Cerrar Antes',
    'elections.editElection': 'Editar Eleccion',
    'elections.createElection': 'Crear Eleccion',
    'elections.electionTitle': 'Titulo de la Eleccion',
    'elections.titlePlaceholder': 'ej., Elecciones de Oficiales 2025',
    'elections.quorumPercent': 'Porcentaje de Quorum',
    'elections.quorumHelp': 'Porcentaje minimo de miembros que deben votar para que los resultados sean validos',
    'elections.nominationStart': 'Inicio de Nominaciones',
    'elections.nominationEnd': 'Fin de Nominaciones',
    'elections.votingEnd': 'Fin de Votacion',
    'elections.addPosition': 'Agregar Cargo',
    'elections.positionTitle': 'Titulo del cargo',
    'elections.positionDescription': 'Descripcion del cargo',
    'elections.termLength': 'Duracion del Mandato',
    'elections.maxTerms': 'Mandatos Maximos',
    'elections.months': 'meses',
    'elections.year': 'ano',
    'elections.years': 'anos',
    'elections.unlimited': 'Sin limite',
    'elections.create': 'Crear',
    'elections.enterTitle': 'Por favor ingresa un titulo',
    'elections.setDates': 'Por favor configura todas las fechas',
    'elections.positionNeedsTitle': 'Todos los cargos necesitan un titulo',
    'elections.nominationEndAfterStart': 'El fin de nominaciones debe ser despues del inicio',
    'elections.votingEndAfterNomination': 'El fin de votacion debe ser despues del fin de nominaciones',

    // Tasks
    'tasks.board': 'Tablero de Tareas',
    'tasks.myTasks': 'Mis Tareas',
    'tasks.allTasks': 'Todas las Tareas',
    'tasks.addTask': 'Agregar Tarea',
    'tasks.todo': 'Por Hacer',
    'tasks.inProgress': 'En Progreso',
    'tasks.blocked': 'Bloqueado',
    'tasks.done': 'Completado',
    'tasks.noTasks': 'Sin tareas todavia',
    'tasks.title': 'Titulo',
    'tasks.description': 'Descripcion',
    'tasks.type': 'Tipo',
    'tasks.priority': 'Prioridad',
    'tasks.dueDate': 'Fecha Limite',
    'tasks.assignees': 'Asignados',
    'tasks.campaign': 'Campana',
    'tasks.building': 'Edificio',
    'tasks.low': 'Baja',
    'tasks.medium': 'Media',
    'tasks.high': 'Alta',
    'tasks.urgent': 'Urgente',
    'tasks.outreachPhone': 'Llamadas',
    'tasks.outreachDoor': 'Tocar Puertas',
    'tasks.outreachFlyer': 'Distribuir Volantes',
    'tasks.eventPlanning': 'Planificacion de Eventos',
    'tasks.eventLogistics': 'Logistica de Eventos',
    'tasks.legalResearch': 'Investigacion Legal',
    'tasks.mediaPress': 'Medios/Prensa',
    'tasks.adminPaperwork': 'Admin/Papeleria',
    'tasks.meetingPrep': 'Prep. de Reunion',
    'tasks.followUp': 'Seguimiento',
    'tasks.other': 'Otro',
    'tasks.assignToMe': 'Asignarme',
    'tasks.unassign': 'Desasignar',
    'tasks.delete': 'Eliminar',
    'tasks.overdue': 'Atrasada',
    'tasks.dueSoon': 'Pronto',
    'tasks.taskDetails': 'Detalles de Tarea',
    'tasks.editTask': 'Editar Tarea',
    'tasks.deleteTask': 'Eliminar Tarea',
    'tasks.confirmDelete': 'Estas seguro de eliminar esta tarea?',
    'tasks.createdBy': 'Creada por',
    'tasks.createdAt': 'Creada',
    'tasks.completedAt': 'Completada',
    'tasks.manage': 'Administrar',
    'tasks.unassigned': 'Sin asignar',
    'tasks.assignSelf': 'Asignarme',
    'tasks.assignTask': 'Asignar Tarea',
    'tasks.assign': 'Asignar',
    'tasks.noProfiles': 'No hay perfiles disponibles',
    'tasks.newTask': 'Nueva Tarea',
    'tasks.titlePlaceholder': 'Ingresa el titulo...',
    'tasks.descriptionPlaceholder': 'Agrega descripcion...',
    'tasks.linkToCampaign': 'Vincular a Campana',
    'tasks.noCampaign': 'Sin campana',
    'tasks.linkedToCampaign': 'Vinculada a campana',
    'tasks.linkedToBuilding': 'Vinculada a edificio',
    'tasks.createTask': 'Crear Tarea',
    'tasks.loginRequired': 'Crea un perfil para agregar tareas.',
    'tasks.allPriorities': 'Todas las Prioridades',
    'tasks.allTypes': 'Todos los Tipos',
    'tasks.status': 'Estado',
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
    'common.edit': 'I-edit',

    // Elections
    'elections.noActive': 'Walang Aktibong Eleksyon',
    'elections.noActiveDesc': 'Walang eleksyon na kasalukuyang nagaganap. Bumalik mamaya.',
    'elections.nominationsOpen': 'Bukas ang Nominasyon',
    'elections.votingOpen': 'Bukas ang Pagboto',
    'elections.closed': 'Sarado',
    'elections.upcoming': 'Paparating',
    'elections.draft': 'Draft',
    'elections.nominationsEnd': 'Magtatapos ang nominasyon',
    'elections.votingEnds': 'Magtatapos ang pagboto',
    'elections.startsOn': 'Magsisimula sa',
    'elections.youveBeenNominated': 'Ikaw ay nominado!',
    'elections.nominatedFor': 'Ikaw ay nominado para sa {position}',
    'elections.by': 'ni',
    'elections.accept': 'Tanggapin',
    'elections.decline': 'Tanggihan',
    'elections.currentCandidates': 'Kasalukuyang Kandidato',
    'elections.candidates': 'kandidato',
    'elections.noCandidates': 'Wala pang kandidato',
    'elections.nominateSomeone': 'Magn-nominate ng Iba',
    'elections.submitNomination': 'Isumite ang Nominasyon',
    'elections.position': 'Posisyon',
    'elections.selectPosition': 'Pumili ng posisyon',
    'elections.nominateMyself': 'Ako ay nagno-nominate sa sarili ko',
    'elections.nomineeName': 'Pangalan ng Nominado',
    'elections.enterNomineeName': 'Ilagay ang pangalan ng nominado',
    'elections.candidateStatement': 'Pahayag ng Kandidato',
    'elections.optional': 'opsyonal',
    'elections.statementPlaceholder': 'Bakit dapat iboto ang kandidatong ito?',
    'elections.alreadyNominated': 'Ang taong ito ay nominado na para sa posisyong ito',
    'elections.alreadyNominatedSomeone': 'Nagno-nominate ka na ng iba para sa posisyong ito',
    'elections.yourProgress': 'Iyong Progreso',
    'elections.positionsVoted': 'posisyon na binoto',
    'elections.votingComplete': 'Nakaboto ka na sa lahat ng posisyon!',
    'elections.selectCandidate': 'Mangyaring pumili ng kandidato',
    'elections.voted': 'Nakaboto',
    'elections.nominatedBy': 'Nominado ni',
    'elections.castVote': 'Magboto',
    'elections.electionResults': 'Resulta ng Eleksyon',
    'elections.totalVoters': 'Kabuuang Bumoto',
    'elections.turnout': 'Partisipasyon',
    'elections.quorumRequired': 'Kinakailangang Quorum',
    'elections.quorumStatus': 'Status ng Quorum',
    'elections.quorumMet': 'Naabot',
    'elections.quorumNotMet': 'Hindi Naabot',
    'elections.votingEnded': 'Natapos ang pagboto',
    'elections.votes': 'boto',
    'elections.winner': 'Panalo',
    'elections.runoffNeeded': 'Walang kandidato na nakakuha ng mahigit 50%. Maaaring kailangang magkaroon ng pangalawang botohan.',
    'elections.noMajority': 'Walang kandidato na nakakuha ng mayorya',
    'elections.resultsUnavailable': 'Hindi pa available ang mga resulta',
    'elections.quorumNotMetTitle': 'Hindi Naabot ang Quorum',
    'elections.quorumNotMetDesc': 'Ang eleksyong ito ay nangangailangan ng {required}% na partisipasyon pero nakakuha lamang ng {actual}%. Maaaring hindi valid ang mga resulta.',
    'elections.manageElections': 'Pamahalaan ang mga Eleksyon',
    'elections.createNew': 'Gumawa ng Bago',
    'elections.noElections': 'Walang nilikhang eleksyon',
    'elections.positions': 'posisyon',
    'elections.nominations': 'Nominasyon',
    'elections.voting': 'Pagboto',
    'elections.closeEarly': 'Isara Nang Maaga',
    'elections.editElection': 'I-edit ang Eleksyon',
    'elections.createElection': 'Gumawa ng Eleksyon',
    'elections.electionTitle': 'Titulo ng Eleksyon',
    'elections.titlePlaceholder': 'hal., Eleksyon ng mga Opisyal 2025',
    'elections.quorumPercent': 'Porsyento ng Quorum',
    'elections.quorumHelp': 'Minimum na porsyento ng miyembro na dapat bumoto para maging valid ang resulta',
    'elections.nominationStart': 'Simula ng Nominasyon',
    'elections.nominationEnd': 'Wakas ng Nominasyon',
    'elections.votingEnd': 'Wakas ng Pagboto',
    'elections.addPosition': 'Magdagdag ng Posisyon',
    'elections.positionTitle': 'Titulo ng posisyon',
    'elections.positionDescription': 'Deskripsyon ng posisyon',
    'elections.termLength': 'Haba ng Termino',
    'elections.maxTerms': 'Max na Termino',
    'elections.months': 'buwan',
    'elections.year': 'taon',
    'elections.years': 'taon',
    'elections.unlimited': 'Walang Limitasyon',
    'elections.create': 'Gumawa',
    'elections.enterTitle': 'Mangyaring maglagay ng titulo',
    'elections.setDates': 'Mangyaring itakda ang lahat ng petsa',
    'elections.positionNeedsTitle': 'Lahat ng posisyon ay nangangailangan ng titulo',
    'elections.nominationEndAfterStart': 'Ang wakas ng nominasyon ay dapat pagkatapos ng simula',
    'elections.votingEndAfterNomination': 'Ang wakas ng pagboto ay dapat pagkatapos ng wakas ng nominasyon',

    // Tasks
    'tasks.board': 'Task Board',
    'tasks.myTasks': 'Aking mga Task',
    'tasks.allTasks': 'Lahat ng Task',
    'tasks.addTask': 'Magdagdag ng Task',
    'tasks.todo': 'Gagawin',
    'tasks.inProgress': 'Ginagawa',
    'tasks.blocked': 'Na-block',
    'tasks.done': 'Tapos',
    'tasks.noTasks': 'Wala pang task',
    'tasks.title': 'Titulo',
    'tasks.description': 'Deskripsyon',
    'tasks.type': 'Uri',
    'tasks.priority': 'Priority',
    'tasks.dueDate': 'Takdang Petsa',
    'tasks.assignees': 'Itinalaga',
    'tasks.campaign': 'Campaign',
    'tasks.building': 'Gusali',
    'tasks.low': 'Mababa',
    'tasks.medium': 'Katamtaman',
    'tasks.high': 'Mataas',
    'tasks.urgent': 'Urgent',
    'tasks.outreachPhone': 'Tawag',
    'tasks.outreachDoor': 'Door Knocking',
    'tasks.outreachFlyer': 'Flyer Distribution',
    'tasks.eventPlanning': 'Event Planning',
    'tasks.eventLogistics': 'Event Logistics',
    'tasks.legalResearch': 'Legal Research',
    'tasks.mediaPress': 'Media/Press',
    'tasks.adminPaperwork': 'Admin/Paperwork',
    'tasks.meetingPrep': 'Meeting Prep',
    'tasks.followUp': 'Follow Up',
    'tasks.other': 'Iba pa',
    'tasks.assignToMe': 'Italaga sa Akin',
    'tasks.unassign': 'Alisin',
    'tasks.delete': 'Burahin',
    'tasks.overdue': 'Overdue',
    'tasks.dueSoon': 'Malapit na',
    'tasks.taskDetails': 'Detalye ng Gawain',
    'tasks.editTask': 'I-edit ang Gawain',
    'tasks.deleteTask': 'Burahin ang Gawain',
    'tasks.confirmDelete': 'Sigurado ka bang gusto mong burahin ang gawaing ito?',
    'tasks.createdBy': 'Ginawa ni',
    'tasks.createdAt': 'Ginawa noong',
    'tasks.completedAt': 'Natapos noong',
    'tasks.manage': 'Pamahalaan',
    'tasks.unassigned': 'Hindi naitalaga',
    'tasks.assignSelf': 'Italaga sa sarili',
    'tasks.assignTask': 'Italaga ang Gawain',
    'tasks.assign': 'Italaga',
    'tasks.noProfiles': 'Walang available na profiles',
    'tasks.newTask': 'Bagong Gawain',
    'tasks.titlePlaceholder': 'Ilagay ang pamagat...',
    'tasks.descriptionPlaceholder': 'Magdagdag ng paglalarawan...',
    'tasks.linkToCampaign': 'I-link sa Campaign',
    'tasks.noCampaign': 'Walang campaign',
    'tasks.linkedToCampaign': 'Naka-link sa campaign',
    'tasks.linkedToBuilding': 'Naka-link sa gusali',
    'tasks.createTask': 'Gumawa ng Gawain',
    'tasks.loginRequired': 'Gumawa ng profile para magdagdag ng gawain.',
    'tasks.allPriorities': 'Lahat ng Priority',
    'tasks.allTypes': 'Lahat ng Uri',
    'tasks.status': 'Status',
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
