/* =========================================================
   layout.js — shared page chrome.
   Header, mega menu, mobile drawer, footer and language gate
   are built here once and injected into every page, so the
   navigation cannot drift out of sync between pages.
   ========================================================= */

const MARK = `<svg viewBox="0 0 200 108" aria-hidden="true"><path d="M4 96 L4 76 L64 76 L118 4 L172 76 L196 76 L196 96 L150 96 L118 46 L86 96 Z" fill="currentColor"/><rect x="104" y="62" width="10" height="10" fill="var(--st-approved)"/><rect x="120" y="62" width="10" height="10" fill="var(--st-approved)"/><rect x="104" y="76" width="10" height="10" fill="var(--st-approved)"/><rect x="120" y="76" width="10" height="10" fill="var(--st-approved)"/></svg>`;
/* The parent relationship is stated, but kept typographically
   subordinate — ORT WATT stays the customer-facing brand. */
const PARENT_LABEL = 'A division of ORT B\u00c2TIMENT';

const TICK = `<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8.5l3.5 3.5L13 4.5" stroke="currentColor" stroke-width="2"/></svg>`;

/* Navigation is organised by what a visitor wants to do,
   not by how the company is structured internally. */
const NAV_EQUIP = [
  ['panels','equipment.html?c=panels'],
  ['inverters','equipment.html?c=inverters'],
  ['batteries','equipment.html?c=batteries'],
  ['storage','equipment.html?c=storage'],
  ['controllers','equipment.html?c=controllers'],
  ['protection','equipment.html?c=protection'],
  ['accessories','equipment.html?c=accessories'],
  ['complete','equipment.html?c=complete'],
];

/* Comparison is a tool, not a category, so it sits apart from
   NAV_EQUIP and is rendered separately in the mega menu. */
const NAV_TOOL = ['compare','compare.html'];

function buildGate(){
  const opt = (lang, native, code) => `
        <button class="gate-opt" type="button" data-gate-lang="${lang}">
          <span class="native">${native}</span>
          <span style="display:flex;align-items:center;gap:.85rem">
            <span class="code">${code}</span>
            <span class="arw">&rarr;</span>
          </span>
        </button>`;
  return `
  <div id="gate">
    <div class="gate-arcs" aria-hidden="true"><span></span><span></span><span></span><span></span></div>

    <div class="gate-brand">
      <div>
        <span class="gate-mark">${MARK}</span>
        <h1 class="gate-title">ORT <em>WATT</em></h1>
        <p class="gate-kick" data-t="gate.kicker"></p>
        <p class="gate-claim" data-t="gate.claim"></p>
      </div>
      <p class="gate-foot" data-t="gate.foot"></p>
    </div>

    <div class="gate-pick">
      <p class="gate-sub" data-t="gate.sub"></p>
      <div class="gate-list">
        ${opt('en','English','EN')}
        ${opt('ar','\u0627\u0644\u0639\u0631\u0628\u064a\u0629','AR')}
        ${opt('fr','Fran\u00e7ais','FR')}
      </div>
    </div>
  </div>`;
}

