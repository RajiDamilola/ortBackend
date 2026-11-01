/* =========================================================
   ORT WATT — Catalogue data
   ---------------------------------------------------------
   Placeholder products, shaped exactly like the server
   returns them. Text that a visitor reads is stored per
   language so the catalogue translates as completely as the
   interface does.

   REPLACE LATER: when staff add real products through the
   admin area, swap ORT_PRODUCTS for the API response.
   ========================================================= */

/* Consistent technical line drawings instead of mismatched
   stock photos. Swap for <img> when real photography exists. */
const FIG = {
  panel:`<svg viewBox="0 0 140 100" fill="none" stroke="currentColor" stroke-linecap="square">
    <rect x="14" y="10" width="112" height="66" stroke-width="1.6"/>
    <path d="M14 32h112M14 54h112M51.3 10v66M88.6 10v66" stroke-width=".9" opacity=".6"/>
    <path d="M46 76l-9 16M94 76l9 16" stroke-width="1.1"/>
    <path d="M30 92h80" stroke-width="1.6"/></svg>`,
  inverter:`<svg viewBox="0 0 140 100" fill="none" stroke="currentColor" stroke-linecap="round">
    <rect x="38" y="6" width="64" height="88" rx="2" stroke-width="1.6"/>
    <rect x="48" y="16" width="44" height="24" stroke-width="1"/>
    <path d="M54 30c4.5-9 9-9 13.5 0s9 9 13.5 0" stroke-width="1.4"/>
    <circle cx="57" cy="56" r="3.4" stroke-width="1"/><circle cx="70" cy="56" r="3.4" stroke-width="1"/>
    <circle cx="83" cy="56" r="3.4" stroke-width="1"/>
    <path d="M50 72h40M50 80h26" stroke-width="1" opacity=".6"/></svg>`,
  battery:`<svg viewBox="0 0 140 100" fill="none" stroke="currentColor" stroke-linecap="square">
    <rect x="18" y="22" width="104" height="60" rx="2" stroke-width="1.6"/>
    <path d="M18 40h104M18 64h104" stroke-width=".9" opacity=".6"/>
    <rect x="40" y="13" width="16" height="9" stroke-width="1.2"/>
    <rect x="84" y="13" width="16" height="9" stroke-width="1.2"/>
    <path d="M72 44l-8 13h10l-8 13" stroke-width="1.5" stroke-linejoin="round"/></svg>`,
  controller:`<svg viewBox="0 0 140 100" fill="none" stroke="currentColor" stroke-linecap="round">
    <rect x="42" y="8" width="56" height="84" rx="2" stroke-width="1.6"/>
    <rect x="52" y="18" width="36" height="20" stroke-width="1"/>
    <path d="M58 50h24M58 60h24M58 70h14" stroke-width="1" opacity=".7"/>
    <circle cx="86" cy="70" r="5" stroke-width="1.2"/></svg>`,
  system:`<svg viewBox="0 0 140 100" fill="none" stroke="currentColor" stroke-linecap="square">
    <rect x="8" y="12" width="48" height="28" stroke-width="1.4"/>
    <path d="M8 26h48M32 12v28" stroke-width=".8" opacity=".6"/>
    <rect x="84" y="10" width="26" height="34" rx="2" stroke-width="1.4"/>
    <rect x="78" y="58" width="40" height="30" rx="2" stroke-width="1.4"/>
    <path d="M78 73h40" stroke-width=".8" opacity=".6"/>
    <path d="M56 26h28M97 44v14M64 34v42h14" stroke-width="1" stroke-dasharray="3 3" opacity=".8"/></svg>`,
};

/* Contact channel used by the "ask on WhatsApp" buttons.
   Digits only, no plus sign or spaces — that is the format wa.me needs. */
const ORT_WHATSAPP = '22961632589';

/* Where cart enquiries sent by email arrive. */
const ORT_ORDERS_EMAIL = 'orders@ortwatt.com';

/* Builds a wa.me link with the message pre-filled, so the customer does
   not have to explain which product they are looking at. */
function ortWhatsApp(product){
  const msg = product
    ? t('wa.productMsg', { name: `${product.brand} ${product.model}` })
    : t('wa.generalMsg');
  return `https://wa.me/${ORT_WHATSAPP}?text=${encodeURIComponent(msg)}`;
}

