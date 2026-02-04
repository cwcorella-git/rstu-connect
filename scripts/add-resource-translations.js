#!/usr/bin/env node
/**
 * Add ES/TL/ZH/VI translations to all organizations in external-resources.json
 * Reference: project-docs/resource-translations.md
 */

const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '..', 'src', 'data', 'external-resources.json');
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// Common serviceArea translations
const SA = {
  'Reno': { es: 'Reno', tl: 'Reno', zh: '里诺', vi: 'Reno' },
  'Reno-Sparks': { es: 'Reno-Sparks', tl: 'Reno-Sparks', zh: '里诺-斯帕克斯', vi: 'Reno-Sparks' },
  'Northern Nevada': { es: 'Norte de Nevada', tl: 'Hilagang Nevada', zh: '内华达州北部', vi: 'Bắc Nevada' },
  'Washoe County': { es: 'Condado de Washoe', tl: 'Kondado ng Washoe', zh: '瓦肖县', vi: 'Quận Washoe' },
  'Statewide': { es: 'Todo el estado', tl: 'Buong estado', zh: '全州', vi: 'Toàn tiểu bang' },
  'Nationwide': { es: 'Todo el país', tl: 'Buong bansa', zh: '全国', vi: 'Toàn quốc' },
  'Nevada': { es: 'Nevada', tl: 'Nevada', zh: '内华达州', vi: 'Nevada' },
  'Northern Nevada & Eastern Sierra': { es: 'Norte de Nevada y Sierra Oriental', tl: 'Hilagang Nevada at Silangang Sierra', zh: '内华达州北部和东部山脉', vi: 'Bắc Nevada & Đông Sierra' },
  'Sparks': { es: 'Sparks', tl: 'Sparks', zh: '斯帕克斯', vi: 'Sparks' },
  'NV Energy service area': { es: 'Área de servicio de NV Energy', tl: 'Lugar ng serbisyo ng NV Energy', zh: 'NV Energy 服务区域', vi: 'Khu vực phục vụ NV Energy' },
  'All Nevada except Clark/Lincoln/Nye County': { es: 'Todo Nevada excepto los condados Clark/Lincoln/Nye', tl: 'Buong Nevada maliban sa Clark/Lincoln/Nye County', zh: '内华达州全境（克拉克/林肯/奈县除外）', vi: 'Toàn Nevada trừ Quận Clark/Lincoln/Nye' },
};

// Common eligibility translations
const EL = {
  'All welcome': { es: 'Todos bienvenidos', tl: 'Lahat ay malugod na tinatanggap', zh: '欢迎所有人', vi: 'Chào đón tất cả mọi người' },
  'No ID required, all welcome': { es: 'No se requiere identificación, todos bienvenidos', tl: 'Hindi kailangan ng ID, lahat ay welcome', zh: '无需身份证件，欢迎所有人', vi: 'Không cần giấy tờ tùy thân, chào đón tất cả' },
  'All welcome, no requirements': { es: 'Todos bienvenidos, sin requisitos', tl: 'Lahat ay welcome, walang kinakailangan', zh: '欢迎所有人，无需任何条件', vi: 'Chào đón tất cả, không yêu cầu gì' },
  'Income-based': { es: 'Basado en ingresos', tl: 'Batay sa kita', zh: '基于收入', vi: 'Dựa trên thu nhập' },
  'Sliding scale fees': { es: 'Tarifas de escala variable', tl: 'Bayad batay sa kakayahan', zh: '按比例收费', vi: 'Phí theo thang trượt' },
  'All welcome, sliding scale': { es: 'Todos bienvenidos, escala variable', tl: 'Lahat ay welcome, bayad batay sa kakayahan', zh: '欢迎所有人，按比例收费', vi: 'Chào đón tất cả, phí theo thang trượt' },
  'Anyone in crisis': { es: 'Cualquier persona en crisis', tl: 'Sinumang nasa krisis', zh: '任何处于危机中的人', vi: 'Bất kỳ ai đang trong khủng hoảng' },
  'Veterans': { es: 'Veteranos', tl: 'Mga beterano', zh: '退伍军人', vi: 'Cựu chiến binh' },
  'Seniors': { es: 'Personas mayores', tl: 'Mga matatanda', zh: '老年人', vi: 'Người cao tuổi' },
  'Nevada Medicaid eligible': { es: 'Elegible para Medicaid de Nevada', tl: 'Kwalipikado sa Nevada Medicaid', zh: '符合内华达州Medicaid资格', vi: 'Đủ điều kiện Nevada Medicaid' },
  'All job seekers': { es: 'Todos los buscadores de empleo', tl: 'Lahat ng naghahanap ng trabaho', zh: '所有求职者', vi: 'Tất cả người tìm việc' },
  'Uninsured/underinsured': { es: 'Sin seguro/con seguro insuficiente', tl: 'Walang insurance/kulang ang insurance', zh: '无保险/保险不足', vi: 'Không có bảo hiểm/bảo hiểm không đủ' },
};

