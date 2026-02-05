import { safeGetJson, safeSetItem } from '../utils/safeStorage'
import { supabase } from '../services/supabase'

// ============================================================================
// Types
// ============================================================================

export interface SectionDescriptor {
  id: string
  type: string
  config: Record<string, unknown>
}

export interface LandingPageConfig {
  id: string
  name: string
  sections: SectionDescriptor[]
  created_at: string
  updated_at: string
}

// ============================================================================
// Constants
// ============================================================================

const PAGES_KEY = 'rstu_landing_pages'
const ACTIVE_KEY = 'rstu_active_landing_page'
const MIGRATION_KEY = 'rstu_landing_page_version'
const CURRENT_VERSION = 4 // Bump when DEFAULT_PAGE_1 changes

let _uid = 0
function uid() {
  return `s-${Date.now()}-${++_uid}`
}

export const SECTION_TYPES = [
  { type: 'columns', label: 'Column Row' },
  { type: 'hero', label: 'Hero' },
  { type: 'rights', label: 'Tenant Rights' },
  { type: 'organizing', label: 'Organizing Works' },
  { type: 'crisis', label: 'Local Crisis' },
  { type: 'action', label: 'What You Can Do' },
  { type: 'cta', label: 'Call to Action' },
  { type: 'mission', label: 'Mission Statement' },
  { type: 'values', label: 'Core Values' },
  { type: 'philosophy', label: 'Philosophy' },
  { type: 'readings', label: 'Featured Readings' },
  { type: 'text', label: 'Custom Text' },
  { type: 'cards', label: 'Custom Cards' },
  { type: 'image-banner', label: 'Image Banner' },
  { type: 'how-it-works', label: 'How It Works' },
] as const

export const COLUMN_LAYOUTS = [
  { id: '1-1',     label: 'Two Equal',    cols: 2, template: '1fr 1fr' },
  { id: '1-2',     label: 'Narrow + Wide', cols: 2, template: '1fr 2fr' },
  { id: '2-1',     label: 'Wide + Narrow', cols: 2, template: '2fr 1fr' },
  { id: '1-1-1',   label: 'Three Equal',  cols: 3, template: '1fr 1fr 1fr' },
  { id: '1-1-1-1', label: 'Four Equal',   cols: 4, template: '1fr 1fr 1fr 1fr' },
] as const

export const SECTION_CATEGORIES = [
  {
    label: 'Layout',
    items: [
      { type: 'columns', label: 'Column Row', description: 'Multi-column layout row' },
    ],
  },
  {
    label: 'Content',
    items: [
      { type: 'text', label: 'Custom Text', description: 'Heading and body text' },
      { type: 'cards', label: 'Custom Cards', description: 'Grid of editable cards' },
      { type: 'image-banner', label: 'Image Banner', description: 'Full-width colored banner' },
      { type: 'hero', label: 'Hero', description: 'Logo, headline, and CTAs' },
      { type: 'cta', label: 'Call to Action', description: 'Main call-to-action block' },
    ],
  },
  {
    label: 'Prebuilt',
    items: [
      { type: 'rights', label: 'Tenant Rights', description: 'Nevada tenant rights listing' },
      { type: 'organizing', label: 'Organizing Works', description: 'How organizing works overview' },
      { type: 'crisis', label: 'Local Crisis', description: 'Reno housing crisis stats' },
      { type: 'action', label: 'What You Can Do', description: 'Legal help and resources' },
      { type: 'mission', label: 'Mission Statement', description: 'Mission, vision, principles' },
      { type: 'values', label: 'Core Values', description: 'Racial justice, anti-gentrification' },
      { type: 'philosophy', label: 'Philosophy', description: 'Municipalism, mutual aid, dual power' },
      { type: 'readings', label: 'Featured Readings', description: 'Curated document highlights' },
      { type: 'how-it-works', label: 'How It Works', description: '6-step feature tour' },
    ],
  },
] as const

