/* =========================================================
   ORT WATT — Translation engine
   ---------------------------------------------------------
   Fixes the architectural problem: nothing is hardcoded in a
   component. Every visible string is a key.

   Markup usage:
     data-t="nav.equipment"            → element text
     data-t-html="hero.line"           → allows inline tags
     data-t-ph="form.namePlaceholder"  → input placeholder
     data-t-aria="a11y.openMenu"       → aria-label
     data-t-title="a11y.account"       → title attribute
     data-t-alt="..."                  → img alt

   From JavaScript:  t('form.required')  →  translated string
   With variables:   t('cat.count', {n: 6})

   Numbers and currency are formatted per locale, so Arabic
   shows Arabic-Indic digits where appropriate.
   ========================================================= */

const ORT_LANGS = {
  en: { name:'English',  native:'English',  dir:'ltr', locale:'en-US' },
  ar: { name:'Arabic',   native:'العربية',  dir:'rtl', locale:'ar-AE' },
  fr: { name:'French',   native:'Français', dir:'ltr', locale:'fr-FR' },
};

let ORT_LANG = 'en';

/* Look up a dotted key like "nav.equipment" in the dictionary. */
function tRaw(key, lang){
  const dict = ORT_STRINGS[lang] || ORT_STRINGS.en;
  let v = key.split('.').reduce((o,k)=> (o && o[k] !== undefined) ? o[k] : undefined, dict);
  if(v === undefined && lang !== 'en'){
    // Fall back to English rather than showing a raw key to a visitor.
    v = key.split('.').reduce((o,k)=> (o && o[k] !== undefined) ? o[k] : undefined, ORT_STRINGS.en);
    if(v !== undefined) console.warn('[i18n] missing', lang, key);
  }
  return v;
}

/* Public translate function, with {variable} interpolation. */
function t(key, vars){
  let s = tRaw(key, ORT_LANG);
  if(s === undefined){ console.warn('[i18n] unknown key', key); return key; }
  if(vars) for(const [k,v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, v);
  return s;
}

/* Locale-aware number and money formatting. */
function tNum(n){
  return new Intl.NumberFormat(ORT_LANGS[ORT_LANG].locale).format(n);
}
function tMoney(n){
  // Prices stay in USD across all languages, per the brand rules.
  return new Intl.NumberFormat(ORT_LANGS[ORT_LANG].locale, {
    style:'currency', currency:'USD', maximumFractionDigits:0,
  }).format(n);
}
function tScore(n){
  return new Intl.NumberFormat(ORT_LANGS[ORT_LANG].locale, {
    minimumFractionDigits:1, maximumFractionDigits:1,
  }).format(n);
}
function tDate(iso){
  try{
    return new Intl.DateTimeFormat(ORT_LANGS[ORT_LANG].locale, {
      year:'numeric', month:'long', day:'numeric',
    }).format(new Date(iso));
  }catch{ return iso; }
}

/* Apply the current language to the whole document. */
function ortApplyLanguage(lang, { rerender = true } = {}){
  if(!ORT_LANGS[lang]) lang = 'en';
  ORT_LANG = lang;
  const cfg = ORT_LANGS[lang];

  document.documentElement.lang = lang;
  document.documentElement.dir = cfg.dir;
  document.documentElement.setAttribute('data-lang', lang);

  document.querySelectorAll('[data-t]').forEach(el=>{
    const v = tRaw(el.getAttribute('data-t'), lang);
    if(v !== undefined) el.textContent = v;
  });
  document.querySelectorAll('[data-t-html]').forEach(el=>{
    const v = tRaw(el.getAttribute('data-t-html'), lang);
    if(v !== undefined) el.innerHTML = v;
  });
  document.querySelectorAll('[data-t-ph]').forEach(el=>{
    const v = tRaw(el.getAttribute('data-t-ph'), lang);
    if(v !== undefined) el.placeholder = v;
  });
  document.querySelectorAll('[data-t-aria]').forEach(el=>{
    const v = tRaw(el.getAttribute('data-t-aria'), lang);
    if(v !== undefined) el.setAttribute('aria-label', v);
  });
  document.querySelectorAll('[data-t-title]').forEach(el=>{
    const v = tRaw(el.getAttribute('data-t-title'), lang);
    if(v !== undefined) el.setAttribute('title', v);
  });
  document.querySelectorAll('[data-t-alt]').forEach(el=>{
    const v = tRaw(el.getAttribute('data-t-alt'), lang);
    if(v !== undefined) el.setAttribute('alt', v);
  });

  // Page <title> and meta description, for SEO in each language.
  const tk = document.body?.getAttribute('data-page-title');
  if(tk){ const v = tRaw(tk, lang); if(v) document.title = v + ' — ORT WATT'; }
  const dk = document.body?.getAttribute('data-page-desc');
  if(dk){
    const v = tRaw(dk, lang);
    const m = document.querySelector('meta[name="description"]');
    if(v && m) m.setAttribute('content', v);
  }

  // Mark the active language control.
  document.querySelectorAll('[data-set-lang]').forEach(b=>{
    const on = b.getAttribute('data-set-lang') === lang;
    b.classList.toggle('is-on', on);
    b.setAttribute('aria-pressed', on ? 'true' : 'false');
  });

  localStorage.setItem('ort-lang', lang);

  /* Any component holding its own rendered strings (product grids,
     the chooser, the dashboard) re-renders itself here. This is what
     makes language switching complete rather than partial. */
  if(rerender) document.dispatchEvent(new CustomEvent('ort:lang', { detail:{ lang } }));
}

/* Switching language must keep the visitor exactly where they are —
   same page, same query string, same scroll position. */
function ortSwitchLanguage(lang){
  const y = window.scrollY;
  ortApplyLanguage(lang);
  window.scrollTo({ top:y });
}

function ortSavedLanguage(){ return localStorage.getItem('ort-lang'); }