// Per-org description translations (keyed by org id)
const TRANSLATIONS = {
  'ext-trinity-episcopal': {
    es: { description: 'Almuerzos gratuitos en bolsa, café y alimento para perros/gatos. No se requiere identificación, todos son bienvenidos. Catedral histórica con vista al río Truckee en el centro de Reno.' },
    tl: { description: 'Libreng bag lunch, kape, at pagkain ng aso/pusa. Hindi kailangan ng ID, lahat ay welcome. Makasaysayang katedral na nakatanaw sa Truckee River sa downtown Reno.' },
    zh: { description: '免费袋装午餐、咖啡和猫狗粮。无需身份证件，欢迎所有人。位于里诺市中心，俯瞰特拉基河的历史大教堂。' },
    vi: { description: 'Bữa trưa miễn phí, cà phê và thức ăn cho chó/mèo. Không cần giấy tờ tùy thân, chào đón tất cả mọi người. Nhà thờ lịch sử nhìn ra sông Truckee ở trung tâm Reno.' },
  },
  'ext-st-vincent-dining': {
    es: { description: 'Almuerzo caliente gratuito servido diariamente, sirviendo a más de 1,400 personas. Todos son bienvenidos, los 7 días de la semana.' },
    tl: { description: 'Libreng mainit na tanghalian araw-araw, nagsisilbi sa mahigit 1,400 na tao. Lahat ay welcome, 7 araw sa isang linggo.' },
    zh: { description: '每日免费供应热午餐，服务超过1,400人。欢迎所有人，每周7天。' },
    vi: { description: 'Bữa trưa nóng miễn phí mỗi ngày, phục vụ hơn 1.400 người. Chào đón tất cả, 7 ngày/tuần.' },
  },
  'ext-family-soup': {
    es: { description: 'Cena gratuita servida todos los martes por la noche. Comida comunitaria para cualquier persona que lo necesite. Organizada por voluntarios y miembros de la comunidad.' },
    tl: { description: 'Libreng hapunan tuwing Martes ng gabi. Pagkain para sa komunidad para sa sinumang nangangailangan. Pinapatakbo ng mga boluntaryo at miyembro ng komunidad.' },
    zh: { description: '每周二晚间提供免费晚餐。面向任何有需要的人的社区餐食。由志愿者和社区成员运营。' },
    vi: { description: 'Bữa tối miễn phí mỗi tối thứ Ba. Bữa ăn cộng đồng dành cho bất kỳ ai cần. Do tình nguyện viên và thành viên cộng đồng điều hành.' },
  },
  'ext-mutual-aid-mondays': {
    es: { description: 'Encuentro semanal de ayuda mutua cada lunes a las 5PM. Un espacio colaborativo para fortalecer la comunidad compartiendo conocimiento, recursos y sabiduría. Todas las edades e identidades son bienvenidas.' },
    tl: { description: 'Lingguhang mutual aid na pagtitipon tuwing Lunes ng 5PM. Isang collaborative na espasyo para palakasin ang komunidad sa pamamagitan ng pagbabahagi ng kaalaman, resources, at karunungan. Lahat ng edad at pagkakakilanlan ay welcome.' },
    zh: { description: '每周一下午5点的互助聚会。一个通过分享知识、资源和智慧来加强社区的协作空间。欢迎所有年龄和身份的人。' },
    vi: { description: 'Buổi tương trợ hàng tuần vào thứ Hai lúc 5 giờ chiều. Không gian hợp tác để củng cố cộng đồng thông qua chia sẻ kiến thức, tài nguyên và trí tuệ. Mọi lứa tuổi và bản sắc đều được chào đón.' },
  },
  'ext-food-bank': {
    es: { description: 'Distribución de alimentos, despensas móviles y asistencia alimentaria de emergencia sirviendo a más de 160,000 personas mensualmente en 13 condados de Nevada y 10 condados de California. Nota: Las distribuciones de alimentos NO se realizan en el almacén - use su herramienta Food Finder.' },
    tl: { description: 'Pamamahagi ng pagkain, mobile pantries, at emergency food assistance na nagsisilbi sa mahigit 160,000 na tao buwan-buwan sa 13 county ng Nevada at 10 county ng California. Paalala: Ang pamamahagi ng pagkain ay HINDI ginaganap sa warehouse - gamitin ang kanilang Food Finder tool.' },
    zh: { description: '食品分发、流动食品储藏室和紧急食品援助，每月服务超过160,000人，覆盖内华达州13个县和加利福尼亚州10个县。注意：食品分发不在仓库进行——请使用他们的Food Finder工具。' },
    vi: { description: 'Phân phối thực phẩm, kho lưu động và hỗ trợ thực phẩm khẩn cấp phục vụ hơn 160.000 người mỗi tháng tại 13 quận Nevada và 10 quận California. Lưu ý: Việc phân phối thực phẩm KHÔNG diễn ra tại kho - hãy sử dụng công cụ Food Finder.' },
  },
  'ext-hampton-house': {
    es: { description: 'Jardín comunitario liderado por la comunidad negra con despensa de alimentos y refrigerador de acceso abierto 24/7. Espacio multigeneracional con jardín comunitario, compostaje de recuperación de alimentos, suministros de reducción de daños y lugar de organización. Sin requisitos para recibir alimentos.' },
    tl: { description: 'Komunidad na hardin na pinamumunuan ng Black community na may 24/7 na bukas na food pantry at refrigerator. Multi-generational na espasyo na may community garden, food recovery compost, harm reduction supplies, at lugar ng pag-oorganisa. Walang kinakailangan para makatanggap ng pagkain.' },
    zh: { description: '由黑人社区领导的社区花园，配有24/7开放式食品储藏室和冰箱。多代际空间，设有社区花园、食物回收堆肥、减害用品和组织场所。领取食物无任何要求。' },
    vi: { description: 'Vườn cộng đồng do cộng đồng người Da đen lãnh đạo với tủ thực phẩm và tủ lạnh mở 24/7. Không gian đa thế hệ có vườn cộng đồng, ủ phân thu hồi thực phẩm, vật tư giảm hại và địa điểm tổ chức. Không yêu cầu gì để nhận thực phẩm.' },
  },
  'ext-catholic-charities': {
    es: { description: 'Centro integral de recursos que incluye asistencia alimentaria, ayuda de emergencia y servicios sociales. Los programas de St. Vincent sirven a miles de personas anualmente.' },
    tl: { description: 'Komprehensibong resource hub na kinabibilangan ng food assistance, emergency aid, at social services. Ang mga programa ng St. Vincent ay nagsisilbi sa libu-libong tao taun-taon.' },
    zh: { description: '综合资源中心，包括食品援助、紧急救助和社会服务。圣文森特项目每年服务数千人。' },
    vi: { description: 'Trung tâm tài nguyên toàn diện bao gồm hỗ trợ thực phẩm, viện trợ khẩn cấp và dịch vụ xã hội. Các chương trình St. Vincent phục vụ hàng nghìn người mỗi năm.' },
  },
  'ext-good-neighbors-warming': {
    es: { description: 'Centros de calentamiento nocturnos que rotan entre iglesias (Trinity Episcopal, First United Methodist, Good Shepherd Lutheran, St. Thomas Aquinas). Refugio nocturno seguro con comidas y calor hasta el 31 de marzo. Coordinado por Hampton House Garden, RISE y socios comunitarios.', eligibility: 'Mujeres, familias, padres solteros con hijos. Hombres solos dirigidos al CARES Campus.' },
    tl: { description: 'Mga overnight warming center na umiikot sa mga simbahan (Trinity Episcopal, First United Methodist, Good Shepherd Lutheran, St. Thomas Aquinas). Ligtas na overnight shelter na may pagkain at init hanggang Marso 31. Koordinado ng Hampton House Garden, RISE, at mga kasosyo sa komunidad.', eligibility: 'Mga babae, pamilya, mga solo na tatay na may anak. Mga lalaking nag-iisa ay ididirekta sa CARES Campus.' },
    zh: { description: '在教堂之间轮流的夜间取暖中心（Trinity Episcopal、First United Methodist、Good Shepherd Lutheran、St. Thomas Aquinas）。安全的夜间庇护所，提供餐食和温暖，持续到3月31日。由Hampton House Garden、RISE和社区合作伙伴协调。', eligibility: '女性、家庭、带孩子的单身父亲。单身男性请前往CARES Campus。' },
    vi: { description: 'Trung tâm sưởi ấm qua đêm luân phiên giữa các nhà thờ (Trinity Episcopal, First United Methodist, Good Shepherd Lutheran, St. Thomas Aquinas). Nơi trú ẩn qua đêm an toàn với bữa ăn và sưởi ấm đến ngày 31 tháng 3. Phối hợp bởi Hampton House Garden, RISE và các đối tác cộng đồng.', eligibility: 'Phụ nữ, gia đình, cha đơn thân có con. Nam giới độc thân được hướng dẫn đến CARES Campus.' },
  },
  'ext-voa-cares': {
    es: { description: 'Refugio de emergencia para hasta 600 adultos sin hogar. Los clientes pueden traer parejas, mascotas y pertenencias. Proporciona servicios de apoyo, gestión de casos, navegación de vivienda, consejería de salud mental y comidas.', eligibility: 'Adultos sin hogar' },
    tl: { description: 'Emergency shelter para sa hanggang 600 na adult na walang tirahan. Maaaring magdala ang mga kliyente ng mga kasama, alagang hayop, at mga gamit. Nagbibigay ng mga serbisyong suporta, case management, housing navigation, mental health counseling, at pagkain.', eligibility: 'Mga adult na walang tirahan' },
    zh: { description: '可容纳600名无家可归成年人的紧急庇护所。客户可以携带伴侣、宠物和个人物品。提供支持服务、案例管理、住房导航、心理健康咨询和餐食。', eligibility: '无家可归的成年人' },
    vi: { description: 'Nơi trú ẩn khẩn cấp cho tối đa 600 người lớn vô gia cư. Khách có thể mang theo bạn đời, thú cưng và đồ đạc. Cung cấp dịch vụ hỗ trợ, quản lý trường hợp, hướng dẫn nhà ở, tư vấn sức khỏe tâm thần và bữa ăn.', eligibility: 'Người lớn vô gia cư' },
  },
  'ext-crossroads': {
    es: { description: 'Programa de vivienda estructurada libre de alcohol y drogas, dirigido por compañeros, con servicios integrales de apoyo. Ofrece gestión intensiva de casos, desarrollo de habilidades de vida, preparación laboral, conexiones de salud y apoyo continuo para exalumnos.', eligibility: 'Hombres, mujeres, mujeres con hijos y familias que buscan vivienda estructurada, de apoyo, libre de alcohol y drogas' },
    tl: { description: 'Peer-led, walang alkohol at droga na structured housing program na may integrated wrap-around supportive services. Nag-aalok ng intensive case management, life skills development, workforce readiness programming, healthcare connections, at patuloy na suporta para sa mga alumni.', eligibility: 'Mga lalaki, babae, babae na may anak, at pamilya na naghahanap ng structured, supportive, walang alkohol at droga na tirahan' },
    zh: { description: '由同伴主导的无酒精和毒品结构化住房项目，配有综合支持服务。提供密集案例管理、生活技能发展、就业准备培训、医疗保健对接和校友持续支持。', eligibility: '寻求结构化、支持性、无酒精和毒品生活环境的男性、女性、带孩子的女性和家庭' },
    vi: { description: 'Chương trình nhà ở có cấu trúc, không rượu và ma túy, do đồng đẳng dẫn dắt, với dịch vụ hỗ trợ toàn diện. Cung cấp quản lý trường hợp chuyên sâu, phát triển kỹ năng sống, đào tạo sẵn sàng việc làm, kết nối y tế và hỗ trợ liên tục cho cựu thành viên.', eligibility: 'Nam, nữ, phụ nữ có con và gia đình tìm kiếm nơi ở có cấu trúc, hỗ trợ, không rượu và ma túy' },
  },
  'ext-battle-born-housing': {
    es: { description: 'Programa de residencia de recuperación que proporciona vivienda y servicios de apoyo para hombres de bajos ingresos que se recuperan de trastornos por uso de sustancias. 58 unidades residenciales incluyendo apartamentos tipo estudio y vivienda congregada. Servicios incluyen gestión de casos, consejería de abuso de sustancias, apoyo de salud conductual, oportunidades de empleo y apoyo de compañeros. Primero en Nevada en obtener certificación NARR.', eligibility: 'Hombres de bajos ingresos en recuperación de trastorno por uso de sustancias' },
    tl: { description: 'Recovery residence program na nagbibigay ng tirahan at supportive services para sa low-income na lalaki na nagre-recover mula sa substance use disorder. 58 residential units kasama ang studio apartments at congregate living. Kasama sa mga serbisyo ang case management, substance abuse counseling, behavioral health support, oportunidad sa trabaho, at peer support. Unang sa Nevada na nakakuha ng NARR certification.', eligibility: 'Low-income na lalaki na nagre-recover mula sa substance use disorder' },
    zh: { description: '为低收入男性药物滥用障碍康复者提供住房和支持服务的康复居所项目。58个住宅单元，包括单间公寓和集体生活区。服务包括案例管理、药物滥用咨询、行为健康支持、就业机会和同伴支持。内华达州首个获得NARR认证的项目。', eligibility: '正在从药物滥用障碍中康复的低收入男性' },
    vi: { description: 'Chương trình cư trú phục hồi cung cấp nhà ở và dịch vụ hỗ trợ cho nam giới thu nhập thấp đang phục hồi từ rối loạn sử dụng chất. 58 đơn vị nhà ở bao gồm căn hộ studio và sinh hoạt tập thể. Dịch vụ bao gồm quản lý trường hợp, tư vấn lạm dụng chất, hỗ trợ sức khỏe hành vi, cơ hội việc làm và hỗ trợ đồng đẳng. Đầu tiên tại Nevada đạt chứng nhận NARR.', eligibility: 'Nam giới thu nhập thấp đang phục hồi từ rối loạn sử dụng chất' },
  },
  'ext-hope-springs': {
    es: { description: 'La primera comunidad de vivienda puente del norte de Nevada. Diferente de un refugio - proporciona privacidad, seguridad y autonomía con recursos compartidos. A través de vivienda segura, salud conductual y servicios integrales, los residentes construyen un camino hacia la vida independiente. Cerca de 50 residentes se han mudado a vivienda permanente.', eligibility: 'Adultos sin hogar (30-60 anualmente)' },
    tl: { description: 'Unang bridge housing community ng Hilagang Nevada. Iba sa shelter - nagbibigay ng privacy, kaligtasan, at autonomy na may shared resources. Sa pamamagitan ng ligtas na tirahan, behavioral health, at wrap-around services, nagtatayo ang mga residente ng landas patungo sa independent living. Halos 50 residente ang lumipat na sa permanenteng tirahan.', eligibility: 'Mga adult na walang tirahan (30-60 taun-taon)' },
    zh: { description: '内华达州北部首个过渡住房社区。不同于庇护所——提供隐私、安全和自主权，并共享资源。通过安全住房、行为健康和全方位服务，居民建立通往独立生活的道路。已有近50名居民搬入永久住房。', eligibility: '无家可归的成年人（每年30-60人）' },
    vi: { description: 'Cộng đồng nhà ở cầu nối đầu tiên của Bắc Nevada. Khác với nơi trú ẩn - cung cấp sự riêng tư, an toàn, tự chủ với tài nguyên chung. Thông qua nhà ở an toàn, sức khỏe hành vi và dịch vụ toàn diện, cư dân xây dựng con đường hướng tới cuộc sống độc lập. Gần 50 cư dân đã chuyển vào nhà ở lâu dài.', eligibility: 'Người lớn vô gia cư (30-60 người/năm)' },
  },
  'ext-safe-camp': {
    es: { description: 'Programa de vivienda transicional en Governors Bowl Park que proporciona apoyo estructurado para personas que avanzan hacia vivienda permanente.', eligibility: 'Adultos en programa de vivienda transicional' },
    tl: { description: 'Transitional housing program sa Governors Bowl Park na nagbibigay ng structured na suporta para sa mga indibidwal na lumilipat patungo sa permanenteng tirahan.', eligibility: 'Mga adult sa transitional housing program' },
    zh: { description: '位于Governors Bowl Park的过渡性住房项目，为走向永久住房的个人提供结构化支持。', eligibility: '过渡性住房项目中的成年人' },
    vi: { description: 'Chương trình nhà ở chuyển tiếp tại Governors Bowl Park cung cấp hỗ trợ có cấu trúc cho những người đang hướng tới nhà ở lâu dài.', eligibility: 'Người lớn trong chương trình nhà ở chuyển tiếp' },
  },
  'ext-eddy-house': {
    es: { description: 'Refugio juvenil y servicios para jóvenes adultos de 12 a 24 años que experimentan falta de hogar o inestabilidad de vivienda. Incluye apartamentos TLC 360 para vivienda transicional.' },
    tl: { description: 'Youth shelter at serbisyo para sa mga young adults edad 12-24 na walang tirahan o may housing instability. Kasama ang TLC 360 apartments para sa transitional housing.' },
    zh: { description: '为12-24岁无家可归或住房不稳定的年轻人提供青年庇护所和服务。包括TLC 360过渡性住房公寓。' },
    vi: { description: 'Nơi trú ẩn thanh thiếu niên và dịch vụ cho người trẻ 12-24 tuổi vô gia cư hoặc bất ổn nhà ở. Bao gồm căn hộ TLC 360 cho nhà ở chuyển tiếp.' },
  },
  'ext-our-place-rise': {
    es: { description: 'Centro de refugio de emergencia y recursos de baja barrera, centrado en la persona, en asociación con Washoe County HSA. Proporciona servicios, referencias y apoyo para personas sin hogar. Un lugar donde los huéspedes se sienten bienvenidos y queridos.' },
    tl: { description: 'Low-barrier, person-first na emergency shelter at resource center sa pakikipagtulungan sa Washoe County HSA. Nagbibigay ng mga serbisyo, referrals, at suporta para sa mga indibidwal na walang tirahan. Isang lugar kung saan ang mga bisita ay nararamdamang welcome at gusto.' },
    zh: { description: '与瓦肖县HSA合作的低门槛、以人为本的紧急庇护所和资源中心。为无家可归者提供服务、转介和支持。一个让客人感到受欢迎和被需要的地方。' },
    vi: { description: 'Nơi trú ẩn khẩn cấp và trung tâm tài nguyên ít rào cản, lấy con người làm trung tâm, hợp tác với Washoe County HSA. Cung cấp dịch vụ, giới thiệu và hỗ trợ cho người vô gia cư. Nơi mà khách cảm thấy được chào đón và trân trọng.' },
  },
  'ext-nyep': {
    es: { description: 'Vivienda y servicios de apoyo para jóvenes de 16 a 24 años que salen del sistema de cuidado temporal o experimentan falta de hogar. Proporciona apartamentos y capacitación en habilidades de vida.' },
    tl: { description: 'Tirahan at mga support services para sa kabataan edad 16-24 na lumalabas sa foster care o walang tirahan. Nagbibigay ng mga apartment at life skills training.' },
    zh: { description: '为16-24岁即将离开寄养系统或无家可归的青年提供住房和支持服务。提供公寓和生活技能培训。' },
    vi: { description: 'Nhà ở và dịch vụ hỗ trợ cho thanh thiếu niên 16-24 tuổi rời khỏi hệ thống chăm sóc thay thế hoặc vô gia cư. Cung cấp căn hộ và đào tạo kỹ năng sống.' },
  },
  'ext-karma-box': {
    es: { description: 'Organización sin fines de lucro que proporciona esperanza y oportunidad para personas sin hogar. Ayuda a los clientes a obtener vivienda permanente, aumentar ingresos, mejorar la salud y recuperar la estabilidad y autosuficiencia a través de proyectos, programas y participación comunitaria. Fundada por Grant Denton en 2018.' },
    tl: { description: 'Nonprofit na nagbibigay ng pag-asa at oportunidad para sa mga taong walang tirahan. Tinutulungan ang mga kliyente na makakuha ng permanenteng tirahan, madagdagan ang kita, mapabuti ang kalusugan, at mabawi ang katatagan at sariling-kakayahan sa pamamagitan ng mga proyekto, programa, at pakikilahok sa komunidad. Itinatag ni Grant Denton noong 2018.' },
    zh: { description: '为无家可归者提供希望和机会的非营利组织。帮助客户获得永久住房、增加收入、改善健康，并通过项目、计划和社区参与重获稳定和自给自足。由Grant Denton于2018年创立。' },
    vi: { description: 'Tổ chức phi lợi nhuận mang lại hy vọng và cơ hội cho người vô gia cư. Giúp khách hàng có được nhà ở lâu dài, tăng thu nhập, cải thiện sức khỏe và lấy lại sự ổn định và tự lập thông qua các dự án, chương trình và sự tham gia cộng đồng. Được Grant Denton thành lập năm 2018.' },
  },
  'ext-puf-house': {
    es: { description: 'Vivienda transicional y servicios de estabilización de crisis. Parte de los programas de WellCare Foundation que proporcionan apoyo de recuperación y vivienda.' },
    tl: { description: 'Transitional housing at crisis stabilization services. Bahagi ng mga programa ng WellCare Foundation na nagbibigay ng recovery at housing support.' },
    zh: { description: '过渡性住房和危机稳定服务。WellCare Foundation提供康复和住房支持项目的一部分。' },
    vi: { description: 'Nhà ở chuyển tiếp và dịch vụ ổn định khủng hoảng. Một phần của chương trình WellCare Foundation cung cấp hỗ trợ phục hồi và nhà ở.' },
  },
  'ext-life-change-center': {
    es: { description: 'Programas de tratamiento residencial y ambulatorio para trastornos por uso de sustancias. Múltiples ubicaciones en Reno, Sparks y Carson City.' },
    tl: { description: 'Mga residential at outpatient treatment program para sa substance use disorders. Maraming lokasyon sa Reno, Sparks, at Carson City.' },
    zh: { description: '针对药物滥用障碍的住院和门诊治疗项目。在Reno、Sparks和Carson City设有多个地点。' },
    vi: { description: 'Chương trình điều trị nội trú và ngoại trú cho rối loạn sử dụng chất. Nhiều địa điểm tại Reno, Sparks và Carson City.' },
  },
  'ext-reno-housing-auth': {
    es: { description: 'Vouchers de Sección 8, vivienda pública y programas de asistencia de alquiler para residentes de bajos ingresos.' },
    tl: { description: 'Section 8 vouchers, public housing, at rental assistance programs para sa mga low-income na residente.' },
    zh: { description: '为低收入居民提供第8条住房券、公共住房和租房援助项目。' },
    vi: { description: 'Phiếu Mục 8, nhà ở công cộng và chương trình hỗ trợ tiền thuê cho cư dân thu nhập thấp.' },
  },
  'ext-safe-embrace': {
    es: { description: 'Refugio de emergencia y servicios de apoyo para sobrevivientes de violencia doméstica y agresión sexual. Línea de crisis disponible las 24 horas.', eligibility: 'Sobrevivientes de violencia doméstica/sexual' },
    tl: { description: 'Emergency shelter at support services para sa mga survivor ng domestic violence at sexual assault. 24-hour crisis line available.', eligibility: 'Mga survivor ng domestic/sexual violence' },
    zh: { description: '为家庭暴力和性侵犯幸存者提供紧急庇护所和支持服务。24小时危机热线。', eligibility: '家庭暴力/性暴力幸存者' },
    vi: { description: 'Nơi trú ẩn khẩn cấp và dịch vụ hỗ trợ cho người sống sót sau bạo lực gia đình và tấn công tình dục. Đường dây khủng hoảng 24 giờ.', eligibility: 'Người sống sót sau bạo lực gia đình/tình dục' },
  },
  'ext-safelink-wireless': {
    es: { description: 'Teléfono celular gratuito y minutos mensuales para personas de bajos ingresos elegibles a través del programa federal Lifeline.', eligibility: 'Basado en ingresos o participación en programas gubernamentales (SNAP, Medicaid, etc.)' },
    tl: { description: 'Libreng cellphone at buwanang minuto para sa mga kwalipikadong low-income na indibidwal sa pamamagitan ng federal Lifeline program.', eligibility: 'Batay sa kita o paglahok sa mga programa ng gobyerno (SNAP, Medicaid, atbp.)' },
    zh: { description: '通过联邦Lifeline计划为符合条件的低收入个人提供免费手机和每月通话时间。', eligibility: '基于收入或参加政府项目（SNAP、Medicaid等）' },
    vi: { description: 'Điện thoại di động miễn phí và phút gọi hàng tháng cho cá nhân thu nhập thấp đủ điều kiện thông qua chương trình Lifeline liên bang.', eligibility: 'Dựa trên thu nhập hoặc tham gia chương trình chính phủ (SNAP, Medicaid, v.v.)' },
  },
  'ext-nevada-legal': {
    es: { description: 'Asistencia legal gratuita para nevadenses de bajos ingresos en asuntos civiles incluyendo vivienda, derecho familiar y beneficios públicos.', eligibility: 'Basado en ingresos (por debajo del 200% del nivel federal de pobreza)' },
    tl: { description: 'Libreng legal assistance para sa low-income na mga taga-Nevada sa mga civil matters kasama ang housing, family law, at public benefits.', eligibility: 'Batay sa kita (mas mababa sa 200% FPL)' },
    zh: { description: '为低收入内华达州居民提供免费法律援助，涉及民事事务包括住房、家庭法和公共福利。', eligibility: '基于收入（低于联邦贫困线200%）' },
    vi: { description: 'Hỗ trợ pháp lý miễn phí cho người Nevada thu nhập thấp trong các vấn đề dân sự bao gồm nhà ở, luật gia đình và trợ cấp công.', eligibility: 'Dựa trên thu nhập (dưới 200% mức nghèo liên bang)' },
  },
  'ext-nnla': {
    es: { description: 'Asistencia legal para inquilinos que enfrentan desalojo, discriminación de vivienda y disputas entre propietarios e inquilinos.' },
    tl: { description: 'Legal assistance para sa mga tenant na nahaharap sa eviction, housing discrimination, at landlord-tenant disputes.' },
    zh: { description: '为面临驱逐、住房歧视和房东-租户纠纷的租户提供法律援助。' },
    vi: { description: 'Hỗ trợ pháp lý cho người thuê nhà đối mặt với trục xuất, phân biệt đối xử về nhà ở và tranh chấp chủ nhà-người thuê.' },
  },
  'ext-ccsnn-immigration': {
    es: { description: 'Servicios legales de inmigración Mother Cabrini proporcionando servicios legales de inmigración de alta calidad, bajo costo o pro bono desde 2006. Ayuda a personas y familias nacidas en el extranjero a obtener o extender estatus migratorio legal o ciudadanía.', eligibility: 'Tarifa de consulta de $75' },
    tl: { description: 'Mother Cabrini Immigration Legal Services na nagbibigay ng mataas na kalidad, mababang gastos o libreng immigration legal services mula 2006. Tinutulungan ang mga indibidwal at pamilya na ipinanganak sa ibang bansa na makakuha o mapahabain ang lawful na immigration status o citizenship.', eligibility: '$75 na bayad sa konsultasyon' },
    zh: { description: 'Mother Cabrini移民法律服务自2006年以来提供高质量、低成本或免费的移民法律服务。帮助外国出生的个人和家庭获得或延长合法移民身份或公民身份。', eligibility: '咨询费$75' },
    vi: { description: 'Dịch vụ Pháp lý Di trú Mother Cabrini cung cấp dịch vụ pháp lý di trú chất lượng cao, chi phí thấp hoặc miễn phí từ năm 2006. Giúp cá nhân và gia đình sinh ra ở nước ngoài có được hoặc gia hạn tình trạng di trú hợp pháp hoặc quốc tịch.', eligibility: 'Phí tư vấn $75' },
  },
  'ext-plan-immigration': {
    es: { description: 'Servicios de inmigración reconocidos y acreditados por el DOJ. Asiste con ajuste de estatus, DACA, peticiones familiares, Estatus de Protección Temporal (TPS) y procedimientos EOIR.' },
    tl: { description: 'DOJ-recognized at accredited immigration services. Tumutulong sa adjustment of status, DACA, family petitions, Temporary Protected Status (TPS), at EOIR proceedings.' },
    zh: { description: '经DOJ认可和认证的移民服务。协助身份调整、DACA、家庭申请、临时保护身份（TPS）和EOIR程序。' },
    vi: { description: 'Dịch vụ di trú được DOJ công nhận và chứng nhận. Hỗ trợ điều chỉnh tình trạng, DACA, đơn gia đình, Tình trạng Bảo vệ Tạm thời (TPS) và thủ tục EOIR.' },
  },
  'ext-nn-hopes': {
    es: { description: 'Centro de salud comunitario que proporciona servicios médicos, dentales, de salud conductual y VIH/SIDA sin importar la capacidad de pago.' },
    tl: { description: 'Community health center na nagbibigay ng medical, dental, behavioral health, at HIV/AIDS services anuman ang kakayahang magbayad.' },
    zh: { description: '社区健康中心，提供医疗、牙科、行为健康和HIV/AIDS服务，不论支付能力。' },
    vi: { description: 'Trung tâm y tế cộng đồng cung cấp dịch vụ y tế, nha khoa, sức khỏe hành vi và HIV/AIDS bất kể khả năng chi trả.' },
  },
  'ext-hopes-sexual-health': {
    es: { description: 'Pruebas gratuitas y confidenciales de ITS/VIH, PrEP y servicios de salud sexual.' },
    tl: { description: 'Libre at confidential na STI/HIV testing, PrEP, at sexual health services.' },
    zh: { description: '免费保密的性病/HIV检测、PrEP和性健康服务。' },
    vi: { description: 'Xét nghiệm STI/HIV miễn phí và bảo mật, PrEP và dịch vụ sức khỏe tình dục.' },
  },
  'ext-community-health': {
    es: { description: 'Atención médica gratuita y de bajo costo, servicios dentales y asistencia con medicamentos recetados para residentes sin seguro o con seguro insuficiente. El Centro de Atención Compleja atiende condiciones crónicas.' },
    tl: { description: 'Libre at mababang gastos na medical care, dental services, at tulong sa reseta para sa mga residenteng walang insurance o kulang ang insurance. Ang Center for Complex Care ay tumutugon sa mga chronic conditions.' },
    zh: { description: '为无保险和保险不足的居民提供免费和低成本的医疗服务、牙科服务和处方药援助。复杂护理中心处理慢性疾病。' },
    vi: { description: 'Chăm sóc y tế miễn phí và chi phí thấp, dịch vụ nha khoa và hỗ trợ thuốc kê đơn cho cư dân không có bảo hiểm hoặc bảo hiểm không đủ. Trung tâm Chăm sóc Phức tạp xử lý các bệnh mãn tính.' },
  },
  'ext-change-point': {
    es: { description: 'Servicios de reducción de daños incluyendo intercambio de jeringas, pruebas de VIH/Hepatitis y distribución de naloxona.' },
    tl: { description: 'Harm reduction services kasama ang syringe exchange, HIV/Hepatitis testing, at naloxone distribution.' },
    zh: { description: '减害服务，包括注射器交换、HIV/肝炎检测和纳洛酮分发。' },
    vi: { description: 'Dịch vụ giảm hại bao gồm trao đổi kim tiêm, xét nghiệm HIV/Viêm gan và phân phối naloxone.' },
  },
  'ext-washoe-cchs': {
    es: { description: 'Servicios de salud pública incluyendo vacunaciones, pruebas de tuberculosis, pruebas de ITS y planificación familiar. Escala de tarifas variable disponible.' },
    tl: { description: 'Public health services kasama ang immunizations, TB testing, STI testing, at family planning. May sliding fee scale.' },
    zh: { description: '公共卫生服务，包括免疫接种、结核病检测、性病检测和计划生育。提供按比例收费。' },
    vi: { description: 'Dịch vụ y tế công cộng bao gồm tiêm chủng, xét nghiệm lao, xét nghiệm STI và kế hoạch hóa gia đình. Có phí theo thang trượt.' },
  },
  'ext-rsic-tribal-health': {
    es: { description: 'Servicios de salud integrales para miembros de la comunidad nativa americana incluyendo servicios médicos, dentales, de farmacia y de salud conductual.', eligibility: 'Miembros de la comunidad nativa americana' },
    tl: { description: 'Komprehensibong health services para sa mga miyembro ng Native American community kasama ang medical, dental, pharmacy, at behavioral health.', eligibility: 'Mga miyembro ng Native American community' },
    zh: { description: '为美洲原住民社区成员提供综合健康服务，包括医疗、牙科、药房和行为健康服务。', eligibility: '美洲原住民社区成员' },
    vi: { description: 'Dịch vụ y tế toàn diện cho thành viên cộng đồng người Mỹ bản địa bao gồm y tế, nha khoa, dược phẩm và sức khỏe hành vi.', eligibility: 'Thành viên cộng đồng người Mỹ bản địa' },
  },
  'ext-nevada-urban-indians': {
    es: { description: 'Servicios de salud y sociales para nativos americanos urbanos incluyendo atención médica, salud conductual y programas comunitarios. Servicios disponibles para todas las poblaciones sin importar el seguro, con tarifas reducidas basadas en ingresos.', eligibility: 'Personas y familias nativas americanas (todas las poblaciones bienvenidas)' },
    tl: { description: 'Health at social services para sa urban Native Americans kasama ang medical care, behavioral health, at community programs. Mga serbisyo available sa lahat ng populasyon anuman ang insurance, na may discounted rates batay sa kita.', eligibility: 'Mga Native American na indibidwal at pamilya (lahat ng populasyon welcome)' },
    zh: { description: '为城市美洲原住民提供健康和社会服务，包括医疗、行为健康和社区项目。服务面向所有人群，不论保险状况，根据收入提供折扣费率。', eligibility: '美洲原住民个人和家庭（欢迎所有人群）' },
    vi: { description: 'Dịch vụ y tế và xã hội cho người Mỹ bản địa trong đô thị bao gồm chăm sóc y tế, sức khỏe hành vi và chương trình cộng đồng. Dịch vụ dành cho tất cả mọi người bất kể bảo hiểm, với mức giá giảm theo thu nhập.', eligibility: 'Cá nhân và gia đình người Mỹ bản địa (chào đón tất cả)' },
  },
  'ext-va-homeless-care': {
    es: { description: 'Atención médica, asistencia de vivienda y servicios de apoyo para veteranos sin hogar o en riesgo de estarlo. Proporciona alimentos y refugio inmediato, vivienda transicional y permanente, capacitación laboral y tratamiento de salud mental.' },
    tl: { description: 'Health care, housing assistance, at support services para sa mga beterano na walang tirahan o nanganganib na mawalan ng tirahan. Nagbibigay ng agarang pagkain at shelter, transitional at permanent housing, job training, at mental health treatment.' },
    zh: { description: '为无家可归或有无家可归风险的退伍军人提供医疗保健、住房援助和支持服务。提供即时食物和庇护、过渡和永久住房、职业培训和心理健康治疗。' },
    vi: { description: 'Chăm sóc sức khỏe, hỗ trợ nhà ở và dịch vụ hỗ trợ cho cựu chiến binh vô gia cư hoặc có nguy cơ vô gia cư. Cung cấp thực phẩm và nơi trú ẩn ngay lập tức, nhà ở chuyển tiếp và lâu dài, đào tạo việc làm và điều trị sức khỏe tâm thần.' },
  },
  'ext-wellcare': {
    es: { description: 'Servicios integrales de salud conductual incluyendo estabilización de crisis, desintoxicación médica y tratamiento ambulatorio.' },
    tl: { description: 'Komprehensibong behavioral health services kasama ang crisis stabilization, medical detox, at outpatient treatment.' },
    zh: { description: '综合行为健康服务，包括危机稳定、医疗戒毒和门诊治疗。' },
    vi: { description: 'Dịch vụ sức khỏe hành vi toàn diện bao gồm ổn định khủng hoảng, cai nghiện y tế và điều trị ngoại trú.' },
  },
  'ext-silver-summit-behavioral': {
    es: { description: 'Red de proveedores de salud conductual para miembros de Medicaid de SilverSummit. Servicios de salud mental y abuso de sustancias.', eligibility: 'Miembros de Medicaid de SilverSummit' },
    tl: { description: 'Behavioral health provider network para sa SilverSummit Medicaid members. Mental health at substance abuse services.', eligibility: 'SilverSummit Medicaid members' },
    zh: { description: '面向SilverSummit Medicaid会员的行为健康提供者网络。心理健康和药物滥用服务。', eligibility: 'SilverSummit Medicaid会员' },
    vi: { description: 'Mạng lưới nhà cung cấp sức khỏe hành vi cho thành viên SilverSummit Medicaid. Dịch vụ sức khỏe tâm thần và lạm dụng chất.', eligibility: 'Thành viên SilverSummit Medicaid' },
  },
  'ext-anthem-medicaid': {
    es: { description: 'Plan de atención administrada de Medicaid de Nevada que proporciona cobertura médica, dental, de visión y de salud conductual.' },
    tl: { description: 'Nevada Medicaid managed care plan na nagbibigay ng medical, dental, vision, at behavioral health coverage.' },
    zh: { description: '内华达州Medicaid管理式护理计划，提供医疗、牙科、视力和行为健康保障。' },
    vi: { description: 'Kế hoạch chăm sóc quản lý Medicaid Nevada cung cấp bảo hiểm y tế, nha khoa, thị lực và sức khỏe hành vi.' },
  },
  'ext-caresource-medicaid': {
    es: { description: 'Plan de atención administrada de Medicaid de Nevada que ofrece beneficios de salud integrales y coordinación de atención.' },
    tl: { description: 'Nevada Medicaid managed care plan na nag-aalok ng komprehensibong health benefits at care coordination.' },
    zh: { description: '内华达州Medicaid管理式护理计划，提供综合健康福利和护理协调。' },
    vi: { description: 'Kế hoạch chăm sóc quản lý Medicaid Nevada cung cấp quyền lợi sức khỏe toàn diện và phối hợp chăm sóc.' },
  },
  'ext-molina-medicaid': {
    es: { description: 'Plan de atención administrada de Medicaid de Nevada con beneficios médicos, de salud conductual, de farmacia y de transporte.' },
    tl: { description: 'Nevada Medicaid managed care plan na may medical, behavioral health, pharmacy, at transportation benefits.' },
    zh: { description: '内华达州Medicaid管理式护理计划，提供医疗、行为健康、药房和交通福利。' },
    vi: { description: 'Kế hoạch chăm sóc quản lý Medicaid Nevada với quyền lợi y tế, sức khỏe hành vi, dược phẩm và giao thông.' },
  },
  'ext-silversummit-medicaid': {
    es: { description: 'Plan de atención administrada de Medicaid de Nevada que proporciona cobertura de salud integral y servicios de apoyo para miembros.' },
    tl: { description: 'Nevada Medicaid managed care plan na nagbibigay ng komprehensibong health coverage at member support services.' },
    zh: { description: '内华达州Medicaid管理式护理计划，提供综合健康保障和会员支持服务。' },
    vi: { description: 'Kế hoạch chăm sóc quản lý Medicaid Nevada cung cấp bảo hiểm sức khỏe toàn diện và dịch vụ hỗ trợ thành viên.' },
  },
  'ext-dwss': {
    es: { description: 'Agencia estatal de Nevada que proporciona programas de SNAP, TANF, Medicaid y otros beneficios públicos. Solicite en línea o en persona.' },
    tl: { description: 'Ahensya ng estado ng Nevada na nagbibigay ng SNAP, TANF, Medicaid, at iba pang public benefit programs. Mag-apply online o personal.' },
    zh: { description: '内华达州政府机构，提供SNAP、TANF、Medicaid和其他公共福利项目。可在线或亲自申请。' },
    vi: { description: 'Cơ quan bang Nevada cung cấp các chương trình SNAP, TANF, Medicaid và các trợ cấp công khác. Đăng ký trực tuyến hoặc trực tiếp.' },
  },
  'ext-dwss-sparks': {
    es: { description: 'Oficina del distrito de Sparks para servicios de bienestar de Nevada incluyendo solicitudes de SNAP, TANF y Medicaid.' },
    tl: { description: 'Opisina ng distrito ng Sparks para sa mga serbisyo ng welfare ng Nevada kasama ang SNAP, TANF, at Medicaid applications.' },
    zh: { description: 'Sparks地区办公室，提供内华达州福利服务，包括SNAP、TANF和Medicaid申请。' },
    vi: { description: 'Văn phòng quận Sparks cho các dịch vụ phúc lợi Nevada bao gồm đăng ký SNAP, TANF và Medicaid.' },
  },
  'ext-nv-dmv': {
    es: { description: 'Licencias de conducir y tarjetas de identificación estatal. Las personas sin hogar pueden usar el formulario de Declaración de Estado de Personas sin Hogar (DMV-128) en lugar de comprobante de domicilio.', eligibility: 'Formulario DMV-128 disponible para declaración de estado de personas sin hogar' },
    tl: { description: 'Mga driver\'s license at state ID cards. Ang mga homeless na indibidwal ay maaaring gumamit ng Declaration of Homeless Status form (DMV-128) bilang kapalit ng address proof.', eligibility: 'Form DMV-128 available para sa homeless status declaration' },
    zh: { description: '驾驶执照和州身份证。无家可归者可使用无家可归身份声明表（DMV-128）代替地址证明。', eligibility: 'DMV-128表格可用于无家可归身份声明' },
    vi: { description: 'Bằng lái xe và thẻ căn cước bang. Người vô gia cư có thể sử dụng mẫu Tuyên bố Tình trạng Vô gia cư (DMV-128) thay cho bằng chứng địa chỉ.', eligibility: 'Mẫu DMV-128 dùng cho tuyên bố tình trạng vô gia cư' },
  },
  'ext-ssa': {
    es: { description: 'Tarjetas de Seguro Social, beneficios por discapacidad y beneficios de jubilación. Tarjetas de reemplazo del Seguro Social disponibles de forma gratuita.' },
    tl: { description: 'Social Security cards, disability benefits, at retirement benefits. Libreng replacement Social Security cards.' },
    zh: { description: '社会安全卡、残障福利和退休福利。可免费更换社会安全卡。' },
    vi: { description: 'Thẻ An sinh Xã hội, trợ cấp khuyết tật và trợ cấp hưu trí. Thẻ An sinh Xã hội thay thế miễn phí.' },
  },
  'ext-birth-certificates': {
    es: { description: 'Información sobre cómo reemplazar certificados de nacimiento, tarjetas del Seguro Social y otros documentos vitales.' },
    tl: { description: 'Impormasyon sa pagpapalit ng birth certificates, Social Security cards, at iba pang vital documents.' },
    zh: { description: '关于更换出生证明、社会安全卡和其他重要文件的信息。' },
    vi: { description: 'Thông tin về thay thế giấy khai sinh, thẻ An sinh Xã hội và các giấy tờ quan trọng khác.' },
  },
  'ext-immunization-records': {
    es: { description: 'Cómo acceder a sus registros de vacunación a través del Distrito de Salud del Condado de Washoe.' },
    tl: { description: 'Paano ma-access ang iyong immunization records sa pamamagitan ng Washoe County Health District.' },
    zh: { description: '如何通过瓦肖县卫生区获取您的免疫接种记录。' },
    vi: { description: 'Cách truy cập hồ sơ tiêm chủng thông qua Sở Y tế Quận Washoe.' },
  },
  'ext-rise': {
    es: { description: 'Organización comunitaria que trabaja en defensa de personas sin hogar, ayuda mutua y cambio sistémico. Opera el centro de recursos Our Place en asociación con el Condado de Washoe.' },
    tl: { description: 'Community organization na nagtatrabaho sa homelessness advocacy, mutual aid, at systemic change. Pinapatakbo ang Our Place resource center sa pakikipagtulungan sa Washoe County.' },
    zh: { description: '致力于无家可归者倡导、互助和系统性变革的社区组织。与瓦肖县合作运营Our Place资源中心。' },
    vi: { description: 'Tổ chức cộng đồng hoạt động về vận động cho người vô gia cư, tương trợ và thay đổi hệ thống. Điều hành trung tâm tài nguyên Our Place với Quận Washoe.' },
  },
  'ext-hope-team': {
    es: { description: 'Equipo de alcance del Sheriff del Condado de Washoe que conecta a personas sin hogar con servicios y recursos. Enfocado en no aplicar la ley.' },
    tl: { description: 'Washoe County Sheriff\'s outreach team na nagkokonekta sa mga unhoused na indibidwal sa mga serbisyo at resources. Hindi nakatuon sa enforcement.' },
    zh: { description: '瓦肖县警长办公室外展团队，帮助无家可归者获得服务和资源。非执法性质。' },
    vi: { description: 'Đội tiếp cận của Cảnh sát trưởng Quận Washoe kết nối người vô gia cư với dịch vụ và tài nguyên. Không tập trung vào thực thi pháp luật.' },
  },
  'ext-radical-cat': {
    es: { description: 'Colectivo de organización comunitaria y boletín enfocado en justicia de vivienda y defensa de inquilinos.' },
    tl: { description: 'Community organizing collective at newsletter na nakatuon sa housing justice at tenant advocacy.' },
    zh: { description: '专注于住房正义和租户倡导的社区组织团体和通讯。' },
    vi: { description: 'Tập thể tổ chức cộng đồng và bản tin tập trung vào công bằng nhà ở và vận động cho người thuê nhà.' },
  },
  'ext-reno-qol-recovery': {
    es: { description: 'Directorio de servicios de recuperación y recursos para trastornos por uso de sustancias en el área de Reno.' },
    tl: { description: 'Direktoryo ng recovery services at resources para sa substance use disorders sa Reno area.' },
    zh: { description: '里诺地区药物滥用障碍的康复服务和资源目录。' },
    vi: { description: 'Danh bạ dịch vụ phục hồi và tài nguyên cho rối loạn sử dụng chất tại khu vực Reno.' },
  },
  'ext-good-shepherd': {
    es: { description: 'Parte de la rotación de centros de calentamiento Good Neighbors. Proporciona refugio nocturno durante clima frío. Congregación ELCA que da la bienvenida a todas las personas.', eligibility: 'Participante del centro de calentamiento Good Neighbors' },
    tl: { description: 'Bahagi ng Good Neighbors warming center rotation. Nagbibigay ng overnight shelter kapag malamig ang panahon. ELCA congregation na welcome ang lahat ng tao.', eligibility: 'Good Neighbors warming center participant' },
    zh: { description: 'Good Neighbors取暖中心轮值点之一。在寒冷天气提供夜间庇护。欢迎所有人的ELCA教会。', eligibility: 'Good Neighbors取暖中心参与者' },
    vi: { description: 'Một phần của hệ thống luân phiên trung tâm sưởi ấm Good Neighbors. Cung cấp nơi trú ẩn qua đêm trong thời tiết lạnh. Hội thánh ELCA chào đón tất cả mọi người.', eligibility: 'Người tham gia trung tâm sưởi ấm Good Neighbors' },
  },
  'ext-st-thomas-aquinas': {
    es: { description: 'Parte de la rotación de centros de calentamiento Good Neighbors. Proporciona refugio nocturno durante clima frío. Catedral católica en el centro de Reno, iglesia madre de la Diócesis de Reno.', eligibility: 'Participante del centro de calentamiento Good Neighbors' },
    tl: { description: 'Bahagi ng Good Neighbors warming center rotation. Nagbibigay ng overnight shelter kapag malamig ang panahon. Katolikong katedral sa downtown Reno, mother church ng Diocese of Reno.', eligibility: 'Good Neighbors warming center participant' },
    zh: { description: 'Good Neighbors取暖中心轮值点之一。在寒冷天气提供夜间庇护。位于里诺市中心的天主教大教堂，里诺教区的母堂。', eligibility: 'Good Neighbors取暖中心参与者' },
    vi: { description: 'Một phần của hệ thống luân phiên trung tâm sưởi ấm Good Neighbors. Cung cấp nơi trú ẩn qua đêm trong thời tiết lạnh. Nhà thờ Công giáo ở trung tâm Reno, nhà thờ mẹ của Giáo phận Reno.', eligibility: 'Người tham gia trung tâm sưởi ấm Good Neighbors' },
  },
  'ext-first-united-methodist': {
    es: { description: 'Parte de la rotación de centros de calentamiento Good Neighbors. Proporciona refugio nocturno durante clima frío. Iglesia histórica del centro fundada en 1868, incluida en el Registro Nacional de Lugares Históricos.', eligibility: 'Participante del centro de calentamiento Good Neighbors' },
    tl: { description: 'Bahagi ng Good Neighbors warming center rotation. Nagbibigay ng overnight shelter kapag malamig ang panahon. Makasaysayang downtown church na itinatag noong 1868, nasa National Register of Historic Places.', eligibility: 'Good Neighbors warming center participant' },
    zh: { description: 'Good Neighbors取暖中心轮值点之一。在寒冷天气提供夜间庇护。始建于1868年的历史性市中心教堂，被列入国家历史古迹名录。', eligibility: 'Good Neighbors取暖中心参与者' },
    vi: { description: 'Một phần của hệ thống luân phiên trung tâm sưởi ấm Good Neighbors. Cung cấp nơi trú ẩn qua đêm trong thời tiết lạnh. Nhà thờ lịch sử trung tâm thành lập năm 1868, được liệt kê trong Sổ đăng ký Di tích Lịch sử Quốc gia.', eligibility: 'Người tham gia trung tâm sưởi ấm Good Neighbors' },
  },
  'ext-pets-homeless': {
    es: { description: 'Organización nacional sin fines de lucro que proporciona alimentos para mascotas, atención veterinaria y suministros a mascotas de personas sin hogar. Recursos locales y sitios de donación.', eligibility: 'Dueños de mascotas sin hogar' },
    tl: { description: 'Pambansang nonprofit na nagbibigay ng pet food, veterinary care, at supplies sa mga alagang hayop ng mga homeless na indibidwal. Mga lokal na resources at donation sites.', eligibility: 'Mga homeless na may-ari ng alagang hayop' },
    zh: { description: '全国性非营利组织，为无家可归者的宠物提供宠物食品、兽医护理和用品。本地资源和捐赠站点。', eligibility: '无家可归的宠物主人' },
    vi: { description: 'Tổ chức phi lợi nhuận quốc gia cung cấp thức ăn thú cưng, chăm sóc thú y và vật tư cho thú cưng của người vô gia cư. Tài nguyên địa phương và điểm quyên góp.', eligibility: 'Chủ thú cưng vô gia cư' },
  },
  'ext-noah-animal-house': {
    es: { description: 'Instalación de servicio completo para mascotas en los terrenos del refugio de violencia doméstica. Permite a los sobrevivientes mantener a sus mascotas seguras mientras están en el refugio. La ubicación de Reno abrió en 2018 en asociación con el Centro de Recursos de Violencia Doméstica.', eligibility: 'Residentes de refugio de violencia doméstica' },
    tl: { description: 'Full-service pet facility sa loob ng domestic violence shelter grounds. Pinapayagan ang mga survivor na panatilihing ligtas ang kanilang mga alagang hayop habang nasa shelter. Ang Reno location ay binuksan noong 2018 sa pakikipagtulungan sa Domestic Violence Resource Center.', eligibility: 'Mga residente ng DV shelter' },
    zh: { description: '位于家庭暴力庇护所场地内的全方位宠物设施。让幸存者在庇护期间保护宠物安全。里诺分部于2018年与家庭暴力资源中心合作开设。', eligibility: '家暴庇护所居住者' },
    vi: { description: 'Cơ sở chăm sóc thú cưng đầy đủ dịch vụ trong khuôn viên nơi trú ẩn bạo lực gia đình. Cho phép người sống sót giữ thú cưng an toàn khi ở nơi trú ẩn. Địa điểm Reno khai trương năm 2018 hợp tác với Trung tâm Tài nguyên Bạo lực Gia đình.', eligibility: 'Cư dân nơi trú ẩn bạo lực gia đình' },
  },
  'ext-nevada-211': {
    es: { description: 'Línea de recursos gratuita, confidencial, 24/7 que conecta a los nevadenses con servicios esenciales incluyendo alimentos, vivienda, atención médica, salud mental y apoyo para niños, familias, personas mayores y personas con discapacidades. Servicios de traducción en más de 150 idiomas.' },
    tl: { description: 'Libre, confidential na 24/7 resource hotline na nagkokonekta sa mga taga-Nevada sa mga essential services kasama ang pagkain, tirahan, healthcare, mental health, at suporta para sa mga bata, pamilya, matatanda, at mga taong may kapansanan. Translation services sa mahigit 150 wika.' },
    zh: { description: '免费、保密的24/7资源热线，帮助内华达州居民获取基本服务，包括食物、住房、医疗、心理健康以及儿童、家庭、老年人和残障人士的支持。提供150多种语言的翻译服务。' },
    vi: { description: 'Đường dây tài nguyên miễn phí, bảo mật 24/7 kết nối người Nevada với các dịch vụ thiết yếu bao gồm thực phẩm, nhà ở, chăm sóc sức khỏe, sức khỏe tâm thần và hỗ trợ cho trẻ em, gia đình, người cao tuổi và người khuyết tật. Dịch vụ phiên dịch hơn 150 ngôn ngữ.' },
  },
  'ext-988-crisis': {
    es: { description: 'Línea nacional de crisis para cualquier persona que experimente pensamientos suicidas, crisis de salud mental o angustia emocional. Apoyo gratuito y confidencial 24/7. Si llama al 911, pida un Oficial del Equipo de Intervención en Crisis (CIT).' },
    tl: { description: 'Pambansang crisis line para sa sinumang nakakaranas ng suicidal thoughts, mental health crisis, o emotional distress. Libre at confidential na suporta 24/7. Kung tatawag ng 911, humingi ng Crisis Intervention Team (CIT) Officer.' },
    zh: { description: '面向任何有自杀念头、心理健康危机或情绪困扰者的全国危机热线。免费、保密的24/7支持。如果拨打911，请要求危机干预团队（CIT）警员。' },
    vi: { description: 'Đường dây khủng hoảng quốc gia cho bất kỳ ai có ý nghĩ tự tử, khủng hoảng sức khỏe tâm thần hoặc đau khổ tinh thần. Hỗ trợ miễn phí, bảo mật 24/7. Nếu gọi 911, hãy yêu cầu Nhân viên Nhóm Can thiệp Khủng hoảng (CIT).' },
  },
  'ext-nami-nn': {
    es: { description: 'Apoyo gratuito de salud mental, educación y defensa. Ofrece grupos de apoyo, programas educativos y recursos de emergencia 24 horas incluyendo equipo de seguridad de alcance móvil y línea de apoyo en crisis. Ayuda a los residentes a acceder a vivienda, empleo, atención médica y educación de calidad.' },
    tl: { description: 'Libreng mental health support, edukasyon, at advocacy. Nag-aalok ng support groups, educational programs, at 24-hour emergency resources kasama ang mobile outreach safety team at crisis support hotline. Tinutulungan ang mga residente na ma-access ang quality na tirahan, trabaho, healthcare, at edukasyon.' },
    zh: { description: '免费心理健康支持、教育和倡导。提供支持小组、教育项目和24小时紧急资源，包括移动外展安全团队和危机支持热线。帮助居民获得优质住房、就业、医疗和教育。' },
    vi: { description: 'Hỗ trợ sức khỏe tâm thần, giáo dục và vận động miễn phí. Cung cấp nhóm hỗ trợ, chương trình giáo dục và tài nguyên khẩn cấp 24 giờ bao gồm đội an toàn tiếp cận lưu động và đường dây hỗ trợ khủng hoảng. Giúp cư dân tiếp cận nhà ở, việc làm, chăm sóc sức khỏe và giáo dục chất lượng.' },
  },
  'ext-dcfs-mcrt': {
    es: { description: 'Servicios de respuesta y estabilización de crisis móvil para jóvenes menores de 18 años. Proporciona terapia de salud mental comunitaria, manejo de medicamentos, tratamiento diurno de primera infancia y coordinación de atención integral.' },
    tl: { description: 'Mobile crisis response at stabilization services para sa kabataan wala pang 18. Nagbibigay ng community-based mental health therapy, medication management, early childhood day treatment, at wraparound care coordination.' },
    zh: { description: '面向18岁以下青少年的流动危机响应和稳定服务。提供社区心理健康治疗、药物管理、幼儿日间治疗和全方位护理协调。' },
    vi: { description: 'Dịch vụ ứng phó và ổn định khủng hoảng lưu động cho thanh thiếu niên dưới 18 tuổi. Cung cấp trị liệu sức khỏe tâm thần cộng đồng, quản lý thuốc, điều trị ban ngày cho trẻ nhỏ và phối hợp chăm sóc toàn diện.' },
  },
  'ext-reno-behavioral': {
    es: { description: 'Evaluaciones de salud mental gratuitas y confidenciales disponibles 24/7 para ayudar a determinar el mejor plan de tratamiento. Proporciona servicios de salud mental hospitalarios y ambulatorios.', eligibility: 'Evaluaciones gratuitas para todos' },
    tl: { description: 'Libre at confidential na mental health assessments na available 24/7 para matulungang matukoy ang pinakamahusay na treatment plan. Nagbibigay ng inpatient at outpatient mental health services.', eligibility: 'Libreng assessments para sa lahat' },
    zh: { description: '全天候提供免费保密的心理健康评估，帮助确定最佳治疗方案。提供住院和门诊心理健康服务。', eligibility: '免费评估，面向所有人' },
    vi: { description: 'Đánh giá sức khỏe tâm thần miễn phí và bảo mật 24/7 để giúp xác định kế hoạch điều trị tốt nhất. Cung cấp dịch vụ sức khỏe tâm thần nội trú và ngoại trú.', eligibility: 'Đánh giá miễn phí cho tất cả' },
  },
  'ext-washoe-senior-services': {
    es: { description: 'Servicios integrales para adultos de 60+ incluyendo comidas nutritivas, asistencia en el hogar, programas de salud emocional, cuidado residencial y apoyo de gestión financiera. Los programas incluyen servicios de ama de casa, gestión de casos, representante de pagos y hogares grupales.' },
    tl: { description: 'Komprehensibong serbisyo para sa mga adult na 60+ kasama ang masustansiyang pagkain, in-home assistance, emotional health programs, residential care, at financial management support. Kasama sa mga programa ang homemaker services, case management, representative payee, at group homes.' },
    zh: { description: '为60岁以上成年人提供综合服务，包括营养餐食、居家援助、情绪健康项目、居住护理和财务管理支持。项目包括家政服务、案例管理、代理收款人和集体住宅。' },
    vi: { description: 'Dịch vụ toàn diện cho người lớn 60+ bao gồm bữa ăn dinh dưỡng, hỗ trợ tại nhà, chương trình sức khỏe tinh thần, chăm sóc cư trú và hỗ trợ quản lý tài chính. Chương trình bao gồm dịch vụ giúp việc nhà, quản lý trường hợp, người nhận thanh toán đại diện và nhà ở nhóm.' },
  },
  'ext-senior-ride': {
    es: { description: 'Programa de taxi subsidiado para personas mayores. Proporciona asistencia de transporte para citas médicas, compras y otros viajes esenciales.' },
    tl: { description: 'Subsidized na programa ng taxi para sa mga matatanda. Nagbibigay ng tulong sa transportasyon para sa medical appointments, pamimili, at iba pang mahahalagang biyahe.' },
    zh: { description: '为老年人提供的补贴出租车项目。为医疗预约、购物和其他必要出行提供交通援助。' },
    vi: { description: 'Chương trình taxi trợ giá cho người cao tuổi. Cung cấp hỗ trợ giao thông cho cuộc hẹn y tế, mua sắm và các chuyến đi thiết yếu khác.' },
  },
  'ext-fbnn-seniors': {
    es: { description: 'Cajas de alimentos mensuales para personas mayores de 60+ a través del Programa de Alimentos Suplementarios de Productos Básicos del USDA. Proporciona alimentos nutritivos para complementar las dietas de personas mayores de bajos ingresos.' },
    tl: { description: 'Buwanang food boxes para sa mga matatanda 60+ sa pamamagitan ng USDA Commodity Supplemental Food Program. Nagbibigay ng masustansiyang pagkain para dagdagan ang diyeta ng mga low-income na matatanda.' },
    zh: { description: '通过USDA商品补充食品计划为60岁以上老年人提供每月食品箱。为低收入老年人提供营养食品补充饮食。' },
    vi: { description: 'Hộp thực phẩm hàng tháng cho người cao tuổi 60+ thông qua Chương trình Thực phẩm Bổ sung Hàng hóa USDA. Cung cấp thực phẩm dinh dưỡng bổ sung chế độ ăn cho người cao tuổi thu nhập thấp.' },
  },
  'ext-nevadaworks': {
    es: { description: 'Centro integral de servicios gratuitos de carrera incluyendo asistencia en búsqueda de empleo, ayuda con currículum, capacitación en habilidades y consejería de carrera. El programa Good Jobs Northern Nevada proporciona capacitación gratuita en salud, TI, manufactura y logística con servicios de apoyo como cuidado infantil y transporte.' },
    tl: { description: 'One-stop shop para sa libreng career services kasama ang job search assistance, resume help, skills training, at career counseling. Ang Good Jobs Northern Nevada program ay nagbibigay ng libreng training sa healthcare, IT, manufacturing, at logistics na may support services tulad ng childcare at transportasyon.' },
    zh: { description: '一站式免费职业服务中心，包括求职援助、简历帮助、技能培训和职业咨询。Good Jobs Northern Nevada项目提供免费的医疗、IT、制造和物流培训，并附带托儿和交通等支持服务。' },
    vi: { description: 'Trung tâm dịch vụ nghề nghiệp miễn phí toàn diện bao gồm hỗ trợ tìm việc, giúp viết CV, đào tạo kỹ năng và tư vấn nghề nghiệp. Chương trình Good Jobs Northern Nevada cung cấp đào tạo miễn phí về y tế, CNTT, sản xuất và hậu cần với dịch vụ hỗ trợ như giữ trẻ và giao thông.' },
  },
  'ext-csa-workforce': {
    es: { description: 'Servicios de empleo gratuitos para buscadores de empleo de todos los orígenes. Proporciona desarrollo de habilidades, capacitación y elimina barreras al empleo. Conecta a buscadores de empleo con oportunidades en aeroespacial, construcción, salud, TI, manufactura, minería y turismo.' },
    tl: { description: 'Libreng employment services para sa lahat ng uri ng job seekers. Nagbibigay ng skill-building, training, at nag-aalis ng mga hadlang sa employment. Nagkokonekta sa mga job seekers sa mga oportunidad sa aerospace, construction, healthcare, IT, manufacturing, mining, at tourism.' },
    zh: { description: '为各类求职者提供免费就业服务。提供技能培养、培训，消除就业障碍。将求职者与航空航天、建筑、医疗、IT、制造、采矿和旅游业的机会对接。' },
    vi: { description: 'Dịch vụ việc làm miễn phí cho người tìm việc mọi nền tảng. Cung cấp xây dựng kỹ năng, đào tạo và loại bỏ rào cản việc làm. Kết nối người tìm việc với cơ hội trong hàng không vũ trụ, xây dựng, y tế, CNTT, sản xuất, khai thác mỏ và du lịch.' },
  },
  'ext-detr': {
    es: { description: 'Agencia estatal de fuerza laboral que proporciona colocación de empleo, capacitación, seguro de desempleo, servicios para personas con discapacidades e información del mercado laboral. Muchos servicios se proporcionan a través de EmployNV Career Hubs.' },
    tl: { description: 'State workforce agency na nagbibigay ng job placement, training, unemployment insurance, mga serbisyo para sa mga taong may kapansanan, at labor market data. Maraming serbisyo ang ibinibigay sa pamamagitan ng EmployNV Career Hubs.' },
    zh: { description: '州劳动力机构，提供就业安置、培训、失业保险、残障人士服务和劳动市场数据。许多服务通过EmployNV职业中心提供。' },
    vi: { description: 'Cơ quan lao động bang cung cấp giới thiệu việc làm, đào tạo, bảo hiểm thất nghiệp, dịch vụ cho người khuyết tật và dữ liệu thị trường lao động. Nhiều dịch vụ được cung cấp qua các Trung tâm Nghề nghiệp EmployNV.' },
  },
  'ext-childrens-cabinet': {
    es: { description: 'Asistencia de subsidio de cuidado infantil para familias elegibles por ingresos para que puedan trabajar, recibir capacitación laboral o terminar la educación. Los subsidios cubren hasta el 100% de los costos de cuidado infantil con copagos de $0, $90 o $150/mes según los ingresos. Prioridad para niños con necesidades especiales, niños sin hogar y familias de muy bajos ingresos.', eligibility: 'Basado en ingresos (igual o inferior al 41% del Ingreso Mediano Estatal)' },
    tl: { description: 'Child care subsidy assistance para sa income-eligible na pamilya para makapagtrabaho, makapag-job training, o matapos ang edukasyon. Ang mga subsidyo ay sumasaklaw ng hanggang 100% ng child care costs na may copays na $0, $90, o $150/buwan batay sa kita. Priyoridad para sa mga batang may special needs, homeless na bata, at very low-income na pamilya.', eligibility: 'Batay sa kita (katumbas o mas mababa sa 41% ng State Median Income)' },
    zh: { description: '为符合收入条件的家庭提供托儿补贴援助，使他们能够工作、接受职业培训或完成教育。补贴覆盖高达100%的托儿费用，根据收入自付$0、$90或$150/月。优先考虑有特殊需要的儿童、无家可归儿童和极低收入家庭。', eligibility: '基于收入（不超过州中位收入的41%）' },
    vi: { description: 'Hỗ trợ trợ cấp giữ trẻ cho gia đình đủ điều kiện thu nhập để có thể làm việc, đào tạo việc làm hoặc hoàn thành giáo dục. Trợ cấp chi trả đến 100% chi phí giữ trẻ với đồng thanh toán $0, $90 hoặc $150/tháng theo thu nhập. Ưu tiên trẻ có nhu cầu đặc biệt, trẻ vô gia cư và gia đình thu nhập rất thấp.', eligibility: 'Dựa trên thu nhập (bằng hoặc dưới 41% Thu nhập Trung vị Bang)' },
  },
  'ext-rtc-reduced-fare': {
    es: { description: 'Tarifa de autobús reducida de $0.75 (vs $2.00 regular) para personas mayores de 60+, personas con discapacidades o tarjetas de Medicare, y veteranos de EE.UU. Compre pases a través de la aplicación Token Transit.', eligibility: 'Personas mayores 60+, discapacitados, Medicare, veteranos' },
    tl: { description: 'Reduced bus fare na $0.75 (vs $2.00 regular) para sa mga matatanda 60+, mga indibidwal na may kapansanan o Medicare cards, at U.S. Veterans. Bumili ng passes sa Token Transit app.', eligibility: 'Matatanda 60+, may kapansanan, Medicare, Veterans' },
    zh: { description: '为60岁以上老年人、残障人士或持Medicare卡者以及美国退伍军人提供$0.75的优惠巴士票价（正常$2.00）。通过Token Transit应用购买乘车证。', eligibility: '60岁以上老年人、残障人士、Medicare持有者、退伍军人' },
    vi: { description: 'Giảm giá vé xe buýt $0.75 (so với $2.00 thường) cho người cao tuổi 60+, người khuyết tật hoặc có thẻ Medicare và cựu chiến binh Hoa Kỳ. Mua vé qua ứng dụng Token Transit.', eligibility: 'Người cao tuổi 60+, người khuyết tật, Medicare, cựu chiến binh' },
  },
  'ext-access-healthcare-transport': {
    es: { description: 'Transporte médico no urgente GRATUITO para personas mayores, personas con discapacidades y residentes de bajos ingresos en Reno y el Gran Condado de Washoe. El Programa Senior Ambassador proporciona viajes gratuitos para pacientes elegibles de Medicare.', eligibility: 'Personas mayores, discapacitados, bajos ingresos' },
    tl: { description: 'LIBRENG non-emergency medical transportation para sa mga matatanda, disabled na indibidwal, at low-income na residente sa Reno at Greater Washoe County. Ang Senior Ambassador Program ay nagbibigay ng libreng sakay para sa eligible na Medicare patients.', eligibility: 'Matatanda, may kapansanan, mababang kita' },
    zh: { description: '为里诺和大瓦肖县的老年人、残障人士和低收入居民提供免费非紧急医疗交通。老年大使项目为符合条件的Medicare患者提供免费接送。', eligibility: '老年人、残障人士、低收入者' },
    vi: { description: 'Vận chuyển y tế không khẩn cấp MIỄN PHÍ cho người cao tuổi, người khuyết tật và cư dân thu nhập thấp tại Reno và Quận Washoe mở rộng. Chương trình Senior Ambassador cung cấp đi xe miễn phí cho bệnh nhân Medicare đủ điều kiện.', eligibility: 'Người cao tuổi, người khuyết tật, thu nhập thấp' },
  },
  'ext-mtm-medicaid-transport': {
    es: { description: 'Transporte no urgente gratuito para miembros de Medicaid de Nevada a citas cubiertas. Ofrece tarjeta de débito recargable para pases diarios de transporte público. Debe programar viajes con anticipación.', eligibility: 'Miembros de Medicaid de Nevada' },
    tl: { description: 'Libreng non-emergency transportation para sa Nevada Medicaid members patungo sa covered appointments. Nag-aalok ng reloadable debit card para sa public transit day passes. Kailangang i-schedule ang mga sakay nang maaga.', eligibility: 'Nevada Medicaid members' },
    zh: { description: '为内华达州Medicaid会员提供免费非紧急交通，前往受保预约。提供可充值借记卡用于公共交通日票。需提前预约乘车。', eligibility: '内华达州Medicaid会员' },
    vi: { description: 'Vận chuyển không khẩn cấp miễn phí cho thành viên Nevada Medicaid đến các cuộc hẹn được bảo hiểm. Cung cấp thẻ ghi nợ nạp lại cho vé xe công cộng. Phải đặt lịch trước.', eligibility: 'Thành viên Nevada Medicaid' },
  },
  'ext-dav-vans': {
    es: { description: 'Viajes gratuitos en furgoneta hacia y desde el Sistema de Atención Médica VA Sierra Nevada para veteranos que no tienen otras opciones de transporte. Solo pasajeros ambulatorios (capaces de moverse sin asistencia del conductor).', eligibility: 'Veteranos (ambulatorios)' },
    tl: { description: 'Libreng van rides papunta at pabalik sa VA Sierra Nevada Healthcare System para sa mga beterano na walang ibang transportation options. Ambulatory passengers lamang (kayang gumalaw nang walang tulong ng driver).', eligibility: 'Mga beterano (ambulatory)' },
    zh: { description: '为没有其他交通方式的退伍军人提供免费往返VA Sierra Nevada医疗系统的厢式车服务。仅限可步行乘客（能够在无司机协助下行动）。', eligibility: '退伍军人（可步行）' },
    vi: { description: 'Xe van miễn phí đến và từ Hệ thống Y tế VA Sierra Nevada cho cựu chiến binh không có phương tiện giao thông khác. Chỉ hành khách tự đi được (có thể di chuyển không cần hỗ trợ tài xế).', eligibility: 'Cựu chiến binh (tự đi được)' },
  },
  'ext-ndalc': {
    es: { description: 'Sistema de protección y defensa legalmente mandatado por el gobierno federal de Nevada para los derechos humanos, legales y de servicios de personas con discapacidades. Proporciona información, referencia, asistencia técnica, capacitación, defensa legal y no legal, y alcance.' },
    tl: { description: 'Federally-mandated protection at advocacy system ng Nevada para sa human, legal, at service rights ng mga indibidwal na may kapansanan. Nagbibigay ng impormasyon, referral, technical assistance, training, legal at non-legal advocacy, at outreach.' },
    zh: { description: '内华达州联邦授权的保护和倡导系统，保障残障人士的人权、法律和服务权利。提供信息、转介、技术援助、培训、法律和非法律倡导及外展。' },
    vi: { description: 'Hệ thống bảo vệ và vận động theo ủy quyền liên bang của Nevada cho quyền con người, pháp lý và dịch vụ của người khuyết tật. Cung cấp thông tin, giới thiệu, hỗ trợ kỹ thuật, đào tạo, vận động pháp lý và phi pháp lý, và tiếp cận cộng đồng.' },
  },
  'ext-adsd': {
    es: { description: 'Agencia estatal que asegura que adultos mayores y personas con discapacidades tengan acceso a programas y recursos esenciales. Los programas incluyen Asistencia de Tratamiento de Autismo, Oficina de Vida Comunitaria y apoyo de vida independiente.' },
    tl: { description: 'State agency na tinitiyak na ang mga matatandang adulto at indibidwal na may kapansanan ay may access sa mga essential programs at resources. Kasama sa mga programa ang Autism Treatment Assistance, Office of Community Living, at independent living support.' },
    zh: { description: '确保老年人和残障人士获得基本项目和资源的州政府机构。项目包括自闭症治疗援助、社区生活办公室和独立生活支持。' },
    vi: { description: 'Cơ quan bang đảm bảo người cao tuổi và người khuyết tật tiếp cận các chương trình và tài nguyên thiết yếu. Chương trình bao gồm Hỗ trợ Điều trị Tự kỷ, Văn phòng Sống Cộng đồng và hỗ trợ sống độc lập.' },
  },
  'ext-natrc': {
    es: { description: 'Parte del Centro de Excelencia en Discapacidades de Nevada en UNR. Ofrece préstamos de dispositivos, demostraciones y capacitación para ayudar a personas con discapacidades a explorar y usar tecnología asistiva de manera efectiva.' },
    tl: { description: 'Bahagi ng Nevada Center for Excellence in Disabilities sa UNR. Nag-aalok ng device loans, demonstrations, at training para tulungan ang mga indibidwal na may kapansanan na mag-explore at gumamit ng assistive technology nang epektibo.' },
    zh: { description: '内华达大学里诺分校残障卓越中心的一部分。提供设备借用、演示和培训，帮助残障人士有效探索和使用辅助技术。' },
    vi: { description: 'Thuộc Trung tâm Xuất sắc về Khuyết tật Nevada tại UNR. Cung cấp cho mượn thiết bị, trình diễn và đào tạo giúp người khuyết tật khám phá và sử dụng công nghệ hỗ trợ hiệu quả.' },
  },
  'ext-our-center-lgbtq': {
    es: { description: 'Centro seguro, empoderador y de apoyo para la comunidad LGBTQ+. Ofrece grupos de apoyo para jóvenes y miembros trans adultos, grupos comunitarios para personas mayores, iniciativas de prevención, educación e información laboral.' },
    tl: { description: 'Ligtas, empowering, at supportive na center para sa LGBTQ+ community. Nag-aalok ng support groups para sa kabataan at adult trans members, senior community groups, prevention-focused initiatives, edukasyon, at job information.' },
    zh: { description: '为LGBTQ+社区提供安全、赋权和支持的中心。提供青年和成年跨性别成员支持小组、老年社区小组、预防倡议、教育和就业信息。' },
    vi: { description: 'Trung tâm an toàn, trao quyền và hỗ trợ cho cộng đồng LGBTQ+. Cung cấp nhóm hỗ trợ cho thanh thiếu niên và thành viên chuyển giới trưởng thành, nhóm cộng đồng cao tuổi, sáng kiến phòng ngừa, giáo dục và thông tin việc làm.' },
  },
  'ext-nn-pride': {
    es: { description: 'Defensa LGBTQ+, eventos comunitarios y celebraciones del Orgullo. Apoya las actividades de Our Center. Promueve los derechos y el bienestar de la comunidad LGBTQ+ a través de la conciencia pública y eventos.' },
    tl: { description: 'LGBTQ+ advocacy, community events, at Pride celebrations. Sinusuportahan ang mga gawain ng Our Center. Pinapromote ang mga karapatan at kapakanan ng LGBTQ+ community sa pamamagitan ng public awareness at events.' },
    zh: { description: 'LGBTQ+倡导、社区活动和骄傲庆典。支持Our Center的活动。通过公众意识和活动促进LGBTQ+社区的权利和福祉。' },
    vi: { description: 'Vận động LGBTQ+, sự kiện cộng đồng và lễ hội Pride. Hỗ trợ các hoạt động của Our Center. Thúc đẩy quyền lợi và phúc lợi của cộng đồng LGBTQ+ thông qua nâng cao nhận thức và sự kiện.' },
  },
  'ext-hopes-lgbtq-health': {
    es: { description: 'La Clínica de Salud de Género y Sexual de la Familia Barry Frank proporciona atención médica competente culturalmente y sin prejuicios, incluyendo recursos de afirmación de género, gestión de casos y apoyo financiero para personas en transición.' },
    tl: { description: 'Ang Barry Frank Family Gender and Sexual Healthcare Clinic ay nagbibigay ng culturally competent, judgment-free na health care kasama ang gender affirming resources, case management, at financial support para sa mga indibidwal na nagta-transition.' },
    zh: { description: 'Barry Frank家庭性别与性健康诊所提供文化敏感、无偏见的医疗服务，包括性别肯定资源、案例管理和为过渡期个人提供的经济支持。' },
    vi: { description: 'Phòng khám Chăm sóc Sức khỏe Giới tính và Tình dục Gia đình Barry Frank cung cấp chăm sóc y tế nhạy cảm văn hóa, không phán xét, bao gồm tài nguyên khẳng định giới tính, quản lý trường hợp và hỗ trợ tài chính cho người chuyển giới.' },
  },
  'ext-ccsnn-reentry': {
    es: { description: 'Programas de reingreso y recuperación para personas anteriormente encarceladas incluyendo Battle Born Housing Plus y Servicios de Apoyo St. Marguerite. Diseñados para reducir la reincidencia, promover la recuperación, proporcionar necesidades básicas y apoyar la reintegración a largo plazo.' },
    tl: { description: 'Reentry at recovery programs para sa mga dating nakulong na indibidwal kasama ang Battle Born Housing Plus at St. Marguerite Support Services. Dinisenyo para mabawasan ang recidivism, isulong ang recovery, magbigay ng basic needs, at suportahan ang long-term reintegration.' },
    zh: { description: '为曾被监禁者提供的重返社会和康复项目，包括Battle Born Housing Plus和St. Marguerite支持服务。旨在减少累犯率、促进康复、提供基本需求和支持长期重新融入社会。' },
    vi: { description: 'Chương trình tái hòa nhập và phục hồi cho người từng bị giam giữ bao gồm Battle Born Housing Plus và Dịch vụ Hỗ trợ St. Marguerite. Được thiết kế để giảm tái phạm, thúc đẩy phục hồi, cung cấp nhu cầu cơ bản và hỗ trợ tái hòa nhập lâu dài.' },
  },
  'ext-life-changes-reentry': {
    es: { description: 'Servicios de reingreso a nivel estatal para personas liberadas del Departamento de Correcciones de Nevada. Proporciona transporte desde la oficina de libertad condicional, asistencia de admisión, ayuda para comprar necesidades como teléfonos y apoyo continuo.' },
    tl: { description: 'Statewide reentry services para sa mga indibidwal na pinalaya mula sa Nevada Department of Corrections. Nagbibigay ng transportasyon mula sa parole office, intake assistance, tulong sa pagbili ng mga pangangailangan tulad ng mga telepono, at patuloy na suporta.' },
    zh: { description: '面向从内华达州矫正部释放人员的全州重返社会服务。提供从假释办公室的交通、入职协助、帮助购买手机等必需品以及持续支持。' },
    vi: { description: 'Dịch vụ tái hòa nhập toàn tiểu bang cho người được thả từ Sở Cải huấn Nevada. Cung cấp phương tiện từ văn phòng quản chế, hỗ trợ tiếp nhận, giúp mua nhu yếu phẩm như điện thoại và hỗ trợ liên tục.' },
  },
  'ext-nv-energy-assistance': {
    es: { description: 'Programas de asistencia de servicios públicos para clientes que tienen dificultades para pagar facturas de electricidad y gas. Incluye planes de pago, facturación presupuestaria y conexiones con LIHEAP y otros programas de asistencia.' },
    tl: { description: 'Mga utility assistance program para sa mga customer na nahihirapang magbayad ng electric at gas bills. Kasama ang payment plans, budget billing, at connections sa LIHEAP at iba pang assistance programs.' },
    zh: { description: '为难以支付电费和燃气费的客户提供的公用事业援助项目。包括付款计划、预算账单以及与LIHEAP和其他援助项目的对接。' },
    vi: { description: 'Chương trình hỗ trợ tiện ích cho khách hàng gặp khó khăn thanh toán hóa đơn điện và gas. Bao gồm kế hoạch thanh toán, thanh toán ngân sách và kết nối với LIHEAP và các chương trình hỗ trợ khác.' },
  },
  'ext-liheap': {
    es: { description: 'Programa federal que ayuda a hogares de bajos ingresos a pagar facturas de calefacción y refrigeración. Solicite a través de Nevada DWSS. El pago va directamente a la compañía de servicios públicos y cubre facturas vencidas y futuras.', eligibility: 'Ingresos iguales o inferiores al 60% del Ingreso Mediano Estatal' },
    tl: { description: 'Federal program na tumutulong sa low-income na mga sambahayan na magbayad ng heating at cooling bills. Mag-apply sa pamamagitan ng Nevada DWSS. Ang bayad ay direktang napupunta sa utility company at sinasaklaw ang past due at future bills.', eligibility: 'Kita na katumbas o mas mababa sa 60% ng State Median Income' },
    zh: { description: '帮助低收入家庭支付取暖和制冷费用的联邦项目。通过Nevada DWSS申请。付款直接给公用事业公司，涵盖逾期和未来账单。', eligibility: '收入不超过州中位收入的60%' },
    vi: { description: 'Chương trình liên bang giúp hộ gia đình thu nhập thấp thanh toán hóa đơn sưởi ấm và làm mát. Đăng ký qua Nevada DWSS. Thanh toán trực tiếp cho công ty tiện ích, bao gồm hóa đơn quá hạn và tương lai.', eligibility: 'Thu nhập bằng hoặc dưới 60% Thu nhập Trung vị Bang' },
  },
};

// Process each organization
let translated = 0;
let skipped = 0;

for (const org of data.organizations) {
  const t = TRANSLATIONS[org.id];
  if (!t) {
    skipped++;
    continue;
  }

  const translations = {};
  for (const locale of ['es', 'tl', 'zh', 'vi']) {
    const localeData = {};

    // Description from per-org data
    if (t[locale]?.description) {
      localeData.description = t[locale].description;
    }

    // Eligibility: per-org first, then common lookup
    if (t[locale]?.eligibility) {
      localeData.eligibility = t[locale].eligibility;
    } else if (org.eligibility && EL[org.eligibility]?.[locale]) {
      localeData.eligibility = EL[org.eligibility][locale];
    }

    // ServiceArea: common lookup
    if (org.serviceArea && SA[org.serviceArea]?.[locale]) {
      localeData.serviceArea = SA[org.serviceArea][locale];
    }

    if (Object.keys(localeData).length > 0) {
      translations[locale] = localeData;
    }
  }

  if (Object.keys(translations).length > 0) {
    org.translations = translations;
    translated++;
  }
}

// Write back
fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2) + '\n');

console.log(`Done! Translated: ${translated}, Skipped: ${skipped}, Total: ${data.organizations.length}`);