export const DEFAULT_PAGE_1: LandingPageConfig = {
  id: 'page-1',
  name: 'Default',
  sections: [
    { id: 'def-hero', type: 'hero', config: {} },
    {
      id: 'def-stronger',
      type: 'text',
      config: {
        heading: {
          en: "We're Stronger Together",
          es: "Juntos Somos Más Fuertes",
          tl: "Mas Malakas Tayo Kung Magkasama",
          zh: "团结就是力量",
          vi: "Chúng Ta Mạnh Mẽ Hơn Khi Đoàn Kết",
        },
        body: {
          en: "As Reno renters face skyrocketing housing costs, limited housing supply, and state laws that put profits over people — we must band together to fight for safe, secure, affordable, and fair housing for all in the Reno-Sparks area.\n\nTogether, we can win safe, dignified, and affordable housing for all.",
          es: "Mientras los inquilinos de Reno enfrentan costos de vivienda disparados, oferta limitada y leyes estatales que priorizan las ganancias sobre las personas — debemos unirnos para luchar por viviendas seguras, asequibles y justas para todos en el área de Reno-Sparks.\n\nJuntos podemos ganar viviendas seguras, dignas y asequibles para todos.",
          tl: "Habang ang mga nangungupahan sa Reno ay nahaharap sa tumataas na gastos sa pabahay, limitadong suplay, at mga batas ng estado na inuuna ang kita kaysa sa tao — kailangan nating magkaisa upang ipaglaban ang ligtas, abot-kaya, at makatarungang pabahay para sa lahat sa Reno-Sparks.\n\nMagkasama, makakamit natin ang ligtas, marangal, at abot-kayang pabahay para sa lahat.",
          zh: "当雷诺的租户面临飙升的住房成本、有限的住房供应以及将利润置于人民之上的州法律时——我们必须团结起来，为雷诺-斯帕克斯地区所有人争取安全、可靠、负担得起且公平的住房。\n\n团结一致，我们能够为所有人赢得安全、体面和负担得起的住房。",
          vi: "Khi người thuê nhà ở Reno đối mặt với chi phí nhà ở tăng vọt, nguồn cung hạn chế và luật tiểu bang đặt lợi nhuận trên con người — chúng ta phải đoàn kết để đấu tranh cho nhà ở an toàn, ổn định, giá cả phải chăng và công bằng cho tất cả mọi người ở khu vực Reno-Sparks.\n\nCùng nhau, chúng ta có thể giành được nhà ở an toàn, đàng hoàng và giá cả phải chăng cho tất cả.",
        },
        bgColor: 'gray',
      },
    },
    {
      id: 'def-values',
      type: 'cards',
      config: {
        heading: {
          en: 'Our Core Values',
          es: 'Nuestros Valores Fundamentales',
          tl: 'Ang Aming Mga Pangunahing Halaga',
          zh: '我们的核心价值观',
          vi: 'Giá Trị Cốt Lõi Của Chúng Tôi',
        },
        layout: 'stacked',
        cards: [
          {
            title: {
              en: 'Housing is a Human Right',
              es: 'La Vivienda es un Derecho Humano',
              tl: 'Ang Pabahay ay Karapatan ng Tao',
              zh: '住房是一项人权',
              vi: 'Nhà Ở Là Quyền Con Người',
            },
            body: {
              en: "Everyone deserves safe, stable, affordable housing regardless of circumstances. The commodification of housing has led to the vast inequality that we see today. We fight for a city in which no one is left without a home.",
              es: "Todos merecen viviendas seguras, estables y asequibles sin importar las circunstancias. La mercantilización de la vivienda ha llevado a la vasta desigualdad que vemos hoy. Luchamos por una ciudad donde nadie se quede sin hogar.",
              tl: "Lahat ay nararapat sa ligtas, matatag, at abot-kayang pabahay anuman ang kalagayan. Ang pagkomersiyo ng pabahay ay humantong sa malaking hindi pagkakapantay-pantay na nakikita natin ngayon. Lumalaban kami para sa isang lungsod kung saan walang maiiwang walang tahanan.",
              zh: "每个人都应该拥有安全、稳定、负担得起的住房，无论境遇如何。住房的商品化导致了我们今天看到的巨大不平等。我们为一个没有人无家可归的城市而奋斗。",
              vi: "Mọi người đều xứng đáng có nhà ở an toàn, ổn định, giá cả phải chăng bất kể hoàn cảnh. Việc thương mại hóa nhà ở đã dẫn đến sự bất bình đẳng to lớn mà chúng ta thấy ngày nay. Chúng tôi đấu tranh cho một thành phố không ai bị bỏ lại không có nhà.",
            },
          },
          {
            title: {
              en: "We're a Tenants Organization First and Foremost",
              es: "Somos una Organización de Inquilinos Ante Todo",
              tl: "Kami ay Organisasyon ng mga Nangungupahan Una at Pinakamahalaga",
              zh: "我们首先是租户组织",
              vi: "Chúng Tôi Là Tổ Chức Người Thuê Nhà Trước Hết",
            },
            body: {
              en: "We fight for tenants, not for housing. The crisis in our region is not solely due to a lack of housing and will not be solved simply with more development. True justice will only be achieved by giving power to tenants to control their own housing.",
              es: "Luchamos por los inquilinos, no por la vivienda. La crisis en nuestra región no se debe únicamente a la falta de viviendas y no se resolverá simplemente con más desarrollo. La verdadera justicia solo se logrará dando poder a los inquilinos para controlar su propia vivienda.",
              tl: "Lumalaban kami para sa mga nangungupahan, hindi para sa pabahay. Ang krisis sa aming rehiyon ay hindi lamang dahil sa kakulangan ng pabahay at hindi malulutas sa pamamagitan ng mas maraming development. Ang tunay na katarungan ay makakamit lamang sa pamamagitan ng pagbibigay ng kapangyarihan sa mga nangungupahan upang kontrolin ang kanilang sariling pabahay.",
              zh: "我们为租户而战，而不是为住房而战。我们地区的危机不仅仅是因为住房短缺，也不会仅靠更多开发来解决。只有赋予租户控制自己住房的权力，才能实现真正的公正。",
              vi: "Chúng tôi đấu tranh cho người thuê nhà, không phải cho nhà ở. Cuộc khủng hoảng trong khu vực không chỉ do thiếu nhà ở và sẽ không được giải quyết chỉ bằng phát triển thêm. Công lý thực sự chỉ đạt được khi trao quyền cho người thuê nhà kiểm soát nhà ở của chính họ.",
            },
          },
          {
            title: {
              en: 'Houselessness is the Result of the Commodification of Housing',
              es: 'La Falta de Vivienda es el Resultado de la Mercantilización',
              tl: 'Ang Kawalan ng Tahanan ay Resulta ng Pagkomersiyo ng Pabahay',
              zh: '无家可归是住房商品化的结果',
              vi: 'Vô Gia Cư Là Kết Quả Của Thương Mại Hóa Nhà Ở',
            },
            body: {
              en: "Houselessness is an inevitable consequence of treating housing like a commodity. We oppose any laws and policies that criminalize houselessness or target unhoused people for harassment. We are fighting for a future where houselessness ends because everyone has a home.",
              es: "La falta de vivienda es una consecuencia inevitable de tratar la vivienda como una mercancía. Nos oponemos a cualquier ley y política que criminalice la falta de vivienda o persiga a las personas sin hogar. Luchamos por un futuro donde la falta de vivienda termine porque todos tengan un hogar.",
              tl: "Ang kawalan ng tahanan ay hindi maiiwasang resulta ng pagtrato sa pabahay bilang kalakal. Tinutulan namin ang anumang batas at patakaran na nagkokriminalize sa kawalan ng tahanan o nag-ta-target sa mga taong walang tirahan. Ipinaglalaban namin ang isang kinabukasan kung saan matatapos ang kawalan ng tahanan dahil lahat ay may tahanan.",
              zh: "无家可归是将住房当作商品的必然后果。我们反对任何将无家可归定为犯罪或骚扰无家可归者的法律和政策。我们正在为一个因每个人都有家而终结无家可归的未来而奋斗。",
              vi: "Vô gia cư là hậu quả không thể tránh khỏi của việc coi nhà ở như hàng hóa. Chúng tôi phản đối mọi luật và chính sách hình sự hóa tình trạng vô gia cư hoặc nhắm vào người không có nhà ở. Chúng tôi đang đấu tranh cho một tương lai nơi tình trạng vô gia cư chấm dứt vì mọi người đều có nhà.",
            },
          },
        ],
      },
    },
    { id: 'def-rights', type: 'rights', config: {} },
    { id: 'def-organizing', type: 'organizing', config: {} },
    { id: 'def-crisis', type: 'crisis', config: {} },
    { id: 'def-action', type: 'action', config: {} },
    { id: 'def-cta', type: 'cta', config: {} },
  ],
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}