function buildHeader(){
  const equipLinks = NAV_EQUIP.map(([k,href])=>
    `<a href="${href}"><strong data-t="cat.${k}"></strong><span data-t="cat.${k}Sub"></span></a>`).join('');

  return `
  <a class="skip" href="#main" data-t="a11y.skip"></a>
  <header class="hdr">
    <div class="hdr-in">
      <a class="brand" href="index.html" data-t-aria="a11y.home">
        <span class="brand-mark">${MARK}</span>
        <span class="brand-txt">ORT <em>WATT</em></span>
      </a>

      <nav class="nav" data-t-aria="a11y.language">
        <div class="nav-i"><a class="nav-l" href="index.html" data-t="nav.home"></a></div>

        <div class="nav-i">
          <a class="nav-l" href="equipment.html"><span data-t="nav.equipment"></span>
            <svg class="chv" viewBox="0 0 10 6" fill="none"><path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5"/></svg></a>
          <div class="mega">
            <div class="mega-h" data-t="nav.equipmentSub"></div>
            ${equipLinks}
            <div class="mega-side">
              <div>
                <h4 data-t="nav.helpTitle"></h4>
                <p data-t="nav.helpBody"></p>
              </div>
              <a href="help-me-choose.html" class="btn btn-signal btn-sm" data-open-chooser><span data-t="nav.helpCta"></span> <span class="arw">→</span></a>
                <a class="mega-tool" href="${NAV_TOOL[1]}"><span data-t="eq.${NAV_TOOL[0]}"></span> <span class="arw">→</span></a>
            </div>
          </div>
        </div>

        <div class="nav-i">
          <a class="nav-l" href="engineering.html"><span data-t="nav.engineering"></span>
            <svg class="chv" viewBox="0 0 10 6" fill="none"><path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5"/></svg></a>
          <div class="mega narrow">
            <div class="mega-h" data-t="nav.engineeringSub"></div>
            <a href="engineering.html"><strong data-t="nav.engineering"></strong><span data-t="nav.engineeringSub"></span></a>
            <a href="ask-an-engineer.html"><strong data-t="nav.ask"></strong><span data-t="ask.sub"></span></a>
            <a href="solar-study.html"><strong data-t="study.title"></strong><span data-t="study.sub"></span></a>
          </div>
        </div>

        <div class="nav-i">
          <a class="nav-l" href="installation.html"><span data-t="nav.installation"></span></a>
        </div>

        <div class="nav-i">
          <a class="nav-l" href="ort-approved.html"><span data-t="nav.why"></span>
            <svg class="chv" viewBox="0 0 10 6" fill="none"><path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5"/></svg></a>
          <div class="mega narrow">
            <div class="mega-h" data-t="nav.why"></div>
            <a href="ort-approved.html"><strong data-t="label.approved"></strong><span data-t="label.approvedWhat"></span></a>
            <a href="how-we-select.html"><strong data-t="home.funnelKicker"></strong><span data-t="home.funnelTitle"></span></a>
            <a href="transparent-pricing.html"><strong data-t="price.title"></strong><span data-t="price.feeNote"></span></a>
          </div>
        </div>

        <div class="nav-i"><a class="nav-l" href="about.html"><span data-t="nav.about"></span></a></div>
        <div class="nav-i"><a class="nav-l" href="contact.html"><span data-t="nav.contact"></span></a></div>
      </nav>

      <div class="hdr-act">
        <button class="ico" data-open-search data-t-aria="search.open" data-t-title="search.label">
          <svg viewBox="0 0 20 20" fill="none"><circle cx="9" cy="9" r="6" stroke="currentColor" stroke-width="1.6"/><path d="M13.5 13.5L17.5 17.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
        </button>
        <button class="ico theme-t" data-theme-toggle aria-pressed="false">
          <svg class="t-sun" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <circle cx="10" cy="10" r="3.6" stroke="currentColor" stroke-width="1.5"/>
            <path d="M10 1.6v2.2M10 16.2v2.2M1.6 10h2.2M16.2 10h2.2M4.1 4.1l1.6 1.6M14.3 14.3l1.6 1.6M4.1 15.9l1.6-1.6M14.3 5.7l1.6-1.6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <svg class="t-moon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M16.5 12.4A7 7 0 017.6 3.5a7 7 0 108.9 8.9z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
          </svg>
        </button>
        <div class="lang" role="group" data-t-aria="a11y.language">
          <button data-set-lang="en">EN</button>
          <button data-set-lang="ar">ع</button>
          <button data-set-lang="fr">FR</button>
        </div>
        <a class="ico" href="login.html" data-t-aria="a11y.account" data-t-title="a11y.account">
          <svg viewBox="0 0 20 20" fill="none"><circle cx="10" cy="6.5" r="3.2" stroke="currentColor" stroke-width="1.5"/><path d="M3.5 17c.6-3.4 3.3-5.2 6.5-5.2s5.9 1.8 6.5 5.2" stroke="currentColor" stroke-width="1.5"/></svg>
        </a>
        <button class="ico cart-btn" data-open-cart data-t-aria="nav.cart" data-t-title="nav.cart">
          <svg viewBox="0 0 20 20" fill="none"><path d="M2.5 3h2.2l1.9 9.5h8.4l1.6-6.8H6.2" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><circle cx="8" cy="16.2" r="1.4" fill="currentColor"/><circle cx="14.6" cy="16.2" r="1.4" fill="currentColor"/></svg>
          <span class="cart-badge" data-cart-count hidden>0</span>
        </button>
        <a class="btn btn-signal btn-sm hdr-cta" href="ask-an-engineer.html" data-t="nav.ask"></a>
        <button class="ico burger" id="burger" data-t-aria="a11y.openMenu" aria-expanded="false">
          <svg viewBox="0 0 20 20" fill="none"><path d="M2 5h16M2 10h16M2 15h16" stroke="currentColor" stroke-width="1.6"/></svg>
        </button>
      </div>
    </div>
  </header>

  <div class="drawer-scrim" id="drawer-scrim" data-close-drawer></div>
  <div class="drawer" id="drawer" aria-hidden="true">
    <div class="drawer-top">
      <span class="brand"><span class="brand-mark">${MARK}</span><span class="brand-txt">ORT <em>WATT</em></span></span>
      <button class="ico" id="drawer-x" data-t-aria="a11y.closeMenu">
        <svg viewBox="0 0 20 20" fill="none"><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" stroke-width="1.6"/></svg>
      </button>
    </div>

    <a class="drawer-home" href="index.html">
      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M3 9l7-6 7 6v8a1 1 0 01-1 1h-4v-5H8v5H4a1 1 0 01-1-1z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>
      <span data-t="nav.home"></span>
    </a>

    <div class="drawer-g"><h5 data-t="nav.equipment"></h5>
      <a href="equipment.html"><span data-t="eq.all"></span></a>
      ${NAV_EQUIP.map(([k,h])=>`<a href="${h}"><span data-t="cat.${k}"></span></a>`).join('')}
      <a href="compare.html"><span data-t="eq.compare"></span></a>
    </div>

    <div class="drawer-g"><h5 data-t="nav.engineering"></h5>
      <a href="engineering.html"><span data-t="nav.engineering"></span></a>
      <a href="ask-an-engineer.html"><span data-t="nav.ask"></span></a>
      <a href="help-me-choose.html"><span data-t="nav.helpCta"></span></a>
      <a href="solar-study.html"><span data-t="study.title"></span></a>
      <a href="installation.html"><span data-t="nav.installation"></span></a>
      <a href="maintenance-repair.html"><span data-t="nav.maintenance"></span></a>
    </div>

    <div class="drawer-g"><h5 data-t="nav.why"></h5>
      <a href="ort-approved.html"><span data-t="label.approved"></span></a>
      <a href="how-we-select.html"><span data-t="journey.title"></span></a>
      <a href="transparent-pricing.html"><span data-t="price.title"></span></a>
    </div>

    <div class="drawer-g"><h5 data-t="nav.cart"></h5>
      <a href="cart.html"><span data-t="cart.title"></span></a>
      <a href="checkout.html"><span data-t="checkout.title"></span></a>
      <a href="request-quote.html"><span data-t="footer.quote"></span></a>
    </div>

    <div class="drawer-g"><h5 data-t="nav.account"></h5>
      <a href="login.html"><span data-t="nav.login"></span></a>
      <a href="signup.html"><span data-t="nav.signup"></span></a>
      <a href="dashboard.html"><span data-t="account.myAccount"></span></a>
    </div>

    <div class="drawer-g"><h5 data-t="nav.about"></h5>
      <a href="about.html"><span data-t="nav.about"></span></a>
      <a href="contact.html"><span data-t="nav.contact"></span></a>
    </div>

    <div class="drawer-foot">
      <div class="lang" role="group">
        <button data-set-lang="en">EN</button><button data-set-lang="ar">ع</button><button data-set-lang="fr">FR</button>
      </div>
      <button class="ico theme-t" data-theme-toggle aria-pressed="false">
        <svg class="t-sun" viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="10" cy="10" r="3.6" stroke="currentColor" stroke-width="1.5"/><path d="M10 1.6v2.2M10 16.2v2.2M1.6 10h2.2M16.2 10h2.2M4.1 4.1l1.6 1.6M14.3 14.3l1.6 1.6M4.1 15.9l1.6-1.6M14.3 5.7l1.6-1.6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
        <svg class="t-moon" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M16.5 12.4A7 7 0 017.6 3.5a7 7 0 108.9 8.9z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>
      </button>
    </div>
  </div>`;
}

