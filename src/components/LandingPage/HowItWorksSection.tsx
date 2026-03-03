'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { useEditMode } from '@/contexts/EditModeContext'

interface LocaleString {
  en: string
  es: string
  tl: string
  zh: string
  vi: string
}

interface Step {
  icon: string
  title: string | LocaleString
  description: string | LocaleString
}

interface HowItWorksSectionProps {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

// Resolve a value that might be a locale object or plain string
function resolveLocale(value: string | LocaleString | unknown, locale: string): string {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object') {
    const obj = value as Record<string, string>
    return obj[locale] || obj['en'] || ''
  }
  return ''
}

// SVG icons for each step (replaces emojis)
const STEP_ICONS = [
  // 1. Find Your Building - building search
  <svg key="building" className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 0h.008v.008h-.008V7.5z" />
  </svg>,
  // 2. Join the Conversation - chat bubbles
  <svg key="chat" className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
  </svg>,
  // 3. Learn from the Library - book open
  <svg key="book" className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
  </svg>,
  // 4. Give & Receive Mutual Aid - hands/heart
  <svg key="aid" className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
  </svg>,
  // 5. Use Organizer Tools - wrench/cog
  <svg key="tools" className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.384 5.384a2.025 2.025 0 01-2.864-2.864l5.384-5.384m2.864 2.864L18 21.75M12.75 6.75h.008v.008h-.008V6.75zm0 0a3 3 0 10-5.997 1.898l-.003.002A3 3 0 0012.75 6.75zM11.42 15.17l.357-.356a6.044 6.044 0 001.77-5.048M11.42 15.17a6.044 6.044 0 01-5.048 1.77l-.356.357M4.5 20.118a2.25 2.25 0 00.399-.078M4.5 20.118a2.248 2.248 0 01-.318-.108" />
  </svg>,
  // 6. Track Your Impact - chart bar
  <svg key="chart" className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
  </svg>,
]