export const PRESET_PAGE_2: LandingPageConfig = {
  id: 'page-2',
  name: 'RSTU.org Mirror',
  sections: [
    {
      id: 'mirror-hero',
      type: 'hero',
      config: {
        showLogo: true,
        headlineOverride: 'Homes for people, not for profit.',
        taglineOverride: 'A volunteer-led union building and protecting tenant power through collective action.',
        missionOverride: 'As Reno renters face skyrocketing housing costs, limited housing supply, and state laws that put profits over people — we fight for safe, secure, affordable, and fair housing for all.',
      },
    },
    {
      id: 'mirror-mission',
      type: 'text',
      config: {
        heading: {
          en: "We're Stronger Together",
          es: "Juntos Somos Más Fuertes",
          tl: "Mas Malakas Tayo Kung Magkasama",
          zh: "团结就是力量",
          vi: "Chúng Ta Mạnh Mẽ Hơn Khi Đoàn Kết",
        },
        body: {
          en: "Together, we can win safe, dignified, and affordable housing for all. When tenants organize, we have the power to hold landlords accountable, change unjust laws, and build a movement for housing justice.",
          es: "Juntos podemos ganar viviendas seguras, dignas y asequibles para todos. Cuando los inquilinos se organizan, tenemos el poder de responsabilizar a los propietarios, cambiar leyes injustas y construir un movimiento por la justicia de vivienda.",
          tl: "Magkasama, makakamit natin ang ligtas, marangal, at abot-kayang pabahay para sa lahat. Kapag nag-organisa ang mga nangungupahan, may kapangyarihan tayong papanagutin ang mga may-ari, baguhin ang hindi makatarungang mga batas, at bumuo ng kilusan para sa katarungan sa pabahay.",
          zh: "团结一致，我们能够为所有人赢得安全、体面和负担得起的住房。当租户组织起来，我们就有力量让房东承担责任、改变不公正的法律、并建立一个住房正义运动。",
          vi: "Cùng nhau, chúng ta có thể giành được nhà ở an toàn, đàng hoàng và giá cả phải chăng cho tất cả. Khi người thuê nhà tổ chức lại, chúng ta có sức mạnh buộc chủ nhà phải chịu trách nhiệm, thay đổi luật bất công và xây dựng phong trào vì công lý nhà ở.",
        },
        bgColor: 'white',
      },
    },
    {
      id: 'mirror-values',
      type: 'cards',
      config: {
        heading: {
          en: 'Our Core Values',
          es: 'Nuestros Valores Fundamentales',
          tl: 'Ang Aming Mga Pangunahing Halaga',
          zh: '我们的核心价值观',
          vi: 'Giá Trị Cốt Lõi Của Chúng Tôi',
        },
        cards: [
          {
            title: {
              en: 'Housing is a Human Right',
              es: 'La Vivienda es un Derecho Humano',
              tl: 'Ang Pabahay ay Karapatan ng Tao',
              zh: '住房是一项人权',
              vi: 'Nhà Ở Là Quyền Con Người',
            },
            body: {
              en: 'Housing is a basic human necessity, not a commodity. Everyone deserves safe, stable, affordable shelter regardless of income.',
              es: 'La vivienda es una necesidad humana básica, no una mercancía. Todos merecen un refugio seguro, estable y asequible sin importar sus ingresos.',
              tl: 'Ang pabahay ay pangunahing pangangailangan ng tao, hindi kalakal. Lahat ay nararapat sa ligtas, matatag, at abot-kayang tirahan anuman ang kita.',
              zh: '住房是基本的人类需求，而不是商品。每个人都应该拥有安全、稳定、负担得起的住所，无论收入如何。',
              vi: 'Nhà ở là nhu cầu thiết yếu của con người, không phải hàng hóa. Mọi người đều xứng đáng có nơi ở an toàn, ổn định, giá cả phải chăng bất kể thu nhập.',
            },
          },
          {
            title: {
              en: "We're a Tenants Organization First",
              es: "Somos una Organización de Inquilinos Ante Todo",
              tl: "Kami ay Organisasyon ng mga Nangungupahan Una",
              zh: "我们首先是租户组织",
              vi: "Chúng Tôi Là Tổ Chức Người Thuê Nhà Trước Hết",
            },
            body: {
              en: 'Our focus is building tenant power — not just housing supply. Tenants deserve a seat at the table in every decision that affects their homes.',
              es: 'Nuestro enfoque es construir el poder de los inquilinos — no solo la oferta de viviendas. Los inquilinos merecen un lugar en la mesa en cada decisión que afecte sus hogares.',
              tl: 'Ang aming pokus ay pagbuo ng kapangyarihan ng nangungupahan — hindi lang suplay ng pabahay. Ang mga nangungupahan ay nararapat na may lugar sa mesa sa bawat desisyon na nakakaapekto sa kanilang tahanan.',
              zh: '我们的重点是建设租户力量——不仅仅是住房供应。租户应该在每一个影响他们住所的决定中拥有发言权。',
              vi: 'Trọng tâm của chúng tôi là xây dựng quyền lực của người thuê nhà — không chỉ nguồn cung nhà ở. Người thuê nhà xứng đáng có tiếng nói trong mọi quyết định ảnh hưởng đến nhà của họ.',
            },
          },
          {
            title: {
              en: 'Houselessness Results from Commodification',
              es: 'La Falta de Vivienda Resulta de la Mercantilización',
              tl: 'Ang Kawalan ng Tahanan ay Resulta ng Pagkomersiyo',
              zh: '无家可归源于商品化',
              vi: 'Vô Gia Cư Là Kết Quả Của Thương Mại Hóa',
            },
            body: {
              en: 'When housing is treated as an investment, people suffer. We oppose the criminalization of poverty and include all tenants in our mission.',
              es: 'Cuando la vivienda se trata como una inversión, la gente sufre. Nos oponemos a la criminalización de la pobreza e incluimos a todos los inquilinos en nuestra misión.',
              tl: 'Kapag ang pabahay ay tinatrato bilang pamumuhunan, ang mga tao ang naghihirap. Tinutulan namin ang kriminalisasyon ng kahirapan at isinasama ang lahat ng nangungupahan sa aming misyon.',
              zh: '当住房被视为投资时，人们就会遭受痛苦。我们反对将贫困定为犯罪，并将所有租户纳入我们的使命。',
              vi: 'Khi nhà ở được coi là đầu tư, mọi người phải chịu khổ. Chúng tôi phản đối việc hình sự hóa nghèo đói và bao gồm tất cả người thuê nhà trong sứ mệnh của chúng tôi.',
            },
          },
        ],
      },
    },
    {
      id: 'mirror-cta',
      type: 'cta',
      config: {},
    },
  ],
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}