function buildFooter(){
  return `
  <footer class="ftr">
    <div class="ftr-g">
      <div>
        <span class="brand" style="margin-block-end:1.1rem">${MARK}<span class="brand-txt">ORT <em>WATT</em></span></span>
        <p class="sm muted" style="max-inline-size:24rem" data-t="footer.desc"></p>
        <p class="mono xs dim" style="margin-block-start:1.25rem" data-t="footer.division"></p>
      </div>
      <div>
        <h5 data-t="footer.explore"></h5>
        <ul>
          <li><a href="equipment.html" data-t="nav.equipment"></a></li>
          <li><a href="equipment.html?c=complete" data-t="cat.complete"></a></li>
          <li><a href="ort-approved.html" data-t="label.approved"></a></li>
          <li><a href="transparent-pricing.html" data-t="price.title"></a></li>
        </ul>
      </div>
      <div>
        <h5 data-t="footer.help"></h5>
        <ul>
          <li><a href="ask-an-engineer.html" data-t="nav.ask"></a></li>
          <li><a href="solar-study.html" data-t="study.title"></a></li>
          <li><a href="installation.html" data-t="nav.installation"></a></li>
          <li><a href="engineering.html" data-t="nav.engineering"></a></li>
        </ul>
      </div>
      <div>
        <h5 data-t="footer.company"></h5>
        <ul>
          <li><a href="about.html" data-t="nav.about"></a></li>
          <li><a href="contact.html" data-t="nav.contact"></a></li>
          <li><a href="login.html" data-t="nav.login"></a></li>
          <li><a href="signup.html" data-t="nav.signup"></a></li>
        </ul>
      </div>
    </div>
    <div class="ftr-b">
      <span data-t="footer.rights"></span>
      <span data-t="footer.location"></span>
    </div>
  </footer>`;
}


