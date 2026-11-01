/* =========================================================
   phone.js — phone input with a country code selector
   ---------------------------------------------------------
   Upgrades every <input type="tel"> on the page into a country
   picker plus a number field, so a customer never has to know or
   type "+229".

   Why this matters beyond convenience: a free-text phone field
   produces "0803...", "+234 803...", "234803..." and "00234 803..."
   in the same database column. None of those can be dialled
   reliably, and none can be matched to a WhatsApp account. This
   stores one canonical value.

   The visible field holds the local number. A hidden field holds
   the full international number, and that is what gets submitted.
   ========================================================= */

/* Dialling codes. Ordered with the markets ORT serves first, then
   the rest alphabetically, because a Gulf or West African customer
   should find their country immediately. */
const PHONE_CODES = [
  // Gulf — primary market
  ['AE','United Arab Emirates','971'], ['SA','Saudi Arabia','966'],
  ['QA','Qatar','974'], ['KW','Kuwait','965'], ['BH','Bahrain','973'],
  ['OM','Oman','968'],
  // West and East Africa
  ['NG','Nigeria','234'], ['BJ','Benin','229'], ['TG','Togo','228'],
  ['GH','Ghana','233'], ['CI','Côte d’Ivoire','225'], ['SN','Senegal','221'],
  ['ML','Mali','223'], ['BF','Burkina Faso','226'], ['NE','Niger','227'],
  ['CM','Cameroon','237'], ['GA','Gabon','241'], ['CD','DR Congo','243'],
  ['KE','Kenya','254'], ['TZ','Tanzania','255'], ['UG','Uganda','256'],
  ['RW','Rwanda','250'], ['ET','Ethiopia','251'], ['ZA','South Africa','27'],
  // North Africa
  ['EG','Egypt','20'], ['MA','Morocco','212'], ['DZ','Algeria','213'],
  ['TN','Tunisia','216'], ['LY','Libya','218'],
  // Europe
  ['FR','France','33'], ['BE','Belgium','32'], ['NL','Netherlands','31'],
  ['DE','Germany','49'], ['ES','Spain','34'], ['IT','Italy','39'],
  ['PT','Portugal','351'], ['GB','United Kingdom','44'], ['CH','Switzerland','41'],
  ['SE','Sweden','46'], ['PL','Poland','48'], ['TR','Turkey','90'],
  // Asia and Americas
  ['IN','India','91'], ['PK','Pakistan','92'], ['BD','Bangladesh','880'],
  ['CN','China','86'], ['PH','Philippines','63'], ['ID','Indonesia','62'],
  ['MY','Malaysia','60'], ['SG','Singapore','65'], ['JP','Japan','81'],
  ['US','United States','1'], ['CA','Canada','1'], ['BR','Brazil','55'],
  ['AU','Australia','61'],
];

const PHONE_DEFAULT = 'AE';   // the company is in Dubai

/* Flag from the country code, using regional indicator letters.
   No image files, works everywhere text does. */
function flagOf(iso){
  return String.fromCodePoint(...[...iso].map(c => 0x1F1E6 + c.charCodeAt(0) - 65));
}

