#!/usr/bin/env node
/**
 * Adds missing translation keys identified in the i18n audit.
 * Covers: Mutual Aid locked state, Login form, Password modal,
 * Invite Required, MutualAid statuses/buttons, Reading categories,
 * and misc hardcoded strings.
 */
const fs = require('fs')
const path = require('path')

const LANG_FILE = path.join(__dirname, '..', 'src', 'contexts', 'LanguageContext.tsx')
let content = fs.readFileSync(LANG_FILE, 'utf-8')

// New keys to add per locale
const newKeys = {
  en: {
    // Mutual Aid locked state
    'mutualAid.lockedTitle': 'Mutual Aid',
    'mutualAid.lockedMessage': 'Mutual Aid is available to registered tenants only.',
    'mutualAid.lockedHelp': 'Create a profile to join the mutual aid network and share resources with your neighbors.',
    // Mutual Aid statuses
    'mutualAid.statusOpen': 'Open',
    'mutualAid.statusInProgress': 'In Progress',
    'mutualAid.statusFulfilled': 'Fulfilled',
    'mutualAid.statusAvailable': 'Available',
    'mutualAid.statusCheckedOut': 'Checked Out',
    // Mutual Aid labels
    'mutualAid.typeNeed': 'Need',
    'mutualAid.typeOffer': 'Offer',
    'mutualAid.building': 'Building',
    'mutualAid.pickupLocation': 'Pickup Location',
    'mutualAid.sharedBy': 'Shared by',
    'mutualAid.postedBy': 'Posted by',
    'mutualAid.expectedReturn': 'Expected return',
    // Mutual Aid buttons
    'mutualAid.offerToHelp': 'Offer to Help',
    'mutualAid.requestThis': 'Request This',
    'mutualAid.checkOut': 'Check Out',
    'mutualAid.returnItem': 'Return Item',
    // Login form
    'login.forgotPassword': 'Forgot password?',
    'login.resetPassword': 'Reset Password',
    'login.resetDescription': 'Enter your email to receive a reset link',
    'login.sending': 'Sending...',
    'login.sendResetLink': 'Send Reset Link',
    'login.checkEmail': 'Check your email',
    'login.resetSentMessage': 'If an account exists for this email, you will receive a password reset link shortly.',
    'login.backToLogin': 'Back to Login',
    // Password modal
    'login.enterPassword': 'Enter Password',
    'login.passwordRequired': 'requires a password to log in',
    'login.passwordPlaceholderModal': 'Enter your password',
    'login.cancel': 'Cancel',
    // Invite required
    'profile.inviteRequired': 'Invite Required',
    'profile.inviteRequiredMessage': 'Profile creation requires an invite code from an existing member. Ask a neighbor or organizer for an invite link.',
    // Reading categories
    'reading.category.abolition': 'Abolition',
    'reading.category.arts-culture-music': 'Arts Culture Music',
    'reading.category.contemporary-analysis': 'Contemporary Analysis',
    'reading.category.data-requests': 'Data Requests',
    'reading.category.economic-alternatives': 'Economic Alternatives',
    'reading.category.environmental-justice': 'Environmental Justice',
    'reading.category.feminist-theory': 'Feminist Theory',
    'reading.category.governance': 'Governance',
    'reading.category.housing': 'Housing',
    'reading.category.international-solidarity': 'International Solidarity',
    'reading.category.labor': 'Labor',
    'reading.category.legislation': 'Legislation',
    'reading.category.organizing': 'Organizing',
    'reading.category.technology-digital-justice': 'Technology Digital Justice',
    'reading.category.notes': 'Notes',
    'reading.category.direct-action': 'Direct Action',
    'reading.category.tenant-rights': 'Tenant Rights',
    'reading.category.theory': 'Theory',
    'reading.category.history': 'History',
    'reading.category.strikes': 'Strikes',
  },
  es: {
    'mutualAid.lockedTitle': 'Ayuda Mutua',
    'mutualAid.lockedMessage': 'La Ayuda Mutua esta disponible solo para inquilinos registrados.',
    'mutualAid.lockedHelp': 'Crea un perfil para unirte a la red de ayuda mutua y compartir recursos con tus vecinos.',
    'mutualAid.statusOpen': 'Abierto',
    'mutualAid.statusInProgress': 'En Progreso',
    'mutualAid.statusFulfilled': 'Cumplido',
    'mutualAid.statusAvailable': 'Disponible',
    'mutualAid.statusCheckedOut': 'Prestado',
    'mutualAid.typeNeed': 'Necesidad',
    'mutualAid.typeOffer': 'Oferta',
    'mutualAid.building': 'Edificio',
    'mutualAid.pickupLocation': 'Lugar de Recogida',
    'mutualAid.sharedBy': 'Compartido por',
    'mutualAid.postedBy': 'Publicado por',
    'mutualAid.expectedReturn': 'Devolucion esperada',
    'mutualAid.offerToHelp': 'Ofrecer Ayuda',
    'mutualAid.requestThis': 'Solicitar Esto',
    'mutualAid.checkOut': 'Tomar Prestado',
    'mutualAid.returnItem': 'Devolver Articulo',
    'login.forgotPassword': '¿Olvidaste tu contraseña?',
    'login.resetPassword': 'Restablecer Contraseña',
    'login.resetDescription': 'Ingresa tu correo para recibir un enlace de restablecimiento',
    'login.sending': 'Enviando...',
    'login.sendResetLink': 'Enviar Enlace',
    'login.checkEmail': 'Revisa tu correo',
    'login.resetSentMessage': 'Si existe una cuenta con este correo, recibiras un enlace de restablecimiento pronto.',
    'login.backToLogin': 'Volver al Inicio de Sesion',
    'login.enterPassword': 'Ingresa Contraseña',
    'login.passwordRequired': 'requiere contraseña para iniciar sesion',
    'login.passwordPlaceholderModal': 'Ingresa tu contraseña',
    'login.cancel': 'Cancelar',
    'profile.inviteRequired': 'Invitacion Requerida',
    'profile.inviteRequiredMessage': 'La creacion de perfil requiere un codigo de invitacion de un miembro existente. Pide a un vecino u organizador un enlace de invitacion.',
    'reading.category.abolition': 'Abolicion',
    'reading.category.arts-culture-music': 'Arte, Cultura y Musica',
    'reading.category.contemporary-analysis': 'Analisis Contemporaneo',
    'reading.category.data-requests': 'Solicitudes de Datos',
    'reading.category.economic-alternatives': 'Alternativas Economicas',
    'reading.category.environmental-justice': 'Justicia Ambiental',
    'reading.category.feminist-theory': 'Teoria Feminista',
    'reading.category.governance': 'Gobernanza',
    'reading.category.housing': 'Vivienda',
    'reading.category.international-solidarity': 'Solidaridad Internacional',
    'reading.category.labor': 'Trabajo',
    'reading.category.legislation': 'Legislacion',
    'reading.category.organizing': 'Organizacion',
    'reading.category.technology-digital-justice': 'Tecnologia y Justicia Digital',
    'reading.category.notes': 'Notas',
    'reading.category.direct-action': 'Accion Directa',
    'reading.category.tenant-rights': 'Derechos del Inquilino',
    'reading.category.theory': 'Teoria',
    'reading.category.history': 'Historia',
    'reading.category.strikes': 'Huelgas',
  },
  tl: {
    'mutualAid.lockedTitle': 'Tulong-Tulong',
    'mutualAid.lockedMessage': 'Ang Tulong-Tulong ay para lamang sa mga rehistradong nangungupahan.',
    'mutualAid.lockedHelp': 'Gumawa ng profile upang sumali sa network ng tulong-tulong at magbahagi ng mga mapagkukunan sa iyong mga kapitbahay.',
    'mutualAid.statusOpen': 'Bukas',
    'mutualAid.statusInProgress': 'Isinasagawa',
    'mutualAid.statusFulfilled': 'Natupad',
    'mutualAid.statusAvailable': 'Magagamit',
    'mutualAid.statusCheckedOut': 'Nahiram',
    'mutualAid.typeNeed': 'Pangangailangan',
    'mutualAid.typeOffer': 'Alok',
    'mutualAid.building': 'Gusali',
    'mutualAid.pickupLocation': 'Lugar ng Pagkuha',
    'mutualAid.sharedBy': 'Ibinahagi ni',
    'mutualAid.postedBy': 'Nai-post ni',
    'mutualAid.expectedReturn': 'Inaasahang pagbalik',
    'mutualAid.offerToHelp': 'Mag-alok ng Tulong',
    'mutualAid.requestThis': 'Hilingin Ito',
    'mutualAid.checkOut': 'Hiramin',
    'mutualAid.returnItem': 'Ibalik ang Item',
    'login.forgotPassword': 'Nakalimutan ang password?',
    'login.resetPassword': 'I-reset ang Password',
    'login.resetDescription': 'Ilagay ang iyong email upang makatanggap ng reset link',
    'login.sending': 'Ipinapadala...',
    'login.sendResetLink': 'Ipadala ang Reset Link',
    'login.checkEmail': 'Tingnan ang iyong email',
    'login.resetSentMessage': 'Kung may account para sa email na ito, makakatanggap ka ng reset link sa lalong madaling panahon.',
    'login.backToLogin': 'Bumalik sa Pag-login',
    'login.enterPassword': 'Ilagay ang Password',
    'login.passwordRequired': 'kailangan ng password upang mag-login',
    'login.passwordPlaceholderModal': 'Ilagay ang iyong password',
    'login.cancel': 'Kanselahin',
    'profile.inviteRequired': 'Kailangan ng Imbitasyon',
    'profile.inviteRequiredMessage': 'Ang paggawa ng profile ay nangangailangan ng invite code mula sa isang kasalukuyang miyembro. Humingi sa kapitbahay o organizer ng invite link.',
    'reading.category.abolition': 'Abolisyon',
    'reading.category.arts-culture-music': 'Sining, Kultura at Musika',
    'reading.category.contemporary-analysis': 'Kontemporaryong Pagsusuri',
    'reading.category.data-requests': 'Mga Kahilingan ng Datos',
    'reading.category.economic-alternatives': 'Mga Alternatibong Pang-ekonomiya',
    'reading.category.environmental-justice': 'Katarungang Pangkapaligiran',
    'reading.category.feminist-theory': 'Teoryang Peminista',
    'reading.category.governance': 'Pamamahala',
    'reading.category.housing': 'Pabahay',
    'reading.category.international-solidarity': 'Pandaigdigang Pagkakaisa',
    'reading.category.labor': 'Paggawa',
    'reading.category.legislation': 'Batas',
    'reading.category.organizing': 'Pag-oorganisa',
    'reading.category.technology-digital-justice': 'Teknolohiya at Digital na Katarungan',
    'reading.category.notes': 'Mga Tala',
    'reading.category.direct-action': 'Direktang Aksyon',
    'reading.category.tenant-rights': 'Mga Karapatan ng Nangungupahan',
    'reading.category.theory': 'Teorya',
    'reading.category.history': 'Kasaysayan',
    'reading.category.strikes': 'Welga',
  },
  zh: {
    'mutualAid.lockedTitle': '互助',
    'mutualAid.lockedMessage': '互助仅对已注册的租户开放。',
    'mutualAid.lockedHelp': '创建个人资料以加入互助网络，与邻居共享资源。',
    'mutualAid.statusOpen': '开放',
    'mutualAid.statusInProgress': '进行中',
    'mutualAid.statusFulfilled': '已完成',
    'mutualAid.statusAvailable': '可用',
    'mutualAid.statusCheckedOut': '已借出',
    'mutualAid.typeNeed': '需求',
    'mutualAid.typeOffer': '提供',
    'mutualAid.building': '建筑',
    'mutualAid.pickupLocation': '取件地点',
    'mutualAid.sharedBy': '分享者',
    'mutualAid.postedBy': '发布者',
    'mutualAid.expectedReturn': '预计归还',
    'mutualAid.offerToHelp': '提供帮助',
    'mutualAid.requestThis': '请求此项',
    'mutualAid.checkOut': '借出',
    'mutualAid.returnItem': '归还物品',
    'login.forgotPassword': '忘记密码？',
    'login.resetPassword': '重置密码',
    'login.resetDescription': '输入您的电子邮件以接收重置链接',
    'login.sending': '发送中...',
    'login.sendResetLink': '发送重置链接',
    'login.checkEmail': '检查您的邮箱',
    'login.resetSentMessage': '如果此邮箱存在账户，您将很快收到密码重置链接。',
    'login.backToLogin': '返回登录',
    'login.enterPassword': '输入密码',
    'login.passwordRequired': '需要密码才能登录',
    'login.passwordPlaceholderModal': '输入您的密码',
    'login.cancel': '取消',
    'profile.inviteRequired': '需要邀请',
    'profile.inviteRequiredMessage': '创建个人资料需要现有成员的邀请码。请向邻居或组织者索取邀请链接。',
    'reading.category.abolition': '废除主义',
    'reading.category.arts-culture-music': '艺术、文化与音乐',
    'reading.category.contemporary-analysis': '当代分析',
    'reading.category.data-requests': '数据请求',
    'reading.category.economic-alternatives': '经济替代方案',
    'reading.category.environmental-justice': '环境正义',
    'reading.category.feminist-theory': '女性主义理论',
    'reading.category.governance': '治理',
    'reading.category.housing': '住房',
    'reading.category.international-solidarity': '国际团结',
    'reading.category.labor': '劳工',
    'reading.category.legislation': '立法',
    'reading.category.organizing': '组织',
    'reading.category.technology-digital-justice': '科技与数字正义',
    'reading.category.notes': '笔记',
    'reading.category.direct-action': '直接行动',
    'reading.category.tenant-rights': '租户权利',
    'reading.category.theory': '理论',
    'reading.category.history': '历史',
    'reading.category.strikes': '罢工',
  },
  vi: {
    'mutualAid.lockedTitle': 'Ho tro lan nhau',
    'mutualAid.lockedMessage': 'Ho tro lan nhau chi danh cho nguoi thue da dang ky.',
    'mutualAid.lockedHelp': 'Tao ho so de tham gia mang luoi ho tro lan nhau va chia se tai nguyen voi hang xom cua ban.',
    'mutualAid.statusOpen': 'Mo',
    'mutualAid.statusInProgress': 'Dang thuc hien',
    'mutualAid.statusFulfilled': 'Da hoan thanh',
    'mutualAid.statusAvailable': 'Co san',
    'mutualAid.statusCheckedOut': 'Da cho muon',
    'mutualAid.typeNeed': 'Nhu cau',
    'mutualAid.typeOffer': 'Cung cap',
    'mutualAid.building': 'Toa nha',
    'mutualAid.pickupLocation': 'Dia diem nhan',
    'mutualAid.sharedBy': 'Chia se boi',
    'mutualAid.postedBy': 'Dang boi',
    'mutualAid.expectedReturn': 'Du kien tra lai',
    'mutualAid.offerToHelp': 'De nghi giup do',
    'mutualAid.requestThis': 'Yeu cau muc nay',
    'mutualAid.checkOut': 'Muon',
    'mutualAid.returnItem': 'Tra lai',
    'login.forgotPassword': 'Quen mat khau?',
    'login.resetPassword': 'Dat lai mat khau',
    'login.resetDescription': 'Nhap email cua ban de nhan lien ket dat lai',
    'login.sending': 'Dang gui...',
    'login.sendResetLink': 'Gui lien ket dat lai',
    'login.checkEmail': 'Kiem tra email cua ban',
    'login.resetSentMessage': 'Neu tai khoan ton tai voi email nay, ban se nhan duoc lien ket dat lai mat khau som.',
    'login.backToLogin': 'Quay lai dang nhap',
    'login.enterPassword': 'Nhap mat khau',
    'login.passwordRequired': 'can mat khau de dang nhap',
    'login.passwordPlaceholderModal': 'Nhap mat khau cua ban',
    'login.cancel': 'Huy',
    'profile.inviteRequired': 'Can loi moi',
    'profile.inviteRequiredMessage': 'Viec tao ho so yeu cau ma moi tu thanh vien hien tai. Hay hoi hang xom hoac nguoi to chuc de lay lien ket moi.',
    'reading.category.abolition': 'Bai bo',
    'reading.category.arts-culture-music': 'Nghe thuat, Van hoa va Am nhac',
    'reading.category.contemporary-analysis': 'Phan tich Duong dai',
    'reading.category.data-requests': 'Yeu cau Du lieu',
    'reading.category.economic-alternatives': 'Giai phap Kinh te',
    'reading.category.environmental-justice': 'Cong bang Moi truong',
    'reading.category.feminist-theory': 'Ly thuyet Nu quyen',
    'reading.category.governance': 'Quan tri',
    'reading.category.housing': 'Nha o',
    'reading.category.international-solidarity': 'Doan ket Quoc te',
    'reading.category.labor': 'Lao dong',
    'reading.category.legislation': 'Phap luat',
    'reading.category.organizing': 'To chuc',
    'reading.category.technology-digital-justice': 'Cong nghe va Cong bang So',
    'reading.category.notes': 'Ghi chu',
    'reading.category.direct-action': 'Hanh dong Truc tiep',
    'reading.category.tenant-rights': 'Quyen Nguoi thue',
    'reading.category.theory': 'Ly thuyet',
    'reading.category.history': 'Lich su',
    'reading.category.strikes': 'Dinh cong',
  },
}

