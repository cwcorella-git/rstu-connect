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
const CURRENT_VERSION = 8 // Bump when preset pages change

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
        headlineOverride: {
          en: 'Homes for people, not for profit.',
          es: 'Hogares para la gente, no para el lucro.',
          tl: 'Mga tahanan para sa tao, hindi para sa kita.',
          zh: '住房为民，而非为利。',
          vi: 'Nhà ở cho con người, không phải vì lợi nhuận.',
        },
        taglineOverride: {
          en: 'A volunteer-led union building and protecting tenant power through collective action.',
          es: 'Un sindicato liderado por voluntarios que construye y protege el poder de los inquilinos a través de la acción colectiva.',
          tl: 'Isang unyon na pinamumunuan ng mga boluntaryo na nagtatayo at nagpoprotekta ng kapangyarihan ng nangungupahan sa pamamagitan ng sama-samang pagkilos.',
          zh: '一个由志愿者领导的工会，通过集体行动建设和保护租户权力。',
          vi: 'Một liên đoàn do tình nguyện viên lãnh đạo, xây dựng và bảo vệ quyền lực của người thuê nhà thông qua hành động tập thể.',
        },
        missionOverride: {
          en: 'As Reno renters face skyrocketing housing costs, limited housing supply, and state laws that put profits over people — we fight for safe, secure, affordable, and fair housing for all.',
          es: 'Mientras los inquilinos de Reno enfrentan costos de vivienda disparados, oferta limitada y leyes estatales que priorizan las ganancias sobre las personas — luchamos por viviendas seguras, asequibles y justas para todos.',
          tl: 'Habang ang mga nangungupahan sa Reno ay nahaharap sa tumataas na gastos sa pabahay, limitadong suplay, at mga batas na inuuna ang kita kaysa sa tao — lumalaban kami para sa ligtas, abot-kaya, at makatarungang pabahay para sa lahat.',
          zh: '当雷诺的租户面临飙升的住房成本、有限的住房供应以及将利润置于人民之上的州法律时——我们为所有人争取安全、可靠、负担得起且公平的住房。',
          vi: 'Khi người thuê nhà ở Reno đối mặt với chi phí nhà ở tăng vọt, nguồn cung hạn chế và luật tiểu bang đặt lợi nhuận trên con người — chúng tôi đấu tranh cho nhà ở an toàn, ổn định, giá cả phải chăng và công bằng cho tất cả.',
        },
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
        headlineOverride: {
          en: 'Tools for Tenant Power',
          es: 'Herramientas para el Poder de los Inquilinos',
          tl: 'Mga Kasangkapan para sa Kapangyarihan ng Nangungupahan',
          zh: '租户力量的工具',
          vi: 'Công Cụ Cho Quyền Lực Người Thuê Nhà',
        },
        taglineOverride: {
          en: 'Everything you need to organize your building and win.',
          es: 'Todo lo que necesitas para organizar tu edificio y ganar.',
          tl: 'Lahat ng kailangan mo upang iorganisa ang iyong gusali at manalo.',
          zh: '组织您的大楼并赢得胜利所需的一切。',
          vi: 'Mọi thứ bạn cần để tổ chức tòa nhà của mình và giành chiến thắng.',
        },
        missionOverride: {
          en: 'RSTU Connect gives you the tools to find neighbors, build community, and take collective action for housing justice.',
          es: 'RSTU Connect te brinda las herramientas para encontrar vecinos, construir comunidad y tomar acción colectiva por la justicia de vivienda.',
          tl: 'Ang RSTU Connect ay nagbibigay sa iyo ng mga kasangkapan upang mahanap ang mga kapitbahay, bumuo ng komunidad, at kumilos nang sama-sama para sa katarungan sa pabahay.',
          zh: 'RSTU Connect 为您提供寻找邻居、建设社区和采取集体行动争取住房正义的工具。',
          vi: 'RSTU Connect cung cấp cho bạn các công cụ để tìm hàng xóm, xây dựng cộng đồng và thực hiện hành động tập thể vì công lý nhà ở.',
        },
      },
    },
    {
      id: 'tour-how',
      type: 'how-it-works',
      config: {
        heading: {
          en: 'How RSTU Connect Works',
          es: 'Cómo Funciona RSTU Connect',
          tl: 'Paano Gumagana ang RSTU Connect',
          zh: 'RSTU Connect 如何运作',
          vi: 'RSTU Connect Hoạt Động Như Thế Nào',
        },
        subtitle: {
          en: 'Six steps from finding your building to building tenant power',
          es: 'Seis pasos desde encontrar tu edificio hasta construir el poder de los inquilinos',
          tl: 'Anim na hakbang mula sa paghahanap ng iyong gusali hanggang sa pagbuo ng kapangyarihan ng nangungupahan',
          zh: '从找到您的大楼到建设租户力量的六个步骤',
          vi: 'Sáu bước từ tìm tòa nhà đến xây dựng quyền lực người thuê nhà',
        },
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

// Page 4: Corporate Greed (Wall Street / Blackstone Frame)
// Leads with: "Wall Street is your landlord" - names enemies, uses class warfare framing
export const PRESET_PAGE_4: LandingPageConfig = {
  id: 'page-4',
  name: 'Corporate Greed',
  sections: [
    {
      id: 'corp-hero',
      type: 'hero',
      config: {
        showLogo: true,
        headlineOverride: {
          en: 'Wall Street Is Your Landlord',
          es: 'Wall Street Es Tu Casero',
          tl: 'Ang Wall Street Ang Iyong Kasero',
          zh: '华尔街是你的房东',
          vi: 'Wall Street Là Chủ Nhà Của Bạn',
        },
        taglineOverride: {
          en: 'Corporate landlords are extracting billions from working families. It\'s time to fight back.',
          es: 'Los propietarios corporativos están extrayendo miles de millones de las familias trabajadoras. Es hora de luchar.',
          tl: 'Ang mga korporasyong may-ari ay kumukuha ng bilyun-bilyon mula sa mga pamilyang manggagawa. Oras na para lumaban.',
          zh: '企业房东正在从工薪家庭榨取数十亿。是时候反击了。',
          vi: 'Các chủ nhà doanh nghiệp đang rút hàng tỷ đô la từ các gia đình lao động. Đã đến lúc phản击.',
        },
        missionOverride: {
          en: 'Blackstone, the world\'s largest private equity firm, owns over 300,000 rental units. They evict tenants at 18% higher rates than small landlords. They raise rents 38% above market. They spend millions defeating rent control. This isn\'t a housing market—it\'s extraction.',
          es: 'Blackstone, la firma de capital privado más grande del mundo, posee más de 300,000 unidades de alquiler. Desalojan a los inquilinos a tasas 18% más altas que los pequeños propietarios. Aumentan los alquileres 38% por encima del mercado. Gastan millones derrotando el control de alquileres. Esto no es un mercado de vivienda—es extracción.',
          tl: 'Ang Blackstone, ang pinakamalaking private equity firm sa mundo, ay nagmamay-ari ng higit sa 300,000 rental units. Ipinapaalis nila ang mga nangungupahan sa 18% na mas mataas na rate kaysa sa maliliit na may-ari. Tinaasan nila ang upa ng 38% higit sa merkado. Gumagastos sila ng milyun-milyon para talunin ang rent control. Hindi ito housing market—ito ay pagsasamantala.',
          zh: '黑石集团是全球最大的私募股权公司，拥有超过30万套租赁房屋。他们驱逐租户的比率比小房东高18%。他们将租金提高到市场价格的38%以上。他们花费数百万击败租金管制。这不是住房市场——这是剥削。',
          vi: 'Blackstone, công ty cổ phần tư nhân lớn nhất thế giới, sở hữu hơn 300.000 căn hộ cho thuê. Họ trục xuất người thuê với tỷ lệ cao hơn 18% so với chủ nhà nhỏ. Họ tăng giá thuê 38% trên thị trường. Họ chi hàng triệu để đánh bại kiểm soát giá thuê. Đây không phải là thị trường nhà ở—đây là bóc lột.',
        },
      },
    },
    {
      id: 'corp-stats',
      type: 'cards',
      config: {
        heading: {
          en: 'The Corporate Landlord Playbook',
          es: 'El Manual del Propietario Corporativo',
          tl: 'Ang Playbook ng Korporasyong May-ari',
          zh: '企业房东的操作手册',
          vi: 'Sách Hướng Dẫn Của Chủ Nhà Doanh Nghiệp',
        },
        layout: 'grid',
        cards: [
          {
            title: {
              en: '8-18% Higher Eviction Rates',
              es: 'Tasas de Desalojo 8-18% Más Altas',
              tl: '8-18% Mas Mataas na Rate ng Pagpapaalis',
              zh: '驱逐率高出8-18%',
              vi: 'Tỷ Lệ Trục Xuất Cao Hơn 8-18%',
            },
            body: {
              en: 'Federal Reserve research proves corporate landlords evict tenants at dramatically higher rates than small landlords—even after controlling for neighborhood and property factors.',
              es: 'La investigación de la Reserva Federal demuestra que los propietarios corporativos desalojan a los inquilinos a tasas dramáticamente más altas que los pequeños propietarios—incluso después de controlar los factores del vecindario y la propiedad.',
              tl: 'Pinapatunayan ng pananaliksik ng Federal Reserve na ang mga korporasyong may-ari ay nagpapaalis ng mga nangungupahan sa mas mataas na rate kaysa sa maliliit na may-ari—kahit pagkatapos kontrolin ang mga salik ng kapitbahayan at ari-arian.',
              zh: '美联储研究证明，企业房东驱逐租户的比率远高于小房东——即使在控制了社区和物业因素之后也是如此。',
              vi: 'Nghiên cứu của Cục Dự trữ Liên bang chứng minh các chủ nhà doanh nghiệp trục xuất người thuê với tỷ lệ cao hơn đáng kể so với chủ nhà nhỏ—ngay cả sau khi kiểm soát các yếu tố khu phố và tài sản.',
            },
          },
          {
            title: {
              en: '$7+ Million to Kill Rent Control',
              es: '$7+ Millones para Matar el Control de Alquileres',
              tl: '$7+ Milyon para Patayin ang Rent Control',
              zh: '超过700万美元用于扼杀租金管制',
              vi: 'Hơn 7 Triệu Đô La Để Giết Chết Kiểm Soát Tiền Thuê',
            },
            body: {
              en: 'Blackstone spent over $7 million in both 2018 and 2020 to defeat California rent control measures—using money from pension funds and university endowments.',
              es: 'Blackstone gastó más de $7 millones tanto en 2018 como en 2020 para derrotar las medidas de control de alquileres de California—usando dinero de fondos de pensiones y dotaciones universitarias.',
              tl: 'Gumastos ang Blackstone ng mahigit $7 milyon sa parehong 2018 at 2020 upang talunin ang mga panukala sa rent control ng California—gamit ang pera mula sa mga pension fund at university endowments.',
              zh: '黑石集团在2018年和2020年各花费超过700万美元击败加州租金管制措施——使用来自养老基金和大学捐赠的资金。',
              vi: 'Blackstone đã chi hơn 7 triệu đô la trong cả năm 2018 và 2020 để đánh bại các biện pháp kiểm soát tiền thuê của California—sử dụng tiền từ quỹ hưu trí và quỹ đại học.',
            },
          },
          {
            title: {
              en: '"The Good News Is Construction Is Down"',
              es: '"La Buena Noticia Es Que La Construcción Bajó"',
              tl: '"Ang Magandang Balita Ay Bumaba Ang Konstruksyon"',
              zh: '"好消息是建设量下降了"',
              vi: '"Tin Tốt Là Xây Dựng Đã Giảm"',
            },
            body: {
              en: 'Blackstone\'s president told investors they profit from housing scarcity. They don\'t want more housing—they want higher rents. Scarcity is their business model.',
              es: 'El presidente de Blackstone les dijo a los inversores que se benefician de la escasez de viviendas. No quieren más viviendas—quieren alquileres más altos. La escasez es su modelo de negocio.',
              tl: 'Sinabi ng presidente ng Blackstone sa mga mamumuhunan na kumikita sila sa kakulangan ng pabahay. Hindi nila gusto ng mas maraming pabahay—gusto nila ng mas mataas na upa. Ang kakulangan ay ang kanilang modelo ng negosyo.',
              zh: '黑石集团总裁告诉投资者，他们从住房短缺中获利。他们不想要更多住房——他们想要更高的租金。稀缺是他们的商业模式。',
              vi: 'Chủ tịch Blackstone nói với các nhà đầu tư rằng họ kiếm lợi từ sự khan hiếm nhà ở. Họ không muốn có thêm nhà ở—họ muốn tiền thuê cao hơn. Sự khan hiếm là mô hình kinh doanh của họ.',
            },
          },
        ],
      },
    },
    {
      id: 'corp-quote',
      type: 'text',
      config: {
        heading: {
          en: '"Class Warfare Has Been Going On For 40 Years"',
          es: '"La Guerra de Clases Ha Estado Ocurriendo Por 40 Años"',
          tl: '"Ang Digmaang Panguri Ay Nagaganap Na Ng 40 Taon"',
          zh: '"阶级战争已经进行了40年"',
          vi: '"Chiến Tranh Giai Cấp Đã Diễn Ra 40 Năm"',
        },
        body: {
          en: '"The billionaire class has been taking everything and leaving the working class with nothing. Whenever working class people ever step up and say, \'This is wrong, we want it to stop,\' all of a sudden, Oh, it\'s class warfare."\n\n— Shawn Fain, UAW President\n\nThe same corporate interests extracting wealth from autoworkers are extracting wealth from tenants. Blackstone. Private equity. Wall Street. They buy our homes, raise our rents, evict our neighbors—and call us radical for fighting back.',
          es: '"La clase multimillonaria ha estado tomando todo y dejando a la clase trabajadora sin nada. Cada vez que la gente de la clase trabajadora se levanta y dice, \'Esto está mal, queremos que pare,\' de repente, Oh, es guerra de clases."\n\n— Shawn Fain, Presidente de UAW\n\nLos mismos intereses corporativos que extraen riqueza de los trabajadores automotrices están extrayendo riqueza de los inquilinos. Blackstone. Capital privado. Wall Street. Compran nuestras casas, aumentan nuestros alquileres, desalojan a nuestros vecinos—y nos llaman radicales por luchar.',
          tl: '"Ang napakalaking uri ng mayaman ay kinukuha ang lahat at iniiwan ang uring manggagawa na walang anuman. Tuwing ang mga tao sa uring manggagawa ay tumataas at nagsasabing, \'Mali ito, gusto naming tumigil,\' bigla, Oh, digmaang panguri."\n\n— Shawn Fain, Pangulo ng UAW\n\nAng parehong interes ng korporasyon na kumukuha ng yaman mula sa mga manggagawa ng auto ay kumukuha ng yaman mula sa mga nangungupahan. Blackstone. Private equity. Wall Street. Binibili nila ang ating mga bahay, tinaasan ang ating upa, pinapaalis ang ating mga kapitbahay—at tinatawag tayong radikal dahil lumalaban.',
          zh: '"亿万富翁阶级一直在拿走一切，让工人阶级一无所有。每当工人阶级站出来说，\'这是错误的，我们希望它停止，\'突然间，哦，这是阶级战争。"\n\n— 肖恩·费恩，UAW主席\n\n从汽车工人身上榨取财富的同样的企业利益集团也在从租户身上榨取财富。黑石集团。私募股权。华尔街。他们购买我们的房屋，提高我们的租金，驱逐我们的邻居——却称我们反击是激进的。',
          vi: '"Giai cấp tỷ phú đã lấy tất cả và để lại giai cấp lao động không có gì. Mỗi khi người lao động đứng lên và nói, \'Điều này sai, chúng tôi muốn nó dừng lại,\' đột nhiên, Ồ, đó là chiến tranh giai cấp."\n\n— Shawn Fain, Chủ tịch UAW\n\nCùng những lợi ích doanh nghiệp đang rút tài sản từ công nhân ô tô cũng đang rút tài sản từ người thuê nhà. Blackstone. Cổ phần tư nhân. Wall Street. Họ mua nhà của chúng ta, tăng tiền thuê, trục xuất hàng xóm—và gọi chúng ta là cực đoan vì phản kháng.',
        },
        bgColor: 'gray',
      },
    },
    {
      id: 'corp-local',
      type: 'text',
      config: {
        heading: {
          en: 'Corporate Landlords in Reno-Sparks',
          es: 'Propietarios Corporativos en Reno-Sparks',
          tl: 'Mga Corporate Landlord sa Reno-Sparks',
          zh: '雷诺-斯帕克斯的企业房东',
          vi: 'Chủ Nhà Doanh Nghiệp Ở Reno-Sparks',
        },
        body: {
          en: 'The same extraction happening nationally is happening here:\n\n**40-45% rent increases** since 2019—outpacing wages and inflation\n\n**57% of Nevada renters** are cost-burdened (spending >30% of income on housing)\n\n**Corporate-owned properties** file evictions at 3.7x the rate of individual landlords (KC data)\n\n**82 hours/week** at minimum wage needed to afford a 1-bedroom apartment\n\nWall Street didn\'t just buy our apartments. They bought our elected officials. They wrote the laws. They built the system. And they\'re counting on you staying alone and afraid.\n\n**But we have numbers. We have neighbors. And we\'re organizing.**',
          es: 'La misma extracción que ocurre a nivel nacional está ocurriendo aquí:\n\n**Aumentos de alquiler del 40-45%** desde 2019—superando salarios e inflación\n\n**57% de los inquilinos de Nevada** están sobrecargados de costos (gastan >30% de ingresos en vivienda)\n\n**Propiedades corporativas** presentan desalojos a una tasa 3.7x mayor que propietarios individuales (datos de KC)\n\n**82 horas/semana** al salario mínimo para pagar un apartamento de 1 dormitorio\n\nWall Street no solo compró nuestros apartamentos. Compraron a nuestros funcionarios electos. Escribieron las leyes. Construyeron el sistema. Y cuentan con que te quedes solo y asustado.\n\n**Pero tenemos números. Tenemos vecinos. Y nos estamos organizando.**',
          tl: 'Ang parehong extraction na nangyayari sa buong bansa ay nangyayari rito:\n\n**40-45% na pagtaas ng upa** mula 2019—mas mabilis kaysa sa sahod at implasyon\n\n**57% ng mga nangungupahan sa Nevada** ay cost-burdened (gumagastos ng >30% ng kita sa pabahay)\n\n**Corporate-owned properties** ay nagfa-file ng eviction sa 3.7x na rate ng mga individual landlord (data ng KC)\n\n**82 oras/linggo** sa minimum wage para makayanan ang 1-bedroom apartment\n\nHindi lang ang mga apartment natin ang binili ng Wall Street. Binili nila ang mga inihalal nating opisyal. Sila ang sumulat ng batas. Sila ang bumuo ng sistema. At inaasahan nila na mag-isa ka at natatakot.\n\n**Pero may bilang tayo. May mga kapitbahay tayo. At nag-oorganisa tayo.**',
          zh: '全国发生的同样剥削正在这里发生：\n\n**40-45%的租金涨幅** 自2019年以来——超过工资和通货膨胀\n\n**57%的内华达州租户** 承受沉重的住房负担（住房支出超过收入30%）\n\n**企业所有的房产** 提起驱逐的比率是个人房东的3.7倍（KC数据）\n\n**每周82小时** 按最低工资工作才能负担一居室公寓\n\n华尔街不仅买了我们的公寓。他们买通了我们的民选官员。他们制定了法律。他们建造了这个系统。他们指望你孤独和恐惧。\n\n**但我们有人数。我们有邻居。我们正在组织起来。**',
          vi: 'Cùng một sự bóc lột đang xảy ra trên toàn quốc cũng đang xảy ra ở đây:\n\n**Tăng tiền thuê 40-45%** kể từ năm 2019—vượt qua lương và lạm phát\n\n**57% người thuê nhà Nevada** đang gánh nặng chi phí (chi >30% thu nhập cho nhà ở)\n\n**Bất động sản thuộc sở hữu doanh nghiệp** nộp đơn trục xuất với tỷ lệ gấp 3,7 lần so với chủ nhà cá nhân (dữ liệu KC)\n\n**82 giờ/tuần** với mức lương tối thiểu để đủ tiền thuê căn hộ 1 phòng ngủ\n\nWall Street không chỉ mua căn hộ của chúng ta. Họ mua các quan chức được bầu. Họ viết luật. Họ xây dựng hệ thống. Và họ đang trông chờ bạn ở một mình và sợ hãi.\n\n**Nhưng chúng ta có số lượng. Chúng ta có hàng xóm. Và chúng ta đang tổ chức.**',
        },
        bgColor: 'white',
      },
    },
    { id: 'corp-cta', type: 'cta', config: {} },
  ],
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}

// Page 5: Know Your Rights (Legal Empowerment Frame)
// Leads with: Tenant rights and legal protections - practical empowerment
export const PRESET_PAGE_5: LandingPageConfig = {
  id: 'page-5',
  name: 'Know Your Rights',
  sections: [
    {
      id: 'rights-hero',
      type: 'hero',
      config: {
        showLogo: true,
        headlineOverride: {
          en: 'You Have Rights. Use Them.',
          es: 'Tienes Derechos. Úsalos.',
          tl: 'May Mga Karapatan Ka. Gamitin Mo.',
          zh: '你有权利。使用它们。',
          vi: 'Bạn Có Quyền. Hãy Sử Dụng Chúng.',
        },
        taglineOverride: {
          en: 'Nevada law protects tenants. Learn your rights and hold landlords accountable.',
          es: 'La ley de Nevada protege a los inquilinos. Conoce tus derechos y responsabiliza a los propietarios.',
          tl: 'Pinoprotektahan ng batas ng Nevada ang mga nangungupahan. Alamin ang iyong mga karapatan at papanagutin ang mga may-ari.',
          zh: '内华达州法律保护租户。了解你的权利，让房东承担责任。',
          vi: 'Luật Nevada bảo vệ người thuê nhà. Tìm hiểu quyền của bạn và buộc chủ nhà chịu trách nhiệm.',
        },
        missionOverride: {
          en: 'In 1970, tenants at Clifton Terrace in Washington D.C. faced 1,500 housing code violations—and refused to pay rent. They won a Supreme Court case that established the implied warranty of habitability: your landlord must maintain livable conditions. That\'s the law. Now it\'s time to enforce it.',
          es: 'En 1970, los inquilinos de Clifton Terrace en Washington D.C. enfrentaron 1,500 violaciones del código de vivienda—y se negaron a pagar el alquiler. Ganaron un caso de la Corte Suprema que estableció la garantía implícita de habitabilidad: su propietario debe mantener condiciones habitables. Esa es la ley. Ahora es hora de hacerla cumplir.',
          tl: 'Noong 1970, ang mga nangungupahan sa Clifton Terrace sa Washington D.C. ay naharap sa 1,500 paglabag sa housing code—at tumanggi na magbayad ng upa. Nanalo sila ng kaso sa Korte Suprema na nagtatatag ng implied warranty of habitability: dapat panatilihin ng iyong may-ari ang mga kondisyong maaaring tirahan. Iyan ang batas. Ngayon ay oras na para ipatupad ito.',
          zh: '1970年，华盛顿特区克利夫顿台阶的租户面临1500项住房法规违规——他们拒绝支付租金。他们赢得了最高法院案件，确立了默示宜居性保证：你的房东必须保持可居住的条件。这就是法律。现在是时候执行它了。',
          vi: 'Năm 1970, những người thuê nhà tại Clifton Terrace ở Washington D.C. đối mặt với 1.500 vi phạm mã nhà ở—và từ chối trả tiền thuê. Họ đã thắng một vụ kiện Tòa án Tối cao thiết lập bảo đảm ngầm về điều kiện sống: chủ nhà của bạn phải duy trì điều kiện có thể ở được. Đó là luật. Bây giờ là lúc thực thi nó.',
        },
      },
    },
    { id: 'rights-section', type: 'rights', config: {} },
    {
      id: 'rights-javins',
      type: 'text',
      config: {
        heading: {
          en: 'The Javins Case: Rent Strikes Changed the Law',
          es: 'El Caso Javins: Las Huelgas de Alquiler Cambiaron la Ley',
          tl: 'Ang Kaso ng Javins: Binago ng Rent Strikes ang Batas',
          zh: 'Javins案：租金罢工改变了法律',
          vi: 'Vụ Javins: Đình Công Tiền Thuê Đã Thay Đổi Luật',
        },
        body: {
          en: 'Before 1970, landlords could collect rent regardless of conditions. Roaches, rats, no heat, broken plumbing—didn\'t matter. You owed rent.\n\nThen Ethel Javins and her neighbors organized. They documented over 1,500 code violations and withheld rent. The court ruled that housing isn\'t just land—it\'s a place to live. Landlords must provide habitable conditions.\n\nThis didn\'t come from politicians. It came from tenants who organized, documented, and refused to pay for their own misery.\n\n**Your habitability rights exist because tenants fought for them.**',
          es: 'Antes de 1970, los propietarios podían cobrar el alquiler sin importar las condiciones. Cucarachas, ratas, sin calefacción, tuberías rotas—no importaba. Debías el alquiler.\n\nEntonces Ethel Javins y sus vecinos se organizaron. Documentaron más de 1,500 violaciones del código y retuvieron el alquiler. El tribunal dictaminó que la vivienda no es solo tierra—es un lugar para vivir. Los propietarios deben proporcionar condiciones habitables.\n\nEsto no vino de los políticos. Vino de inquilinos que se organizaron, documentaron y se negaron a pagar por su propia miseria.\n\n**Tus derechos de habitabilidad existen porque los inquilinos lucharon por ellos.**',
          tl: 'Bago ang 1970, maaaring mangolekta ng upa ang mga may-ari anuman ang kondisyon. Mga ipis, daga, walang init, sirang tubo—hindi mahalaga. May utang kang upa.\n\nPagkatapos ay nag-organisa sina Ethel Javins at ang kanyang mga kapitbahay. Dinokumento nila ang higit sa 1,500 paglabag sa code at hindi nagbayad ng upa. Nagpasya ang korte na ang pabahay ay hindi lang lupa—ito ay lugar para tumira. Dapat magbigay ang mga may-ari ng mga kondisyong maaaring tirahan.\n\nHindi ito galing sa mga pulitiko. Galing ito sa mga nangungupahan na nag-organisa, nagdokumento, at tumanggi na magbayad para sa kanilang sariling paghihirap.\n\n**Umiiral ang iyong mga karapatan sa habitability dahil naglaban ang mga nangungupahan para sa mga ito.**',
          zh: '1970年以前，房东可以不顾条件收取租金。蟑螂、老鼠、没有暖气、管道破损——都不重要。你欠租金。\n\n然后Ethel Javins和她的邻居们组织起来。他们记录了1500多项法规违规并拒付租金。法院裁定住房不仅仅是土地——它是居住的地方。房东必须提供可居住的条件。\n\n这不是来自政客。这来自组织起来、记录证据、拒绝为自己的苦难付款的租户。\n\n**你的宜居权利之所以存在，是因为租户为之奋斗。**',
          vi: 'Trước năm 1970, chủ nhà có thể thu tiền thuê bất kể điều kiện. Gián, chuột, không có sưởi, ống nước hỏng—không quan trọng. Bạn nợ tiền thuê.\n\nRồi Ethel Javins và hàng xóm của cô đã tổ chức. Họ ghi nhận hơn 1.500 vi phạm mã và giữ lại tiền thuê. Tòa án phán quyết rằng nhà ở không chỉ là đất—nó là nơi để sống. Chủ nhà phải cung cấp điều kiện có thể ở được.\n\nĐiều này không đến từ các chính trị gia. Nó đến từ những người thuê nhà đã tổ chức, ghi nhận và từ chối trả tiền cho sự khốn khổ của chính mình.\n\n**Quyền sống được của bạn tồn tại vì những người thuê nhà đã đấu tranh cho chúng.**',
        },
        bgColor: 'gray',
      },
    },
    {
      id: 'rights-toolkit',
      type: 'cards',
      config: {
        heading: {
          en: 'Your Tenant Toolkit',
          es: 'Tu Kit de Herramientas de Inquilino',
          tl: 'Ang Iyong Toolkit ng Nangungupahan',
          zh: '你的租户工具包',
          vi: 'Bộ Công Cụ Người Thuê Của Bạn',
        },
        layout: 'stacked',
        cards: [
          {
            title: {
              en: 'Document Everything',
              es: 'Documenta Todo',
              tl: 'Idokumento ang Lahat',
              zh: '记录一切',
              vi: 'Ghi Nhận Mọi Thứ',
            },
            body: {
              en: 'Take photos with timestamps. Save all communications in writing. Keep copies of your lease and every notice. Send repair requests in writing and keep copies. Your documentation is your evidence—and evidence wins cases.',
              es: 'Toma fotos con marcas de tiempo. Guarda todas las comunicaciones por escrito. Mantén copias de tu contrato y cada aviso. Envía solicitudes de reparación por escrito y guarda copias. Tu documentación es tu evidencia—y la evidencia gana casos.',
              tl: 'Kumuha ng mga litrato na may timestamp. I-save ang lahat ng komunikasyon sa nakasulat. Magkuha ng mga kopya ng iyong lease at bawat notice. Ipadala ang mga kahilingan sa pag-aayos sa nakasulat at itago ang mga kopya. Ang iyong dokumentasyon ay ang iyong ebidensya—at ang ebidensya ang nananalong ng mga kaso.',
              zh: '拍摄带时间戳的照片。保存所有书面通信。保留租约和每份通知的副本。以书面形式发送维修请求并保留副本。你的文件就是证据——证据能赢得案件。',
              vi: 'Chụp ảnh có dấu thời gian. Lưu tất cả thông tin liên lạc bằng văn bản. Giữ bản sao hợp đồng thuê và mọi thông báo. Gửi yêu cầu sửa chữa bằng văn bản và giữ bản sao. Tài liệu của bạn là bằng chứng—và bằng chứng chiến thắng.',
            },
          },
          {
            title: {
              en: 'Request Repairs in Writing',
              es: 'Solicita Reparaciones por Escrito',
              tl: 'Humiling ng mga Pag-aayos sa Nakasulat',
              zh: '书面请求维修',
              vi: 'Yêu Cầu Sửa Chữa Bằng Văn Bản',
            },
            body: {
              en: 'Nevada law (NRS 118A.355) requires landlords to maintain habitable conditions. If repairs aren\'t made within 14 days of written notice, you may have legal options including rent reduction or lease termination. Always put repair requests in writing and keep copies.',
              es: 'La ley de Nevada (NRS 118A.355) requiere que los propietarios mantengan condiciones habitables. Si las reparaciones no se hacen dentro de 14 días del aviso escrito, puedes tener opciones legales incluyendo reducción de alquiler o terminación del contrato. Siempre pon las solicitudes de reparación por escrito y guarda copias.',
              tl: 'Ang batas ng Nevada (NRS 118A.355) ay nangangailangan na panatilihin ng mga landlord ang mga kondisyong maaaring tirahan. Kung ang mga pag-aayos ay hindi ginawa sa loob ng 14 na araw ng nakasulat na abiso, maaari kang magkaroon ng mga legal na opsyon kabilang ang pagbabawas ng upa o pagtatapos ng lease. Palaging ilagay ang mga kahilingan sa pag-aayos sa nakasulat at itago ang mga kopya.',
              zh: '内华达州法律（NRS 118A.355）要求房东保持可居住条件。如果在书面通知后14天内未进行维修，你可能有法律选择，包括降低租金或终止租约。始终以书面形式提出维修请求并保留副本。',
              vi: 'Luật Nevada (NRS 118A.355) yêu cầu chủ nhà duy trì điều kiện có thể ở được. Nếu việc sửa chữa không được thực hiện trong vòng 14 ngày kể từ thông báo bằng văn bản, bạn có thể có các lựa chọn pháp lý bao gồm giảm tiền thuê hoặc chấm dứt hợp đồng thuê. Luôn đặt yêu cầu sửa chữa bằng văn bản và giữ bản sao.',
            },
          },
          {
            title: {
              en: 'Know the Eviction Timeline',
              es: 'Conoce el Cronograma de Desalojo',
              tl: 'Alamin ang Timeline ng Eviction',
              zh: '了解驱逐时间表',
              vi: 'Biết Thời Gian Trục Xuất',
            },
            body: {
              en: 'Landlords cannot "self-help evict" (changing locks, shutting off utilities). They must go through the courts. You have the right to appear and defend yourself. Many eviction cases are dismissed when tenants show up with documentation. Legal aid is available—use it.',
              es: 'Los propietarios no pueden hacer "auto-desalojo" (cambiar cerraduras, cortar servicios). Deben ir a los tribunales. Tienes derecho a presentarte y defenderte. Muchos casos de desalojo se desestiman cuando los inquilinos se presentan con documentación. La asistencia legal está disponible—úsala.',
              tl: 'Hindi maaaring "self-help evict" ang mga landlord (pagpapalit ng mga kandado, pagsasara ng mga utility). Dapat silang dumaan sa mga korte. May karapatan kang lumitaw at ipagtanggol ang iyong sarili. Maraming kaso ng eviction ang dinidismiss kapag lumitaw ang mga nangungupahan na may dokumentasyon. Available ang legal aid—gamitin mo ito.',
              zh: '房东不能"自助驱逐"（换锁、关闭公用设施）。他们必须通过法院。你有权出庭为自己辩护。当租户带着文件出庭时，许多驱逐案件被驳回。法律援助是可用的——使用它。',
              vi: 'Chủ nhà không thể "tự trục xuất" (đổi khóa, cắt điện nước). Họ phải thông qua tòa án. Bạn có quyền ra tòa và tự bảo vệ mình. Nhiều vụ trục xuất bị bác bỏ khi người thuê xuất hiện với tài liệu. Hỗ trợ pháp lý có sẵn—hãy sử dụng.',
            },
          },
          {
            title: {
              en: 'Organize Your Neighbors',
              es: 'Organiza a Tus Vecinos',
              tl: 'Iorganisa ang Iyong mga Kapitbahay',
              zh: '组织你的邻居',
              vi: 'Tổ Chức Hàng Xóm Của Bạn',
            },
            body: {
              en: 'Your strongest protection is collective action. Talk to your neighbors—they likely face the same issues. Form a tenant association. Landlords target isolated tenants; they fear organized ones. Retaliation for organizing is illegal under NRS 118A.510.',
              es: 'Tu protección más fuerte es la acción colectiva. Habla con tus vecinos—probablemente enfrentan los mismos problemas. Forma una asociación de inquilinos. Los propietarios atacan a inquilinos aislados; temen a los organizados. Las represalias por organizarse son ilegales bajo NRS 118A.510.',
              tl: 'Ang pinakamalakas mong proteksyon ay sama-samang pagkilos. Kausapin ang iyong mga kapitbahay—malamang na nahaharap sila sa parehong mga isyu. Bumuo ng tenant association. Tina-target ng mga landlord ang mga isolated na nangungupahan; natatakot sila sa mga organisado. Ang paghihiganti dahil sa pag-oorganisa ay ilegal sa ilalim ng NRS 118A.510.',
              zh: '你最强的保护是集体行动。与邻居交谈——他们可能面临同样的问题。组建租户协会。房东针对孤立的租户；他们害怕有组织的租户。根据NRS 118A.510，因组织而进行报复是违法的。',
              vi: 'Sự bảo vệ mạnh nhất của bạn là hành động tập thể. Nói chuyện với hàng xóm—họ có thể đối mặt với cùng vấn đề. Thành lập hiệp hội người thuê. Chủ nhà nhắm vào người thuê cô lập; họ sợ người có tổ chức. Trả đũa vì tổ chức là bất hợp pháp theo NRS 118A.510.',
            },
          },
        ],
      },
    },
    { id: 'rights-cta', type: 'cta', config: {} },
  ],
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}

// Page 6: Historical Justice (Systemic Discrimination Frame)
// Leads with: FHA redlining history - shows housing crisis was deliberately constructed
export const PRESET_PAGE_6: LandingPageConfig = {
  id: 'page-6',
  name: 'Historical Justice',
  sections: [
    {
      id: 'history-hero',
      type: 'hero',
      config: {
        showLogo: true,
        headlineOverride: {
          en: 'The Housing Crisis Was Built. On Purpose.',
          es: 'La Crisis de Vivienda Fue Construida. A Propósito.',
          tl: 'Ang Krisis sa Pabahay Ay Itinayo. Sadya.',
          zh: '住房危机是人为制造的。故意的。',
          vi: 'Cuộc Khủng Hoảng Nhà Ở Được Xây Dựng. Có Chủ Đích.',
        },
        taglineOverride: {
          en: 'Government policy created this crisis. Government has an obligation to fix it.',
          es: 'La política gubernamental creó esta crisis. El gobierno tiene la obligación de arreglarla.',
          tl: 'Nilikha ng patakaran ng gobyerno ang krisis na ito. May obligasyon ang gobyerno na ayusin ito.',
          zh: '政府政策造成了这场危机。政府有义务解决它。',
          vi: 'Chính sách chính phủ đã tạo ra cuộc khủng hoảng này. Chính phủ có nghĩa vụ khắc phục.',
        },
        missionOverride: {
          en: 'In 1938, the Federal Housing Administration\'s Underwriting Manual required banks to deny loans to neighborhoods with Black residents. They called it "protecting property values." We call it redlining. 74% of those neighborhoods remain low-income today. The crisis we face was engineered—and the engineers owe us a solution.',
          es: 'En 1938, el Manual de Suscripción de la Administración Federal de Vivienda requería que los bancos negaran préstamos a vecindarios con residentes negros. Lo llamaron "proteger los valores de las propiedades". Nosotros lo llamamos redlining. El 74% de esos vecindarios siguen siendo de bajos ingresos hoy. La crisis que enfrentamos fue diseñada—y los diseñadores nos deben una solución.',
          tl: 'Noong 1938, ang Underwriting Manual ng Federal Housing Administration ay nag-utos sa mga bangko na tanggihan ang mga pautang sa mga kapitbahayan na may mga residenteng Itim. Tinawag nila itong "pagpoprotekta sa mga halaga ng ari-arian". Tinatawag natin itong redlining. 74% ng mga kapitbahayang iyon ay nananatiling mababang kita ngayon. Ang krisis na ating kinakaharap ay dinisenyo—at ang mga nagdisenyo ay may utang sa ating solusyon.',
          zh: '1938年，联邦住房管理局的承保手册要求银行拒绝向有黑人居民的社区发放贷款。他们称之为"保护财产价值"。我们称之为红线政策。这些社区中74%至今仍是低收入地区。我们面临的危机是人为设计的——设计者欠我们一个解决方案。',
          vi: 'Năm 1938, Sổ tay Bảo lãnh của Cơ quan Quản lý Nhà ở Liên bang yêu cầu các ngân hàng từ chối cho vay với các khu phố có cư dân Da đen. Họ gọi đó là "bảo vệ giá trị tài sản". Chúng tôi gọi đó là redlining. 74% những khu phố đó vẫn là thu nhập thấp ngày nay. Cuộc khủng hoảng chúng ta đối mặt được thiết kế—và những người thiết kế nợ chúng ta một giải pháp.',
        },
      },
    },
    {
      id: 'history-fha',
      type: 'cards',
      config: {
        heading: {
          en: 'How the Government Built Housing Inequality',
          es: 'Cómo el Gobierno Construyó la Desigualdad de Vivienda',
          tl: 'Paano Itinayo ng Gobyerno ang Hindi Pagkakapantay-pantay sa Pabahay',
          zh: '政府如何建造住房不平等',
          vi: 'Chính Phủ Đã Xây Dựng Bất Bình Đẳng Nhà Ở Như Thế Nào',
        },
        layout: 'stacked',
        cards: [
          {
            title: {
              en: 'FHA: Government-Mandated Segregation (1934-1968)',
              es: 'FHA: Segregación Mandada por el Gobierno (1934-1968)',
              tl: 'FHA: Segregasyong Iniutos ng Gobyerno (1934-1968)',
              zh: 'FHA：政府强制的种族隔离 (1934-1968)',
              vi: 'FHA: Phân Biệt Chủng Tộc Do Chính Phủ Bắt Buộc (1934-1968)',
            },
            body: {
              en: 'The 1938 FHA Underwriting Manual stated that neighborhoods required investigation for "incompatible racial groups" and that "properties shall continue to be occupied by the same social and racial classes." Over 98% of FHA-insured loans went to white home purchasers. This wasn\'t private prejudice—it was federal policy.',
              es: 'El Manual de Suscripción de la FHA de 1938 establecía que los vecindarios requerían investigación por "grupos raciales incompatibles" y que "las propiedades deben continuar siendo ocupadas por las mismas clases sociales y raciales". Más del 98% de los préstamos asegurados por la FHA fueron para compradores de viviendas blancos. Esto no era prejuicio privado—era política federal.',
              tl: 'Ang 1938 FHA Underwriting Manual ay nagsasaad na ang mga kapitbahayan ay nangangailangan ng imbestigasyon para sa "mga hindi tugmang pangkat ng lahi" at na "ang mga ari-arian ay dapat patuloy na okupahan ng parehong mga uri ng lipunan at lahi". Higit sa 98% ng mga pautang na insured ng FHA ay napunta sa mga puting bumibili ng bahay. Hindi ito pribadong pagtatangi—ito ay pederal na patakaran.',
              zh: '1938年FHA承保手册规定，社区需要调查"不兼容的种族群体"，并且"房产应继续由相同的社会和种族阶层占用"。超过98%的FHA保险贷款流向白人购房者。这不是私人偏见——这是联邦政策。',
              vi: 'Sổ tay Bảo lãnh FHA năm 1938 quy định rằng các khu phố cần được điều tra về "các nhóm chủng tộc không tương thích" và "tài sản phải tiếp tục được chiếm hữu bởi cùng các tầng lớp xã hội và chủng tộc". Hơn 98% các khoản vay được FHA bảo hiểm đã đến tay người mua nhà da trắng. Đây không phải là định kiến cá nhân—đây là chính sách liên bang.',
            },
          },
          {
            title: {
              en: 'The GI Bill: Affirmative Action for Whites',
              es: 'La Ley GI: Acción Afirmativa para Blancos',
              tl: 'Ang GI Bill: Affirmative Action para sa mga Puti',
              zh: 'GI法案：对白人的平权行动',
              vi: 'Luật GI: Hành Động Tích Cực Cho Người Da Trắng',
            },
            body: {
              en: 'The VA adopted FHA\'s racial exclusion policies. In Mississippi in 1947, of 3,229 VA home loans, only TWO went to Black veterans. In New York, of 67,000 GI Bill home purchases, fewer than 100 were by non-white families. This created the white middle class—and the racial wealth gap.',
              es: 'El VA adoptó las políticas de exclusión racial de la FHA. En Mississippi en 1947, de 3,229 préstamos hipotecarios del VA, solo DOS fueron para veteranos negros. En Nueva York, de 67,000 compras de viviendas con la Ley GI, menos de 100 fueron por familias no blancas. Esto creó la clase media blanca—y la brecha de riqueza racial.',
              tl: 'Inampon ng VA ang mga patakaran ng FHA sa pagbubukod ng lahi. Sa Mississippi noong 1947, sa 3,229 na pautang sa bahay ng VA, DALAWA lang ang napunta sa mga beteranong Itim. Sa New York, sa 67,000 na pagbili ng bahay sa GI Bill, mas mababa sa 100 ang ng mga pamilyang hindi puti. Nilikha nito ang puting gitnang uri—at ang agwat ng yaman ng lahi.',
              zh: '退伍军人管理局采纳了FHA的种族排斥政策。1947年在密西西比州，3229笔VA住房贷款中只有两笔发放给黑人退伍军人。在纽约，67000笔GI法案购房中，不到100笔是非白人家庭。这创造了白人中产阶级——以及种族财富差距。',
              vi: 'VA đã áp dụng các chính sách loại trừ chủng tộc của FHA. Tại Mississippi năm 1947, trong số 3.229 khoản vay nhà VA, chỉ có HAI khoản dành cho cựu chiến binh Da đen. Tại New York, trong số 67.000 giao dịch mua nhà theo Luật GI, ít hơn 100 là của các gia đình không phải da trắng. Điều này tạo ra tầng lớp trung lưu da trắng—và khoảng cách giàu nghèo chủng tộc.',
            },
          },
          {
            title: {
              en: 'Housing Act of 1949: The Unfulfilled Promise',
              es: 'Ley de Vivienda de 1949: La Promesa Incumplida',
              tl: 'Housing Act ng 1949: Ang Hindi Natupad na Pangako',
              zh: '1949年住房法：未兑现的承诺',
              vi: 'Đạo Luật Nhà Ở 1949: Lời Hứa Chưa Thực Hiện',
            },
            body: {
              en: 'In 1949, Congress declared "the goal of a decent home and suitable living environment for every American family" as NATIONAL POLICY. Not aspiration—law. President Truman called it "a national objective." Seventy-five years later, we\'re still waiting. The promise exists. The political will doesn\'t.',
              es: 'En 1949, el Congreso declaró "el objetivo de una vivienda digna y un entorno de vida adecuado para cada familia estadounidense" como POLÍTICA NACIONAL. No aspiración—ley. El Presidente Truman lo llamó "un objetivo nacional". Setenta y cinco años después, todavía estamos esperando. La promesa existe. La voluntad política no.',
              tl: 'Noong 1949, idineklara ng Kongreso ang "layunin ng isang disenteng tahanan at angkop na kapaligiran para sa bawat pamilyang Amerikano" bilang PAMBANSANG PATAKARAN. Hindi hangarin—batas. Tinawag ito ni Pangulong Truman na "isang pambansang layunin". Pitumpu\'t limang taon na ang nakalipas, naghihintay pa rin tayo. Umiiral ang pangako. Ang pulitikal na kalooban ay wala.',
              zh: '1949年，国会宣布"为每个美国家庭提供体面的住房和适宜的生活环境"是国家政策。不是愿望——是法律。杜鲁门总统称之为"国家目标"。七十五年后，我们仍在等待。承诺存在。政治意愿不存在。',
              vi: 'Năm 1949, Quốc hội tuyên bố "mục tiêu về một ngôi nhà đàng hoàng và môi trường sống phù hợp cho mọi gia đình Mỹ" là CHÍNH SÁCH QUỐC GIA. Không phải khát vọng—là luật. Tổng thống Truman gọi đó là "một mục tiêu quốc gia". Bảy mươi lăm năm sau, chúng ta vẫn đang chờ đợi. Lời hứa tồn tại. Ý chí chính trị không.',
            },
          },
        ],
      },
    },
    {
      id: 'history-impact',
      type: 'text',
      config: {
        heading: {
          en: 'The Legacy Lives On',
          es: 'El Legado Continúa',
          tl: 'Ang Pamana Ay Nananatili',
          zh: '遗产延续至今',
          vi: 'Di Sản Vẫn Còn',
        },
        body: {
          en: '**74% of neighborhoods marked "Hazardous" in the 1930s remain low-to-moderate income today.**\n\nThe racial wealth gap—driven largely by differential homeownership rates—traces directly to these policies. Black families were systematically excluded from the greatest wealth-building opportunity in American history.\n\nThis isn\'t ancient history. The Fair Housing Act was passed in 1968—within living memory. The effects are ongoing. And the obligation to repair is collective.\n\nWe made this system. We benefit from it (those of us who own property, claim mortgage deductions, or live in protected neighborhoods). We are therefore obligated to unmake it.',
          es: '**El 74% de los vecindarios marcados como "Peligrosos" en los años 1930 siguen siendo de ingresos bajos a moderados hoy.**\n\nLa brecha de riqueza racial—impulsada en gran parte por las tasas diferenciales de propiedad de vivienda—se remonta directamente a estas políticas. Las familias negras fueron sistemáticamente excluidas de la mayor oportunidad de creación de riqueza en la historia de Estados Unidos.\n\nEsto no es historia antigua. La Ley de Vivienda Justa se aprobó en 1968—dentro de la memoria viva. Los efectos continúan. Y la obligación de reparar es colectiva.\n\nCreamos este sistema. Nos beneficiamos de él (aquellos de nosotros que poseemos propiedades, reclamamos deducciones hipotecarias o vivimos en vecindarios protegidos). Por lo tanto, estamos obligados a deshacerlo.',
          tl: '**74% ng mga kapitbahayang minarkahan bilang "Mapanganib" noong 1930s ay nananatiling mababa hanggang katamtamang kita ngayon.**\n\nAng agwat ng yaman ng lahi—na higit na hinihimok ng mga rate ng pagmamay-ari ng bahay—ay direktang nauugnay sa mga patakarang ito. Ang mga pamilyang Itim ay sistematikong ibinukod mula sa pinakamalaking pagkakataon ng pagbuo ng yaman sa kasaysayan ng Amerika.\n\nHindi ito sinaunang kasaysayan. Ang Fair Housing Act ay ipinasa noong 1968—sa loob ng nabubuhay na alaala. Ang mga epekto ay nagpapatuloy. At ang obligasyon na ayusin ay kolektibo.\n\nGinawa natin ang sistemang ito. Nakikinabang tayo dito (yung mga nagmamay-ari ng ari-arian, nag-claim ng mortgage deductions, o nakatira sa mga protektadong kapitbahayan). Samakatuwid ay obligado tayong sirain ito.',
          zh: '**1930年代被标记为"危险"的社区中有74%至今仍是中低收入地区。**\n\n种族财富差距——主要由住房拥有率差异驱动——直接追溯到这些政策。黑人家庭被系统性地排除在美国历史上最大的财富积累机会之外。\n\n这不是古老的历史。公平住房法于1968年通过——在人们的记忆之内。影响仍在持续。修复的义务是集体的。\n\n我们创造了这个系统。我们从中受益（那些拥有房产、申请抵押贷款扣除或住在受保护社区的人）。因此，我们有义务拆除它。',
          vi: '**74% các khu phố được đánh dấu là "Nguy hiểm" vào những năm 1930 vẫn là thu nhập thấp đến trung bình ngày nay.**\n\nKhoảng cách giàu nghèo chủng tộc—chủ yếu do sự khác biệt về tỷ lệ sở hữu nhà—bắt nguồn trực tiếp từ những chính sách này. Các gia đình Da đen đã bị loại trừ một cách có hệ thống khỏi cơ hội xây dựng tài sản lớn nhất trong lịch sử nước Mỹ.\n\nĐây không phải là lịch sử xa xưa. Đạo luật Nhà ở Công bằng được thông qua vào năm 1968—trong trí nhớ sống. Những ảnh hưởng vẫn đang tiếp diễn. Và nghĩa vụ sửa chữa là tập thể.\n\nChúng ta đã tạo ra hệ thống này. Chúng ta được hưởng lợi từ nó (những người sở hữu tài sản, yêu cầu khấu trừ thế chấp, hoặc sống trong các khu phố được bảo vệ). Do đó, chúng ta có nghĩa vụ phải gỡ bỏ nó.',
        },
        bgColor: 'gray',
      },
    },
    {
      id: 'history-repair',
      type: 'cards',
      config: {
        heading: {
          en: 'What Reparative Justice Requires',
          es: 'Lo Que Requiere la Justicia Reparadora',
          tl: 'Ano ang Kinakailangan ng Reparative Justice',
          zh: '修复性正义需要什么',
          vi: 'Công Lý Sửa Chữa Đòi Hỏi Điều Gì',
        },
        layout: 'stacked',
        cards: [
          {
            title: {
              en: 'Enforce the 1949 Promise',
              es: 'Hacer Cumplir la Promesa de 1949',
              tl: 'Ipatupad ang Pangako ng 1949',
              zh: '执行1949年的承诺',
              vi: 'Thực Thi Lời Hứa Năm 1949',
            },
            body: {
              en: 'The Housing Act of 1949 declared "a decent home and suitable living environment for every American family" as national policy—not aspiration, but law. Seventy-five years later, the promise remains unfulfilled. The solution isn\'t new programs. It\'s enforcing the commitment we already made.',
              es: 'La Ley de Vivienda de 1949 declaró "un hogar decente y un ambiente de vida adecuado para cada familia estadounidense" como política nacional—no aspiración, sino ley. Setenta y cinco años después, la promesa sigue sin cumplirse. La solución no son nuevos programas. Es hacer cumplir el compromiso que ya hicimos.',
              tl: 'Ang Housing Act ng 1949 ay nagdeklara ng "isang disenteng tahanan at angkop na kapaligiran para sa bawat pamilyang Amerikano" bilang pambansang patakaran—hindi hangarin, kundi batas. Pitumpu\'t limang taon na ang nakalipas, hindi pa natutupad ang pangako. Ang solusyon ay hindi mga bagong programa. Ito ay pagpapatupad ng commitment na nagawa na natin.',
              zh: '1949年住房法宣布"为每个美国家庭提供体面的住房和适宜的生活环境"是国家政策——不是愿望，而是法律。七十五年后，承诺仍未兑现。解决方案不是新项目。而是执行我们已经做出的承诺。',
              vi: 'Đạo luật Nhà ở 1949 tuyên bố "một ngôi nhà đàng hoàng và môi trường sống phù hợp cho mọi gia đình Mỹ" là chính sách quốc gia—không phải khát vọng, mà là luật. Bảy mươi lăm năm sau, lời hứa vẫn chưa được thực hiện. Giải pháp không phải là các chương trình mới. Mà là thực thi cam kết chúng ta đã đưa ra.',
            },
          },
          {
            title: {
              en: 'Repair the Wealth Gap',
              es: 'Reparar la Brecha de Riqueza',
              tl: 'Ayusin ang Wealth Gap',
              zh: '修复财富差距',
              vi: 'Sửa Chữa Khoảng Cách Giàu Nghèo',
            },
            body: {
              en: 'The racial wealth gap traces directly to federal housing policy. Black families were systematically excluded from homeownership while white families built generational wealth. Repairing this requires: community land trusts, social housing, universal rent relief, and policies that prioritize communities harmed by redlining.',
              es: 'La brecha de riqueza racial se remonta directamente a la política federal de vivienda. Las familias negras fueron sistemáticamente excluidas de la propiedad de viviendas mientras las familias blancas construían riqueza generacional. Reparar esto requiere: fideicomisos comunitarios de tierra, vivienda social, alivio universal de alquileres y políticas que prioricen comunidades dañadas por el redlining.',
              tl: 'Ang racial wealth gap ay direktang nauugnay sa pederal na patakaran sa pabahay. Ang mga pamilyang Itim ay sistematikong ibinukod sa pagmamay-ari ng bahay habang ang mga pamilyang puti ay nagtatayo ng generational wealth. Ang pag-aayos nito ay nangangailangan ng: community land trusts, social housing, universal rent relief, at mga patakaran na inuuna ang mga komunidad na napinsala ng redlining.',
              zh: '种族财富差距直接追溯到联邦住房政策。黑人家庭被系统性地排除在住房所有权之外，而白人家庭积累了世代财富。修复这一问题需要：社区土地信托、社会住房、普遍租金减免，以及优先考虑受红线政策损害的社区的政策。',
              vi: 'Khoảng cách giàu nghèo chủng tộc trực tiếp bắt nguồn từ chính sách nhà ở liên bang. Các gia đình Da đen bị loại trừ một cách có hệ thống khỏi quyền sở hữu nhà trong khi các gia đình Da trắng xây dựng tài sản qua nhiều thế hệ. Sửa chữa điều này đòi hỏi: quỹ đất cộng đồng, nhà ở xã hội, giảm tiền thuê phổ quát và các chính sách ưu tiên các cộng đồng bị tổn hại bởi redlining.',
            },
          },
          {
            title: {
              en: 'Build Tenant Power',
              es: 'Construir Poder de Inquilinos',
              tl: 'Itayo ang Kapangyarihan ng Nangungupahan',
              zh: '建设租户力量',
              vi: 'Xây Dựng Quyền Lực Người Thuê',
            },
            body: {
              en: 'Policy alone won\'t create justice—power creates justice. The communities most harmed by housing discrimination must lead the movement to repair it. That means tenant unions, community control, and democratic governance of housing. Not charity from above, but power from below.',
              es: 'Las políticas solas no crearán justicia—el poder crea justicia. Las comunidades más perjudicadas por la discriminación en la vivienda deben liderar el movimiento para repararla. Eso significa sindicatos de inquilinos, control comunitario y gobernanza democrática de la vivienda. No caridad desde arriba, sino poder desde abajo.',
              tl: 'Ang patakaran lamang ay hindi lilikha ng katarungan—ang kapangyarihan ang lumikha ng katarungan. Ang mga komunidad na pinaka-napinsala ng diskriminasyon sa pabahay ay dapat mamuno sa kilusan para ayusin ito. Ibig sabihin ay mga tenant union, community control, at demokratikong pamamahala ng pabahay. Hindi kawanggawa mula sa itaas, kundi kapangyarihan mula sa ibaba.',
              zh: '仅靠政策不会创造正义——权力创造正义。受住房歧视伤害最深的社区必须领导修复运动。这意味着租户工会、社区控制和住房的民主治理。不是来自上层的施舍，而是来自下层的力量。',
              vi: 'Chỉ chính sách sẽ không tạo ra công lý—quyền lực tạo ra công lý. Các cộng đồng bị tổn hại nhiều nhất bởi phân biệt đối xử nhà ở phải dẫn đầu phong trào sửa chữa nó. Điều đó có nghĩa là công đoàn người thuê, kiểm soát cộng đồng và quản trị dân chủ nhà ở. Không phải từ thiện từ trên, mà là quyền lực từ dưới.',
            },
          },
        ],
      },
    },
    { id: 'history-cta', type: 'cta', config: {} },
  ],
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}

// Page 7: Organizing Works (Movement Victory Frame)
// Leads with: KC Tenants success stories, historical victories - collective action works
export const PRESET_PAGE_7: LandingPageConfig = {
  id: 'page-7',
  name: 'Organizing Works',
  sections: [
    {
      id: 'org-hero',
      type: 'hero',
      config: {
        showLogo: true,
        headlineOverride: {
          en: 'Tenants Win When Tenants Organize',
          es: 'Los Inquilinos Ganan Cuando Se Organizan',
          tl: 'Nananalo ang mga Nangungupahan Kapag Nag-organisa',
          zh: '租户组织起来就能赢',
          vi: 'Người Thuê Nhà Thắng Khi Tổ Chức Lại',
        },
        taglineOverride: {
          en: 'From 1919 to today, organized tenants have won rent control, stopped evictions, and changed the law.',
          es: 'Desde 1919 hasta hoy, los inquilinos organizados han ganado control de alquileres, detenido desalojos y cambiado la ley.',
          tl: 'Mula 1919 hanggang ngayon, ang mga organisadong nangungupahan ay nanalo ng rent control, pinigilan ang mga pagpapaalis, at binago ang batas.',
          zh: '从1919年到今天，有组织的租户赢得了租金管制、阻止了驱逐、改变了法律。',
          vi: 'Từ năm 1919 đến nay, những người thuê nhà có tổ chức đã giành được kiểm soát tiền thuê, ngăn chặn trục xuất và thay đổi luật pháp.',
        },
        missionOverride: {
          en: 'In 2022, tenants at Independence Towers in Kansas City went on a 248-day rent strike against their corporate landlord. They won $300,000 in back rent forgiven. That\'s the power of collective action. Rights are what you make and what you take.',
          es: 'En 2022, los inquilinos de Independence Towers en Kansas City hicieron una huelga de alquiler de 248 días contra su propietario corporativo. Ganaron $300,000 en alquiler atrasado perdonado. Ese es el poder de la acción colectiva. Los derechos son lo que haces y lo que tomas.',
          tl: 'Noong 2022, ang mga nangungupahan sa Independence Towers sa Kansas City ay nag-strike ng 248 araw laban sa kanilang corporate na may-ari. Nanalo sila ng $300,000 sa naatrasang upa na napatawad. Iyan ang kapangyarihan ng sama-samang pagkilos. Ang mga karapatan ay kung ano ang ginagawa mo at kinukuha mo.',
          zh: '2022年，堪萨斯城Independence Towers的租户进行了248天的租金罢工，对抗他们的企业房东。他们赢得了30万美元的欠租豁免。这就是集体行动的力量。权利是你创造和争取的。',
          vi: 'Năm 2022, những người thuê nhà tại Independence Towers ở Kansas City đã đình công tiền thuê 248 ngày chống lại chủ nhà doanh nghiệp. Họ đã thắng được 300.000 đô la tiền thuê truy thu được xóa bỏ. Đó là sức mạnh của hành động tập thể. Quyền lợi là những gì bạn tạo ra và giành lấy.',
        },
      },
    },
    {
      id: 'org-victories',
      type: 'cards',
      config: {
        heading: {
          en: 'A Century of Tenant Victories',
          es: 'Un Siglo de Victorias de Inquilinos',
          tl: 'Isang Siglo ng mga Tagumpay ng Nangungupahan',
          zh: '租户胜利的一个世纪',
          vi: 'Một Thế Kỷ Chiến Thắng Của Người Thuê Nhà',
        },
        layout: 'grid',
        cards: [
          {
            title: {
              en: '1919-1920: America\'s First Rent Control',
              es: '1919-1920: El Primer Control de Alquileres de América',
              tl: '1919-1920: Unang Rent Control ng Amerika',
              zh: '1919-1920：美国首个租金管制',
              vi: '1919-1920: Kiểm Soát Tiền Thuê Đầu Tiên Của Mỹ',
            },
            body: {
              en: 'Jewish immigrant workers organized 25,000 tenants in NYC. They struck 500 buildings. The state passed the nation\'s first rent control laws. When tenants organize, we change the law.',
              es: 'Los trabajadores inmigrantes judíos organizaron 25,000 inquilinos en NYC. Hicieron huelga en 500 edificios. El estado aprobó las primeras leyes de control de alquileres del país. Cuando los inquilinos se organizan, cambiamos la ley.',
              tl: 'Ang mga manggagawang imigrante na Hudyo ay nag-organisa ng 25,000 nangungupahan sa NYC. Nag-strike sila sa 500 gusali. Ipinasa ng estado ang unang mga batas sa rent control ng bansa. Kapag nag-organisa ang mga nangungupahan, binabago natin ang batas.',
              zh: '犹太移民工人在纽约组织了25000名租户。他们在500栋建筑物罢工。该州通过了全国第一个租金管制法。当租户组织起来，我们改变法律。',
              vi: 'Công nhân nhập cư Do Thái đã tổ chức 25.000 người thuê nhà ở NYC. Họ đình công 500 tòa nhà. Tiểu bang đã thông qua luật kiểm soát tiền thuê đầu tiên của quốc gia. Khi người thuê nhà tổ chức, chúng ta thay đổi luật.',
            },
          },
          {
            title: {
              en: '1970: Javins and the Right to Habitability',
              es: '1970: Javins y el Derecho a la Habitabilidad',
              tl: '1970: Javins at ang Karapatan sa Habitability',
              zh: '1970年：Javins案和宜居权',
              vi: '1970: Javins và Quyền Được Ở',
            },
            body: {
              en: 'Tenants at Clifton Terrace documented 1,500 code violations and refused to pay rent. The court ruled landlords must maintain habitable conditions. This case transformed landlord-tenant law nationwide.',
              es: 'Los inquilinos de Clifton Terrace documentaron 1,500 violaciones del código y se negaron a pagar el alquiler. El tribunal dictaminó que los propietarios deben mantener condiciones habitables. Este caso transformó la ley de propietarios e inquilinos en todo el país.',
              tl: 'Ang mga nangungupahan sa Clifton Terrace ay nagdokumento ng 1,500 paglabag sa code at tumanggi na magbayad ng upa. Nagpasya ang korte na dapat panatilihin ng mga may-ari ang mga kondisyong maaaring tirahan. Binago ng kasong ito ang batas ng may-ari-nangungupahan sa buong bansa.',
              zh: 'Clifton Terrace的租户记录了1500项法规违规并拒绝支付租金。法院裁定房东必须保持可居住条件。此案改变了全国的房东-租户法律。',
              vi: 'Người thuê nhà tại Clifton Terrace đã ghi nhận 1.500 vi phạm mã và từ chối trả tiền thuê. Tòa án phán quyết chủ nhà phải duy trì điều kiện có thể ở được. Vụ án này đã biến đổi luật chủ nhà-người thuê trên toàn quốc.',
            },
          },
          {
            title: {
              en: '2019: Oregon\'s Statewide Rent Control',
              es: '2019: Control de Alquileres Estatal de Oregon',
              tl: '2019: Statewide Rent Control ng Oregon',
              zh: '2019年：俄勒冈州全州租金管制',
              vi: '2019: Kiểm Soát Tiền Thuê Toàn Tiểu Bang Oregon',
            },
            body: {
              en: 'Oregon became the first state to pass statewide rent control. California followed with AB 1482, protecting 8 million renters. The momentum is building.',
              es: 'Oregon se convirtió en el primer estado en aprobar el control de alquileres a nivel estatal. California siguió con AB 1482, protegiendo a 8 millones de inquilinos. El impulso está creciendo.',
              tl: 'Ang Oregon ang naging unang estado na magpasa ng statewide rent control. Sumunod ang California sa AB 1482, na nagpoprotekta sa 8 milyong nangungupahan. Lumalaki ang momentum.',
              zh: '俄勒冈州成为第一个通过全州租金管制的州。加利福尼亚州随后通过AB 1482，保护800万租户。势头正在增强。',
              vi: 'Oregon trở thành tiểu bang đầu tiên thông qua kiểm soát tiền thuê toàn tiểu bang. California theo sau với AB 1482, bảo vệ 8 triệu người thuê. Đà phát triển đang được xây dựng.',
            },
          },
          {
            title: {
              en: '2024: New York Good Cause Eviction',
              es: '2024: Desalojo por Causa Justa de Nueva York',
              tl: '2024: Good Cause Eviction ng New York',
              zh: '2024年：纽约正当理由驱逐法',
              vi: '2024: Luật Trục Xuất Có Lý Do Chính Đáng New York',
            },
            body: {
              en: 'After years of organizing, New York passed Good Cause Eviction protections covering approximately 1 million renters. Landlords can no longer evict tenants for no reason. The fight continues.',
              es: 'Después de años de organización, Nueva York aprobó protecciones de Desalojo por Causa Justa que cubren aproximadamente 1 millón de inquilinos. Los propietarios ya no pueden desalojar a los inquilinos sin razón. La lucha continúa.',
              tl: 'Pagkatapos ng mga taon ng pag-oorganisa, ipinasa ng New York ang mga proteksyon sa Good Cause Eviction na sumasaklaw sa humigit-kumulang 1 milyong nangungupahan. Hindi na maaaring paalisin ng mga may-ari ang mga nangungupahan nang walang dahilan. Nagpapatuloy ang laban.',
              zh: '经过多年组织，纽约通过了正当理由驱逐保护，覆盖约100万租户。房东不能再无故驱逐租户。斗争仍在继续。',
              vi: 'Sau nhiều năm tổ chức, New York đã thông qua bảo vệ Trục xuất Có lý do Chính đáng bao gồm khoảng 1 triệu người thuê. Chủ nhà không còn có thể trục xuất người thuê mà không có lý do. Cuộc đấu tranh tiếp tục.',
            },
          },
        ],
      },
    },
    {
      id: 'org-kc',
      type: 'text',
      config: {
        heading: {
          en: '"My Rent Is My Power"',
          es: '"Mi Alquiler Es Mi Poder"',
          tl: '"Ang Upa Ko Ang Kapangyarihan Ko"',
          zh: '"我的租金就是我的力量"',
          vi: '"Tiền Thuê Của Tôi Là Sức Mạnh Của Tôi"',
        },
        body: {
          en: 'KC Tenants has shown what\'s possible when tenants organize:\n\n**248-day rent strike** at Independence Towers → $300,000 forgiven\n**Citywide Tenants Bill of Rights** passed\n**Tenant Union Federation** launched nationally\n\nAs founder Tara Raghuveer says: "The vehicle to organize poor and working-class people in the 21st century is the tenant union. The tenant union needs to be for that group of people what the labor union was in the 20th century at its peak."\n\n**Stay dangerous. Stay united. The slumlords are on notice.**',
          es: 'KC Tenants ha demostrado lo que es posible cuando los inquilinos se organizan:\n\n**Huelga de alquiler de 248 días** en Independence Towers → $300,000 perdonados\n**Declaración de Derechos de los Inquilinos de la ciudad** aprobada\n**Federación de Sindicatos de Inquilinos** lanzada a nivel nacional\n\nComo dice la fundadora Tara Raghuveer: "El vehículo para organizar a la gente pobre y de clase trabajadora en el siglo XXI es el sindicato de inquilinos. El sindicato de inquilinos necesita ser para ese grupo de personas lo que el sindicato laboral fue en el siglo XX en su apogeo."\n\n**Mantente peligroso. Mantente unido. Los caseros están advertidos.**',
          tl: 'Ipinakita ng KC Tenants kung ano ang posible kapag nag-organisa ang mga nangungupahan:\n\n**248-araw na rent strike** sa Independence Towers → $300,000 napatawad\n**Citywide Tenants Bill of Rights** naipasa\n**Tenant Union Federation** inilunsad sa buong bansa\n\nGaya ng sabi ng tagapagtatag na si Tara Raghuveer: "Ang sasakyan para iorganisa ang mga mahihirap at manggagawang tao sa ika-21 siglo ay ang tenant union. Ang tenant union ay kailangang maging para sa pangkat ng mga taong iyon kung ano ang labor union sa ika-20 siglo sa tugatog nito."\n\n**Manatiling mapanganib. Manatiling nagkakaisa. Naabisuhan na ang mga slumlord.**',
          zh: 'KC Tenants展示了租户组织起来时的可能性：\n\n**248天租金罢工** @ Independence Towers → 30万美元被豁免\n**全市租户权利法案** 通过\n**租户工会联合会** 全国启动\n\n正如创始人Tara Raghuveer所说："21世纪组织穷人和工人阶级的工具是租户工会。租户工会需要成为这群人在21世纪的工具，就像工会在20世纪鼎盛时期那样。"\n\n**保持危险。保持团结。贫民窟房东们已被警告。**',
          vi: 'KC Tenants đã cho thấy điều gì có thể khi người thuê nhà tổ chức:\n\n**Đình công tiền thuê 248 ngày** tại Independence Towers → 300.000 đô la được xóa\n**Tuyên ngôn Quyền Người Thuê Toàn Thành Phố** được thông qua\n**Liên đoàn Công đoàn Người Thuê** ra mắt trên toàn quốc\n\nNhư người sáng lập Tara Raghuveer nói: "Phương tiện để tổ chức người nghèo và tầng lớp lao động trong thế kỷ 21 là công đoàn người thuê. Công đoàn người thuê cần phải là cho nhóm người đó những gì công đoàn lao động đã là trong thế kỷ 20 ở đỉnh cao của nó."\n\n**Hãy nguy hiểm. Hãy đoàn kết. Những kẻ bóc lột đã được cảnh báo.**',
        },
        bgColor: 'gray',
      },
    },
    {
      id: 'org-model',
      type: 'cards',
      config: {
        heading: {
          en: 'The Tenant Union Model',
          es: 'El Modelo del Sindicato de Inquilinos',
          tl: 'Ang Modelo ng Tenant Union',
          zh: '租户工会模式',
          vi: 'Mô Hình Công Đoàn Người Thuê',
        },
        layout: 'stacked',
        cards: [
          {
            title: {
              en: 'Building-by-Building Organizing',
              es: 'Organización Edificio por Edificio',
              tl: 'Pag-oorganisa ng Gusali-sa-Gusali',
              zh: '逐楼组织',
              vi: 'Tổ Chức Từng Tòa Nhà',
            },
            body: {
              en: 'Start where you live. Talk to your neighbors. Find common issues. Form a tenant association. This is the foundation of tenant power. KC Tenants built their citywide power by organizing hundreds of buildings, one at a time.',
              es: 'Comienza donde vives. Habla con tus vecinos. Encuentra problemas comunes. Forma una asociación de inquilinos. Esta es la base del poder de los inquilinos. KC Tenants construyó su poder en toda la ciudad organizando cientos de edificios, uno a la vez.',
              tl: 'Magsimula kung saan ka nakatira. Kausapin ang iyong mga kapitbahay. Hanapin ang mga karaniwang isyu. Bumuo ng tenant association. Ito ang pundasyon ng kapangyarihan ng nangungupahan. Itinayo ng KC Tenants ang kanilang citywide power sa pamamagitan ng pag-oorganisa ng daan-daang gusali, isa-isa.',
              zh: '从你住的地方开始。与邻居交谈。找到共同问题。成立租户协会。这是租户力量的基础。KC Tenants通过一栋一栋地组织数百栋建筑，建立了他们的全市力量。',
              vi: 'Bắt đầu từ nơi bạn sống. Nói chuyện với hàng xóm. Tìm các vấn đề chung. Thành lập hiệp hội người thuê. Đây là nền tảng của quyền lực người thuê. KC Tenants xây dựng sức mạnh toàn thành phố bằng cách tổ chức hàng trăm tòa nhà, từng tòa một.',
            },
          },
          {
            title: {
              en: 'Escalating Demands',
              es: 'Demandas Escaladas',
              tl: 'Pag-escalate ng mga Demand',
              zh: '升级诉求',
              vi: 'Leo Thang Yêu Cầu',
            },
            body: {
              en: 'Document issues → Written demand → Public pressure → Collective action. Each step builds power. At Independence Towers, tenants documented violations for months before striking. When they finally withheld rent, they had the evidence and unity to win.',
              es: 'Documenta problemas → Demanda escrita → Presión pública → Acción colectiva. Cada paso construye poder. En Independence Towers, los inquilinos documentaron violaciones durante meses antes de hacer huelga. Cuando finalmente retuvieron el alquiler, tenían la evidencia y la unidad para ganar.',
              tl: 'Idokumento ang mga isyu → Nakasulat na demand → Public pressure → Collective action. Bawat hakbang ay nagtatayo ng kapangyarihan. Sa Independence Towers, nagdokumento ang mga nangungupahan ng mga paglabag sa loob ng ilang buwan bago mag-strike. Nang sa wakas ay itinago nila ang upa, mayroon silang ebidensya at pagkakaisa para manalo.',
              zh: '记录问题 → 书面要求 → 公众压力 → 集体行动。每一步都建立力量。在Independence Towers，租户在罢工前花了几个月时间记录违规行为。当他们最终拒付租金时，他们有了赢得胜利所需的证据和团结。',
              vi: 'Ghi nhận vấn đề → Yêu cầu bằng văn bản → Áp lực công chúng → Hành động tập thể. Mỗi bước xây dựng sức mạnh. Tại Independence Towers, người thuê ghi nhận vi phạm trong nhiều tháng trước khi đình công. Khi cuối cùng họ giữ lại tiền thuê, họ có bằng chứng và sự đoàn kết để chiến thắng.',
            },
          },
          {
            title: {
              en: 'From Defense to Offense',
              es: 'De Defensa a Ofensiva',
              tl: 'Mula Depensa hanggang Opensiba',
              zh: '从防守到进攻',
              vi: 'Từ Phòng Thủ Đến Tấn Công',
            },
            body: {
              en: 'Don\'t just fight evictions—fight for policy change. KC Tenants passed a citywide Tenants Bill of Rights. They launched a national Tenant Union Federation. When you build enough power, you stop playing defense and start changing the rules.',
              es: 'No solo luches contra los desalojos—lucha por cambios de política. KC Tenants aprobó una Declaración de Derechos de los Inquilinos en toda la ciudad. Lanzaron una Federación Nacional de Sindicatos de Inquilinos. Cuando construyes suficiente poder, dejas de jugar a la defensiva y empiezas a cambiar las reglas.',
              tl: 'Huwag lang lumaban sa eviction—lumaban para sa pagbabago ng patakaran. Naipasa ng KC Tenants ang isang citywide Tenants Bill of Rights. Inilunsad nila ang isang national Tenant Union Federation. Kapag nakabuo ka ng sapat na kapangyarihan, hihinto ka na sa paglalaro ng depensa at magsisimula nang baguhin ang mga patakaran.',
              zh: '不只是抵抗驱逐——为政策变革而战。KC Tenants通过了全市租户权利法案。他们启动了全国租户工会联合会。当你建立了足够的力量，你就不再只是防守，而是开始改变规则。',
              vi: 'Không chỉ chống lại việc trục xuất—đấu tranh cho thay đổi chính sách. KC Tenants đã thông qua Tuyên ngôn Quyền Người Thuê toàn thành phố. Họ ra mắt Liên đoàn Công đoàn Người Thuê quốc gia. Khi bạn xây dựng đủ sức mạnh, bạn ngừng phòng thủ và bắt đầu thay đổi luật chơi.',
            },
          },
        ],
      },
    },
    { id: 'org-cta', type: 'cta', config: {} },
  ],
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}

// Page 8: Class Solidarity (Worker Power Frame)
// Leads with: Explicit class framing, labor-tenant alliance, "billionaire class vs working class"
export const PRESET_PAGE_8: LandingPageConfig = {
  id: 'page-8',
  name: 'Class Solidarity',
  sections: [
    {
      id: 'class-hero',
      type: 'hero',
      config: {
        showLogo: true,
        headlineOverride: {
          en: 'Your Rent Funds the Billionaire Class',
          es: 'Tu Alquiler Financia la Clase Multimillonaria',
          tl: 'Ang Upa Mo Ay Nagpopondo sa Napakalaking Mayamang Klase',
          zh: '你的租金资助亿万富翁阶级',
          vi: 'Tiền Thuê Của Bạn Tài Trợ Cho Giai Cấp Tỷ Phú',
        },
        taglineOverride: {
          en: 'The same forces extracting wealth from workers are extracting wealth from tenants. It\'s time to fight back together.',
          es: 'Las mismas fuerzas que extraen riqueza de los trabajadores están extrayendo riqueza de los inquilinos. Es hora de luchar juntos.',
          tl: 'Ang parehong mga pwersang kumukuha ng yaman mula sa mga manggagawa ay kumukuha ng yaman mula sa mga nangungupahan. Oras na para lumaban nang magkasama.',
          zh: '从工人身上榨取财富的同样力量也在从租户身上榨取财富。是时候一起反击了。',
          vi: 'Cùng những lực lượng rút tài sản từ công nhân cũng đang rút tài sản từ người thuê nhà. Đã đến lúc cùng nhau phản击.',
        },
        missionOverride: {
          en: 'Stephen Schwarzman, CEO of Blackstone (America\'s largest landlord), made $1.27 billion in 2022. Meanwhile, 57% of Nevada renters spend over 30% of their income on housing. That\'s not a housing market—that\'s class warfare. And we\'re joining the fight.',
          es: 'Stephen Schwarzman, CEO de Blackstone (el mayor propietario de Estados Unidos), ganó $1.27 mil millones en 2022. Mientras tanto, el 57% de los inquilinos de Nevada gastan más del 30% de sus ingresos en vivienda. Eso no es un mercado de vivienda—es guerra de clases. Y nos unimos a la lucha.',
          tl: 'Si Stephen Schwarzman, CEO ng Blackstone (pinakamalaking may-ari ng Amerika), ay kumita ng $1.27 bilyon noong 2022. Samantala, 57% ng mga nangungupahan sa Nevada ay gumagastos ng higit sa 30% ng kanilang kita sa pabahay. Hindi iyan housing market—iyan ay digmaang panguri. At sumasali tayo sa laban.',
          zh: '黑石集团（美国最大房东）CEO斯蒂芬·施瓦茨曼2022年赚了12.7亿美元。与此同时，内华达州57%的租户将超过30%的收入用于住房。这不是住房市场——这是阶级战争。我们加入了这场战斗。',
          vi: 'Stephen Schwarzman, CEO của Blackstone (chủ nhà lớn nhất nước Mỹ), kiếm được 1,27 tỷ đô la vào năm 2022. Trong khi đó, 57% người thuê nhà ở Nevada chi hơn 30% thu nhập cho nhà ở. Đó không phải là thị trường nhà ở—đó là chiến tranh giai cấp. Và chúng tôi tham gia cuộc chiến.',
        },
      },
    },
    {
      id: 'class-extraction',
      type: 'cards',
      config: {
        heading: {
          en: 'The Extraction Economy',
          es: 'La Economía de Extracción',
          tl: 'Ang Ekonomiya ng Pagsasamantala',
          zh: '剥削经济',
          vi: 'Nền Kinh Tế Bóc Lột',
        },
        layout: 'stacked',
        cards: [
          {
            title: {
              en: 'At Work: They Steal Your Labor',
              es: 'En el Trabajo: Roban Tu Trabajo',
              tl: 'Sa Trabaho: Ninanakaw Nila ang Iyong Trabaho',
              zh: '在工作中：他们偷取你的劳动',
              vi: 'Tại Nơi Làm Việc: Họ Đánh Cắp Sức Lao Động Của Bạn',
            },
            body: {
              en: 'Wages haven\'t kept up with productivity since the 1970s. The wealth you create goes to executives and shareholders. When workers organize—like the UAW in 2023—we win it back.',
              es: 'Los salarios no han seguido el ritmo de la productividad desde los años 70. La riqueza que creas va a ejecutivos y accionistas. Cuando los trabajadores se organizan—como el UAW en 2023—la recuperamos.',
              tl: 'Ang mga sahod ay hindi nakakasabay sa produktibidad mula noong 1970s. Ang yaman na nililikha mo ay napupunta sa mga executive at shareholder. Kapag nag-organisa ang mga manggagawa—tulad ng UAW noong 2023—nababawi natin ito.',
              zh: '自1970年代以来，工资没有跟上生产力。你创造的财富流向了高管和股东。当工人组织起来时——像2023年的UAW——我们赢回它。',
              vi: 'Lương không theo kịp năng suất từ những năm 1970. Tài sản bạn tạo ra đi đến giám đốc điều hành và cổ đông. Khi công nhân tổ chức lại—như UAW năm 2023—chúng ta giành lại được.',
            },
          },
          {
            title: {
              en: 'At Home: They Steal Your Rent',
              es: 'En Casa: Roban Tu Alquiler',
              tl: 'Sa Bahay: Ninanakaw Nila ang Iyong Upa',
              zh: '在家中：他们偷取你的租金',
              vi: 'Tại Nhà: Họ Đánh Cắp Tiền Thuê Của Bạn',
            },
            body: {
              en: 'Rent increases outpace wages. Corporate landlords buy up housing, raise rents, and evict families. What you earn at work, they take at home. Tenant unions fight back.',
              es: 'Los aumentos de alquiler superan los salarios. Los propietarios corporativos compran viviendas, aumentan los alquileres y desalojan a las familias. Lo que ganas en el trabajo, lo toman en casa. Los sindicatos de inquilinos luchan.',
              tl: 'Ang pagtaas ng upa ay mas mabilis kaysa sa sahod. Ang mga korporasyong may-ari ay bumibili ng pabahay, tinaasan ang upa, at pinapaalis ang mga pamilya. Kung ano ang kinikita mo sa trabaho, kinukuha nila sa bahay. Ang mga tenant union ay lumalaban.',
              zh: '租金上涨超过工资。企业房东买断住房，提高租金，驱逐家庭。你在工作中赚的，他们在家里拿走。租户工会反击。',
              vi: 'Tiền thuê tăng nhanh hơn lương. Chủ nhà doanh nghiệp mua nhà ở, tăng tiền thuê và trục xuất gia đình. Những gì bạn kiếm được ở nơi làm việc, họ lấy ở nhà. Công đoàn người thuê phản击.',
            },
          },
          {
            title: {
              en: 'The Solution: Organize Both',
              es: 'La Solución: Organizar Ambos',
              tl: 'Ang Solusyon: Iorganisa Pareho',
              zh: '解决方案：两者都组织起来',
              vi: 'Giải Pháp: Tổ Chức Cả Hai',
            },
            body: {
              en: 'Labor unions and tenant unions are two fronts of the same fight. What the labor movement was in the 20th century, the tenant movement can be in the 21st. Working people need power in both spheres.',
              es: 'Los sindicatos laborales y los sindicatos de inquilinos son dos frentes de la misma lucha. Lo que el movimiento laboral fue en el siglo XX, el movimiento de inquilinos puede ser en el XXI. La gente trabajadora necesita poder en ambas esferas.',
              tl: 'Ang mga labor union at tenant union ay dalawang harapan ng parehong laban. Kung ano ang labor movement sa ika-20 siglo, ang tenant movement ay maaaring maging sa ika-21. Ang mga taong nagtatrabaho ay nangangailangan ng kapangyarihan sa parehong larangan.',
              zh: '工会和租户工会是同一场斗争的两个战线。劳工运动在20世纪是什么，租户运动在21世纪就可以是什么。劳动人民需要在两个领域都有力量。',
              vi: 'Công đoàn lao động và công đoàn người thuê là hai mặt trận của cùng một cuộc chiến. Phong trào lao động trong thế kỷ 20 là gì, phong trào người thuê có thể là gì trong thế kỷ 21. Người lao động cần quyền lực ở cả hai lĩnh vực.',
            },
          },
        ],
      },
    },
    {
      id: 'class-fain',
      type: 'text',
      config: {
        heading: {
          en: '"I Don\'t Think Billionaires Should Exist"',
          es: '"No Creo Que Los Multimillonarios Deban Existir"',
          tl: '"Hindi Ko Iniisip Na Dapat Mag-exist ang mga Bilyonaryo"',
          zh: '"我认为亿万富翁不应该存在"',
          vi: '"Tôi Không Nghĩ Tỷ Phú Nên Tồn Tại"',
        },
        body: {
          en: '"No one needs that much money. I think it\'s inhumane."\n\n— Shawn Fain, UAW President\n\nThe UAW won historic contracts for 150,000 workers in 2023 by refusing to apologize for class conflict. They named the enemy—the billionaire class—and organized to win.\n\nTenant unions can do the same. We\'re not asking landlords for mercy. We\'re building power to take what\'s ours: safe, stable, affordable housing.\n\n**Every eviction is an act of violence. Every rent increase funds the billionaire class. It\'s time to organize.**',
          es: '"Nadie necesita tanto dinero. Creo que es inhumano."\n\n— Shawn Fain, Presidente de UAW\n\nEl UAW ganó contratos históricos para 150,000 trabajadores en 2023 al negarse a disculparse por el conflicto de clases. Nombraron al enemigo—la clase multimillonaria—y se organizaron para ganar.\n\nLos sindicatos de inquilinos pueden hacer lo mismo. No estamos pidiendo misericordia a los propietarios. Estamos construyendo poder para tomar lo que es nuestro: vivienda segura, estable y asequible.\n\n**Cada desalojo es un acto de violencia. Cada aumento de alquiler financia la clase multimillonaria. Es hora de organizarse.**',
          tl: '"Walang nangangailangan ng ganyang karaming pera. Sa tingin ko ay hindi ito makatarungan."\n\n— Shawn Fain, Pangulo ng UAW\n\nNanalo ang UAW ng mga makasaysayang kontrata para sa 150,000 manggagawa noong 2023 sa pamamagitan ng pagtanggi na humingi ng tawad para sa konflikto ng klase. Pinangalanan nila ang kaaway—ang napakalaking mayamang klase—at nag-organisa para manalo.\n\nMaaaring gawin ng mga tenant union ang parehong bagay. Hindi kami humihingi ng awa sa mga may-ari. Nagtatayo kami ng kapangyarihan para kunin ang sa atin: ligtas, matatag, at abot-kayang pabahay.\n\n**Ang bawat pagpapaalis ay isang gawa ng karahasan. Ang bawat pagtaas ng upa ay nagpopondo sa napakalaking mayamang klase. Oras na para mag-organisa.**',
          zh: '"没有人需要那么多钱。我认为这是不人道的。"\n\n— 肖恩·费恩，UAW主席\n\nUAW在2023年为15万工人赢得了历史性合同，因为他们拒绝为阶级冲突道歉。他们点名敌人——亿万富翁阶级——并组织起来取得胜利。\n\n租户工会也可以做到同样的事情。我们不是在向房东乞求怜悯。我们在建设力量，以夺取属于我们的东西：安全、稳定、负担得起的住房。\n\n**每一次驱逐都是暴力行为。每一次租金上涨都在资助亿万富翁阶级。是时候组织起来了。**',
          vi: '"Không ai cần nhiều tiền như vậy. Tôi nghĩ đó là vô nhân đạo."\n\n— Shawn Fain, Chủ tịch UAW\n\nUAW đã giành được các hợp đồng lịch sử cho 150.000 công nhân vào năm 2023 bằng cách từ chối xin lỗi về xung đột giai cấp. Họ nêu tên kẻ thù—giai cấp tỷ phú—và tổ chức để chiến thắng.\n\nCông đoàn người thuê có thể làm điều tương tự. Chúng tôi không xin chủ nhà thương xót. Chúng tôi đang xây dựng sức mạnh để lấy những gì thuộc về chúng tôi: nhà ở an toàn, ổn định, giá cả phải chăng.\n\n**Mỗi vụ trục xuất là một hành động bạo lực. Mỗi lần tăng tiền thuê là tài trợ cho giai cấp tỷ phú. Đã đến lúc tổ chức.**',
        },
        bgColor: 'gray',
      },
    },
    {
      id: 'class-alliance',
      type: 'cards',
      config: {
        heading: {
          en: 'Building the Labor-Tenant Alliance',
          es: 'Construyendo la Alianza Laboral-Inquilinos',
          tl: 'Pagbuo ng Labor-Tenant Alliance',
          zh: '建设劳工-租户联盟',
          vi: 'Xây Dựng Liên Minh Lao Động-Người Thuê',
        },
        layout: 'stacked',
        cards: [
          {
            title: {
              en: 'Same Bosses, Same Fight',
              es: 'Mismos Jefes, Misma Lucha',
              tl: 'Parehong mga Boss, Parehong Laban',
              zh: '同样的老板，同样的斗争',
              vi: 'Cùng Ông Chủ, Cùng Cuộc Chiến',
            },
            body: {
              en: 'Private equity firms own both workplaces and housing. Blackstone, the largest landlord, also owns companies that employ millions. When they cut wages at work and raise rents at home, they\'re extracting from workers at both ends. Fighting back requires solidarity across both fronts.',
              es: 'Las firmas de capital privado son dueñas tanto de los lugares de trabajo como de las viviendas. Blackstone, el mayor propietario, también es dueño de empresas que emplean a millones. Cuando recortan salarios en el trabajo y suben los alquileres en casa, están extrayendo de los trabajadores en ambos extremos. Luchar requiere solidaridad en ambos frentes.',
              tl: 'Ang mga private equity firm ay nagmamay-ari ng parehong mga lugar ng trabaho at pabahay. Ang Blackstone, ang pinakamalaking landlord, ay nagmamay-ari rin ng mga kumpanya na nag-eempleyo ng milyun-milyon. Kapag binabawasan nila ang sahod sa trabaho at tinaasan ang upa sa bahay, kumukuha sila mula sa mga manggagawa sa parehong dulo. Ang paglaban ay nangangailangan ng pagkakaisa sa parehong harapan.',
              zh: '私募股权公司同时拥有工作场所和住房。黑石集团是最大的房东，也拥有雇用数百万人的公司。当他们削减工作工资并提高家庭租金时，他们在两端从工人身上榨取。反击需要两条战线上的团结。',
              vi: 'Các công ty cổ phần tư nhân sở hữu cả nơi làm việc và nhà ở. Blackstone, chủ nhà lớn nhất, cũng sở hữu các công ty sử dụng hàng triệu người. Khi họ cắt giảm lương tại nơi làm việc và tăng tiền thuê ở nhà, họ đang bóc lột công nhân ở cả hai đầu. Đấu tranh đòi hỏi sự đoàn kết trên cả hai mặt trận.',
            },
          },
          {
            title: {
              en: 'Labor Unions + Tenant Unions',
              es: 'Sindicatos Laborales + Sindicatos de Inquilinos',
              tl: 'Labor Unions + Tenant Unions',
              zh: '工会 + 租户工会',
              vi: 'Công Đoàn Lao Động + Công Đoàn Người Thuê',
            },
            body: {
              en: 'The UAW\'s 2023 strike showed what\'s possible when workers organize. Tenant unions can do the same. As Tara Raghuveer says: "The tenant union needs to be for the 21st century what the labor union was in the 20th century at its peak." When workers and tenants organize together, the billionaire class has nowhere to hide.',
              es: 'La huelga de UAW de 2023 mostró lo que es posible cuando los trabajadores se organizan. Los sindicatos de inquilinos pueden hacer lo mismo. Como dice Tara Raghuveer: "El sindicato de inquilinos necesita ser para el siglo XXI lo que el sindicato laboral fue en el siglo XX en su apogeo." Cuando trabajadores e inquilinos se organizan juntos, la clase multimillonaria no tiene donde esconderse.',
              tl: 'Ang huelga ng UAW noong 2023 ay nagpakita kung ano ang posible kapag nag-organisa ang mga manggagawa. Maaaring gawin ng mga tenant union ang pareho. Gaya ng sabi ni Tara Raghuveer: "Ang tenant union ay kailangang maging para sa ika-21 siglo kung ano ang labor union sa ika-20 siglo sa tugatog nito." Kapag nag-organisa ang mga manggagawa at nangungupahan nang magkasama, walang mapagtataguan ang napakalaking mayamang klase.',
              zh: 'UAW 2023年的罢工展示了工人组织起来时的可能性。租户工会也可以做到同样的事情。正如Tara Raghuveer所说："租户工会需要成为21世纪的东西，就像工会在20世纪鼎盛时期那样。"当工人和租户一起组织时，亿万富翁阶级无处可逃。',
              vi: 'Cuộc đình công của UAW năm 2023 cho thấy điều gì có thể khi công nhân tổ chức. Công đoàn người thuê có thể làm điều tương tự. Như Tara Raghuveer nói: "Công đoàn người thuê cần phải là cho thế kỷ 21 những gì công đoàn lao động đã là trong thế kỷ 20 ở đỉnh cao của nó." Khi công nhân và người thuê tổ chức cùng nhau, giai cấp tỷ phú không có nơi nào để trốn.',
            },
          },
          {
            title: {
              en: 'What You Can Do',
              es: 'Qué Puedes Hacer',
              tl: 'Ano ang Maaari Mong Gawin',
              zh: '你能做什么',
              vi: 'Bạn Có Thể Làm Gì',
            },
            body: {
              en: 'Join your union at work. Join RSTU at home. Talk to your coworkers about housing. Talk to your neighbors about work. When your union negotiates, demand housing support. When your tenant association acts, invite workers. Power builds when we connect our struggles.',
              es: 'Únete a tu sindicato en el trabajo. Únete a RSTU en casa. Habla con tus compañeros de trabajo sobre vivienda. Habla con tus vecinos sobre trabajo. Cuando tu sindicato negocie, exige apoyo de vivienda. Cuando tu asociación de inquilinos actúe, invita a trabajadores. El poder crece cuando conectamos nuestras luchas.',
              tl: 'Sumali sa iyong unyon sa trabaho. Sumali sa RSTU sa bahay. Kausapin ang iyong mga kasamahan sa trabaho tungkol sa pabahay. Kausapin ang iyong mga kapitbahay tungkol sa trabaho. Kapag nakikipagnegosasyon ang iyong unyon, hilingin ang suporta sa pabahay. Kapag kumilos ang iyong tenant association, imbitahan ang mga manggagawa. Lumalaki ang kapangyarihan kapag nag-uugnay tayo ng ating mga pakikibaka.',
              zh: '在工作中加入你的工会。在家里加入RSTU。与同事谈论住房。与邻居谈论工作。当你的工会谈判时，要求住房支持。当你的租户协会行动时，邀请工人。当我们连接我们的斗争时，力量就会增长。',
              vi: 'Tham gia công đoàn của bạn tại nơi làm việc. Tham gia RSTU ở nhà. Nói chuyện với đồng nghiệp về nhà ở. Nói chuyện với hàng xóm về công việc. Khi công đoàn của bạn đàm phán, yêu cầu hỗ trợ nhà ở. Khi hiệp hội người thuê của bạn hành động, mời công nhân. Sức mạnh xây dựng khi chúng ta kết nối các cuộc đấu tranh.',
            },
          },
        ],
      },
    },
    { id: 'class-cta', type: 'cta', config: {} },
  ],
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}

// Page 9: Mutual Aid - Community care framing
export const PRESET_PAGE_9: LandingPageConfig = {
  id: 'page-9',
  name: 'Mutual Aid',
  sections: [
    {
      id: 'mutual-hero',
      type: 'hero',
      config: {
        showLogo: true,
        headlineOverride: {
          en: 'Neighbors Helping Neighbors',
          es: 'Vecinos Ayudando a Vecinos',
          tl: 'Mga Kapitbahay na Tumutulong sa mga Kapitbahay',
          zh: '邻里互助',
          vi: 'Hàng Xóm Giúp Đỡ Hàng Xóm',
        },
        taglineOverride: {
          en: 'When the system fails us, we take care of each other. That\'s what tenant organizing is all about.',
          es: 'Cuando el sistema nos falla, nos cuidamos unos a otros. De eso se trata la organización de inquilinos.',
          tl: 'Kapag bigo tayo ng sistema, nag-aalaga tayo sa isa\'t isa. Iyan ang kahulugan ng tenant organizing.',
          zh: '当系统让我们失望时，我们互相照顾。这就是租户组织的意义。',
          vi: 'Khi hệ thống thất bại với chúng ta, chúng ta chăm sóc lẫn nhau. Đó là ý nghĩa của việc tổ chức người thuê nhà.',
        },
        missionOverride: {
          en: 'In Reno-Sparks, 57% of renters are cost-burdened. Many are just one emergency away from eviction. We don\'t wait for politicians to fix this. We build networks of solidarity—tenants helping tenants, neighbors protecting neighbors. Together, we survive. Together, we thrive.',
          es: 'En Reno-Sparks, el 57% de los inquilinos están sobrecargados de costos. Muchos están a solo una emergencia de ser desalojados. No esperamos a que los políticos arreglen esto. Construimos redes de solidaridad—inquilinos ayudando a inquilinos, vecinos protegiendo a vecinos. Juntos, sobrevivimos. Juntos, prosperamos.',
          tl: 'Sa Reno-Sparks, 57% ng mga nangungupahan ay cost-burdened. Marami ang isang emergency na lang ang layo sa eviction. Hindi tayo naghihintay sa mga politiko para ayusin ito. Nagtatayo tayo ng mga network ng pagkakaisa—mga nangungupahan na tumutulong sa mga nangungupahan, mga kapitbahay na nagpoprotekta sa mga kapitbahay. Magkasama, nakakaligtas tayo. Magkasama, umuunlad tayo.',
          zh: '在雷诺-斯帕克斯，57%的租户承受着沉重的住房负担。许多人离被驱逐只差一次紧急情况。我们不等政客来解决这个问题。我们建立团结网络——租户帮助租户，邻居保护邻居。一起，我们生存。一起，我们繁荣。',
          vi: 'Tại Reno-Sparks, 57% người thuê nhà đang gánh nặng chi phí. Nhiều người chỉ cách bị trục xuất một trường hợp khẩn cấp. Chúng tôi không chờ các chính trị gia giải quyết điều này. Chúng tôi xây dựng mạng lưới đoàn kết—người thuê giúp người thuê, hàng xóm bảo vệ hàng xóm. Cùng nhau, chúng ta sống sót. Cùng nhau, chúng ta phát triển.',
        },
      },
    },
    {
      id: 'mutual-how',
      type: 'cards',
      config: {
        heading: {
          en: 'How Mutual Aid Works',
          es: 'Cómo Funciona la Ayuda Mutua',
          tl: 'Paano Gumagana ang Mutual Aid',
          zh: '互助如何运作',
          vi: 'Hỗ Trợ Lẫn Nhau Hoạt Động Như Thế Nào',
        },
        layout: 'stacked',
        cards: [
          {
            title: {
              en: 'We Share Resources',
              es: 'Compartimos Recursos',
              tl: 'Nagbabahagi Tayo ng mga Resources',
              zh: '我们分享资源',
              vi: 'Chúng Ta Chia Sẻ Tài Nguyên',
            },
            body: {
              en: 'Need help with rent? Have skills to offer? Our platform connects neighbors who can help with neighbors who need it. No charity—just solidarity.',
              es: '¿Necesitas ayuda con el alquiler? ¿Tienes habilidades que ofrecer? Nuestra plataforma conecta a vecinos que pueden ayudar con vecinos que lo necesitan. Sin caridad—solo solidaridad.',
              tl: 'Kailangan ng tulong sa upa? May mga kasanayan na maaaring i-offer? Ang aming platform ay nag-uugnay ng mga kapitbahay na makakatulong sa mga kapitbahay na nangangailangan. Walang charity—solidaridad lamang.',
              zh: '需要帮助付房租吗？有技能可以提供吗？我们的平台将可以帮助的邻居与需要帮助的邻居联系起来。不是慈善——只是团结。',
              vi: 'Cần giúp đỡ tiền thuê nhà? Có kỹ năng để đóng góp? Nền tảng của chúng tôi kết nối hàng xóm có thể giúp đỡ với hàng xóm cần giúp đỡ. Không phải từ thiện—chỉ là đoàn kết.',
            },
          },
          {
            title: {
              en: 'We Show Up For Each Other',
              es: 'Nos Apoyamos Mutuamente',
              tl: 'Dumadalo Tayo Para sa Isa\'t Isa',
              zh: '我们互相支持',
              vi: 'Chúng Ta Có Mặt Cho Nhau',
            },
            body: {
              en: 'Facing eviction? We show up at court. Landlord harassing you? We show up at your door. When one of us is threatened, we all respond.',
              es: '¿Enfrentas un desalojo? Nos presentamos en el tribunal. ¿Tu propietario te acosa? Nos presentamos en tu puerta. Cuando uno de nosotros está amenazado, todos respondemos.',
              tl: 'Nahaharap sa eviction? Dumadalo tayo sa korte. Nang-ha-harass ang landlord? Dumadalo tayo sa pinto mo. Kapag may pinagbabantaang isa sa atin, lahat tayo ay tumutugon.',
              zh: '面临驱逐？我们去法庭。房东骚扰你？我们去你门口。当我们中的一个受到威胁时，我们所有人都会回应。',
              vi: 'Đối mặt với việc bị đuổi? Chúng tôi có mặt tại tòa án. Chủ nhà quấy rối bạn? Chúng tôi có mặt trước cửa nhà bạn. Khi một người trong chúng ta bị đe dọa, tất cả chúng ta đều phản ứng.',
            },
          },
          {
            title: {
              en: 'We Build Community Power',
              es: 'Construimos Poder Comunitario',
              tl: 'Nagtatayo Tayo ng Community Power',
              zh: '我们建立社区力量',
              vi: 'Chúng Ta Xây Dựng Sức Mạnh Cộng Đồng',
            },
            body: {
              en: 'Mutual aid isn\'t just emergency response—it\'s building the relationships we need to fight for systemic change. Every connection we make is power we build.',
              es: 'La ayuda mutua no es solo respuesta de emergencia—es construir las relaciones que necesitamos para luchar por el cambio sistémico. Cada conexión que hacemos es poder que construimos.',
              tl: 'Ang mutual aid ay hindi lamang emergency response—ito ay pagtatayo ng mga relasyon na kailangan natin para lumaban para sa systemic change. Bawat koneksyon na ginagawa natin ay kapangyarihang itinatayo natin.',
              zh: '互助不仅仅是应急响应——它是建立我们争取系统性变革所需的关系。我们建立的每一个联系都是我们建立的力量。',
              vi: 'Hỗ trợ lẫn nhau không chỉ là ứng phó khẩn cấp—mà là xây dựng các mối quan hệ chúng ta cần để đấu tranh cho thay đổi hệ thống. Mỗi kết nối chúng ta tạo ra là sức mạnh chúng ta xây dựng.',
            },
          },
        ],
      },
    },
    {
      id: 'mutual-quote',
      type: 'text',
      config: {
        heading: {
          en: 'Solidarity, Not Charity',
          es: 'Solidaridad, No Caridad',
          tl: 'Pagkakaisa, Hindi Kawanggawa',
          zh: '团结，而非施舍',
          vi: 'Đoàn Kết, Không Phải Từ Thiện',
        },
        body: {
          en: '"Mutual aid is about genuine relationships, not heroic individualism. It\'s not about one group saving another, but about recognizing that our liberation is bound up together."\n\nMutual aid is different from charity. Charity maintains the existing power structure—the wealthy give to the poor. Mutual aid builds power from the bottom up—we give to each other, and in doing so, we build the relationships and trust we need to fight together.\n\n**Join your neighbors. Build power. Transform your community.**',
          es: '"La ayuda mutua se trata de relaciones genuinas, no de individualismo heroico. No se trata de que un grupo salve a otro, sino de reconocer que nuestra liberación está unida."\n\nLa ayuda mutua es diferente de la caridad. La caridad mantiene la estructura de poder existente—los ricos dan a los pobres. La ayuda mutua construye poder desde abajo—nos damos unos a otros, y al hacerlo, construimos las relaciones y la confianza que necesitamos para luchar juntos.\n\n**Únete a tus vecinos. Construye poder. Transforma tu comunidad.**',
          tl: '"Ang mutual aid ay tungkol sa tunay na relasyon, hindi heroic individualism. Hindi ito tungkol sa pagliligtas ng isang grupo sa iba, kundi tungkol sa pagkilala na ang ating kalayaan ay magkakaugnay."\n\nAng mutual aid ay iba sa charity. Ang charity ay nagpapanatili ng umiiral na power structure—ang mayayaman ay nagbibigay sa mahihirap. Ang mutual aid ay nagtatayo ng kapangyarihan mula sa ibaba—nagbibigayan tayo, at sa paggawa nito, itinatayo natin ang mga relasyon at tiwala na kailangan natin para lumaban nang magkasama.\n\n**Sumali sa iyong mga kapitbahay. Magtayo ng kapangyarihan. Baguhin ang iyong komunidad.**',
          zh: '"互助是关于真诚的关系，而不是英雄主义的个人行为。这不是一个群体拯救另一个群体，而是认识到我们的解放是紧密相连的。"\n\n互助不同于慈善。慈善维持现有的权力结构——富人给予穷人。互助从底层建立力量——我们互相给予，在这样做的过程中，我们建立了一起战斗所需的关系和信任。\n\n**加入你的邻居。建立力量。改变你的社区。**',
          vi: '"Hỗ trợ lẫn nhau là về các mối quan hệ chân thành, không phải chủ nghĩa cá nhân anh hùng. Đó không phải là một nhóm cứu nhóm khác, mà là nhận ra rằng sự giải phóng của chúng ta gắn bó với nhau."\n\nHỗ trợ lẫn nhau khác với từ thiện. Từ thiện duy trì cấu trúc quyền lực hiện có—người giàu cho người nghèo. Hỗ trợ lẫn nhau xây dựng sức mạnh từ dưới lên—chúng ta cho nhau, và khi làm như vậy, chúng ta xây dựng các mối quan hệ và sự tin tưởng cần thiết để cùng nhau chiến đấu.\n\n**Tham gia cùng hàng xóm. Xây dựng sức mạnh. Biến đổi cộng đồng của bạn.**',
        },
        bgColor: 'gray',
      },
    },
    {
      id: 'mutual-network',
      type: 'cards',
      config: {
        heading: {
          en: 'The Mutual Aid Network',
          es: 'La Red de Ayuda Mutua',
          tl: 'Ang Network ng Mutual Aid',
          zh: '互助网络',
          vi: 'Mạng Lưới Hỗ Trợ Lẫn Nhau',
        },
        layout: 'stacked',
        cards: [
          {
            title: {
              en: 'Emergency Rent Relief',
              es: 'Alivio de Alquiler de Emergencia',
              tl: 'Emergency Rent Relief',
              zh: '紧急租金援助',
              vi: 'Hỗ Trợ Tiền Thuê Khẩn Cấp',
            },
            body: {
              en: 'When a neighbor faces eviction, we pool resources. Small contributions from many tenants can prevent displacement. This isn\'t charity—it\'s insurance. Today you give; tomorrow you might receive. We survive together.',
              es: 'Cuando un vecino enfrenta desalojo, juntamos recursos. Pequeñas contribuciones de muchos inquilinos pueden prevenir el desplazamiento. Esto no es caridad—es seguro. Hoy das; mañana podrías recibir. Sobrevivimos juntos.',
              tl: 'Kapag ang isang kapitbahay ay nahaharap sa eviction, pinagsasama natin ang mga resources. Ang maliliit na kontribusyon mula sa maraming nangungupahan ay makakapigil sa displacement. Hindi ito charity—ito ay insurance. Ngayon ay nagbibigay ka; bukas maaaring tumanggap ka. Nakakaligtas tayo nang magkasama.',
              zh: '当邻居面临驱逐时，我们汇集资源。许多租户的小额贡献可以防止迫迁。这不是慈善——这是保险。今天你给予；明天你可能接受。我们一起生存。',
              vi: 'Khi hàng xóm đối mặt với việc bị đuổi, chúng ta góp chung tài nguyên. Đóng góp nhỏ từ nhiều người thuê có thể ngăn chặn di dời. Đây không phải từ thiện—đây là bảo hiểm. Hôm nay bạn cho; ngày mai bạn có thể nhận. Chúng ta sống sót cùng nhau.',
            },
          },
          {
            title: {
              en: 'Skills Exchange',
              es: 'Intercambio de Habilidades',
              tl: 'Skills Exchange',
              zh: '技能交换',
              vi: 'Trao Đổi Kỹ Năng',
            },
            body: {
              en: 'You know how to fix a leaky faucet. Your neighbor speaks Spanish. Another can watch kids. Someone else knows tenant law. When we share skills instead of paying for everything, we keep resources in our community and build relationships that make organizing possible.',
              es: 'Sabes cómo arreglar un grifo que gotea. Tu vecino habla español. Otro puede cuidar niños. Alguien más conoce la ley de inquilinos. Cuando compartimos habilidades en lugar de pagar por todo, mantenemos recursos en nuestra comunidad y construimos relaciones que hacen posible la organización.',
              tl: 'Alam mo kung paano ayusin ang tumutulo na gripo. Ang kapitbahay mo ay nagsasalita ng Spanish. Ang isa pa ay maaaring mag-alaga ng mga bata. May iba na alam ang tenant law. Kapag nagbabahagi tayo ng mga kasanayan sa halip na magbayad para sa lahat, pinapanatili natin ang mga resources sa ating komunidad at nagtatayo ng mga relasyon na ginagawang posible ang pag-oorganisa.',
              zh: '你知道如何修理漏水的水龙头。你的邻居会说西班牙语。另一个可以照看孩子。还有人懂租户法。当我们分享技能而不是为一切付费时，我们将资源留在社区，并建立使组织成为可能的关系。',
              vi: 'Bạn biết cách sửa vòi nước rò rỉ. Hàng xóm của bạn nói tiếng Tây Ban Nha. Người khác có thể trông trẻ. Ai đó hiểu luật người thuê. Khi chúng ta chia sẻ kỹ năng thay vì trả tiền cho mọi thứ, chúng ta giữ tài nguyên trong cộng đồng và xây dựng mối quan hệ giúp việc tổ chức trở nên khả thi.',
            },
          },
          {
            title: {
              en: 'Eviction Defense',
              es: 'Defensa contra Desalojos',
              tl: 'Eviction Defense',
              zh: '驱逐防御',
              vi: 'Phòng Thủ Trục Xuất',
            },
            body: {
              en: 'When the sheriff comes, we show up. When a landlord harasses, we witness. Eviction defense means physical presence—bodies at the door, neighbors in the courtroom. Landlords target isolated tenants. When we show up together, we change the equation.',
              es: 'Cuando viene el alguacil, nos presentamos. Cuando un propietario acosa, somos testigos. La defensa contra desalojos significa presencia física—cuerpos en la puerta, vecinos en la corte. Los propietarios atacan a inquilinos aislados. Cuando nos presentamos juntos, cambiamos la ecuación.',
              tl: 'Kapag dumating ang sheriff, dumadalo tayo. Kapag nang-ha-harass ang landlord, nagiging saksi tayo. Ang eviction defense ay nangangahulugan ng pisikal na presensya—mga katawan sa pinto, mga kapitbahay sa korte. Tina-target ng mga landlord ang mga isolated na nangungupahan. Kapag dumadalo tayo nang magkasama, binabago natin ang equation.',
              zh: '当警长来时，我们出现。当房东骚扰时，我们见证。驱逐防御意味着实际存在——门口的身体，法庭上的邻居。房东针对孤立的租户。当我们一起出现时，我们改变了等式。',
              vi: 'Khi cảnh sát đến, chúng ta có mặt. Khi chủ nhà quấy rối, chúng ta làm chứng. Phòng thủ trục xuất có nghĩa là sự hiện diện vật lý—những người ở cửa, hàng xóm trong phòng xử án. Chủ nhà nhắm vào người thuê cô lập. Khi chúng ta xuất hiện cùng nhau, chúng ta thay đổi phương trình.',
            },
          },
        ],
      },
    },
    { id: 'mutual-cta', type: 'cta', config: {} },
  ],
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}

// Page 10: Faith/Moral - Housing as moral imperative
export const PRESET_PAGE_10: LandingPageConfig = {
  id: 'page-10',
  name: 'Faith & Morality',
  sections: [
    {
      id: 'faith-hero',
      type: 'hero',
      config: {
        showLogo: true,
        headlineOverride: {
          en: 'Housing Is a Moral Imperative',
          es: 'La Vivienda es un Imperativo Moral',
          tl: 'Ang Pabahay ay isang Moral na Tungkulin',
          zh: '住房是道德责任',
          vi: 'Nhà Ở Là Mệnh Lệnh Đạo Đức',
        },
        taglineOverride: {
          en: 'In every faith tradition, providing shelter for the vulnerable is a sacred duty. We are called to action.',
          es: 'En toda tradición religiosa, proporcionar refugio a los vulnerables es un deber sagrado. Estamos llamados a actuar.',
          tl: 'Sa bawat tradisyon ng pananampalataya, ang pagbibigay ng tirahan sa mga mahihina ay isang banal na tungkulin. Tayo ay tinatawag sa aksyon.',
          zh: '在每个信仰传统中，为弱势群体提供住所是神圣的责任。我们被召唤采取行动。',
          vi: 'Trong mọi truyền thống đức tin, cung cấp nơi ở cho người dễ bị tổn thương là nghĩa vụ thiêng liêng. Chúng ta được kêu gọi hành động.',
        },
        missionOverride: {
          en: '"In the kingdom of God, no one hoards all the wealth while everyone else suffers and starves." — Shawn Fain, UAW President\n\nThe housing crisis is not just an economic issue—it\'s a moral crisis. When landlords profit from displacement, when families are torn apart by eviction, when the unhoused are criminalized instead of sheltered—we have strayed from our deepest values. Faith calls us to stand with the oppressed.',
          es: '"En el reino de Dios, nadie acapara toda la riqueza mientras todos los demás sufren y mueren de hambre." — Shawn Fain, Presidente de UAW\n\nLa crisis de vivienda no es solo un problema económico—es una crisis moral. Cuando los propietarios lucran con el desplazamiento, cuando las familias son separadas por desalojos, cuando los sin techo son criminalizados en lugar de refugiados—nos hemos alejado de nuestros valores más profundos. La fe nos llama a estar con los oprimidos.',
          tl: '"Sa kaharian ng Diyos, walang nag-iimbak ng lahat ng kayamanan habang ang lahat ng iba ay nagdurusa at nagugutom." — Shawn Fain, Pangulo ng UAW\n\nAng krisis sa pabahay ay hindi lamang isang problemang pang-ekonomiya—ito ay isang moral na krisis. Kapag ang mga landlord ay kumikita mula sa displacement, kapag ang mga pamilya ay pinaghihiwalay ng eviction, kapag ang mga walang tirahan ay kinokriminalize sa halip na binibigyan ng tirahan—nalayo tayo sa ating pinakamalalim na mga halaga. Ang pananampalataya ay tumatawag sa atin na tumayo kasama ang mga inaapi.',
          zh: '"在上帝的国度里，没有人囤积所有财富，而其他人都在受苦和挨饿。" — 肖恩·费恩，UAW主席\n\n住房危机不仅仅是经济问题——这是一场道德危机。当房东从迫迁中获利，当家庭因驱逐而分裂，当无家可归者被定罪而不是被庇护——我们已经偏离了我们最深层的价值观。信仰召唤我们站在被压迫者一边。',
          vi: '"Trong vương quốc của Chúa, không ai tích trữ tất cả tài sản trong khi mọi người khác đau khổ và chết đói." — Shawn Fain, Chủ tịch UAW\n\nCuộc khủng hoảng nhà ở không chỉ là vấn đề kinh tế—đó là một cuộc khủng hoảng đạo đức. Khi chủ nhà kiếm lời từ việc di dời, khi gia đình bị chia cắt bởi việc trục xuất, khi người vô gia cư bị hình sự hóa thay vì được che chở—chúng ta đã xa rời các giá trị sâu xa nhất. Đức tin kêu gọi chúng ta đứng cùng những người bị áp bức.',
        },
      },
    },
    {
      id: 'faith-teachings',
      type: 'cards',
      config: {
        heading: {
          en: 'Teachings on Housing and Shelter',
          es: 'Enseñanzas sobre Vivienda y Refugio',
          tl: 'Mga Aral tungkol sa Pabahay at Tirahan',
          zh: '关于住房和庇护的教导',
          vi: 'Giáo Huấn về Nhà Ở và Nơi Trú Ẩn',
        },
        layout: 'stacked',
        cards: [
          {
            title: {
              en: '"Is it not to share your bread with the hungry and bring the homeless poor into your house?"',
              es: '"¿No es acaso compartir tu pan con el hambriento y traer a los pobres sin hogar a tu casa?"',
              tl: '"Hindi ba ito ang magbahagi ng iyong tinapay sa nagugutom at dalhin ang mga mahihirap na walang tirahan sa iyong bahay?"',
              zh: '"岂不是把你的饼分给饥饿的人，将无家可归的穷人接到你家中？"',
              vi: '"Há chẳng phải là chia bánh cho người đói và đưa những người nghèo không nhà vào nhà mình sao?"',
            },
            body: {
              en: '— Isaiah 58:7\n\nThe Hebrew prophets called for justice for the poor and shelter for the homeless. This isn\'t optional—it\'s central to living a righteous life.',
              es: '— Isaías 58:7\n\nLos profetas hebreos clamaron por justicia para los pobres y refugio para los sin hogar. Esto no es opcional—es central para vivir una vida justa.',
              tl: '— Isaias 58:7\n\nAng mga propetang Hebreo ay tumawag para sa katarungan para sa mahihirap at tirahan para sa mga walang tahanan. Hindi ito opsyonal—ito ay sentral sa pamumuhay ng isang matuwid na buhay.',
              zh: '— 以赛亚书58:7\n\n希伯来先知呼吁为穷人伸张正义，为无家可归者提供庇护。这不是可选的——这是过正义生活的核心。',
              vi: '— Isaiah 58:7\n\nCác tiên tri Do Thái kêu gọi công lý cho người nghèo và nơi ở cho người vô gia cư. Điều này không phải là tùy chọn—nó là trọng tâm của cuộc sống công chính.',
            },
          },
          {
            title: {
              en: '"Whoever has two tunics is to share with him who has none."',
              es: '"El que tiene dos túnicas, dé al que no tiene."',
              tl: '"Ang may dalawang tunika ay dapat ibahagi sa walang wala."',
              zh: '"有两件衣服的，应当分给没有的。"',
              vi: '"Ai có hai áo thì hãy chia cho người không có."',
            },
            body: {
              en: '— Luke 3:11\n\nJesus taught radical redistribution. When some have empty apartments and others sleep on streets, we are called to act.',
              es: '— Lucas 3:11\n\nJesús enseñó la redistribución radical. Cuando algunos tienen apartamentos vacíos y otros duermen en las calles, estamos llamados a actuar.',
              tl: '— Lucas 3:11\n\nItinuro ni Hesus ang radikal na redistribusyon. Kapag ang ilan ay may mga bakanteng apartment at ang iba ay natutulog sa kalye, tayo ay tinatawag na kumilos.',
              zh: '— 路加福音3:11\n\n耶稣教导激进的再分配。当有些人有空置公寓，而其他人睡在街上时，我们被召唤采取行动。',
              vi: '— Lu-ca 3:11\n\nChúa Giê-su dạy về phân phối lại triệt để. Khi một số người có căn hộ trống và người khác ngủ trên đường phố, chúng ta được kêu gọi hành động.',
            },
          },
          {
            title: {
              en: '"Give to him who begs from you, and do not refuse him who would borrow from you."',
              es: '"Da al que te pida, y no rechaces al que quiere pedirte prestado."',
              tl: '"Bigyan mo ang humihingi sa iyo, at huwag tanggihan ang gustong mangutang sa iyo."',
              zh: '"有求你的，就给他；有向你借贷的，不可推辞。"',
              vi: '"Hãy cho ai xin mình, và đừng từ chối ai muốn vay mượn mình."',
            },
            body: {
              en: '— Matthew 5:42\n\nGenerosity without strings. Mutual aid without conditions. This is the moral foundation of solidarity.',
              es: '— Mateo 5:42\n\nGenerosidad sin condiciones. Ayuda mutua sin restricciones. Esta es la base moral de la solidaridad.',
              tl: '— Mateo 5:42\n\nKagandahang-loob na walang kundisyon. Mutual aid na walang mga kondisyon. Ito ang moral na pundasyon ng pagkakaisa.',
              zh: '— 马太福音5:42\n\n无条件的慷慨。无条件的互助。这是团结的道德基础。',
              vi: '— Ma-thi-ơ 5:42\n\nSự hào phóng không điều kiện. Hỗ trợ lẫn nhau không điều kiện. Đây là nền tảng đạo đức của sự đoàn kết.',
            },
          },
        ],
      },
    },
    {
      id: 'faith-action',
      type: 'text',
      config: {
        heading: {
          en: 'Faith Without Works Is Dead',
          es: 'La Fe Sin Obras Está Muerta',
          tl: 'Ang Pananampalataya na Walang Gawa ay Patay',
          zh: '没有行为的信心是死的',
          vi: 'Đức Tin Không Có Việc Làm Là Chết',
        },
        body: {
          en: 'It is not enough to believe housing is a right. It is not enough to pray for the homeless. James 2:17 tells us: "Faith by itself, if it does not have works, is dead."\n\nThe tenant movement is faith in action. When we organize our buildings, we practice the solidarity our traditions call us to. When we resist eviction, we protect the vulnerable as we are commanded. When we build power together, we create the just community our prophets envisioned.\n\n**Your faith demands action. Join the movement.**',
          es: 'No es suficiente creer que la vivienda es un derecho. No es suficiente orar por los sin hogar. Santiago 2:17 nos dice: "La fe por sí sola, si no tiene obras, está muerta."\n\nEl movimiento de inquilinos es fe en acción. Cuando organizamos nuestros edificios, practicamos la solidaridad a la que nos llaman nuestras tradiciones. Cuando resistimos el desalojo, protegemos a los vulnerables como nos es ordenado. Cuando construimos poder juntos, creamos la comunidad justa que nuestros profetas imaginaron.\n\n**Tu fe exige acción. Únete al movimiento.**',
          tl: 'Hindi sapat na maniwala na ang pabahay ay isang karapatan. Hindi sapat na ipagdasal ang mga walang tirahan. Sinasabi sa atin ni Santiago 2:17: "Ang pananampalataya sa kanyang sarili, kung wala itong mga gawa, ay patay."\n\nAng kilusang nangungupahan ay pananampalataya sa aksyon. Kapag nag-oorganisa tayo ng ating mga gusali, isinasagawa natin ang pagkakaisa na tinatawagan tayo ng ating mga tradisyon. Kapag nilalabanan natin ang eviction, pinoprotektahan natin ang mga mahihina gaya ng iniutos sa atin. Kapag nagtatayo tayo ng kapangyarihan nang magkasama, nililikha natin ang makatarungang komunidad na nakita ng ating mga propeta.\n\n**Ang iyong pananampalataya ay nangangailangan ng aksyon. Sumali sa kilusan.**',
          zh: '仅仅相信住房是一项权利是不够的。仅仅为无家可归者祈祷是不够的。雅各书2:17告诉我们："信心若没有行为就是死的。"\n\n租户运动是信心的行动。当我们组织我们的建筑时，我们践行我们传统所呼召的团结。当我们抵制驱逐时，我们按照命令保护弱势群体。当我们一起建立力量时，我们创造先知们所设想的公正社区。\n\n**你的信仰要求行动。加入运动吧。**',
          vi: 'Tin rằng nhà ở là một quyền là không đủ. Cầu nguyện cho người vô gia cư là không đủ. Gia-cơ 2:17 nói với chúng ta: "Đức tin tự nó, nếu không có việc làm, thì là chết."\n\nPhong trào người thuê là đức tin trong hành động. Khi chúng ta tổ chức các tòa nhà của mình, chúng ta thực hành sự đoàn kết mà truyền thống của chúng ta kêu gọi. Khi chúng ta chống lại việc trục xuất, chúng ta bảo vệ những người dễ bị tổn thương như được truyền lệnh. Khi chúng ta cùng xây dựng sức mạnh, chúng ta tạo ra cộng đồng công bằng mà các tiên tri của chúng ta hình dung.\n\n**Đức tin của bạn đòi hỏi hành động. Tham gia phong trào.**',
        },
        bgColor: 'gray',
      },
    },
    {
      id: 'faith-interfaith',
      type: 'cards',
      config: {
        heading: {
          en: 'The Interfaith Movement for Housing',
          es: 'El Movimiento Interreligioso por la Vivienda',
          tl: 'Ang Interfaith Movement para sa Pabahay',
          zh: '跨信仰住房运动',
          vi: 'Phong Trào Liên Tôn Vì Nhà Ở',
        },
        layout: 'stacked',
        cards: [
          {
            title: {
              en: 'Sanctuary in the Struggle',
              es: 'Santuario en la Lucha',
              tl: 'Sanctuary sa Pakikibaka',
              zh: '斗争中的圣所',
              vi: 'Nơi Trú Ẩn Trong Cuộc Đấu Tranh',
            },
            body: {
              en: 'Throughout history, houses of worship have sheltered the oppressed. Today, congregations open their doors for tenant meetings, provide space for organizing, and stand witness at eviction hearings. Your faith community can be part of this tradition.',
              es: 'A lo largo de la historia, los lugares de culto han dado refugio a los oprimidos. Hoy, las congregaciones abren sus puertas para reuniones de inquilinos, proporcionan espacio para organizar y son testigos en audiencias de desalojo. Tu comunidad de fe puede ser parte de esta tradición.',
              tl: 'Sa buong kasaysayan, ang mga lugar ng pagsamba ay nagbigay ng shelter sa mga inaapi. Ngayon, ang mga kongregasyon ay nagbubukas ng kanilang mga pinto para sa mga pagpupulong ng nangungupahan, nagbibigay ng espasyo para sa pag-oorganisa, at nagiging saksi sa mga eviction hearing. Ang iyong komunidad ng pananampalataya ay maaaring maging bahagi ng tradisyong ito.',
              zh: '纵观历史，礼拜场所一直庇护着被压迫者。今天，教会为租户会议敞开大门，为组织提供空间，并在驱逐听证会上作证。你的信仰社区可以成为这一传统的一部分。',
              vi: 'Trong suốt lịch sử, các nơi thờ phượng đã che chở những người bị áp bức. Ngày nay, các giáo đoàn mở cửa cho các cuộc họp người thuê, cung cấp không gian để tổ chức, và làm chứng tại các phiên điều trần trục xuất. Cộng đồng đức tin của bạn có thể là một phần của truyền thống này.',
            },
          },
          {
            title: {
              en: 'Clergy on the Picket Line',
              es: 'Clérigos en la Línea de Piquete',
              tl: 'Mga Clergy sa Picket Line',
              zh: '神职人员在纠察线上',
              vi: 'Giáo Sĩ Trên Hàng Biểu Tình',
            },
            body: {
              en: 'From the civil rights movement to farmworker strikes, religious leaders have put their bodies on the line for justice. When tenants face displacement, moral witnesses make a difference. A collar or a stole at a protest says: this is not just an economic dispute—it is a moral crisis.',
              es: 'Desde el movimiento por los derechos civiles hasta las huelgas de trabajadores agrícolas, los líderes religiosos han puesto sus cuerpos en la línea por la justicia. Cuando los inquilinos enfrentan el desplazamiento, los testigos morales hacen la diferencia. Un cuello o una estola en una protesta dice: esto no es solo una disputa económica—es una crisis moral.',
              tl: 'Mula sa civil rights movement hanggang sa mga strikes ng farmworker, ang mga religious leader ay inilagay ang kanilang katawan sa linya para sa katarungan. Kapag ang mga nangungupahan ay nahaharap sa displacement, ang mga moral witness ay gumagawa ng pagkakaiba. Ang isang collar o stole sa isang protesta ay nagsasabi: hindi ito isang economic dispute lamang—ito ay isang moral na krisis.',
              zh: '从民权运动到农场工人罢工，宗教领袖们为正义挺身而出。当租户面临迫迁时，道德见证者能产生影响。抗议活动中的领带或披肩表明：这不仅仅是经济纠纷——这是一场道德危机。',
              vi: 'Từ phong trào dân quyền đến các cuộc đình công của công nhân nông trại, các nhà lãnh đạo tôn giáo đã đặt thân mình vì công lý. Khi người thuê đối mặt với việc di dời, các nhân chứng đạo đức tạo ra sự khác biệt. Một cổ áo hoặc áo choàng trong một cuộc biểu tình nói: đây không chỉ là tranh chấp kinh tế—đây là cuộc khủng hoảng đạo đức.',
            },
          },
          {
            title: {
              en: 'From Charity to Justice',
              es: 'De la Caridad a la Justicia',
              tl: 'Mula sa Charity tungo sa Justice',
              zh: '从慈善到正义',
              vi: 'Từ Từ Thiện Đến Công Lý',
            },
            body: {
              en: 'Many congregations run food pantries and emergency funds. These are good works—but they don\'t change the system that creates hunger and eviction. The prophetic tradition calls us beyond charity to justice: changing the structures that oppress. Join the tenant movement and transform your ministry.',
              es: 'Muchas congregaciones administran bancos de alimentos y fondos de emergencia. Estas son buenas obras—pero no cambian el sistema que crea hambre y desalojos. La tradición profética nos llama más allá de la caridad hacia la justicia: cambiar las estructuras que oprimen. Únete al movimiento de inquilinos y transforma tu ministerio.',
              tl: 'Maraming kongregasyon ang nagpapatakbo ng food pantry at emergency fund. Ito ay mabubuting gawa—pero hindi nila binabago ang sistemang lumilikha ng gutom at eviction. Tinatawag tayo ng propetikong tradisyon na lumampas sa charity tungo sa katarungan: pagbabago ng mga istrukturang umaapi. Sumali sa tenant movement at baguhin ang iyong ministry.',
              zh: '许多教会开办食品储藏室和紧急基金。这些是善行——但它们不能改变造成饥饿和驱逐的制度。先知传统呼召我们超越慈善走向正义：改变压迫的结构。加入租户运动，改变你的事工。',
              vi: 'Nhiều giáo đoàn điều hành các kho thực phẩm và quỹ khẩn cấp. Đây là những việc làm tốt—nhưng chúng không thay đổi hệ thống tạo ra đói và trục xuất. Truyền thống tiên tri kêu gọi chúng ta vượt ra ngoài từ thiện đến công lý: thay đổi các cấu trúc áp bức. Tham gia phong trào người thuê và biến đổi mục vụ của bạn.',
            },
          },
        ],
      },
    },
    { id: 'faith-cta', type: 'cta', config: {} },
  ],
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}

// Page 11: Data/Evidence - Numbers-focused framing
export const PRESET_PAGE_11: LandingPageConfig = {
  id: 'page-11',
  name: 'Data & Evidence',
  sections: [
    {
      id: 'data-hero',
      type: 'hero',
      config: {
        showLogo: true,
        headlineOverride: {
          en: 'The Numbers Don\'t Lie',
          es: 'Los Números No Mienten',
          tl: 'Hindi Nagsisinungaling ang mga Numero',
          zh: '数字不会说谎',
          vi: 'Những Con Số Không Nói Dối',
        },
        taglineOverride: {
          en: 'Decades of research prove that tenant organizing works. The data is clear. The path forward is organized.',
          es: 'Décadas de investigación demuestran que la organización de inquilinos funciona. Los datos son claros. El camino a seguir está organizado.',
          tl: 'Mga dekada ng pananaliksik ang nagpapatunay na gumagana ang tenant organizing. Malinaw ang datos. Ang landas pasulong ay organisado.',
          zh: '数十年的研究证明租户组织是有效的。数据很清楚。前进的道路是有组织的。',
          vi: 'Hàng thập kỷ nghiên cứu chứng minh rằng tổ chức người thuê có hiệu quả. Dữ liệu rất rõ ràng. Con đường phía trước là có tổ chức.',
        },
        missionOverride: {
          en: 'Princeton\'s Eviction Lab tracked over one million eviction cases in 2024. The Federal Reserve documents corporate landlord practices. Peer-reviewed research shows organizing reduces displacement. This isn\'t ideology—it\'s evidence.',
          es: 'El Eviction Lab de Princeton rastreó más de un millón de casos de desalojo en 2024. La Reserva Federal documenta las prácticas de propietarios corporativos. La investigación revisada por pares muestra que la organización reduce el desplazamiento. Esto no es ideología—son evidencias.',
          tl: 'Ang Eviction Lab ng Princeton ay nagsubaybay ng higit sa isang milyong kaso ng eviction noong 2024. Ang Federal Reserve ay nagdodokumento ng mga praktika ng corporate landlord. Ang peer-reviewed research ay nagpapakita na ang pag-oorganisa ay nagpapababa ng displacement. Hindi ito ideolohiya—ito ay ebidensya.',
          zh: '普林斯顿大学的驱逐实验室在2024年追踪了超过一百万起驱逐案件。联邦储备系统记录了企业房东的做法。同行评审的研究表明，组织可以减少迫迁。这不是意识形态——这是证据。',
          vi: 'Phòng thí nghiệm Trục xuất của Princeton đã theo dõi hơn một triệu vụ trục xuất vào năm 2024. Cục Dự trữ Liên bang ghi lại các hoạt động của chủ nhà doanh nghiệp. Nghiên cứu được đánh giá ngang hàng cho thấy tổ chức làm giảm sự di dời. Đây không phải là ý thức hệ—đây là bằng chứng.',
        },
      },
    },
    {
      id: 'data-stats',
      type: 'cards',
      config: {
        heading: {
          en: 'The Research Is Clear',
          es: 'La Investigación Es Clara',
          tl: 'Malinaw ang Pananaliksik',
          zh: '研究很清楚',
          vi: 'Nghiên Cứu Rất Rõ Ràng',
        },
        layout: 'stacked',
        cards: [
          {
            title: {
              en: 'Corporate Landlords Evict More',
              es: 'Los Propietarios Corporativos Desalojan Más',
              tl: 'Ang mga Corporate Landlord ay Mas Maraming Napa-evict',
              zh: '企业房东驱逐更多',
              vi: 'Chủ Nhà Doanh Nghiệp Đuổi Nhiều Hơn',
            },
            body: {
              en: 'Federal Reserve research shows large institutional landlords are 8% more likely to evict than small landlords. Private equity-backed firms are 18-19% more likely. In Kansas City, corporate landlords file evictions at 3.7x the rate of individual owners.',
              es: 'La investigación de la Reserva Federal muestra que los grandes propietarios institucionales tienen un 8% más de probabilidades de desalojar que los pequeños propietarios. Las empresas respaldadas por capital privado tienen un 18-19% más de probabilidades. En Kansas City, los propietarios corporativos presentan desalojos a una tasa 3.7 veces mayor que los propietarios individuales.',
              tl: 'Ang pananaliksik ng Federal Reserve ay nagpapakita na ang malalaking institutional landlord ay 8% mas malamang na mag-evict kaysa sa maliliit na landlord. Ang mga firmang suportado ng private equity ay 18-19% mas malamang. Sa Kansas City, ang mga corporate landlord ay nagfa-file ng eviction sa 3.7x na rate ng mga individual owner.',
              zh: '美联储的研究表明，大型机构房东比小房东驱逐租户的可能性高8%。私募股权支持的公司高18-19%。在堪萨斯城，企业房东提起驱逐的比率是个人业主的3.7倍。',
              vi: 'Nghiên cứu của Cục Dự trữ Liên bang cho thấy các chủ nhà tổ chức lớn có khả năng đuổi người thuê cao hơn 8% so với chủ nhà nhỏ. Các công ty được hỗ trợ bởi vốn cổ phần tư nhân cao hơn 18-19%. Tại Kansas City, chủ nhà doanh nghiệp nộp đơn trục xuất với tỷ lệ gấp 3,7 lần so với chủ sở hữu cá nhân.',
            },
          },
          {
            title: {
              en: 'A Small Number Create Most Evictions',
              es: 'Un Pequeño Número Crea la Mayoría de los Desalojos',
              tl: 'Ang Maliit na Bilang ay Gumagawa ng Karamihan sa mga Eviction',
              zh: '少数人制造了大多数驱逐',
              vi: 'Một Số Ít Tạo Ra Hầu Hết Các Vụ Trục Xuất',
            },
            body: {
              en: 'The Eviction Lab found that the top 100 buildings accounted for 32.6% of filings across fifteen tracked cities. Targeting these "super-evictors" could dramatically reduce displacement.',
              es: 'El Eviction Lab encontró que los 100 edificios principales representaron el 32.6% de las demandas en quince ciudades rastreadas. Dirigirse a estos "super-desalojadores" podría reducir dramáticamente el desplazamiento.',
              tl: 'Natuklasan ng Eviction Lab na ang nangungunang 100 gusali ay bumubuo ng 32.6% ng mga filing sa labinlimang siyudad na sinusubaybayan. Ang pag-target sa mga "super-evictors" na ito ay maaaring dramatikong mabawasan ang displacement.',
              zh: '驱逐实验室发现，在追踪的15个城市中，排名前100的建筑占了32.6%的申请。针对这些"超级驱逐者"可以大幅减少迫迁。',
              vi: 'Phòng thí nghiệm Trục xuất phát hiện rằng 100 tòa nhà hàng đầu chiếm 32,6% các vụ nộp đơn tại mười lăm thành phố được theo dõi. Nhắm mục tiêu vào những "siêu trục xuất viên" này có thể giảm đáng kể tình trạng di dời.',
            },
          },
          {
            title: {
              en: 'Tenant Organizing Reduces Evictions',
              es: 'La Organización de Inquilinos Reduce los Desalojos',
              tl: 'Ang Tenant Organizing ay Nagpapababa ng Eviction',
              zh: '租户组织减少驱逐',
              vi: 'Tổ Chức Người Thuê Giảm Trục Xuất',
            },
            body: {
              en: 'Philadelphia achieved the second-lowest eviction filing rate among tracked cities (4.0%). Cities with stronger tenant protections consistently see lower eviction rates. Policy works—and organizing creates policy.',
              es: 'Filadelfia logró la segunda tasa más baja de demandas de desalojo entre las ciudades rastreadas (4.0%). Las ciudades con protecciones de inquilinos más fuertes consistentemente ven tasas de desalojo más bajas. Las políticas funcionan—y la organización crea políticas.',
              tl: 'Nakamit ng Philadelphia ang pangalawang pinakamababang eviction filing rate sa mga sinusubaybayang siyudad (4.0%). Ang mga siyudad na may mas malakas na proteksyon sa nangungupahan ay patuloy na nakakakita ng mas mababang rate ng eviction. Gumagana ang patakaran—at nililikha ng pag-oorganisa ang patakaran.',
              zh: '费城在被追踪的城市中实现了第二低的驱逐申请率（4.0%）。拥有更强租户保护的城市驱逐率始终较低。政策有效——而组织创造政策。',
              vi: 'Philadelphia đạt được tỷ lệ nộp đơn trục xuất thấp thứ hai trong các thành phố được theo dõi (4,0%). Các thành phố có bảo vệ người thuê mạnh hơn luôn có tỷ lệ trục xuất thấp hơn. Chính sách có hiệu quả—và tổ chức tạo ra chính sách.',
            },
          },
        ],
      },
    },
    {
      id: 'data-local',
      type: 'text',
      config: {
        heading: {
          en: 'Reno-Sparks By The Numbers',
          es: 'Reno-Sparks en Números',
          tl: 'Reno-Sparks sa mga Numero',
          zh: '雷诺-斯帕克斯数据',
          vi: 'Reno-Sparks Qua Các Con Số',
        },
        body: {
          en: '**57%** of Nevada renters are cost-burdened (spending >30% of income on housing)\n\n**40-45%** rent increase since 2019\n\n**82 hours/week** at minimum wage to afford a 1-bedroom apartment\n\n**51%** of Reno-Sparks households are renters\n\n**$30.42/hour** income needed for a 2-bedroom at Fair Market Rent\n\nThe housing crisis isn\'t abstract. These numbers represent real families—perhaps including yours. When we organize, we change these numbers.',
          es: '**57%** de los inquilinos de Nevada están sobrecargados de costos (gastan >30% de sus ingresos en vivienda)\n\n**40-45%** aumento de alquiler desde 2019\n\n**82 horas/semana** al salario mínimo para pagar un apartamento de 1 dormitorio\n\n**51%** de los hogares de Reno-Sparks son inquilinos\n\n**$30.42/hora** ingresos necesarios para un 2 dormitorios al Alquiler Justo de Mercado\n\nLa crisis de vivienda no es abstracta. Estos números representan familias reales—quizás incluyendo la tuya. Cuando nos organizamos, cambiamos estos números.',
          tl: '**57%** ng mga nangungupahan sa Nevada ay cost-burdened (gumagastos ng >30% ng kita sa pabahay)\n\n**40-45%** pagtaas ng upa mula 2019\n\n**82 oras/linggo** sa minimum wage para makayanan ang 1-bedroom apartment\n\n**51%** ng mga sambahayan sa Reno-Sparks ay mga nangungupahan\n\n**$30.42/oras** kita na kailangan para sa 2-bedroom sa Fair Market Rent\n\nAng krisis sa pabahay ay hindi abstract. Ang mga numerong ito ay kumakatawan sa mga tunay na pamilya—maaaring kabilang ang iyo. Kapag nag-organisa tayo, binabago natin ang mga numerong ito.',
          zh: '**57%** 的内华达州租户承受着沉重的住房负担（住房支出超过收入的30%）\n\n**40-45%** 自2019年以来的租金涨幅\n\n**每周82小时** 按最低工资需要工作这么长时间才能负担一居室公寓\n\n**51%** 的雷诺-斯帕克斯家庭是租户\n\n**$30.42/小时** 按公平市场租金需要这样的收入才能负担两居室\n\n住房危机不是抽象的。这些数字代表着真实的家庭——也许包括你的家庭。当我们组织起来时，我们改变这些数字。',
          vi: '**57%** người thuê nhà ở Nevada đang gánh nặng chi phí (chi >30% thu nhập cho nhà ở)\n\n**40-45%** tăng tiền thuê kể từ năm 2019\n\n**82 giờ/tuần** với mức lương tối thiểu để đủ tiền thuê căn hộ 1 phòng ngủ\n\n**51%** hộ gia đình Reno-Sparks là người thuê nhà\n\n**$30,42/giờ** thu nhập cần thiết cho căn hộ 2 phòng ngủ theo Giá Thuê Thị Trường Công Bằng\n\nCuộc khủng hoảng nhà ở không trừu tượng. Những con số này đại diện cho các gia đình thực sự—có thể bao gồm gia đình bạn. Khi chúng ta tổ chức, chúng ta thay đổi những con số này.',
        },
        bgColor: 'gray',
      },
    },
    {
      id: 'data-sources',
      type: 'cards',
      config: {
        heading: {
          en: 'Our Research Sources',
          es: 'Nuestras Fuentes de Investigación',
          tl: 'Ang Ating mga Pinagkunan ng Pananaliksik',
          zh: '我们的研究来源',
          vi: 'Nguồn Nghiên Cứu Của Chúng Tôi',
        },
        layout: 'stacked',
        cards: [
          {
            title: {
              en: 'Princeton Eviction Lab',
              es: 'Laboratorio de Desalojos de Princeton',
              tl: 'Princeton Eviction Lab',
              zh: '普林斯顿驱逐实验室',
              vi: 'Phòng Thí Nghiệm Trục Xuất Princeton',
            },
            body: {
              en: 'The Eviction Tracking System monitors filings in real-time across the country. Their research proves that eviction is not inevitable—it\'s a policy choice. Cities with tenant protections have lower rates. We can change these numbers.',
              es: 'El Sistema de Seguimiento de Desalojos monitorea las demandas en tiempo real en todo el país. Su investigación prueba que el desalojo no es inevitable—es una elección política. Las ciudades con protecciones de inquilinos tienen tasas más bajas. Podemos cambiar estos números.',
              tl: 'Ang Eviction Tracking System ay nagmo-monitor ng mga filing sa real-time sa buong bansa. Ang kanilang pananaliksik ay nagpapatunay na ang eviction ay hindi inevitable—ito ay isang policy choice. Ang mga siyudad na may tenant protection ay may mas mababang rate. Maaari nating baguhin ang mga numerong ito.',
              zh: '驱逐追踪系统在全国范围内实时监控申请。他们的研究证明驱逐不是不可避免的——这是政策选择。拥有租户保护的城市比率较低。我们可以改变这些数字。',
              vi: 'Hệ thống Theo dõi Trục xuất giám sát các đơn nộp theo thời gian thực trên toàn quốc. Nghiên cứu của họ chứng minh rằng trục xuất không phải là không thể tránh khỏi—đó là sự lựa chọn chính sách. Các thành phố có bảo vệ người thuê có tỷ lệ thấp hơn. Chúng ta có thể thay đổi những con số này.',
            },
          },
          {
            title: {
              en: 'Federal Reserve Research',
              es: 'Investigación de la Reserva Federal',
              tl: 'Pananaliksik ng Federal Reserve',
              zh: '联邦储备研究',
              vi: 'Nghiên Cứu Cục Dự Trữ Liên Bang',
            },
            body: {
              en: 'The Atlanta Fed and other regional banks have documented how institutional investors and private equity firms drive evictions. This isn\'t activist speculation—it\'s central bank research. The data shows corporate ownership means more displacement.',
              es: 'La Fed de Atlanta y otros bancos regionales han documentado cómo los inversores institucionales y las firmas de capital privado impulsan los desalojos. Esto no es especulación activista—es investigación del banco central. Los datos muestran que la propiedad corporativa significa más desplazamiento.',
              tl: 'Ang Atlanta Fed at iba pang mga regional bank ay nagdokumento kung paano ang mga institutional investor at private equity firm ang nagpapatakbo ng mga eviction. Hindi ito activist speculation—ito ay central bank research. Ang datos ay nagpapakita na ang corporate ownership ay nangangahulugan ng mas maraming displacement.',
              zh: '亚特兰大联储和其他地区银行记录了机构投资者和私募股权公司如何推动驱逐。这不是活动家的猜测——这是中央银行的研究。数据显示企业所有权意味着更多的迫迁。',
              vi: 'Fed Atlanta và các ngân hàng khu vực khác đã ghi lại cách các nhà đầu tư tổ chức và công ty vốn cổ phần tư nhân thúc đẩy trục xuất. Đây không phải là suy đoán của nhà hoạt động—đây là nghiên cứu của ngân hàng trung ương. Dữ liệu cho thấy sở hữu doanh nghiệp có nghĩa là nhiều di dời hơn.',
            },
          },
          {
            title: {
              en: 'RSTU Local Data Collection',
              es: 'Recolección de Datos Locales de RSTU',
              tl: 'RSTU Local Data Collection',
              zh: 'RSTU本地数据收集',
              vi: 'Thu Thập Dữ Liệu Địa Phương RSTU',
            },
            body: {
              en: 'We file public records requests for eviction data, code enforcement violations, and ownership records. We canvass buildings to document habitability conditions. We track which landlords are the worst actors. Local data drives local organizing.',
              es: 'Presentamos solicitudes de registros públicos para datos de desalojo, violaciones de aplicación de códigos y registros de propiedad. Recorremos edificios para documentar las condiciones de habitabilidad. Rastreamos qué propietarios son los peores actores. Los datos locales impulsan la organización local.',
              tl: 'Nag-file kami ng public records request para sa eviction data, code enforcement violation, at ownership record. Kinakampanya namin ang mga gusali para idokumento ang mga kondisyon ng habitability. Sinusubaybayan namin kung aling mga landlord ang mga pinakamasamang aktor. Ang lokal na datos ay nagtutulak ng lokal na pag-oorganisa.',
              zh: '我们提交公共记录请求以获取驱逐数据、执法违规和所有权记录。我们走访建筑物记录居住条件。我们追踪哪些房东是最糟糕的行为者。本地数据推动本地组织。',
              vi: 'Chúng tôi nộp yêu cầu hồ sơ công khai cho dữ liệu trục xuất, vi phạm thực thi mã và hồ sơ sở hữu. Chúng tôi đi khảo sát các tòa nhà để ghi lại điều kiện ở. Chúng tôi theo dõi chủ nhà nào là những kẻ xấu nhất. Dữ liệu địa phương thúc đẩy tổ chức địa phương.',
            },
          },
        ],
      },
    },
    { id: 'data-cta', type: 'cta', config: {} },
  ],
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}

// Page 12: Personal Stories - Lived experience framing
export const PRESET_PAGE_12: LandingPageConfig = {
  id: 'page-12',
  name: 'Personal Stories',
  sections: [
    {
      id: 'stories-hero',
      type: 'hero',
      config: {
        showLogo: true,
        headlineOverride: {
          en: 'Real Tenants. Real Struggles. Real Power.',
          es: 'Inquilinos Reales. Luchas Reales. Poder Real.',
          tl: 'Tunay na mga Nangungupahan. Tunay na mga Pakikibaka. Tunay na Kapangyarihan.',
          zh: '真实租户。真实斗争。真正力量。',
          vi: 'Người Thuê Thực. Cuộc Đấu Tranh Thực. Sức Mạnh Thực.',
        },
        taglineOverride: {
          en: 'Behind every statistic is a person. Behind every eviction is a family. This is their story—and it could be yours.',
          es: 'Detrás de cada estadística hay una persona. Detrás de cada desalojo hay una familia. Esta es su historia—y podría ser la tuya.',
          tl: 'Sa likod ng bawat estadistika ay may tao. Sa likod ng bawat eviction ay may pamilya. Ito ang kanilang kuwento—at maaaring iyo rin.',
          zh: '每个统计数字背后都是一个人。每次驱逐背后都是一个家庭。这是他们的故事——也可能是你的故事。',
          vi: 'Đằng sau mỗi số liệu thống kê là một con người. Đằng sau mỗi vụ trục xuất là một gia đình. Đây là câu chuyện của họ—và có thể là của bạn.',
        },
        missionOverride: {
          en: 'The housing crisis isn\'t happening somewhere else to someone else. It\'s happening here, to our neighbors, to our coworkers, to our families. When we share our stories, we break the shame and isolation that landlords count on. When we listen to each other, we build the solidarity we need to fight back.',
          es: 'La crisis de vivienda no está ocurriendo en otro lugar a otra persona. Está ocurriendo aquí, a nuestros vecinos, a nuestros compañeros de trabajo, a nuestras familias. Cuando compartimos nuestras historias, rompemos la vergüenza y el aislamiento con los que cuentan los propietarios. Cuando nos escuchamos, construimos la solidaridad que necesitamos para luchar.',
          tl: 'Ang krisis sa pabahay ay hindi nangyayari sa ibang lugar sa ibang tao. Nangyayari ito dito, sa ating mga kapitbahay, sa ating mga kasamahan sa trabaho, sa ating mga pamilya. Kapag ibinahagi natin ang ating mga kuwento, sinisira natin ang kahihiyan at paghihiwalay na inaasahan ng mga landlord. Kapag nakikinig tayo sa isa\'t isa, itinatayo natin ang pagkakaisa na kailangan natin para lumaban.',
          zh: '住房危机不是发生在其他地方对其他人。它正发生在这里，发生在我们的邻居、同事和家人身上。当我们分享我们的故事时，我们打破了房东所依赖的羞耻和孤立。当我们倾听彼此时，我们建立了反击所需的团结。',
          vi: 'Cuộc khủng hoảng nhà ở không xảy ra ở nơi khác với người khác. Nó đang xảy ra ở đây, với hàng xóm của chúng ta, đồng nghiệp của chúng ta, gia đình của chúng ta. Khi chúng ta chia sẻ câu chuyện của mình, chúng ta phá vỡ sự xấu hổ và cô lập mà chủ nhà dựa vào. Khi chúng ta lắng nghe nhau, chúng ta xây dựng sự đoàn kết cần thiết để phản击.',
        },
      },
    },
    {
      id: 'stories-voices',
      type: 'cards',
      config: {
        heading: {
          en: 'Voices From Our Community',
          es: 'Voces de Nuestra Comunidad',
          tl: 'Mga Tinig Mula sa Ating Komunidad',
          zh: '来自我们社区的声音',
          vi: 'Tiếng Nói Từ Cộng Đồng Của Chúng Ta',
        },
        layout: 'stacked',
        cards: [
          {
            title: {
              en: '"I work 60 hours a week and still can\'t afford rent."',
              es: '"Trabajo 60 horas a la semana y todavía no puedo pagar el alquiler."',
              tl: '"Nagtatrabaho ako ng 60 oras sa isang linggo at hindi pa rin kayang bayaran ang upa."',
              zh: '"我每周工作60小时，仍然付不起房租。"',
              vi: '"Tôi làm việc 60 giờ mỗi tuần và vẫn không đủ tiền thuê nhà."',
            },
            body: {
              en: 'Maria works two jobs—as a nurse\'s aide and a hotel housekeeper. She hasn\'t had a day off in months. After her landlord raised rent by $400, she started skipping meals. "I\'m not asking for luxury," she says. "I just want to live without fear."\n\n*When Maria joined her building\'s tenant association, she learned she wasn\'t alone. Together, they\'re fighting back.*',
              es: 'María trabaja en dos empleos—como auxiliar de enfermería y como camarera de hotel. No ha tenido un día libre en meses. Después de que su propietario aumentó el alquiler $400, empezó a saltarse comidas. "No estoy pidiendo lujos," dice. "Solo quiero vivir sin miedo."\n\n*Cuando María se unió a la asociación de inquilinos de su edificio, aprendió que no estaba sola. Juntos, están luchando.*',
              tl: 'Si Maria ay nagtatrabaho ng dalawang trabaho—bilang nurse\'s aide at hotel housekeeper. Hindi siya nagkaroon ng day off sa loob ng ilang buwan. Pagkatapos itaas ng kanyang landlord ang upa ng $400, nagsimula siyang laktawan ang mga pagkain. "Hindi ako humihingi ng luho," sabi niya. "Gusto ko lang mabuhay nang walang takot."\n\n*Nang sumali si Maria sa tenant association ng kanyang gusali, natutunan niya na hindi siya nag-iisa. Magkasama, lumalaban sila.*',
              zh: '玛丽亚做两份工作——护士助理和酒店客房服务员。她已经好几个月没有休息日了。在房东涨租400美元后，她开始省饭吃。"我不是在要求奢侈，"她说。"我只是想活得不用害怕。"\n\n*当玛丽亚加入她的建筑租户协会时，她知道自己并不孤单。他们一起在反击。*',
              vi: 'Maria làm hai công việc—làm trợ lý y tá và dọn phòng khách sạn. Cô ấy không có ngày nghỉ trong nhiều tháng. Sau khi chủ nhà tăng tiền thuê 400 đô la, cô bắt đầu bỏ bữa. "Tôi không yêu cầu sự xa xỉ," cô nói. "Tôi chỉ muốn sống không sợ hãi."\n\n*Khi Maria tham gia hiệp hội người thuê của tòa nhà, cô biết mình không cô đơn. Cùng nhau, họ đang phản击.*',
            },
          },
          {
            title: {
              en: '"They tried to evict us for organizing."',
              es: '"Intentaron desalojarnos por organizarnos."',
              tl: '"Sinubukan nilang i-evict kami dahil nag-organisa."',
              zh: '"他们试图因为我们组织而驱逐我们。"',
              vi: '"Họ cố đuổi chúng tôi vì tổ chức."',
            },
            body: {
              en: 'When James started talking to his neighbors about the broken heating, his landlord served him a 30-day notice. "They thought they could silence us," James says. "But when 40 tenants showed up at the eviction hearing, the judge dismissed the case."\n\n*Retaliation is illegal. And solidarity makes us untouchable.*',
              es: 'Cuando James empezó a hablar con sus vecinos sobre la calefacción rota, su propietario le dio un aviso de 30 días. "Pensaban que podían silenciarnos," dice James. "Pero cuando 40 inquilinos aparecieron en la audiencia de desalojo, el juez desestimó el caso."\n\n*Las represalias son ilegales. Y la solidaridad nos hace intocables.*',
              tl: 'Nang magsimulang makipag-usap si James sa kanyang mga kapitbahay tungkol sa sirang pag-init, binigyan siya ng kanyang landlord ng 30-day notice. "Akala nila maaari nila kaming patahimikin," sabi ni James. "Pero nang 40 nangungupahan ang dumalo sa eviction hearing, dinismiss ng hukom ang kaso."\n\n*Ang paghihiganti ay ilegal. At ang pagkakaisa ay ginagawa tayong untouchable.*',
              zh: '当詹姆斯开始和邻居们谈论供暖坏了的问题时，房东给了他30天通知。"他们以为能让我们闭嘴，"詹姆斯说。"但当40名租户出现在驱逐听证会上时，法官驳回了案件。"\n\n*报复是违法的。而团结让我们坚不可摧。*',
              vi: 'Khi James bắt đầu nói chuyện với hàng xóm về hệ thống sưởi hỏng, chủ nhà đã gửi cho anh thông báo 30 ngày. "Họ nghĩ có thể bịt miệng chúng tôi," James nói. "Nhưng khi 40 người thuê xuất hiện tại phiên điều trần trục xuất, thẩm phán đã bác bỏ vụ án."\n\n*Trả đũa là bất hợp pháp. Và đoàn kết khiến chúng ta bất khả xâm phạm.*',
            },
          },
          {
            title: {
              en: '"We won—and it changed everything."',
              es: '"Ganamos—y cambió todo."',
              tl: '"Nanalo kami—at nagbago ang lahat."',
              zh: '"我们赢了——这改变了一切。"',
              vi: '"Chúng tôi thắng—và nó thay đổi mọi thứ."',
            },
            body: {
              en: 'The tenants at Independence Towers in Kansas City withheld rent for 248 days to protest uninhabitable conditions. When they won—$300,000 in back rent forgiven—it proved that organized tenants can beat corporate landlords.\n\n*"We didn\'t have money or lawyers," says organizer Tiana Caldwell. "We had each other."*',
              es: 'Los inquilinos de Independence Towers en Kansas City retuvieron el alquiler durante 248 días para protestar por las condiciones inhabitables. Cuando ganaron—$300,000 en alquiler atrasado perdonado—demostró que los inquilinos organizados pueden vencer a los propietarios corporativos.\n\n*"No teníamos dinero ni abogados," dice la organizadora Tiana Caldwell. "Nos teníamos unos a otros."*',
              tl: 'Ang mga nangungupahan sa Independence Towers sa Kansas City ay itinago ang upa sa loob ng 248 araw para protesta sa hindi matirahan na kondisyon. Nang manalo sila—$300,000 sa back rent na pinatawad—napatunayan nito na ang mga organisadong nangungupahan ay maaaring talunin ang mga corporate landlord.\n\n*"Wala kaming pera o mga abogado," sabi ng organizer na si Tiana Caldwell. "Mayroon kaming isa\'t isa."*',
              zh: '堪萨斯城独立大厦的租户为抗议不适宜居住的条件，拒付租金248天。当他们赢了——30万美元的欠租被免除——这证明了组织起来的租户可以打败企业房东。\n\n*"我们没有钱或律师，"组织者蒂安娜·考德威尔说。"我们有彼此。"*',
              vi: 'Những người thuê tại Independence Towers ở Kansas City đã giữ lại tiền thuê trong 248 ngày để phản đối điều kiện không thể ở được. Khi họ thắng—300.000 đô la tiền thuê nợ được tha—nó chứng minh rằng người thuê có tổ chức có thể đánh bại chủ nhà doanh nghiệp.\n\n*"Chúng tôi không có tiền hay luật sư," tổ chức viên Tiana Caldwell nói. "Chúng tôi có nhau."*',
            },
          },
        ],
      },
    },
    {
      id: 'stories-share',
      type: 'text',
      config: {
        heading: {
          en: 'Your Story Matters',
          es: 'Tu Historia Importa',
          tl: 'Mahalaga ang Iyong Kuwento',
          zh: '你的故事很重要',
          vi: 'Câu Chuyện Của Bạn Quan Trọng',
        },
        body: {
          en: 'Every tenant has a story. Maybe you\'ve faced an unfair rent increase. Maybe your landlord ignores repairs. Maybe you\'ve been threatened with eviction. Maybe you\'ve won a fight.\n\nWhen we share our stories, we realize we\'re not alone. We discover that our "personal problems" are actually collective conditions—created by policy choices that can be changed.\n\n**Your story is power. Share it. Organize. Win.**',
          es: 'Cada inquilino tiene una historia. Quizás has enfrentado un aumento de alquiler injusto. Quizás tu propietario ignora las reparaciones. Quizás has sido amenazado con desalojo. Quizás has ganado una pelea.\n\nCuando compartimos nuestras historias, nos damos cuenta de que no estamos solos. Descubrimos que nuestros "problemas personales" son en realidad condiciones colectivas—creadas por decisiones políticas que pueden cambiarse.\n\n**Tu historia es poder. Compártela. Organízate. Gana.**',
          tl: 'Bawat nangungupahan ay may kuwento. Baka naharap ka sa hindi makatarungang pagtaas ng upa. Baka binabalewala ng iyong landlord ang mga pag-aayos. Baka binabantaan ka ng eviction. Baka nanalo ka sa isang laban.\n\nKapag ibinahagi natin ang ating mga kuwento, napagtanto natin na hindi tayo nag-iisa. Nadiskubre natin na ang ating "personal na problema" ay talagang mga kolektibong kondisyon—nilikha ng mga desisyon sa patakaran na maaaring baguhin.\n\n**Ang iyong kuwento ay kapangyarihan. Ibahagi ito. Mag-organisa. Manalo.**',
          zh: '每个租户都有故事。也许你面临过不公平的租金上涨。也许你的房东忽视维修。也许你被威胁驱逐。也许你打赢过一场仗。\n\n当我们分享我们的故事时，我们意识到我们并不孤单。我们发现我们的"个人问题"实际上是集体状况——是可以改变的政策选择造成的。\n\n**你的故事就是力量。分享它。组织起来。赢得胜利。**',
          vi: 'Mỗi người thuê đều có một câu chuyện. Có thể bạn đã đối mặt với việc tăng tiền thuê không công bằng. Có thể chủ nhà của bạn phớt lờ việc sửa chữa. Có thể bạn đã bị đe dọa trục xuất. Có thể bạn đã thắng một trận chiến.\n\nKhi chúng ta chia sẻ câu chuyện của mình, chúng ta nhận ra mình không cô đơn. Chúng ta phát hiện rằng "vấn đề cá nhân" của chúng ta thực ra là điều kiện tập thể—được tạo ra bởi các lựa chọn chính sách có thể thay đổi.\n\n**Câu chuyện của bạn là sức mạnh. Chia sẻ nó. Tổ chức. Chiến thắng.**',
        },
        bgColor: 'gray',
      },
    },
    {
      id: 'stories-power',
      type: 'cards',
      config: {
        heading: {
          en: 'The Power of Testimony',
          es: 'El Poder del Testimonio',
          tl: 'Ang Kapangyarihan ng Testimonya',
          zh: '证词的力量',
          vi: 'Sức Mạnh Của Lời Chứng',
        },
        layout: 'stacked',
        cards: [
          {
            title: {
              en: 'Breaking the Silence',
              es: 'Rompiendo el Silencio',
              tl: 'Pagsira sa Katahimikan',
              zh: '打破沉默',
              vi: 'Phá Vỡ Sự Im Lặng',
            },
            body: {
              en: 'Landlords count on tenant isolation. They rely on shame keeping us quiet. When we share our stories publicly—at city council meetings, in the press, at protests—we break that silence. Every tenant who speaks empowers ten more to find their voice.',
              es: 'Los propietarios cuentan con el aislamiento de los inquilinos. Confían en que la vergüenza nos mantenga callados. Cuando compartimos nuestras historias públicamente—en reuniones del ayuntamiento, en la prensa, en protestas—rompemos ese silencio. Cada inquilino que habla empodera a diez más para encontrar su voz.',
              tl: 'Umaasa ang mga landlord sa paghihiwalay ng mga nangungupahan. Umaasa sila sa kahihiyan na nagpapanatiling tahimik sa atin. Kapag ibinahagi natin ang ating mga kuwento sa publiko—sa mga pagpupulong ng city council, sa press, sa mga protesta—sinisira natin ang katahimikang iyon. Bawat nangungupahan na nagsasalita ay nagpapalakas sa sampung iba pa na mahanap ang kanilang boses.',
              zh: '房东依赖租户的孤立。他们依靠羞耻让我们保持沉默。当我们公开分享我们的故事——在市议会会议上、在新闻中、在抗议活动中——我们打破了这种沉默。每一个发声的租户都能赋予十个人找到自己声音的力量。',
              vi: 'Chủ nhà dựa vào sự cô lập của người thuê. Họ dựa vào sự xấu hổ để giữ chúng ta im lặng. Khi chúng ta chia sẻ câu chuyện công khai—tại các cuộc họp hội đồng thành phố, trên báo chí, tại các cuộc biểu tình—chúng ta phá vỡ sự im lặng đó. Mỗi người thuê lên tiếng trao quyền cho mười người khác tìm thấy tiếng nói của họ.',
            },
          },
          {
            title: {
              en: 'Stories Change Policy',
              es: 'Las Historias Cambian las Políticas',
              tl: 'Ang mga Kuwento ay Nagbabago ng Patakaran',
              zh: '故事改变政策',
              vi: 'Câu Chuyện Thay Đổi Chính Sách',
            },
            body: {
              en: 'Statistics matter—but stories move people. When a mother describes choosing between rent and medicine for her child, legislators listen differently than to a policy memo. The tenant rights laws that exist today were won by tenants brave enough to tell their stories.',
              es: 'Las estadísticas importan—pero las historias mueven a la gente. Cuando una madre describe elegir entre el alquiler y la medicina para su hijo, los legisladores escuchan de manera diferente que a un memorándum de política. Las leyes de derechos de inquilinos que existen hoy fueron ganadas por inquilinos lo suficientemente valientes para contar sus historias.',
              tl: 'Mahalaga ang mga estadistika—pero ang mga kuwento ang nakakaantig sa mga tao. Kapag inilalarawan ng isang ina ang pagpili sa pagitan ng upa at gamot para sa kanyang anak, nakikinig ang mga mambabatas nang iba kaysa sa isang policy memo. Ang mga batas sa karapatan ng nangungupahan na umiiral ngayon ay napanalunan ng mga nangungupahang sapat ang tapang na ikuwento ang kanilang mga kuwento.',
              zh: '统计数据很重要——但故事能打动人心。当一位母亲描述在房租和孩子的药物之间做选择时，立法者的倾听方式与政策备忘录不同。今天存在的租户权利法是由勇于讲述自己故事的租户赢得的。',
              vi: 'Số liệu thống kê quan trọng—nhưng câu chuyện lay động con người. Khi một người mẹ mô tả việc chọn giữa tiền thuê và thuốc cho con, các nhà lập pháp lắng nghe khác với bản ghi nhớ chính sách. Các luật quyền người thuê tồn tại ngày nay được giành được bởi những người thuê đủ dũng cảm để kể câu chuyện của họ.',
            },
          },
          {
            title: {
              en: 'We Document Everything',
              es: 'Documentamos Todo',
              tl: 'Dinodokumento Natin ang Lahat',
              zh: '我们记录一切',
              vi: 'Chúng Ta Ghi Lại Mọi Thứ',
            },
            body: {
              en: 'RSTU Connect helps tenants document their experiences—habitability issues, landlord retaliation, rent increases. Your story becomes evidence. Your testimony becomes power. Together, we\'re building an archive of tenant experience that no one can ignore.',
              es: 'RSTU Connect ayuda a los inquilinos a documentar sus experiencias—problemas de habitabilidad, represalias de propietarios, aumentos de alquiler. Tu historia se convierte en evidencia. Tu testimonio se convierte en poder. Juntos, estamos construyendo un archivo de experiencias de inquilinos que nadie puede ignorar.',
              tl: 'Tinutulungan ng RSTU Connect ang mga nangungupahan na idokumento ang kanilang mga karanasan—mga isyu sa habitability, paghihiganti ng landlord, mga pagtaas ng upa. Ang iyong kuwento ay nagiging ebidensya. Ang iyong testimonya ay nagiging kapangyarihan. Magkasama, nagtatayo tayo ng isang archive ng karanasan ng nangungupahan na hindi maaaring balewalain ng sinuman.',
              zh: 'RSTU Connect帮助租户记录他们的经历——居住条件问题、房东报复、租金上涨。你的故事成为证据。你的证词成为力量。我们一起正在建立一个没有人可以忽视的租户经历档案。',
              vi: 'RSTU Connect giúp người thuê ghi lại trải nghiệm của họ—các vấn đề về điều kiện ở, sự trả đũa của chủ nhà, tăng tiền thuê. Câu chuyện của bạn trở thành bằng chứng. Lời chứng của bạn trở thành sức mạnh. Cùng nhau, chúng ta đang xây dựng một kho lưu trữ trải nghiệm người thuê mà không ai có thể bỏ qua.',
            },
          },
        ],
      },
    },
    { id: 'stories-cta', type: 'cta', config: {} },
  ],
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}

// Page 13: Democratic Control - Bookchin-style participatory democracy
export const PRESET_PAGE_13: LandingPageConfig = {
  id: 'page-13',
  name: 'Democratic Control',
  sections: [
    {
      id: 'demo-hero',
      type: 'hero',
      config: {
        showLogo: true,
        headlineOverride: {
          en: 'We Run This',
          es: 'Nosotros Controlamos Esto',
          tl: 'Tayo ang Namamahala Dito',
          zh: '我们自己做主',
          vi: 'Chúng Ta Điều Hành Việc Này',
        },
        taglineOverride: {
          en: 'No bosses. No landlords. Just tenants, democratically controlling our own housing.',
          es: 'Sin jefes. Sin propietarios. Solo inquilinos, controlando democráticamente nuestra propia vivienda.',
          tl: 'Walang boss. Walang landlord. Mga nangungupahan lamang, demokratikong kumokontrol sa ating sariling pabahay.',
          zh: '没有老板。没有房东。只有租户，民主地控制我们自己的住房。',
          vi: 'Không có ông chủ. Không có chủ nhà. Chỉ có người thuê, dân chủ kiểm soát nhà ở của chính mình.',
        },
        missionOverride: {
          en: 'Why should landlords—who don\'t live here, don\'t work here, often don\'t even visit—make decisions about our homes? The tenant union puts power where it belongs: with the people who actually live in these buildings. We vote on our own rules. We elect our own leaders. We govern ourselves.',
          es: '¿Por qué deberían los propietarios—que no viven aquí, no trabajan aquí, a menudo ni siquiera visitan—tomar decisiones sobre nuestros hogares? El sindicato de inquilinos pone el poder donde pertenece: con las personas que realmente viven en estos edificios. Votamos nuestras propias reglas. Elegimos a nuestros propios líderes. Nos gobernamos a nosotros mismos.',
          tl: 'Bakit dapat ang mga landlord—na hindi nakatira dito, hindi nagtatrabaho dito, madalas ay hindi man lang bumibisita—ang gumawa ng mga desisyon tungkol sa ating mga tahanan? Inilalagay ng tenant union ang kapangyarihan kung saan ito nabibilang: sa mga taong talagang nakatira sa mga gusaling ito. Bumoboto tayo sa ating sariling mga patakaran. Inihihalal natin ang ating sariling mga lider. Pinamamahalaan natin ang ating sarili.',
          zh: '为什么房东——他们不住在这里，不在这里工作，甚至经常不来看看——要为我们的家做决定？租户工会把权力放在它应该在的地方：与真正住在这些建筑物里的人在一起。我们投票决定自己的规则。我们选举自己的领导人。我们自治。',
          vi: 'Tại sao chủ nhà—những người không sống ở đây, không làm việc ở đây, thường thậm chí không đến thăm—lại đưa ra quyết định về nhà của chúng ta? Công đoàn người thuê đặt quyền lực ở nơi nó thuộc về: với những người thực sự sống trong các tòa nhà này. Chúng ta bỏ phiếu cho các quy tắc của riêng mình. Chúng ta bầu các nhà lãnh đạo của riêng mình. Chúng ta tự quản.',
        },
      },
    },
    {
      id: 'demo-how',
      type: 'cards',
      config: {
        heading: {
          en: 'How Tenant Democracy Works',
          es: 'Cómo Funciona la Democracia de Inquilinos',
          tl: 'Paano Gumagana ang Demokrasya ng Nangungupahan',
          zh: '租户民主如何运作',
          vi: 'Dân Chủ Người Thuê Hoạt Động Như Thế Nào',
        },
        layout: 'stacked',
        cards: [
          {
            title: {
              en: 'Tenants Vote, Not Admins',
              es: 'Los Inquilinos Votan, No los Administradores',
              tl: 'Ang mga Nangungupahan ang Bumoboto, Hindi ang mga Admin',
              zh: '租户投票，不是管理员',
              vi: 'Người Thuê Bỏ Phiếu, Không Phải Quản Trị Viên',
            },
            body: {
              en: 'In RSTU Connect, administrators can\'t vote on governance. Only verified tenants and the organizers who represent them have voting power. This is the Bookchin principle: power belongs to the people, not the managers.',
              es: 'En RSTU Connect, los administradores no pueden votar sobre la gobernanza. Solo los inquilinos verificados y los organizadores que los representan tienen poder de voto. Este es el principio de Bookchin: el poder pertenece al pueblo, no a los gerentes.',
              tl: 'Sa RSTU Connect, ang mga administrator ay hindi maaaring bumoto sa governance. Tanging ang mga verified tenant at ang mga organizer na kumakatawan sa kanila ang may kapangyarihang bumoto. Ito ang Bookchin principle: ang kapangyarihan ay sa mga tao, hindi sa mga manager.',
              zh: '在RSTU Connect中，管理员不能对治理进行投票。只有经过验证的租户和代表他们的组织者才有投票权。这就是布克钦原则：权力属于人民，而不是管理者。',
              vi: 'Trong RSTU Connect, quản trị viên không thể bỏ phiếu về quản trị. Chỉ những người thuê đã được xác minh và những người tổ chức đại diện cho họ mới có quyền bỏ phiếu. Đây là nguyên tắc Bookchin: quyền lực thuộc về nhân dân, không phải người quản lý.',
            },
          },
          {
            title: {
              en: 'Delegates Represent Real Tenants',
              es: 'Los Delegados Representan a Inquilinos Reales',
              tl: 'Ang mga Delegate ay Kumakatawan sa mga Tunay na Nangungupahan',
              zh: '代表代表真正的租户',
              vi: 'Đại Biểu Đại Diện Cho Người Thuê Thực',
            },
            body: {
              en: 'Voting weight is earned by organizing. The more tenants you represent, the more your vote counts—but with a cap to prevent any one person from dominating. Power is distributed, not concentrated.',
              es: 'El peso del voto se gana organizando. Cuantos más inquilinos representes, más cuenta tu voto—pero con un límite para evitar que una sola persona domine. El poder se distribuye, no se concentra.',
              tl: 'Ang bigat ng boto ay nakukuha sa pamamagitan ng pag-oorganisa. Mas maraming nangungupahan ang kinakatawan mo, mas malaki ang halaga ng iyong boto—pero may limitasyon para maiwasan ang isang tao na mangibabaw. Ang kapangyarihan ay ipinapamahagi, hindi nakakonsentrate.',
              zh: '投票权重是通过组织获得的。你代表的租户越多，你的投票就越重要——但有上限防止任何一个人独大。权力是分散的，不是集中的。',
              vi: 'Trọng số bỏ phiếu được kiếm bằng cách tổ chức. Bạn đại diện cho càng nhiều người thuê, phiếu bầu của bạn càng có giá trị—nhưng có giới hạn để ngăn bất kỳ một người nào thống trị. Quyền lực được phân phối, không tập trung.',
            },
          },
          {
            title: {
              en: 'Decisions Are Transparent',
              es: 'Las Decisiones Son Transparentes',
              tl: 'Ang mga Desisyon ay Transparent',
              zh: '决策是透明的',
              vi: 'Các Quyết Định Minh Bạch',
            },
            body: {
              en: 'Every proposal, every vote, every decision is visible to all members. No backroom deals. No hidden agendas. When we disagree, we debate openly. When we decide, we do it together.',
              es: 'Cada propuesta, cada voto, cada decisión es visible para todos los miembros. Sin acuerdos secretos. Sin agendas ocultas. Cuando no estamos de acuerdo, debatimos abiertamente. Cuando decidimos, lo hacemos juntos.',
              tl: 'Bawat panukala, bawat boto, bawat desisyon ay nakikita ng lahat ng miyembro. Walang backroom deals. Walang mga nakatagong agenda. Kapag hindi tayo nagkasundo, nagdedebate tayo nang bukas. Kapag nagdedesisyon tayo, ginagawa natin ito nang magkasama.',
              zh: '每一个提案、每一次投票、每一个决定对所有成员都是可见的。没有密室交易。没有隐藏的议程。当我们有分歧时，我们公开辩论。当我们做决定时，我们一起做。',
              vi: 'Mỗi đề xuất, mỗi lá phiếu, mỗi quyết định đều được tất cả thành viên nhìn thấy. Không có giao dịch ngầm. Không có chương trình nghị sự ẩn. Khi chúng ta không đồng ý, chúng ta tranh luận công khai. Khi chúng ta quyết định, chúng ta làm cùng nhau.',
            },
          },
        ],
      },
    },
    {
      id: 'demo-vision',
      type: 'text',
      config: {
        heading: {
          en: 'From Tenants\' Councils to Tenant Power',
          es: 'De Consejos de Inquilinos a Poder de Inquilinos',
          tl: 'Mula sa Konseho ng mga Nangungupahan hanggang sa Kapangyarihan ng Nangungupahan',
          zh: '从租户委员会到租户权力',
          vi: 'Từ Hội Đồng Người Thuê Đến Quyền Lực Người Thuê',
        },
        body: {
          en: 'Social ecologist Murray Bookchin imagined a world of nested councils—neighborhood assemblies making local decisions, federating into larger bodies for regional issues. The tenant union is that vision coming to life.\n\nEach building has its own democratic assembly. Buildings federate into blocs. Blocs coordinate citywide. And the people who live in these spaces—not distant owners, not elected officials, not professional managers—make the decisions.\n\n**This is what democracy looks like. Not voting every four years for someone else to make decisions. Voting every day on the conditions of your own life.**',
          es: 'El ecólogo social Murray Bookchin imaginó un mundo de consejos anidados—asambleas vecinales tomando decisiones locales, federándose en cuerpos más grandes para asuntos regionales. El sindicato de inquilinos es esa visión cobrando vida.\n\nCada edificio tiene su propia asamblea democrática. Los edificios se federan en bloques. Los bloques coordinan a nivel de ciudad. Y las personas que viven en estos espacios—no los propietarios distantes, no los funcionarios electos, no los gerentes profesionales—toman las decisiones.\n\n**Así es como se ve la democracia. No votar cada cuatro años para que alguien más tome decisiones. Votar cada día sobre las condiciones de tu propia vida.**',
          tl: 'Inisip ng social ecologist na si Murray Bookchin ang isang mundo ng mga nested councils—mga neighborhood assembly na gumagawa ng mga lokal na desisyon, nagfe-federate sa mga mas malalaking katawan para sa mga rehiyonal na isyu. Ang tenant union ay ang pananaw na iyon na nabubuhay.\n\nAng bawat gusali ay may sariling demokratikong asembleya. Ang mga gusali ay nagfe-federate sa mga bloc. Ang mga bloc ay nagko-coordinate sa buong lungsod. At ang mga taong naninirahan sa mga lugar na ito—hindi ang mga malalayong may-ari, hindi ang mga inihalal na opisyal, hindi ang mga propesyonal na manager—ang gumagawa ng mga desisyon.\n\n**Ito ang hitsura ng demokrasya. Hindi pagboboto tuwing apat na taon para sa iba na gumawa ng mga desisyon. Bumoboto araw-araw sa mga kondisyon ng iyong sariling buhay.**',
          zh: '社会生态学家默里·布克钦设想了一个嵌套委员会的世界——社区大会做出地方决定，联合成更大的机构处理区域问题。租户工会就是这个愿景的实现。\n\n每栋建筑都有自己的民主大会。建筑联合成街区。街区在全市范围内协调。而住在这些空间里的人——不是远方的业主，不是民选官员，不是专业经理——做出决定。\n\n**这就是民主的样子。不是每四年投票一次让别人做决定。而是每天为自己生活的条件投票。**',
          vi: 'Nhà sinh thái học xã hội Murray Bookchin đã hình dung một thế giới của các hội đồng lồng nhau—các hội đồng khu phố đưa ra quyết định địa phương, liên kết thành các cơ quan lớn hơn cho các vấn đề khu vực. Công đoàn người thuê là tầm nhìn đó đang trở thành hiện thực.\n\nMỗi tòa nhà có hội đồng dân chủ riêng. Các tòa nhà liên kết thành các khối. Các khối phối hợp toàn thành phố. Và những người sống trong các không gian này—không phải chủ sở hữu xa xôi, không phải quan chức được bầu, không phải người quản lý chuyên nghiệp—đưa ra quyết định.\n\n**Đây là dân chủ trông như thế nào. Không phải bỏ phiếu bốn năm một lần để người khác đưa ra quyết định. Bỏ phiếu mỗi ngày về điều kiện của chính cuộc sống của bạn.**',
        },
        bgColor: 'gray',
      },
    },
    {
      id: 'demo-practice',
      type: 'cards',
      config: {
        heading: {
          en: 'Democracy in Practice',
          es: 'Democracia en la Práctica',
          tl: 'Demokrasya sa Praktika',
          zh: '民主实践',
          vi: 'Dân Chủ Trong Thực Hành',
        },
        layout: 'stacked',
        cards: [
          {
            title: {
              en: 'Building Assemblies',
              es: 'Asambleas de Edificios',
              tl: 'Mga Assembly ng Gusali',
              zh: '建筑大会',
              vi: 'Hội Nghị Tòa Nhà',
            },
            body: {
              en: 'Every building can form a tenant assembly—a democratic body where neighbors meet to discuss issues, vote on demands, and coordinate action. The assembly is the foundation of tenant democracy. It\'s where power is born.',
              es: 'Cada edificio puede formar una asamblea de inquilinos—un cuerpo democrático donde los vecinos se reúnen para discutir problemas, votar demandas y coordinar acciones. La asamblea es la base de la democracia de inquilinos. Es donde nace el poder.',
              tl: 'Bawat gusali ay maaaring bumuo ng tenant assembly—isang demokratikong katawan kung saan nagpupulong ang mga kapitbahay para talakayin ang mga isyu, bumoto sa mga demands, at mag-coordinate ng aksyon. Ang assembly ang pundasyon ng tenant democracy. Dito ipinanganak ang kapangyarihan.',
              zh: '每栋建筑都可以组建租户大会——一个民主机构，邻居们在这里开会讨论问题、对要求进行投票、协调行动。大会是租户民主的基础。这是权力诞生的地方。',
              vi: 'Mỗi tòa nhà có thể thành lập một hội nghị người thuê—một cơ quan dân chủ nơi hàng xóm họp để thảo luận các vấn đề, bỏ phiếu về yêu cầu, và phối hợp hành động. Hội nghị là nền tảng của dân chủ người thuê. Đó là nơi quyền lực được sinh ra.',
            },
          },
          {
            title: {
              en: 'Blocs and Federations',
              es: 'Bloques y Federaciones',
              tl: 'Mga Bloc at Federation',
              zh: '街区和联盟',
              vi: 'Khối và Liên Đoàn',
            },
            body: {
              en: 'When buildings link together—across neighborhoods, under the same landlord, or facing the same issues—they form Blocs. Blocs coordinate larger actions: citywide campaigns, legal strategies, mutual aid networks. This is federation: power scaling up while staying democratic.',
              es: 'Cuando los edificios se unen—a través de vecindarios, bajo el mismo propietario, o enfrentando los mismos problemas—forman Bloques. Los Bloques coordinan acciones más grandes: campañas a nivel de ciudad, estrategias legales, redes de ayuda mutua. Esto es federación: el poder crece mientras se mantiene democrático.',
              tl: 'Kapag nagkakaugnay ang mga gusali—sa mga kapitbahayan, sa ilalim ng parehong landlord, o nahaharap sa parehong mga isyu—bumubuo sila ng mga Bloc. Ang mga Bloc ay nagko-coordinate ng mas malalaking aksyon: mga kampanya sa buong lungsod, mga legal na estratehiya, mga network ng mutual aid. Ito ang federation: ang kapangyarihan ay lumalaki habang nananatiling demokratiko.',
              zh: '当建筑物联合起来——跨社区、在同一房东下、或面对相同问题——它们形成街区。街区协调更大的行动：全市范围的运动、法律策略、互助网络。这就是联盟：权力扩大的同时保持民主。',
              vi: 'Khi các tòa nhà liên kết—xuyên khu phố, dưới cùng một chủ nhà, hoặc đối mặt với cùng vấn đề—họ hình thành Khối. Khối phối hợp các hành động lớn hơn: chiến dịch toàn thành phố, chiến lược pháp lý, mạng lưới hỗ trợ lẫn nhau. Đây là liên đoàn: quyền lực mở rộng trong khi vẫn dân chủ.',
            },
          },
          {
            title: {
              en: 'Ranked-Choice and Consensus',
              es: 'Votación Preferencial y Consenso',
              tl: 'Ranked-Choice at Consensus',
              zh: '排序选择和共识',
              vi: 'Xếp Hạng Lựa Chọn và Đồng Thuận',
            },
            body: {
              en: 'RSTU Connect uses ranked-choice voting for elections and weighted voting for proposals. We aim for consensus when possible, majority when necessary. Every member\'s voice matters. No one is silenced. This is what democracy feels like.',
              es: 'RSTU Connect usa votación preferencial para elecciones y votación ponderada para propuestas. Buscamos el consenso cuando es posible, la mayoría cuando es necesario. La voz de cada miembro importa. Nadie es silenciado. Así se siente la democracia.',
              tl: 'Gumagamit ang RSTU Connect ng ranked-choice voting para sa mga eleksyon at weighted voting para sa mga panukala. Nagsusumikap kami para sa consensus kapag posible, mayorya kapag kinakailangan. Ang boses ng bawat miyembro ay mahalaga. Walang sinumang pinapatahimik. Ganito dapat ang pakiramdam ng demokrasya.',
              zh: 'RSTU Connect在选举中使用排序选择投票，在提案中使用加权投票。我们尽可能寻求共识，必要时采用多数决定。每个成员的声音都很重要。没有人被沉默。这就是民主的感觉。',
              vi: 'RSTU Connect sử dụng bỏ phiếu xếp hạng lựa chọn cho các cuộc bầu cử và bỏ phiếu có trọng số cho các đề xuất. Chúng tôi hướng đến đồng thuận khi có thể, đa số khi cần thiết. Tiếng nói của mỗi thành viên đều quan trọng. Không ai bị bịt miệng. Đây là cảm giác của dân chủ.',
            },
          },
        ],
      },
    },
    { id: 'demo-cta', type: 'cta', config: {} },
  ],
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}

// Page 14: Environmental Justice - Climate intersection framing
export const PRESET_PAGE_14: LandingPageConfig = {
  id: 'page-14',
  name: 'Environmental Justice',
  sections: [
    {
      id: 'enviro-hero',
      type: 'hero',
      config: {
        showLogo: true,
        headlineOverride: {
          en: 'Housing Instability Kills',
          es: 'La Inestabilidad de Vivienda Mata',
          tl: 'Ang Kawalan ng Katatagan sa Pabahay ay Pumapatay',
          zh: '住房不稳定致命',
          vi: 'Bất Ổn Nhà Ở Gây Chết Người',
        },
        taglineOverride: {
          en: 'Climate change and housing injustice are the same fight. We can\'t have climate justice without housing justice.',
          es: 'El cambio climático y la injusticia de vivienda son la misma lucha. No podemos tener justicia climática sin justicia de vivienda.',
          tl: 'Ang climate change at kawalan ng katarungan sa pabahay ay iisang laban. Hindi maaaring magkaroon ng climate justice kung walang housing justice.',
          zh: '气候变化和住房不公正是同一场斗争。没有住房正义就没有气候正义。',
          vi: 'Biến đổi khí hậu và bất công nhà ở là cùng một cuộc chiến. Chúng ta không thể có công lý khí hậu mà không có công lý nhà ở.',
        },
        missionOverride: {
          en: 'When heatwaves hit, who dies? Tenants in buildings without AC, because landlords won\'t invest. When floods come, who\'s displaced? Renters in low-income neighborhoods, because they can\'t rebuild. When energy prices spike, who suffers? Cost-burdened tenants, already spending 40%+ of their income on housing. The climate crisis and the housing crisis are one crisis—and the solution is the same: organized tenant power.',
          es: 'Cuando llegan las olas de calor, ¿quién muere? Inquilinos en edificios sin aire acondicionado, porque los propietarios no invierten. Cuando llegan las inundaciones, ¿quién es desplazado? Los inquilinos en barrios de bajos ingresos, porque no pueden reconstruir. Cuando los precios de la energía suben, ¿quién sufre? Los inquilinos sobrecargados de costos, que ya gastan el 40%+ de sus ingresos en vivienda. La crisis climática y la crisis de vivienda son una sola crisis—y la solución es la misma: el poder organizado de los inquilinos.',
          tl: 'Kapag tumama ang mga heatwave, sino ang namamatay? Mga nangungupahan sa mga gusali na walang AC, dahil hindi mag-invest ang mga landlord. Kapag dumating ang mga baha, sino ang nadedisplace? Mga renter sa mga low-income na kapitbahayan, dahil hindi sila makabangon. Kapag tumaas ang presyo ng enerhiya, sino ang nagdurusa? Mga cost-burdened na nangungupahan, na gumagastos na ng 40%+ ng kanilang kita sa pabahay. Ang climate crisis at ang housing crisis ay iisang krisis—at pareho ang solusyon: organisadong kapangyarihan ng nangungupahan.',
          zh: '当热浪来袭时，谁会死？住在没有空调的建筑物里的租户，因为房东不愿投资。当洪水来临时，谁会流离失所？低收入社区的租户，因为他们无法重建。当能源价格飙升时，谁会受苦？负担过重的租户，他们已经把40%以上的收入花在住房上。气候危机和住房危机是同一场危机——解决方案也是一样的：有组织的租户力量。',
          vi: 'Khi sóng nhiệt đến, ai chết? Người thuê trong các tòa nhà không có điều hòa, vì chủ nhà không đầu tư. Khi lũ lụt đến, ai bị di dời? Người thuê ở các khu vực thu nhập thấp, vì họ không thể xây dựng lại. Khi giá năng lượng tăng vọt, ai chịu khổ? Người thuê gánh nặng chi phí, đã chi hơn 40% thu nhập cho nhà ở. Cuộc khủng hoảng khí hậu và cuộc khủng hoảng nhà ở là một cuộc khủng hoảng—và giải pháp giống nhau: sức mạnh có tổ chức của người thuê.',
        },
      },
    },
    {
      id: 'enviro-intersection',
      type: 'cards',
      config: {
        heading: {
          en: 'Climate & Housing: The Same Fight',
          es: 'Clima y Vivienda: La Misma Lucha',
          tl: 'Klima at Pabahay: Iisang Laban',
          zh: '气候与住房：同一场斗争',
          vi: 'Khí Hậu & Nhà Ở: Cùng Một Cuộc Chiến',
        },
        layout: 'stacked',
        cards: [
          {
            title: {
              en: 'Extreme Heat Kills Tenants',
              es: 'El Calor Extremo Mata a los Inquilinos',
              tl: 'Ang Matinding Init ay Pumapatay sa mga Nangungupahan',
              zh: '极端高温杀死租户',
              vi: 'Nóng Cực Độ Giết Chết Người Thuê',
            },
            body: {
              en: 'Heat is the deadliest weather event. Poor and working-class tenants—especially elders—die in buildings where landlords refuse to provide air conditioning. Nevada summers are getting hotter. Our buildings aren\'t getting safer.',
              es: 'El calor es el evento climático más mortal. Los inquilinos pobres y de clase trabajadora—especialmente los ancianos—mueren en edificios donde los propietarios se niegan a proporcionar aire acondicionado. Los veranos de Nevada se están volviendo más calientes. Nuestros edificios no se están volviendo más seguros.',
              tl: 'Ang init ang pinakamapanganib na kaganapan sa panahon. Ang mga mahihirap at working-class na nangungupahan—lalo na ang mga matatanda—ay namamatay sa mga gusali kung saan tumatanggi ang mga landlord na magbigay ng air conditioning. Ang mga tag-init sa Nevada ay nagiging mas mainit. Ang ating mga gusali ay hindi nagiging mas ligtas.',
              zh: '高温是最致命的天气事件。贫穷和工薪阶层的租户——尤其是老年人——死在房东拒绝提供空调的建筑物里。内华达州的夏天越来越热。我们的建筑物并没有变得更安全。',
              vi: 'Nóng là sự kiện thời tiết chết chóc nhất. Người thuê nghèo và lao động—đặc biệt là người già—chết trong các tòa nhà nơi chủ nhà từ chối cung cấp điều hòa. Mùa hè Nevada ngày càng nóng hơn. Các tòa nhà của chúng ta không an toàn hơn.',
            },
          },
          {
            title: {
              en: 'Displacement Accelerates Emissions',
              es: 'El Desplazamiento Acelera las Emisiones',
              tl: 'Ang Displacement ay Nagpapabilis ng Emissions',
              zh: '迫迁加速排放',
              vi: 'Di Dời Làm Tăng Phát Thải',
            },
            body: {
              en: 'When tenants are displaced from urban cores, they\'re pushed to sprawling suburbs with longer commutes. Every eviction increases car dependency and carbon emissions. Tenant stability is climate policy.',
              es: 'Cuando los inquilinos son desplazados de los centros urbanos, son empujados a suburbios extensos con viajes más largos. Cada desalojo aumenta la dependencia del automóvil y las emisiones de carbono. La estabilidad de los inquilinos es política climática.',
              tl: 'Kapag ang mga nangungupahan ay nadidisplace mula sa mga urban core, sila ay itinutulak sa mga sprawling suburb na may mas mahabang commute. Ang bawat eviction ay nagpapataas ng car dependency at carbon emissions. Ang tenant stability ay climate policy.',
              zh: '当租户被迫离开市中心时，他们被推到郊区，通勤时间更长。每一次驱逐都会增加对汽车的依赖和碳排放。租户稳定就是气候政策。',
              vi: 'Khi người thuê bị di dời khỏi trung tâm đô thị, họ bị đẩy đến vùng ngoại ô với thời gian đi làm dài hơn. Mỗi vụ trục xuất làm tăng sự phụ thuộc vào ô tô và phát thải carbon. Sự ổn định của người thuê là chính sách khí hậu.',
            },
          },
          {
            title: {
              en: 'Green Buildings Need Tenant Power',
              es: 'Los Edificios Verdes Necesitan Poder de Inquilinos',
              tl: 'Ang mga Green Building ay Nangangailangan ng Tenant Power',
              zh: '绿色建筑需要租户力量',
              vi: 'Tòa Nhà Xanh Cần Sức Mạnh Người Thuê',
            },
            body: {
              en: 'Retrofitting buildings for energy efficiency is essential—but who pays and who benefits? Without tenant organizing, green renovations become "green gentrification," with landlords using upgrades to justify rent hikes that displace the very people who need climate-resilient housing most.',
              es: 'La renovación de edificios para la eficiencia energética es esencial—pero ¿quién paga y quién se beneficia? Sin la organización de inquilinos, las renovaciones verdes se convierten en "gentrificación verde", con propietarios usando las mejoras para justificar aumentos de alquiler que desplazan a las mismas personas que más necesitan viviendas resistentes al clima.',
              tl: 'Ang retrofitting ng mga gusali para sa energy efficiency ay mahalaga—pero sino ang nagbabayad at sino ang nakikinabang? Kung walang tenant organizing, ang mga green renovation ay nagiging "green gentrification," kung saan ginagamit ng mga landlord ang mga upgrade para bigyang-katwiran ang mga pagtaas ng upa na nagdidisplace sa mga taong pinaka-nangangailangan ng climate-resilient na pabahay.',
              zh: '改造建筑以提高能源效率是必要的——但谁付费，谁受益？没有租户组织，绿色翻新就会变成"绿色绅士化"，房东用升级作为提高租金的借口，驱逐最需要气候适应性住房的人。',
              vi: 'Cải tạo các tòa nhà để tiết kiệm năng lượng là cần thiết—nhưng ai trả tiền và ai được hưởng lợi? Nếu không có tổ chức người thuê, các cải tạo xanh trở thành "gentrification xanh," với chủ nhà sử dụng các nâng cấp để biện minh cho việc tăng tiền thuê di dời chính những người cần nhà ở có khả năng chống chịu khí hậu nhất.',
            },
          },
        ],
      },
    },
    {
      id: 'enviro-just-transition',
      type: 'text',
      config: {
        heading: {
          en: 'A Just Transition Requires Housing Justice',
          es: 'Una Transición Justa Requiere Justicia de Vivienda',
          tl: 'Ang Just Transition ay Nangangailangan ng Housing Justice',
          zh: '公正转型需要住房公正',
          vi: 'Chuyển Đổi Công Bằng Đòi Hỏi Công Lý Nhà Ở',
        },
        body: {
          en: 'The climate movement talks about "just transition"—moving to clean energy in ways that don\'t leave workers behind. But what about tenants?\n\nWe need housing policies that:\n• Require landlords to provide cooling as temperatures rise\n• Ensure green renovations don\'t displace low-income tenants\n• Prioritize climate-vulnerable renters for energy assistance\n• Build sustainable, affordable housing—not luxury eco-condos\n\nThe tenant union is part of the climate movement. When we fight for safe, stable, affordable housing, we\'re fighting for a livable planet.\n\n**Climate justice is housing justice. Join the fight.**',
          es: 'El movimiento climático habla de "transición justa"—pasar a la energía limpia de maneras que no dejen atrás a los trabajadores. ¿Pero qué hay de los inquilinos?\n\nNecesitamos políticas de vivienda que:\n• Requieran que los propietarios proporcionen refrigeración a medida que suben las temperaturas\n• Aseguren que las renovaciones verdes no desplacen a los inquilinos de bajos ingresos\n• Prioricen a los inquilinos vulnerables al clima para asistencia energética\n• Construyan viviendas sostenibles y asequibles—no eco-condominios de lujo\n\nEl sindicato de inquilinos es parte del movimiento climático. Cuando luchamos por viviendas seguras, estables y asequibles, estamos luchando por un planeta habitable.\n\n**La justicia climática es justicia de vivienda. Únete a la lucha.**',
          tl: 'Ang climate movement ay nagsasalita tungkol sa "just transition"—paglipat sa clean energy sa mga paraan na hindi iniiwan ang mga manggagawa. Pero paano ang mga nangungupahan?\n\nKailangan natin ng mga housing policy na:\n• Nag-uutos sa mga landlord na magbigay ng cooling habang tumataas ang temperatura\n• Tinitiyak na ang mga green renovation ay hindi nagdidisplace sa mga low-income na nangungupahan\n• Prayoridad ang mga climate-vulnerable na renter para sa energy assistance\n• Nagtatayo ng sustainable, affordable na pabahay—hindi luxury eco-condos\n\nAng tenant union ay bahagi ng climate movement. Kapag lumalaban tayo para sa ligtas, matatag, at abot-kayang pabahay, lumalaban tayo para sa isang maaaring tirhan na planeta.\n\n**Ang climate justice ay housing justice. Sumali sa laban.**',
          zh: '气候运动谈论"公正转型"——以不抛弃工人的方式转向清洁能源。但租户呢？\n\n我们需要的住房政策：\n• 要求房东在气温上升时提供制冷\n• 确保绿色翻新不会驱逐低收入租户\n• 优先考虑气候脆弱的租户获得能源援助\n• 建造可持续、负担得起的住房——而不是豪华生态公寓\n\n租户工会是气候运动的一部分。当我们为安全、稳定、负担得起的住房而战时，我们是在为一个宜居的星球而战。\n\n**气候正义就是住房正义。加入战斗吧。**',
          vi: 'Phong trào khí hậu nói về "chuyển đổi công bằng"—chuyển sang năng lượng sạch theo cách không bỏ lại công nhân. Nhưng còn người thuê thì sao?\n\nChúng ta cần các chính sách nhà ở:\n• Yêu cầu chủ nhà cung cấp làm mát khi nhiệt độ tăng\n• Đảm bảo các cải tạo xanh không di dời người thuê thu nhập thấp\n• Ưu tiên người thuê dễ bị tổn thương về khí hậu cho hỗ trợ năng lượng\n• Xây dựng nhà ở bền vững, giá cả phải chăng—không phải căn hộ sinh thái xa xỉ\n\nCông đoàn người thuê là một phần của phong trào khí hậu. Khi chúng ta đấu tranh cho nhà ở an toàn, ổn định, giá cả phải chăng, chúng ta đang đấu tranh cho một hành tinh có thể sống được.\n\n**Công lý khí hậu là công lý nhà ở. Tham gia cuộc chiến.**',
        },
        bgColor: 'gray',
      },
    },
    {
      id: 'enviro-demands',
      type: 'cards',
      config: {
        heading: {
          en: 'Tenant Climate Demands',
          es: 'Demandas Climáticas de Inquilinos',
          tl: 'Mga Climate Demand ng Nangungupahan',
          zh: '租户气候诉求',
          vi: 'Yêu Cầu Khí Hậu Của Người Thuê',
        },
        layout: 'stacked',
        cards: [
          {
            title: {
              en: 'Cooling as a Right',
              es: 'Refrigeración como un Derecho',
              tl: 'Cooling bilang isang Karapatan',
              zh: '制冷是一项权利',
              vi: 'Làm Mát Là Một Quyền',
            },
            body: {
              en: 'Nevada summers regularly exceed 100°F. Heat kills more people than any other weather event. We demand that landlords provide functioning air conditioning—and that the law require it. Cooling is not a luxury; it\'s survival.',
              es: 'Los veranos de Nevada regularmente superan los 100°F. El calor mata a más personas que cualquier otro evento climático. Exigimos que los propietarios proporcionen aire acondicionado funcional—y que la ley lo requiera. La refrigeración no es un lujo; es supervivencia.',
              tl: 'Ang mga tag-init sa Nevada ay regular na lumampas sa 100°F. Ang init ay pumapatay ng mas maraming tao kaysa sa anumang iba pang kaganapan sa panahon. Hinihiling namin na ang mga landlord ay magbigay ng gumaganang air conditioning—at na ito ay kinakailangan ng batas. Ang cooling ay hindi luho; ito ay survival.',
              zh: '内华达州的夏天经常超过100华氏度。高温比任何其他天气事件杀死更多的人。我们要求房东提供正常运作的空调——而且法律应该要求这样做。制冷不是奢侈品；这是生存。',
              vi: 'Mùa hè Nevada thường xuyên vượt quá 100°F. Nóng giết nhiều người hơn bất kỳ sự kiện thời tiết nào khác. Chúng tôi yêu cầu chủ nhà cung cấp điều hòa hoạt động—và luật pháp yêu cầu điều đó. Làm mát không phải là xa xỉ; đó là sự sống còn.',
            },
          },
          {
            title: {
              en: 'Green Retrofits Without Displacement',
              es: 'Renovaciones Verdes Sin Desplazamiento',
              tl: 'Green Retrofit na Walang Displacement',
              zh: '绿色改造不驱逐',
              vi: 'Cải Tạo Xanh Không Di Dời',
            },
            body: {
              en: 'Energy efficiency upgrades should benefit tenants, not just landlords. We demand: no rent increases after green renovations, tenant relocation rights during construction, and priority return for displaced residents. Climate investment must not become climate gentrification.',
              es: 'Las mejoras de eficiencia energética deben beneficiar a los inquilinos, no solo a los propietarios. Exigimos: sin aumentos de alquiler después de renovaciones verdes, derechos de reubicación de inquilinos durante la construcción, y retorno prioritario para residentes desplazados. La inversión climática no debe convertirse en gentrificación climática.',
              tl: 'Ang mga upgrade sa energy efficiency ay dapat makinabang sa mga nangungupahan, hindi lamang sa mga landlord. Hinihiling namin: walang pagtaas ng upa pagkatapos ng green renovation, karapatan sa relokasyon ng nangungupahan sa panahon ng konstruksyon, at priority return para sa mga displaced na residente. Ang climate investment ay hindi dapat maging climate gentrification.',
              zh: '能源效率升级应该使租户受益，而不仅仅是房东。我们要求：绿色翻新后不涨租金、施工期间租户搬迁权、被迫迁居民优先返回。气候投资不能成为气候绅士化。',
              vi: 'Nâng cấp hiệu quả năng lượng nên có lợi cho người thuê, không chỉ chủ nhà. Chúng tôi yêu cầu: không tăng tiền thuê sau cải tạo xanh, quyền tái định cư người thuê trong quá trình xây dựng, và ưu tiên trở về cho cư dân bị di dời. Đầu tư khí hậu không được trở thành gentrification khí hậu.',
            },
          },
          {
            title: {
              en: 'Sustainable Social Housing',
              es: 'Vivienda Social Sostenible',
              tl: 'Sustainable na Social Housing',
              zh: '可持续的社会住房',
              vi: 'Nhà Ở Xã Hội Bền Vững',
            },
            body: {
              en: 'The solution to both crises is the same: publicly-owned, democratically-controlled, climate-resilient housing. Vienna has done it. Singapore has done it. We can build housing that\'s affordable, sustainable, and removes landlords entirely. The tenant movement is a climate movement.',
              es: 'La solución a ambas crisis es la misma: vivienda de propiedad pública, controlada democráticamente, resistente al clima. Viena lo ha hecho. Singapur lo ha hecho. Podemos construir viviendas que sean asequibles, sostenibles, y que eliminen completamente a los propietarios. El movimiento de inquilinos es un movimiento climático.',
              tl: 'Ang solusyon sa parehong krisis ay pareho: publicly-owned, demokratikong kontrolado, climate-resilient na pabahay. Nagawa na ito ng Vienna. Nagawa na ito ng Singapore. Maaari tayong magtayo ng pabahay na abot-kaya, sustainable, at nag-aalis ng mga landlord nang buo. Ang tenant movement ay isang climate movement.',
              zh: '两场危机的解决方案是一样的：公有的、民主控制的、气候适应性住房。维也纳已经做到了。新加坡已经做到了。我们可以建造负担得起的、可持续的、完全没有房东的住房。租户运动就是气候运动。',
              vi: 'Giải pháp cho cả hai cuộc khủng hoảng là giống nhau: nhà ở thuộc sở hữu công, kiểm soát dân chủ, có khả năng chống chịu khí hậu. Vienna đã làm được. Singapore đã làm được. Chúng ta có thể xây dựng nhà ở giá cả phải chăng, bền vững, và loại bỏ hoàn toàn chủ nhà. Phong trào người thuê là phong trào khí hậu.',
            },
          },
        ],
      },
    },
    { id: 'enviro-cta', type: 'cta', config: {} },
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
    const defaults = [
      DEFAULT_PAGE_1,
      PRESET_PAGE_2,
      PRESET_PAGE_3,
      PRESET_PAGE_4,
      PRESET_PAGE_5,
      PRESET_PAGE_6,
      PRESET_PAGE_7,
      PRESET_PAGE_8,
      PRESET_PAGE_9,
      PRESET_PAGE_10,
      PRESET_PAGE_11,
      PRESET_PAGE_12,
      PRESET_PAGE_13,
      PRESET_PAGE_14,
    ]
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

    // v4→v5: convert page-2 and page-3 hero overrides + how-it-works to locale objects
    if (version < 5) {
      const page2 = stored.find(p => p.id === 'page-2')
      if (page2) {
        const heroSection = page2.sections.find(s => s.type === 'hero')
        if (heroSection && typeof heroSection.config.headlineOverride === 'string') {
          if (heroSection.config.headlineOverride === 'Homes for people, not for profit.') {
            const presetHero = PRESET_PAGE_2.sections.find(s => s.type === 'hero')
            if (presetHero) {
              heroSection.config.headlineOverride = presetHero.config.headlineOverride
              heroSection.config.taglineOverride = presetHero.config.taglineOverride
              heroSection.config.missionOverride = presetHero.config.missionOverride
              changed = true
            }
          } else {
            heroSection.config.headlineOverride = { en: heroSection.config.headlineOverride }
            if (typeof heroSection.config.taglineOverride === 'string') {
              heroSection.config.taglineOverride = { en: heroSection.config.taglineOverride }
            }
            if (typeof heroSection.config.missionOverride === 'string') {
              heroSection.config.missionOverride = { en: heroSection.config.missionOverride }
            }
            changed = true
          }
        }
      }

      const page3 = stored.find(p => p.id === 'page-3')
      if (page3) {
        const heroSection = page3.sections.find(s => s.type === 'hero')
        if (heroSection && typeof heroSection.config.headlineOverride === 'string') {
          if (heroSection.config.headlineOverride === 'Tools for Tenant Power') {
            const presetHero = PRESET_PAGE_3.sections.find(s => s.type === 'hero')
            if (presetHero) {
              heroSection.config.headlineOverride = presetHero.config.headlineOverride
              heroSection.config.taglineOverride = presetHero.config.taglineOverride
              heroSection.config.missionOverride = presetHero.config.missionOverride
              changed = true
            }
          } else {
            heroSection.config.headlineOverride = { en: heroSection.config.headlineOverride }
            if (typeof heroSection.config.taglineOverride === 'string') {
              heroSection.config.taglineOverride = { en: heroSection.config.taglineOverride }
            }
            if (typeof heroSection.config.missionOverride === 'string') {
              heroSection.config.missionOverride = { en: heroSection.config.missionOverride }
            }
            changed = true
          }
        }

        const howSection = page3.sections.find(s => s.type === 'how-it-works')
        if (howSection && typeof howSection.config.heading === 'string') {
          if (howSection.config.heading === 'How RSTU Connect Works') {
            const presetHow = PRESET_PAGE_3.sections.find(s => s.type === 'how-it-works')
            if (presetHow) {
              howSection.config.heading = presetHow.config.heading
              howSection.config.subtitle = presetHow.config.subtitle
              changed = true
            }
          } else {
            howSection.config.heading = { en: howSection.config.heading }
            if (typeof howSection.config.subtitle === 'string') {
              howSection.config.subtitle = { en: howSection.config.subtitle }
            }
            changed = true
          }
        }
      }
    }

    safeSetItem(MIGRATION_KEY, String(CURRENT_VERSION))
  }

  // Ensure preset pages exist (restore if deleted)
  const presetPages = [
    { id: 'page-1', config: DEFAULT_PAGE_1 },
    { id: 'page-2', config: PRESET_PAGE_2 },
    { id: 'page-3', config: PRESET_PAGE_3 },
    { id: 'page-4', config: PRESET_PAGE_4 },
    { id: 'page-5', config: PRESET_PAGE_5 },
    { id: 'page-6', config: PRESET_PAGE_6 },
    { id: 'page-7', config: PRESET_PAGE_7 },
    { id: 'page-8', config: PRESET_PAGE_8 },
    { id: 'page-9', config: PRESET_PAGE_9 },
    { id: 'page-10', config: PRESET_PAGE_10 },
    { id: 'page-11', config: PRESET_PAGE_11 },
    { id: 'page-12', config: PRESET_PAGE_12 },
    { id: 'page-13', config: PRESET_PAGE_13 },
    { id: 'page-14', config: PRESET_PAGE_14 },
  ]
  presetPages.forEach(({ id, config }, idx) => {
    if (!stored.find(p => p.id === id)) {
      stored.splice(idx, 0, config)
      changed = true
    }
  })
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
  // Also remove from Supabase (fire-and-forget - table may not exist)
  if (supabase) {
    void supabase.from('landing_pages').delete().eq('id', id)
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