/* ---------- Cart drawer + search overlay ----------
   Both are global chrome, injected once per page next to the
   header so every page gets them without repeating markup. */
function buildOverlays(){
  return `
  <div class="scrim" id="cart-scrim" data-close-cart></div>

  <aside class="cart-drawer" id="cart-drawer" aria-hidden="true" aria-labelledby="cart-drawer-h">
    <div class="cart-top">
      <h2 id="cart-drawer-h" data-t="cart.title"></h2>
      <button class="ico" data-close-cart data-t-aria="common.close">
        <svg viewBox="0 0 20 20" fill="none"><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" stroke-width="1.6"/></svg>
      </button>
    </div>
    <div class="cart-body" id="cart-body"></div>
    <div class="cart-foot" id="cart-foot" hidden></div>
  </aside>

  <div class="search-overlay" id="search-overlay" aria-hidden="true">
    <div class="search-box">
      <div class="search-field">
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="9" cy="9" r="6" stroke="currentColor" stroke-width="1.6"/><path d="M13.5 13.5L17.5 17.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
        <input id="search-input" type="search" autocomplete="off" data-t-ph="search.placeholder" data-t-aria="search.label">
        <button class="ico" data-close-search data-t-aria="search.close">
          <svg viewBox="0 0 20 20" fill="none"><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" stroke-width="1.6"/></svg>
        </button>
      </div>
      <div class="search-results" id="search-results"></div>
    </div>
  </div>`;
}