export const PRESET_PAGE_3: LandingPageConfig = {
  id: 'page-3',
  name: 'Feature Tour',
  sections: [
    {
      id: 'tour-hero',
      type: 'hero',
      config: {
        showLogo: true,
        headlineOverride: 'Tools for Tenant Power',
        taglineOverride: 'Everything you need to organize your building and win.',
        missionOverride: 'RSTU Connect gives you the tools to find neighbors, build community, and take collective action for housing justice.',
      },
    },
    {
      id: 'tour-how',
      type: 'how-it-works',
      config: {
        heading: 'How RSTU Connect Works',
        subtitle: 'Six steps from finding your building to building tenant power',
      },
    },
    {
      id: 'tour-text',
      type: 'text',
      config: {
        heading: {
          en: 'Built By and For Tenants',
          es: 'Construido Por y Para Inquilinos',
          tl: 'Ginawa Ng at Para Sa Mga Nangungupahan',
          zh: '由租户建造，为租户服务',
          vi: 'Được Xây Dựng Bởi và Cho Người Thuê Nhà',
        },
        body: {
          en: "RSTU Connect is a free, open-source tool built by tenant organizers in Reno-Sparks. We don't collect your personal data or sell your information. Everything stays between you and your neighbors.\n\nThis platform exists because we believe tenants deserve the same sophisticated tools that landlords use to coordinate against us. Now we can coordinate too.",
          es: "RSTU Connect es una herramienta gratuita y de código abierto construida por organizadores de inquilinos en Reno-Sparks. No recopilamos sus datos personales ni vendemos su información. Todo queda entre usted y sus vecinos.\n\nEsta plataforma existe porque creemos que los inquilinos merecen las mismas herramientas sofisticadas que los propietarios usan para coordinarse contra nosotros. Ahora nosotros también podemos coordinarnos.",
          tl: "Ang RSTU Connect ay isang libre, open-source na kasangkapan na ginawa ng mga organizer ng nangungupahan sa Reno-Sparks. Hindi namin kinokolekta ang iyong personal na data o ibinebenta ang iyong impormasyon. Lahat ay nananatili sa pagitan mo at ng iyong mga kapitbahay.\n\nAng platform na ito ay umiiral dahil naniniwala kami na ang mga nangungupahan ay nararapat sa parehong sopistikadong kasangkapan na ginagamit ng mga may-ari laban sa atin. Ngayon tayo rin ay maaaring mag-coordinate.",
          zh: "RSTU Connect 是由雷诺-斯帕克斯的租户组织者构建的免费开源工具。我们不收集您的个人数据，也不出售您的信息。一切都留在您和您的邻居之间。\n\n这个平台之所以存在，是因为我们相信租户应该拥有与房东用来对付我们的同样精密的工具。现在我们也可以协调行动了。",
          vi: "RSTU Connect là công cụ miễn phí, mã nguồn mở được xây dựng bởi các nhà tổ chức người thuê nhà ở Reno-Sparks. Chúng tôi không thu thập dữ liệu cá nhân hay bán thông tin của bạn. Mọi thứ đều ở giữa bạn và hàng xóm.\n\nNền tảng này tồn tại vì chúng tôi tin rằng người thuê nhà xứng đáng có những công cụ tinh vi như chủ nhà sử dụng để phối hợp chống lại chúng ta. Giờ chúng ta cũng có thể phối hợp.",
        },
        bgColor: 'gray',
      },
    },
    {
      id: 'tour-cta',
      type: 'cta',
      config: {},
    },
  ],
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}