const DEFAULT_STEPS: Step[] = [
  {
    icon: 'building',
    title: {
      en: 'Find Your Building',
      es: 'Encuentra Tu Edificio',
      tl: 'Hanapin ang Iyong Gusali',
      zh: '找到您的大楼',
      vi: 'Tìm Tòa Nhà Của Bạn',
    },
    description: {
      en: 'Search 16,000+ rental properties in Washoe County. See who owns your building, how many units there are, and whether neighbors are organizing.',
      es: 'Busca entre más de 16,000 propiedades de alquiler en el Condado de Washoe. Ve quién es dueño de tu edificio, cuántas unidades hay y si los vecinos se están organizando.',
      tl: 'Maghanap sa mahigit 16,000 na upa na ari-arian sa Washoe County. Tingnan kung sino ang nagmamay-ari ng iyong gusali, ilan ang mga unit, at kung nag-oorganisa ang mga kapitbahay.',
      zh: '搜索沃肖县超过16,000处出租物业。查看谁拥有您的大楼、有多少单元，以及邻居是否正在组织。',
      vi: 'Tìm kiếm hơn 16.000 bất động sản cho thuê ở Quận Washoe. Xem ai sở hữu tòa nhà, có bao nhiêu căn hộ, và liệu hàng xóm có đang tổ chức không.',
    },
  },
  {
    icon: 'chat',
    title: {
      en: 'Join the Conversation',
      es: 'Únete a la Conversación',
      tl: 'Sumali sa Usapan',
      zh: '加入对话',
      vi: 'Tham Gia Cuộc Trò Chuyện',
    },
    description: {
      en: 'Every building has a chat room. Introduce yourself, share concerns, coordinate with neighbors, and plan actions together.',
      es: 'Cada edificio tiene una sala de chat. Preséntate, comparte preocupaciones, coordina con vecinos y planifica acciones juntos.',
      tl: 'Bawat gusali ay may chat room. Ipakilala ang iyong sarili, ibahagi ang mga alalahanin, makipag-ugnayan sa mga kapitbahay, at magplano ng mga aksyon nang magkasama.',
      zh: '每栋大楼都有聊天室。介绍自己、分享关切、与邻居协调，共同规划行动。',
      vi: 'Mỗi tòa nhà đều có phòng chat. Giới thiệu bản thân, chia sẻ mối quan ngại, phối hợp với hàng xóm và cùng lên kế hoạch hành động.',
    },
  },
  {
    icon: 'book',
    title: {
      en: 'Learn from the Library',
      es: 'Aprende de la Biblioteca',
      tl: 'Matuto mula sa Aklatan',
      zh: '从图书馆学习',
      vi: 'Học Từ Thư Viện',
    },
    description: {
      en: 'Access thousands of resources on tenant rights, organizing tactics, labor history, and housing theory. Build knowledge together.',
      es: 'Accede a miles de recursos sobre derechos de inquilinos, tácticas de organización, historia laboral y teoría de vivienda. Construyan conocimiento juntos.',
      tl: 'Mag-access ng libu-libong mapagkukunan tungkol sa karapatan ng nangungupahan, taktika sa pag-oorganisa, kasaysayan ng paggawa, at teorya ng pabahay. Bumuo ng kaalaman nang magkasama.',
      zh: '获取数千份关于租户权利、组织策略、劳动历史和住房理论的资源。共同积累知识。',
      vi: 'Truy cập hàng nghìn tài nguyên về quyền người thuê nhà, chiến thuật tổ chức, lịch sử lao động và lý thuyết nhà ở. Cùng nhau xây dựng kiến thức.',
    },
  },
  {
    icon: 'aid',
    title: {
      en: 'Give & Receive Mutual Aid',
      es: 'Da y Recibe Ayuda Mutua',
      tl: 'Magbigay at Tumanggap ng Tulong',
      zh: '互助共济',
      vi: 'Cho Đi & Nhận Lại Hỗ Trợ',
    },
    description: {
      en: 'Post needs or offers. Share skills with neighbors. Build a support network that makes your community resilient.',
      es: 'Publica necesidades u ofertas. Comparte habilidades con vecinos. Construye una red de apoyo que haga tu comunidad resiliente.',
      tl: 'Mag-post ng mga pangangailangan o alok. Ibahagi ang mga kasanayan sa mga kapitbahay. Bumuo ng network ng suporta na nagpapalakas sa iyong komunidad.',
      zh: '发布需求或提供帮助。与邻居分享技能。建立一个使社区更有韧性的支持网络。',
      vi: 'Đăng nhu cầu hoặc đề nghị. Chia sẻ kỹ năng với hàng xóm. Xây dựng mạng lưới hỗ trợ giúp cộng đồng vững mạnh.',
    },
  },
  {
    icon: 'tools',
    title: {
      en: 'Use Organizer Tools',
      es: 'Usa Herramientas de Organización',
      tl: 'Gamitin ang mga Tool sa Pag-oorganisa',
      zh: '使用组织工具',
      vi: 'Sử Dụng Công Cụ Tổ Chức',
    },
    description: {
      en: 'Track outreach with canvassing tools. Map building power structures. Run campaigns and coordinate collective action.',
      es: 'Haz seguimiento del alcance con herramientas de sondeo. Mapea las estructuras de poder del edificio. Ejecuta campañas y coordina acciones colectivas.',
      tl: 'Subaybayan ang outreach gamit ang mga tool sa canvassing. I-mapa ang mga istruktura ng kapangyarihan ng gusali. Magpatakbo ng mga kampanya at i-coordinate ang sama-samang pagkilos.',
      zh: '使用上门拜访工具跟踪外展工作。绘制大楼权力结构图。运行活动并协调集体行动。',
      vi: 'Theo dõi tiếp cận bằng công cụ vận động. Lập bản đồ cấu trúc quyền lực tòa nhà. Chạy chiến dịch và phối hợp hành động tập thể.',
    },
  },
  {
    icon: 'chart',
    title: {
      en: 'Track Your Impact',
      es: 'Rastrea Tu Impacto',
      tl: 'Subaybayan ang Iyong Epekto',
      zh: '追踪您的影响',
      vi: 'Theo Dõi Tác Động Của Bạn',
    },
    description: {
      en: 'Create a profile to compare your rent, qualify as a building delegate, and see your organizing activity over time.',
      es: 'Crea un perfil para comparar tu alquiler, calificar como delegado del edificio y ver tu actividad de organización a lo largo del tiempo.',
      tl: 'Gumawa ng profile upang ikumpara ang iyong upa, maging kwalipikado bilang delegado ng gusali, at makita ang iyong aktibidad sa pag-oorganisa sa paglipas ng panahon.',
      zh: '创建个人资料以比较您的租金、获得大楼代表资格，并查看您的组织活动历程。',
      vi: 'Tạo hồ sơ để so sánh tiền thuê, đủ điều kiện làm đại biểu tòa nhà và xem hoạt động tổ chức của bạn theo thời gian.',
    },
  },
]

export function HowItWorksSection({ config }: HowItWorksSectionProps) {
  const { locale, t } = useLanguage()
  const { isEditMode } = useEditMode()

  const heading = resolveLocale(config.heading, locale) || t('landing.howItWorks.heading')
  const subtitle = resolveLocale(config.subtitle, locale) || t('landing.howItWorks.subtitle')
  const steps = (config.steps as Step[]) || DEFAULT_STEPS

  return (
    <section className="py-12 sm:py-16 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2
            className={`text-3xl sm:text-4xl font-bold text-gray-900 mb-4 ${
              isEditMode ? 'outline-dashed outline-2 outline-blue-300 outline-offset-2' : ''
            }`}
          >
            {heading}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Steps - 2 column grid with generous spacing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              {/* Step number + icon row */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 bg-rstu-red text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {index + 1}
                </div>
                <div className="text-rstu-red">
                  {STEP_ICONS[index] || STEP_ICONS[0]}
                </div>
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {resolveLocale(step.title, locale)}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {resolveLocale(step.description, locale)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