function ortPhoneInit(root = document){
  root.querySelectorAll('input[type="tel"]:not([data-phone-ready])').forEach(input => {
    input.setAttribute('data-phone-ready', '1');

    const wrap = document.createElement('div');
    wrap.className = 'phone';

    // The picker
    const pick = document.createElement('button');
    pick.type = 'button';
    pick.className = 'phone-pick';
    pick.setAttribute('aria-haspopup', 'listbox');
    pick.setAttribute('aria-expanded', 'false');

    // Remembered from last time, so a returning customer sees their own country
    const saved = localStorage.getItem('ort-dial') || PHONE_DEFAULT;
    let iso = PHONE_CODES.some(c => c[0] === saved) ? saved : PHONE_DEFAULT;

    const codeOf = i => (PHONE_CODES.find(c => c[0] === i) || PHONE_CODES[0])[2];
    const nameOf = i => (PHONE_CODES.find(c => c[0] === i) || PHONE_CODES[0])[1];

    const paint = () => {
      pick.innerHTML =
        `<span class="phone-flag">${flagOf(iso)}</span>` +
        `<span class="phone-code">+${codeOf(iso)}</span>` +
        `<span class="phone-caret" aria-hidden="true">▾</span>`;
      pick.setAttribute('aria-label', `${nameOf(iso)} +${codeOf(iso)}`);
    };
    paint();

    // The dropdown, with a search box because 50+ countries is a lot to scroll
    const menu = document.createElement('div');
    menu.className = 'phone-menu';
    menu.hidden = true;
    menu.innerHTML =
      `<input type="text" class="phone-search" autocomplete="off"
              placeholder="${typeof t === 'function' ? t('form.phoneSearch') : 'Search country'}">
       <ul class="phone-list" role="listbox"></ul>`;

    const list = menu.querySelector('.phone-list');
    const search = menu.querySelector('.phone-search');

    const renderList = (filter = '') => {
      const f = filter.trim().toLowerCase();
      const rows = PHONE_CODES.filter(([code, name, dial]) =>
        !f || name.toLowerCase().includes(f) || dial.includes(f) || code.toLowerCase() === f);
      list.innerHTML = rows.length
        ? rows.map(([code, name, dial]) => `
            <li role="option" data-iso="${code}" ${code === iso ? 'aria-selected="true"' : ''}>
              <span class="phone-flag">${flagOf(code)}</span>
              <span class="phone-name">${name}</span>
              <span class="phone-dial">+${dial}</span>
            </li>`).join('')
        : `<li class="phone-none">${typeof t === 'function' ? t('search.none') : 'No match'}</li>`;
    };
    renderList();

    // Hidden field carrying the full international number
    const full = document.createElement('input');
    full.type = 'hidden';
    full.name = input.name;                 // submits under the original name
    input.name = input.name + '_local';     // the visible field becomes secondary

    const sync = () => {
      const local = input.value.replace(/[^\d]/g, '').replace(/^0+/, '');
      full.value = local ? `+${codeOf(iso)}${local}` : '';
    };

    input.addEventListener('input', sync);
    input.setAttribute('inputmode', 'tel');
    input.classList.add('phone-num');

    // Assemble
    input.parentNode.insertBefore(wrap, input);
    wrap.appendChild(pick);
    wrap.appendChild(input);
    wrap.appendChild(menu);
    wrap.appendChild(full);
    sync();

    /* ---- interaction ---- */
    const close = () => { menu.hidden = true; pick.setAttribute('aria-expanded','false'); };
    const open  = () => {
      document.querySelectorAll('.phone-menu').forEach(m => { if (m !== menu) m.hidden = true; });
      menu.hidden = false; pick.setAttribute('aria-expanded','true');
      search.value = ''; renderList(); search.focus();
    };

    pick.addEventListener('click', e => { e.preventDefault(); menu.hidden ? open() : close(); });
    search.addEventListener('input', () => renderList(search.value));
    search.addEventListener('keydown', e => {
      if (e.key === 'Escape') { close(); pick.focus(); }
      if (e.key === 'Enter') {
        e.preventDefault();
        const first = list.querySelector('li[data-iso]');
        if (first) first.click();
      }
    });
    list.addEventListener('click', e => {
      const li = e.target.closest('li[data-iso]');
      if (!li) return;
      iso = li.dataset.iso;
      localStorage.setItem('ort-dial', iso);
      paint(); sync(); close(); input.focus();
    });
    document.addEventListener('click', e => { if (!wrap.contains(e.target)) close(); });
  });
}

/* Run on load, and again whenever a page re-renders its forms. */
document.addEventListener('DOMContentLoaded', () => ortPhoneInit());
document.addEventListener('ort:lang', () => {
  // Labels inside the picker are translated; rebuild the search placeholder
  document.querySelectorAll('.phone-search').forEach(s => {
    if (typeof t === 'function') s.placeholder = t('form.phoneSearch');
  });
});