/* Searches products and a small map of pages. Matching is on
   brand, model, capacity and category so a customer can type
   what they remember rather than the exact product name. */
const SEARCH_PAGES = [
  ['equipment.html','nav.equipment'], ['engineering.html','nav.engineering'],
  ['installation.html','nav.installation'], ['maintenance-repair.html','nav.maintenance'],
  ['ort-approved.html','nav.why'], ['how-we-select.html','journey.title'],
  ['transparent-pricing.html','price.title'], ['solar-study.html','study.title'],
  ['ask-an-engineer.html','nav.ask'], ['compare.html','eq.compare'],
  ['cart.html','cart.title'], ['about.html','nav.about'], ['contact.html','nav.contact'],
];

function runSearch(q){
  const box = document.getElementById('search-results');
  q = (q||'').trim().toLowerCase();
  if(!q){ box.innerHTML=''; return; }

  const prods = ORT_PRODUCTS.filter(p=>{
    const tx = pText(p);
    return `${p.brand} ${p.model} ${p.capacity} ${tx.catLabel}`.toLowerCase().includes(q);
  }).slice(0,6);

  const pages = SEARCH_PAGES.filter(([,k]) => t(k).toLowerCase().includes(q)).slice(0,5);

  if(!prods.length && !pages.length){
    box.innerHTML = `<div class="search-none"><strong>${t('search.none')}</strong><p>${t('search.noneHint')}</p></div>`;
    return;
  }
  box.innerHTML =
    (prods.length ? `<div class="search-grp"><h4>${t('search.products')}</h4>` + prods.map(p=>
      `<a class="search-hit" href="product.html?p=${p.slug}">
         <span class="search-fig">${FIG[p.figure]}</span>
         <span><span class="search-brand">${p.brand}</span>
         <span class="ltr">${p.model}</span></span>
         <span class="badge b-${p.label}">${t('label.'+p.label)}</span>
       </a>`).join('') + '</div>' : '') +
    (pages.length ? `<div class="search-grp"><h4>${t('search.pages')}</h4>` + pages.map(([h,k])=>
      `<a class="search-hit page" href="${h}"><span>${t(k)}</span><span class="arw">→</span></a>`).join('') + '</div>' : '');
}

/* Dismiss the language gate and release the page. */
function dismissGate(){
  const gate = document.getElementById('gate');
  if(!gate) return;
  gate.classList.add('gone');
  gate.setAttribute('aria-hidden','true');
  document.body.style.overflow = '';
}