// ============================================================================
// Local Storage CRUD
// ============================================================================

export function getLandingPages(): LandingPageConfig[] {
  const stored = safeGetJson<LandingPageConfig[]>(PAGES_KEY, [])
  if (stored.length === 0) {
    // Initialize with defaults
    const defaults = [DEFAULT_PAGE_1, PRESET_PAGE_2, PRESET_PAGE_3]
    safeSetItem(PAGES_KEY, JSON.stringify(defaults))
    safeSetItem(MIGRATION_KEY, String(CURRENT_VERSION))
    return defaults
  }

  // Check for migration
  const version = parseInt(safeGetJson<string>(MIGRATION_KEY, '1') || '1', 10)
  let changed = false

  if (version < CURRENT_VERSION) {
    const page1Idx = stored.findIndex(p => p.id === 'page-1')
    if (page1Idx >= 0) {
      const page1 = stored[page1Idx]

      if (version < 2) {
        // v1→v2: added "Stronger Together" and "Values" cards
        const hasOnlyHeroAndCta = page1.sections.length === 2 &&
          page1.sections[0]?.type === 'hero' &&
          page1.sections[1]?.type === 'cta'
        if (hasOnlyHeroAndCta) {
          stored[page1Idx] = DEFAULT_PAGE_1
          changed = true
        }
      }

      if (version < 3) {
        // v2→v3: restore rights, organizing, crisis, action sections before CTA
        const types = page1.sections.map(s => s.type)
        const missingPrebuilt = !types.includes('rights') && !types.includes('organizing')
          && !types.includes('crisis') && !types.includes('action')
        if (missingPrebuilt) {
          const ctaIdx = page1.sections.findIndex(s => s.type === 'cta')
          const insertAt = ctaIdx >= 0 ? ctaIdx : page1.sections.length
          page1.sections.splice(insertAt, 0,
            { id: 'def-rights', type: 'rights', config: {} },
            { id: 'def-organizing', type: 'organizing', config: {} },
            { id: 'def-crisis', type: 'crisis', config: {} },
            { id: 'def-action', type: 'action', config: {} },
          )
          changed = true
        }
        // v3: set stacked layout on Core Values cards
        const valuesSection = page1.sections.find(s => s.id === 'def-values')
        if (valuesSection && !valuesSection.config.layout) {
          valuesSection.config.layout = 'stacked'
          changed = true
        }
      }

      if (version < 4) {
        // v3→v4: convert default text/cards sections to locale objects for i18n
        const strongerSection = page1.sections.find(s => s.id === 'def-stronger')
        if (strongerSection && typeof strongerSection.config.heading === 'string') {
          // Only inject translations if the user hasn't customized the heading
          if (strongerSection.config.heading === "We're Stronger Together") {
            const defStronger = DEFAULT_PAGE_1.sections.find(s => s.id === 'def-stronger')
            if (defStronger) {
              strongerSection.config.heading = defStronger.config.heading
              strongerSection.config.body = defStronger.config.body
              changed = true
            }
          } else {
            // User customized — wrap as {en: value} to preserve
            strongerSection.config.heading = { en: strongerSection.config.heading }
            if (typeof strongerSection.config.body === 'string') {
              strongerSection.config.body = { en: strongerSection.config.body }
            }
            changed = true
          }
        }
        const valSection = page1.sections.find(s => s.id === 'def-values')
        if (valSection && typeof valSection.config.heading === 'string') {
          if (valSection.config.heading === 'Our Core Values') {
            const defValues = DEFAULT_PAGE_1.sections.find(s => s.id === 'def-values')
            if (defValues) {
              valSection.config.heading = defValues.config.heading
              valSection.config.cards = defValues.config.cards
              changed = true
            }
          } else {
            valSection.config.heading = { en: valSection.config.heading }
            changed = true
          }
        }
      }
    }
    safeSetItem(MIGRATION_KEY, String(CURRENT_VERSION))
  }

  // Ensure preset pages exist (restore if deleted)
  if (!stored.find(p => p.id === 'page-1')) {
    stored.unshift(DEFAULT_PAGE_1)
    changed = true
  }
  if (!stored.find(p => p.id === 'page-2')) {
    stored.splice(1, 0, PRESET_PAGE_2)
    changed = true
  }
  if (!stored.find(p => p.id === 'page-3')) {
    stored.splice(2, 0, PRESET_PAGE_3)
    changed = true
  }
  if (changed) {
    safeSetItem(PAGES_KEY, JSON.stringify(stored))
  }
  return stored
}