const ORT_PRODUCTS = [
  {
    slug:'deye-sun-6k-sg04lp3', brand:'Deye', model:'SUN-6K-SG04LP3',
    category:'inverters', figure:'inverter', capacity:'6 kW',
    referencePrice:836, feePercent:10, verifiedOn:'2026-08-12',
    score:4.7, label:'approved', mode:'buy', availability:'inStock',
    scores:{ reliability:4.8, value:4.9, performance:4.7, warranty:4.5, parts:4.6 },
    i18n:{
      en:{
        catLabel:'Hybrid inverter',
        whatIs:'A hybrid inverter is the brain of a solar system. It converts what the panels produce into electricity your appliances can use, charges the battery, and switches between solar, battery and grid automatically.',
        whoFor:'Homes and small businesses that want both lower bills and backup during outages.',
        why:['Works with every lithium battery in our approved list, so you are not locked in',
             'Strong reliability record in hot climates, where cheaper units tend to fail',
             'Spare parts held regionally rather than shipped per incident',
             'Manufacturer support actually responds, which is rarer than it should be',
             'Best price against performance in the 6 kW class we compared'],
        goodFor:['Larger homes','Small businesses','Backup power systems','Hybrid solar systems'],
        notIdeal:['Very small installations under 2 kW','Systems needing three phase supply'],
        specs:{'Rated power':'6 000 W','Phase':'Single phase','Battery voltage':'48 V','MPPT trackers':'2',
               'Max PV input':'7 800 W','Peak efficiency':'97.6 %','Warranty':'5 years','Protection rating':'IP65'},
      },
      fr:{
        catLabel:'Onduleur hybride',
        whatIs:'Un onduleur hybride est le cerveau d\u2019une installation solaire. Il convertit la production des panneaux en électricité utilisable, charge la batterie et bascule automatiquement entre solaire, batterie et réseau.',
        whoFor:'Maisons et petites entreprises qui veulent à la fois réduire leur facture et disposer d\u2019une autonomie pendant les coupures.',
        why:['Compatible avec toutes les batteries lithium de notre liste approuvée, sans enfermement',
             'Bon historique de fiabilité en climat chaud, où les modèles bon marché lâchent',
             'Pièces détachées stockées régionalement plutôt qu\u2019expédiées au cas par cas',
             'Le support du fabricant répond réellement, ce qui est plus rare qu\u2019on ne le croit',
             'Meilleur rapport prix/performance de la catégorie 6 kW comparée'],
        goodFor:['Grandes maisons','Petites entreprises','Systèmes de secours','Installations hybrides'],
        notIdeal:['Très petites installations sous 2 kW','Systèmes nécessitant du triphasé'],
        specs:{'Puissance nominale':'6 000 W','Phase':'Monophasé','Tension batterie':'48 V','Trackers MPPT':'2',
               'Entrée PV max':'7 800 W','Rendement maximal':'97,6 %','Garantie':'5 ans','Indice de protection':'IP65'},
      },
      ar:{
        catLabel:'عاكس هجين',
        whatIs:'العاكس الهجين هو عقل النظام الشمسي. يحوّل ما تنتجه الألواح إلى كهرباء تستخدمها أجهزتك، ويشحن البطارية، وينتقل تلقائياً بين الطاقة الشمسية والبطارية والشبكة.',
        whoFor:'المنازل والشركات الصغيرة التي تريد خفض الفاتورة والحصول على طاقة احتياطية أثناء الانقطاع.',
        why:['يعمل مع كل بطاريات الليثيوم في قائمتنا المعتمدة، فلا تُقيَّد بخيار واحد',
             'سجل موثوقية قوي في المناخ الحار، حيث تفشل الأجهزة الأرخص عادة',
             'قطع الغيار متوفرة إقليمياً بدل شحنها عند كل عطل',
             'دعم المصنّع يستجيب فعلاً، وهو أمر أندر مما ينبغي',
             'أفضل نسبة سعر إلى أداء في فئة ٦ كيلوواط التي قارنّاها'],
        goodFor:['المنازل الكبيرة','الشركات الصغيرة','أنظمة الطاقة الاحتياطية','الأنظمة الشمسية الهجينة'],
        notIdeal:['التركيبات الصغيرة جداً دون ٢ كيلوواط','الأنظمة التي تحتاج تغذية ثلاثية الأطوار'],
        specs:{'القدرة الاسمية':'٦٠٠٠ واط','الأطوار':'طور واحد','جهد البطارية':'٤٨ فولت','متتبعات MPPT':'٢',
               'أقصى دخل شمسي':'٧٨٠٠ واط','أعلى كفاءة':'٩٧٫٦٪','الضمان':'٥ سنوات','درجة الحماية':'IP65'},
      },
    },
  },
  {
    slug:'ja-solar-jam72s30-545', brand:'JA Solar', model:'JAM72S30 545/MR',
    category:'panels', figure:'panel', capacity:'545 W',
    referencePrice:129, feePercent:10, verifiedOn:'2026-08-12',
    score:4.8, label:'approved', mode:'buy', availability:'inStock',
    scores:{ reliability:4.9, value:4.8, performance:4.8, warranty:4.7, parts:4.5 },
    i18n:{
      en:{
        catLabel:'Monocrystalline panel',
        whatIs:'A solar panel converts sunlight into electricity. This is a large, high output panel intended for roof or ground mounted arrays rather than small portable use.',
        whoFor:'Any installation with the roof space to take full size panels, which is most homes and businesses.',
        why:['Efficiency holds up in high ambient heat, where many panels quietly lose output',
             'Degradation warranty is among the strongest terms available',
             'Manufacturing quality is consistent between production batches',
             'Widely stocked, so replacing one panel years later is realistic'],
        goodFor:['Roof mounted arrays','Ground mounted arrays','Homes and businesses','Hot climates'],
        notIdeal:['Small or awkwardly shaped roofs','Portable or vehicle installations'],
        specs:{'Rated power':'545 W','Cell type':'Monocrystalline PERC','Module efficiency':'21.1 %',
               'Dimensions':'2 278 × 1 134 × 35 mm','Weight':'28.6 kg','Product warranty':'12 years',
               'Performance warranty':'25 years','Temperature coefficient':'-0.350 %/°C'},
      },
      fr:{
        catLabel:'Panneau monocristallin',
        whatIs:'Un panneau solaire convertit la lumière en électricité. Celui-ci est un grand panneau à forte puissance, destiné aux installations en toiture ou au sol plutôt qu\u2019à un usage portable.',
        whoFor:'Toute installation disposant de la surface nécessaire pour des panneaux pleine taille, soit la plupart des maisons et entreprises.',
        why:['Le rendement tient sous forte chaleur, là où beaucoup de panneaux perdent discrètement en production',
             'La garantie de dégradation figure parmi les meilleures du marché',
             'Qualité de fabrication constante d\u2019un lot de production à l\u2019autre',
             'Largement stocké : remplacer un panneau des années plus tard reste réaliste'],
        goodFor:['Installations en toiture','Installations au sol','Maisons et entreprises','Climats chauds'],
        notIdeal:['Toitures petites ou de forme complexe','Installations portables ou sur véhicule'],
        specs:{'Puissance nominale':'545 W','Type de cellule':'Monocristallin PERC','Rendement du module':'21,1 %',
               'Dimensions':'2 278 × 1 134 × 35 mm','Poids':'28,6 kg','Garantie produit':'12 ans',
               'Garantie de performance':'25 ans','Coefficient de température':'-0,350 %/°C'},
      },
      ar:{
        catLabel:'لوح أحادي البلورة',
        whatIs:'يحوّل اللوح الشمسي ضوء الشمس إلى كهرباء. وهذا لوح كبير عالي الإنتاج، مخصص للتركيب على الأسطح أو الأرض لا للاستخدام المتنقل.',
        whoFor:'أي تركيب تتوفر فيه مساحة كافية للألواح كاملة الحجم، وهو حال معظم المنازل والشركات.',
        why:['الكفاءة تصمد في الحرارة المرتفعة، حيث تفقد ألواح كثيرة إنتاجها بهدوء',
             'ضمان التدهور من أقوى الشروط المتاحة',
             'جودة تصنيع متسقة بين دفعات الإنتاج',
             'متوفر على نطاق واسع، فاستبدال لوح واحد بعد سنوات يبقى ممكناً'],
        goodFor:['التركيب على الأسطح','التركيب الأرضي','المنازل والشركات','المناخات الحارة'],
        notIdeal:['الأسطح الصغيرة أو غير المنتظمة','التركيبات المتنقلة أو على المركبات'],
        specs:{'القدرة الاسمية':'٥٤٥ واط','نوع الخلية':'أحادي البلورة PERC','كفاءة الوحدة':'٢١٫١٪',
               'الأبعاد':'٢٢٧٨ × ١١٣٤ × ٣٥ ملم','الوزن':'٢٨٫٦ كغ','ضمان المنتج':'١٢ سنة',
               'ضمان الأداء':'٢٥ سنة','معامل الحرارة':'-٠٫٣٥٠٪/°م'},
      },
    },
  },
  {
    slug:'pylontech-force-h2', brand:'Pylontech', model:'Force-H2 US5000',
    category:'batteries', figure:'battery', capacity:'4.8 kWh',
    referencePrice:1073, feePercent:10, verifiedOn:'2026-08-12',
    score:4.6, label:'approved', mode:'buy', availability:'inStock',
    scores:{ reliability:4.7, value:4.5, performance:4.6, warranty:4.6, parts:4.5 },
    i18n:{
      en:{
        catLabel:'Lithium battery',
        whatIs:'A battery stores the electricity your panels produce but you do not use immediately, so it is available in the evening or when the grid goes down.',
        whoFor:'Anyone who needs power to continue during an outage, or who wants to use solar generation after dark.',
        why:['Cycle life verified against the datasheet rather than taken on trust',
             'Compatible with every inverter on our approved list',
             'Supplier has a dependable support history with us',
             'Modules stack, so capacity can be added later without replacing what you have'],
        goodFor:['Evening use of solar power','Backup during outages','Systems that may grow later'],
        notIdeal:['Very large industrial storage','Installations needing high voltage architecture'],
        specs:{'Usable capacity':'4.8 kWh','Chemistry':'LiFePO₄','Nominal voltage':'48 V',
               'Cycle life':'6 000 at 80% depth of discharge','Maximum modules':'16',
               'Warranty':'10 years','Protection rating':'IP20'},
      },
      fr:{
        catLabel:'Batterie lithium',
        whatIs:'Une batterie stocke l\u2019électricité produite par vos panneaux et non consommée immédiatement, pour en disposer le soir ou lors d\u2019une coupure.',
        whoFor:'Toute personne devant conserver du courant pendant une coupure, ou souhaitant utiliser sa production solaire après la tombée du jour.',
        why:['Durée de vie en cycles vérifiée sur la fiche technique, pas acceptée sur parole',
             'Compatible avec tous les onduleurs de notre liste approuvée',
             'Le fournisseur a un historique de support fiable avec nous',
             'Modules empilables : la capacité peut être augmentée sans tout remplacer'],
        goodFor:['Utilisation du solaire en soirée','Secours pendant les coupures','Systèmes évolutifs'],
        notIdeal:['Stockage industriel de très grande taille','Architectures haute tension'],
        specs:{'Capacité utile':'4,8 kWh','Chimie':'LiFePO₄','Tension nominale':'48 V',
               'Cycles':'6 000 à 80% de décharge','Modules maximum':'16',
               'Garantie':'10 ans','Indice de protection':'IP20'},
      },
      ar:{
        catLabel:'بطارية ليثيوم',
        whatIs:'تخزّن البطارية الكهرباء التي تنتجها الألواح ولا تستهلكها فوراً، لتكون متاحة مساءً أو عند انقطاع التيار.',
        whoFor:'كل من يحتاج استمرار الكهرباء أثناء الانقطاع، أو يريد استخدام إنتاج الطاقة الشمسية بعد الغروب.',
        why:['تم التحقق من عمر الدورات مقابل ورقة البيانات بدل الأخذ بالثقة',
             'متوافقة مع كل العواكس في قائمتنا المعتمدة',
             'للمورد سجل دعم موثوق معنا',
             'الوحدات قابلة للتركيب فوق بعضها، فيمكن زيادة السعة لاحقاً دون استبدال ما لديك'],
        goodFor:['استخدام الطاقة الشمسية مساءً','الاحتياط أثناء الانقطاع','الأنظمة القابلة للتوسع لاحقاً'],
        notIdeal:['التخزين الصناعي الضخم','التركيبات التي تحتاج بنية جهد عالٍ'],
        specs:{'السعة القابلة للاستخدام':'٤٫٨ ك.و.س','الكيمياء':'LiFePO₄','الجهد الاسمي':'٤٨ فولت',
               'عمر الدورات':'٦٠٠٠ عند عمق تفريغ ٨٠٪','أقصى عدد وحدات':'١٦',
               'الضمان':'١٠ سنوات','درجة الحماية':'IP20'},
      },
    },
  },
  {
    slug:'srne-hf2430u60-100', brand:'SRNE', model:'HF2430U60-100',
    category:'controllers', figure:'controller', capacity:'60 A',
    referencePrice:172, feePercent:10, verifiedOn:'2026-08-12',
    score:4.4, label:'verified', mode:'buy', availability:'onRequest',
    scores:{ reliability:4.5, value:4.7, performance:4.4, warranty:4.1, parts:4.2 },
    i18n:{
      en:{
        catLabel:'MPPT charge controller',
        whatIs:'A charge controller sits between the panels and the battery, regulating how the battery is charged so it is not damaged and the panels are used efficiently.',
        whoFor:'Simpler off grid setups where a full hybrid inverter would be more than the job needs.',
        why:['Tracking efficiency measured close to the published figure',
             'Straightforward to configure on site, which matters for remote installations',
             'Sensible choice where a full hybrid inverter is unnecessary'],
        goodFor:['Small off grid systems','Cabins and remote sites','Adding panels to an existing battery'],
        notIdeal:['Systems that also need grid interaction','Installations planning to expand significantly'],
        specs:{'Rated current':'60 A','System voltage':'12 / 24 V automatic','Max PV input':'100 V',
               'Tracking efficiency':'99.5 %','Display':'LCD','Warranty':'2 years'},
      },
      fr:{
        catLabel:'Régulateur de charge MPPT',
        whatIs:'Un régulateur de charge se place entre les panneaux et la batterie et contrôle la charge, afin de ne pas abîmer la batterie et d\u2019exploiter efficacement les panneaux.',
        whoFor:'Installations hors réseau simples, où un onduleur hybride complet serait surdimensionné.',
        why:['Rendement de suivi mesuré proche de la valeur annoncée',
             'Configuration simple sur site, ce qui compte pour les installations isolées',
             'Choix pertinent quand un onduleur hybride complet est inutile'],
        goodFor:['Petits systèmes hors réseau','Chalets et sites isolés','Ajout de panneaux à une batterie existante'],
        notIdeal:['Systèmes nécessitant une interaction réseau','Installations destinées à beaucoup s\u2019agrandir'],
        specs:{'Courant nominal':'60 A','Tension système':'12 / 24 V automatique','Entrée PV max':'100 V',
               'Rendement de suivi':'99,5 %','Affichage':'LCD','Garantie':'2 ans'},
      },
      ar:{
        catLabel:'منظم شحن MPPT',
        whatIs:'يقع منظم الشحن بين الألواح والبطارية، وينظّم طريقة الشحن حتى لا تتضرر البطارية وتُستغل الألواح بكفاءة.',
        whoFor:'الأنظمة المستقلة البسيطة، حيث يكون العاكس الهجين الكامل أكثر مما يتطلبه العمل.',
        why:['كفاءة التتبع قريبة من الرقم المعلن عند القياس',
             'سهل الضبط في الموقع، وهو أمر مهم في التركيبات النائية',
             'خيار منطقي حين لا يكون العاكس الهجين الكامل ضرورياً'],
        goodFor:['الأنظمة المستقلة الصغيرة','الاستراحات والمواقع النائية','إضافة ألواح إلى بطارية قائمة'],
        notIdeal:['الأنظمة التي تحتاج تفاعلاً مع الشبكة','التركيبات المخطط لتوسعها كثيراً'],
        specs:{'التيار الاسمي':'٦٠ أمبير','جهد النظام':'١٢ / ٢٤ فولت تلقائي','أقصى دخل شمسي':'١٠٠ فولت',
               'كفاءة التتبع':'٩٩٫٥٪','الشاشة':'LCD','الضمان':'سنتان'},
      },
    },
  },
  {
    slug:'ort-home-6kw-10kwh', brand:'ORT WATT', model:'Home 6kW / 10kWh',
    category:'complete', figure:'system', capacity:'6 kW · 10 kWh',
    referencePrice:4227, feePercent:10, verifiedOn:'2026-08-12',
    score:4.9, label:'premium', mode:'buy', availability:'onRequest',
    scores:{ reliability:4.9, value:4.8, performance:4.9, warranty:4.9, parts:4.8 },
    i18n:{
      en:{
        catLabel:'Complete system',
        whatIs:'A complete system is panels, inverter and battery chosen to work together and supplied as one package, rather than three separate purchases you have to make compatible yourself.',
        whoFor:'Households that want the whole problem solved once, with one warranty conversation instead of three.',
        why:['Panels, inverter and battery matched by our engineers as a single system',
             'Sized for a typical household with backup through the evening',
             'One warranty conversation instead of three separate ones',
             'Installation and commissioning can be coordinated by ORT'],
        goodFor:['Typical family homes','First time solar buyers','Anyone wanting a single point of responsibility'],
        notIdeal:['Very large properties','Sites with unusual three phase requirements'],
        specs:{'System power':'6 kW','Usable storage':'9.6 kWh','Panels':'12 × 545 W',
               'Inverter':'6 kW hybrid','Typical backup':'Approximately 8 hours',
               'Warranty':'System level, 5 years','Installation':'Available through ORT'},
      },
      fr:{
        catLabel:'Système complet',
        whatIs:'Un système complet réunit panneaux, onduleur et batterie choisis pour fonctionner ensemble et livrés en un seul ensemble, au lieu de trois achats séparés à rendre compatibles soi-même.',
        whoFor:'Les foyers qui veulent régler tout le problème d\u2019un coup, avec une seule garantie au lieu de trois.',
        why:['Panneaux, onduleur et batterie assortis par nos ingénieurs comme un seul système',
             'Dimensionné pour un foyer type avec autonomie en soirée',
             'Un seul interlocuteur garantie au lieu de trois',
             'Installation et mise en service coordonnées par ORT'],
        goodFor:['Maisons familiales classiques','Premiers achats solaires','Ceux qui veulent un seul responsable'],
        notIdeal:['Très grandes propriétés','Sites avec besoins triphasés particuliers'],
        specs:{'Puissance du système':'6 kW','Stockage utile':'9,6 kWh','Panneaux':'12 × 545 W',
               'Onduleur':'hybride 6 kW','Autonomie typique':'Environ 8 heures',
               'Garantie':'Au niveau système, 5 ans','Installation':'Disponible via ORT'},
      },
      ar:{
        catLabel:'نظام متكامل',
        whatIs:'النظام المتكامل هو ألواح وعاكس وبطارية اختيرت لتعمل معاً وتُورَّد كحزمة واحدة، بدل ثلاث عمليات شراء منفصلة عليك أن توفّق بينها بنفسك.',
        whoFor:'الأسر التي تريد حل المسألة كاملة مرة واحدة، بضمان واحد بدل ثلاثة.',
        why:['ألواح وعاكس وبطارية طابقها مهندسونا كنظام واحد',
             'محدد الحجم لأسرة نموذجية مع طاقة احتياطية تغطي المساء',
             'محادثة ضمان واحدة بدل ثلاث منفصلة',
             'يمكن لـ ORT تنسيق التركيب والتشغيل'],
        goodFor:['المنازل العائلية النموذجية','المشترين لأول مرة','من يريد جهة مسؤولة واحدة'],
        notIdeal:['العقارات الكبيرة جداً','المواقع ذات متطلبات ثلاثية الأطوار غير معتادة'],
        specs:{'قدرة النظام':'٦ كيلوواط','التخزين القابل للاستخدام':'٩٫٦ ك.و.س','الألواح':'١٢ × ٥٤٥ واط',
               'العاكس':'هجين ٦ كيلوواط','الاحتياط النموذجي':'نحو ٨ ساعات',
               'الضمان':'على مستوى النظام، ٥ سنوات','التركيب':'متاح عبر ORT'},
      },
    },
  },
  {
    slug:'felicity-lpbf48200', brand:'Felicity', model:'LPBF48200',
    category:'batteries', figure:'battery', capacity:'10 kWh',
    referencePrice:1445, feePercent:10, verifiedOn:'2026-08-12',
    score:4.3, label:'selected', mode:'buy', availability:'onRequest',
    scores:{ reliability:4.3, value:4.6, performance:4.3, warranty:4.2, parts:4.0 },
    i18n:{
      en:{
        catLabel:'Lithium battery',
        whatIs:'A larger capacity lithium battery, offering more storage per unit than a stacked modular system at the cost of less flexibility.',
        whoFor:'Installations that need substantial storage in one unit and have the floor space for it.',
        why:['Large usable capacity for the price in this segment',
             'Suited to installations where floor space is not constrained',
             'Compatibility verified with our approved hybrid inverters'],
        goodFor:['Larger backup requirements','Installations with available floor space','Budget conscious storage'],
        notIdeal:['Small spaces','Systems needing gradual capacity expansion'],
        specs:{'Usable capacity':'10 kWh','Chemistry':'LiFePO₄','Nominal voltage':'48 V',
               'Cycle life':'4 000 at 80% depth of discharge','Warranty':'5 years','Protection rating':'IP20'},
      },
      fr:{
        catLabel:'Batterie lithium',
        whatIs:'Une batterie lithium de plus grande capacité, offrant davantage de stockage par unité qu\u2019un système modulaire empilé, au prix d\u2019une moindre flexibilité.',
        whoFor:'Installations nécessitant un stockage important en une seule unité et disposant de la place au sol.',
        why:['Grande capacité utile pour le prix dans ce segment',
             'Adaptée aux installations où la place au sol n\u2019est pas limitée',
             'Compatibilité vérifiée avec nos onduleurs hybrides approuvés'],
        goodFor:['Besoins d\u2019autonomie importants','Installations avec place au sol disponible','Stockage à budget maîtrisé'],
        notIdeal:['Espaces réduits','Systèmes nécessitant une extension progressive'],
        specs:{'Capacité utile':'10 kWh','Chimie':'LiFePO₄','Tension nominale':'48 V',
               'Cycles':'4 000 à 80% de décharge','Garantie':'5 ans','Indice de protection':'IP20'},
      },
      ar:{
        catLabel:'بطارية ليثيوم',
        whatIs:'بطارية ليثيوم بسعة أكبر، توفّر تخزيناً أعلى للوحدة الواحدة مقارنة بالأنظمة الوحدوية القابلة للتركيب، مقابل مرونة أقل.',
        whoFor:'التركيبات التي تحتاج تخزيناً كبيراً في وحدة واحدة وتتوفر لها المساحة الأرضية.',
        why:['سعة كبيرة قابلة للاستخدام مقابل السعر في هذه الفئة',
             'مناسبة للتركيبات التي لا تعاني ضيق المساحة',
             'تم التحقق من توافقها مع عواكسنا الهجينة المعتمدة'],
        goodFor:['احتياجات احتياطية كبيرة','التركيبات ذات المساحة المتاحة','التخزين المراعي للميزانية'],
        notIdeal:['المساحات الضيقة','الأنظمة التي تحتاج توسعاً تدريجياً للسعة'],
        specs:{'السعة القابلة للاستخدام':'١٠ ك.و.س','الكيمياء':'LiFePO₄','الجهد الاسمي':'٤٨ فولت',
               'عمر الدورات':'٤٠٠٠ عند عمق تفريغ ٨٠٪','الضمان':'٥ سنوات','درجة الحماية':'IP20'},
      },
    },
  },
];

const ORT_CATEGORIES = [
  { slug:'complete',    key:'complete'    },
  { slug:'panels',      key:'panels'      },
  { slug:'inverters',   key:'inverters'   },
  { slug:'batteries',   key:'batteries'   },
  { slug:'controllers', key:'controllers' },
];

/* Pricing is always derived so the breakdown can never
   disagree with the total shown. */
function ortPrice(p){
  const fee = Math.round(p.referencePrice * p.feePercent / 100);
  return { ref:p.referencePrice, fee, total:p.referencePrice + fee };
}

/* Returns the product's text in the language now selected. */
function pText(p) {
  const text = p.i18n || {};
  return text[ORT_LANG] || text.en || {
    catLabel: p.category || 'Equipment',
    whatIs: '',
    whoFor: '',
    why: [],
    goodFor: [],
    notIdeal: [],
    specs: {}
  };
}
/* Plain-language verdict for a score, so a visitor does not
   have to interpret a number on their own. */
function scoreWord(n){
  if(n >= 4.7) return t('score.excellent');
  if(n >= 4.3) return t('score.verygood');
  if(n >= 3.8) return t('score.good');
  return t('score.fair');
}