/* ---------- Mount ---------- */
document.addEventListener('DOMContentLoaded', ()=>{
  const g = document.getElementById('slot-gate');
  const h = document.getElementById('slot-header');
  const f = document.getElementById('slot-footer');
  if(g) g.innerHTML = buildGate();
  if(h) h.innerHTML = buildHeader();
  if(f) f.innerHTML = buildFooter();
  if(typeof buildChooser === 'function') buildChooser();

  // Global chrome: cart drawer and search overlay
  if(h) h.insertAdjacentHTML('beforeend', buildOverlays());

  // Search
  const so = document.getElementById('search-overlay');
  const si = document.getElementById('search-input');
  // Null-guarded. If the overlay ever fails to mount, an unguarded
  // call here throws inside the shared keydown listener and silently
  // kills every handler after it — including the gate's Escape route.
  const openSearch = ()=>{
    if(!so) return;
    so.classList.add('in'); so.setAttribute('aria-hidden','false');
    document.body.style.overflow='hidden'; setTimeout(()=>si?.focus(),60);
  };
  const shutSearch = ()=>{
    if(!so) return;
    so.classList.remove('in'); so.setAttribute('aria-hidden','true');
    document.body.style.overflow=''; if(si) si.value=''; runSearch('');
  };
  // Delegated, for the same reason as the gate: injected markup and
  // direct bindings drift apart too easily.
  document.addEventListener('click', e=>{
    if(e.target.closest('[data-open-search]')){ e.preventDefault(); openSearch(); }
  });
  document.addEventListener('click', e=>{
    if(e.target.closest('[data-close-search]') || e.target === so) shutSearch();
  });
  si?.addEventListener('input', e=> runSearch(e.target.value));
  document.addEventListener('keydown', e=>{
    if(e.key === 'Escape') shutSearch();
    // "/" opens search, the convention on technical sites
    if(e.key === '/' && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)){
      e.preventDefault(); openSearch();
    }
  });

  // Cart badge on first paint
  if(typeof cartRefreshBadge === 'function'){ cartRefreshBadge(); cartRenderDrawer(); }

  // Highlight current page
  const here = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-l').forEach(a=>{
    if((a.getAttribute('href')||'').split('?')[0] === here) a.classList.add('on');
  });

  // Drawer. Closing is bound in several ways because a link to the
  // page you are already on does not navigate, so the drawer has to
  // close itself rather than rely on the page unloading.
  const drawer = document.getElementById('drawer');
  const burger = document.getElementById('burger');
  const dScrim = document.getElementById('drawer-scrim');
  const openDrawer = ()=>{
    drawer.classList.add('open'); dScrim?.classList.add('in');
    burger?.setAttribute('aria-expanded','true');
    drawer.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden';
  };
  const shutDrawer = ()=>{
    drawer?.classList.remove('open'); dScrim?.classList.remove('in');
    burger?.setAttribute('aria-expanded','false');
    drawer?.setAttribute('aria-hidden','true'); document.body.style.overflow='';
  };
  burger?.addEventListener('click', e=>{ e.preventDefault(); openDrawer(); });
  document.getElementById('drawer-x')?.addEventListener('click', shutDrawer);
  document.addEventListener('click', e=>{
    if(e.target.closest('[data-close-drawer]')) shutDrawer();
    // Any link or button inside the drawer dismisses it.
    if(e.target.closest('#drawer a, #drawer [data-open-chooser]')) shutDrawer();
  });
  document.addEventListener('keydown', e=>{ if(e.key==='Escape') shutDrawer(); });
  // If the viewport grows past the mobile breakpoint while the drawer
  // is open, close it so it can't strand the page with overflow hidden.
  window.addEventListener('resize', ()=>{
    if(window.innerWidth > 1100 && drawer?.classList.contains('open')) shutDrawer();
  });

  // Language: gate choice, and header/drawer switching.
  // Delegated on purpose. These controls are injected by script, and a
  // direct binding fails silently if the markup and the selector ever
  // drift apart — which is exactly how the gate once became a dead end.
  document.addEventListener('click', e=>{
    const g = e.target.closest('[data-gate-lang]');
    if(g){
      e.preventDefault();
      ortApplyLanguage(g.dataset.gateLang);
      dismissGate();
      return;
    }
    const sw = e.target.closest('[data-set-lang]');
    if(sw){ e.preventDefault(); ortSwitchLanguage(sw.dataset.setLang); }
  });

  // Keyboard route out of the gate, and a safety net: if the gate is
  // ever shown without working controls, Escape still gets you in.
  document.addEventListener('keydown', e=>{
    const gate = document.getElementById('gate');
    if(!gate || gate.classList.contains('gone')) return;
    if(e.key === 'Escape'){ ortApplyLanguage(ortSavedLanguage() || 'en'); dismissGate(); }
  });

  // Apply saved language, or show the gate to a first time visitor.
  const saved = ortSavedLanguage();
  if(saved){
    ortApplyLanguage(saved);
    document.getElementById('gate')?.classList.add('gone');
  }else{
    ortApplyLanguage('en');
  }

  ortReveal();
});