// Locale markers in LanguageContext.tsx to find insertion points
const localeMarkers = {
  en: /('nav\.home':\s*'Home')/,
  es: /('nav\.home':\s*'Inicio')/,
  tl: /('nav\.home':\s*'Home')/g, // TL has nav.home as 'Home'
  zh: /('nav\.home':\s*'首页')/,
  vi: /('nav\.home':\s*'Trang chủ')/,
}

// For each locale, find the LAST key in that locale block and insert after it
// Strategy: find each locale's translation object and add keys before its closing

let added = 0
let skipped = 0

for (const [locale, keys] of Object.entries(newKeys)) {
  for (const [key, value] of Object.entries(keys)) {
    // Check if key already exists for this locale
    const escapedKey = key.replace(/\./g, '\\.')
    const existsRegex = new RegExp(`'${escapedKey}':\\s*'`)

    // We need to find the right locale block. Each locale block starts after a specific pattern.
    // Let's check if this specific key already exists anywhere in the file
    const keyInFile = content.includes(`'${key}': '`)

    // Check if this exact key+value combo exists or if the key exists in the locale block
    // We need a smarter approach - let's just check if the key appears the expected number of times
    // (once per locale that has it)
    const allOccurrences = content.split(`'${key}':`).length - 1

    // For locale-specific check, we look for the key near locale-specific strings
    // This is complex, so let's just add it if the key doesn't exist at all or exists fewer times than needed
    if (allOccurrences >= Object.keys(newKeys).length) {
      skipped++
      continue
    }
  }
}