export function saveLandingPage(config: LandingPageConfig): void {
  const pages = getLandingPages()
  const idx = pages.findIndex(p => p.id === config.id)
  config.updated_at = new Date().toISOString()
  if (idx >= 0) {
    pages[idx] = config
  } else {
    pages.push(config)
  }
  safeSetItem(PAGES_KEY, JSON.stringify(pages))
  pushToSupabase(config)
}

export function deleteLandingPage(id: string): void {
  const pages = getLandingPages().filter(p => p.id !== id)
  safeSetItem(PAGES_KEY, JSON.stringify(pages))
  // Also remove from Supabase
  if (supabase) {
    supabase.from('landing_pages').delete().eq('id', id).then(() => {})
  }
  // If active page was deleted, reset to page-1
  if (getActiveLandingPageId() === id) {
    setActiveLandingPageId('page-1')
  }
}

export function getActiveLandingPageId(): string {
  return safeGetJson<string>(ACTIVE_KEY, 'page-1') || 'page-1'
}

export function setActiveLandingPageId(id: string): void {
  safeSetItem(ACTIVE_KEY, JSON.stringify(id))
}

// ============================================================================
// Helpers
// ============================================================================

export function createBlankPage(name: string): LandingPageConfig {
  return {
    id: `page-${Date.now()}`,
    name,
    sections: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

export function createSection(type: string): SectionDescriptor {
  const base: SectionDescriptor = { id: uid(), type, config: {} }
  if (type === 'columns') {
    base.config = {
      layout: '1-1',
      columns: [
        { id: uid(), type: 'text', config: { heading: 'Column 1', body: 'Content here.', bgColor: 'white' } },
        { id: uid(), type: 'text', config: { heading: 'Column 2', body: 'Content here.', bgColor: 'white' } },
      ],
      gap: 'md',
      bgColor: 'transparent',
    }
  } else if (type === 'text') {
    base.config = { heading: 'New Section', body: 'Add your content here.', bgColor: 'white' }
  } else if (type === 'cards') {
    base.config = {
      heading: 'New Cards Section',
      cards: [
        { title: 'Card 1', body: 'Description here.' },
        { title: 'Card 2', body: 'Description here.' },
      ],
    }
  } else if (type === 'image-banner') {
    base.config = { bgColor: '#cc0000', overlayText: 'Banner Text', textColor: 'white' }
  }
  return base
}

// ============================================================================
// Supabase Sync
// ============================================================================

async function pushToSupabase(config: LandingPageConfig): Promise<void> {
  if (!supabase) return
  try {
    await supabase.from('landing_pages').upsert({
      id: config.id,
      name: config.name,
      sections: config.sections,
      created_at: config.created_at,
      updated_at: config.updated_at,
    })
  } catch {
    // Silent fail — localStorage is primary
  }
}

export async function syncFromSupabase(): Promise<LandingPageConfig[]> {
  if (!supabase) return getLandingPages()
  try {
    const { data, error } = await supabase
      .from('landing_pages')
      .select('*')
      .order('created_at', { ascending: true })
    if (error || !data || data.length === 0) return getLandingPages()

    const pages = data.map((row: Record<string, unknown>) => ({
      id: row.id as string,
      name: row.name as string,
      sections: row.sections as SectionDescriptor[],
      created_at: row.created_at as string,
      updated_at: row.updated_at as string,
    }))
    safeSetItem(PAGES_KEY, JSON.stringify(pages))
    return pages
  } catch {
    return getLandingPages()
  }
}
