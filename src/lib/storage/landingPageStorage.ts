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
const CURRENT_VERSION = 5 // Bump when preset pages change

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
    { id: 'corp-crisis', type: 'crisis', config: {} },
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
    { id: 'rights-action', type: 'action', config: {} },
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
    { id: 'history-crisis', type: 'crisis', config: {} },
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
    { id: 'org-organizing', type: 'organizing', config: {} },
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
    { id: 'class-crisis', type: 'crisis', config: {} },
    { id: 'class-cta', type: 'cta', config: {} },
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