// Simpler approach: build key blocks and insert them at known positions
// Find the end of each locale's translation block

function insertKeysInLocale(content, localeId, keys) {
  // Find a reliable anchor point for each locale
  const anchors = {
    en: "'nav.home': 'Home',",
    es: "'nav.home': 'Inicio',",
    tl: "'nav.home': 'Home',\n    'nav.organize': 'Organisahin',",
    zh: "'nav.home': '首页',",
    vi: "'nav.home': 'Trang chủ',",
  }

  // For each locale, find its section and add missing keys
  // We'll insert new keys after the last existing key in each category
  // Strategy: find the locale section end by looking for the last key pattern

  let insertions = []
  for (const [key, value] of Object.entries(keys)) {
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    // Check if this key exists in this locale section
    // Simpler: just check globally if we have the right count
    const re = new RegExp(`'${escapedKey}':\\s*'[^']*'`, 'g')
    const matches = content.match(re)
    const count = matches ? matches.length : 0

    // We expect this key to appear in all 5 locales
    // If it appears fewer times, we need to add it to the missing locales
    // For simplicity, let's just check if it exists at all for this locale
    // by looking near locale-specific strings

    if (count === 0) {
      // Key doesn't exist at all — add to all insertion blocks
      insertions.push({ key, value })
    }
  }

  return insertions
}

// Build the complete insertion blocks
const localeAnchors = {
  en: { search: "'reading.viewAll': 'View All'", offset: 'after' },
  es: { search: "'reading.viewAll': 'Ver Todo'", offset: 'after' },
  tl: { search: "'reading.viewAll': 'Tingnan Lahat'", offset: 'after' },
  zh: { search: "'reading.viewAll': '查看全部'", offset: 'after' },
  vi: { search: "'reading.viewAll': 'Xem Tất cả'", offset: 'after' },
}

// Fallback anchors if the first ones don't work
const fallbackAnchors = {
  en: "'reading.library': 'Reading Library'",
  es: "'reading.library': 'Biblioteca de Lectura'",
  tl: "'reading.library': 'Aklatan ng Pagbasa'",
  zh: "'reading.library': '阅读图书馆'",
  vi: "'reading.library': 'Thư viện Đọc'",
}

for (const [locale, keys] of Object.entries(newKeys)) {
  // Find what keys need adding (not yet present)
  const keysToAdd = {}
  for (const [key, value] of Object.entries(keys)) {
    // Check if this exact key-value exists
    const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const pattern = `'${key}': '`

    // Count occurrences - we just need to know if this locale has it
    // Simple heuristic: search for key + nearby locale indicator
    if (!content.includes(`'${key}': '${value}'`)) {
      // Check if key exists with different value (already translated differently)
      // by looking in the approximate region
      keysToAdd[key] = value
    }
  }

  if (Object.keys(keysToAdd).length === 0) {
    console.log(`${locale}: All keys present, skipping`)
    continue
  }

  // Build insertion string
  const lines = Object.entries(keysToAdd)
    .map(([k, v]) => `    '${k}': '${v}',`)
    .join('\n')

  // Find insertion point - look for anchor
  let anchor = localeAnchors[locale]?.search || fallbackAnchors[locale]
  const anchorIdx = content.indexOf(anchor)

  if (anchorIdx === -1) {
    // Try fallback
    anchor = fallbackAnchors[locale]
    const fallbackIdx = content.indexOf(anchor)
    if (fallbackIdx === -1) {
      console.log(`${locale}: Could not find anchor, skipping (tried: ${anchor})`)
      continue
    }
    // Insert after the fallback anchor line
    const lineEnd = content.indexOf('\n', fallbackIdx)
    content = content.slice(0, lineEnd + 1) +
      `    // --- i18n audit: missing translations ---\n` +
      lines + '\n' +
      content.slice(lineEnd + 1)
    console.log(`${locale}: Added ${Object.keys(keysToAdd).length} keys (fallback anchor)`)
  } else {
    // Insert after the anchor line
    const lineEnd = content.indexOf('\n', anchorIdx)
    content = content.slice(0, lineEnd + 1) +
      `    // --- i18n audit: missing translations ---\n` +
      lines + '\n' +
      content.slice(lineEnd + 1)
    console.log(`${locale}: Added ${Object.keys(keysToAdd).length} keys`)
  }
}

fs.writeFileSync(LANG_FILE, content)
console.log('\nDone! Translation keys added to LanguageContext.tsx')
