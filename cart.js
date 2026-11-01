/* =========================================================
   cart.js — the shopping cart.
   ---------------------------------------------------------
   Two things make this cart different from a normal shop cart:

   1. MIXED CARTS. Some products have a fixed price (mode 'buy')
      and some are quotation only (mode 'quote'). A cart can hold
      both. We total the purchasable lines and list the quote
      lines separately, rather than pretending we can price them.

   2. THE FEE IS VISIBLE. The 10% ORT quality and service fee is
      never folded into the line price. It is calculated across
      the purchasable subtotal and shown as its own row, the same
      way it is shown on a product page.

   State lives in localStorage so the cart survives a refresh.
   ========================================================= */

const CART_KEY = 'ort-cart';

/* ---------- state ---------- */

function cartRead(){
  try{
    const raw = localStorage.getItem(CART_KEY);
    const items = raw ? JSON.parse(raw) : [];
    // Drop anything whose product no longer exists in the catalogue,
    // so a stale cart can never crash the page.
    return items.filter(i => ORT_PRODUCTS.some(p => p.slug === i.slug));
  }catch{ return []; }
}

function cartWrite(items){
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  document.dispatchEvent(new CustomEvent('ort:cart', { detail:{ items } }));
}

function cartCount(){
  return cartRead().reduce((n,i)=> n + i.qty, 0);
}

function cartAdd(slug, qty=1){
  const items = cartRead();
  const line = items.find(i=>i.slug===slug);
  if(line) line.qty = Math.min(99, line.qty + qty);
  else items.push({ slug, qty:Math.min(99, Math.max(1, qty)) });
  cartWrite(items);
  return items;
}

function cartSetQty(slug, qty){
  let items = cartRead();
  qty = Math.max(0, Math.min(99, qty));
  if(qty === 0) items = items.filter(i=>i.slug!==slug);
  else{
    const line = items.find(i=>i.slug===slug);
    if(line) line.qty = qty;
  }
  cartWrite(items);
  return items;
}

function cartRemove(slug){ return cartSetQty(slug, 0); }
function cartClear(){ cartWrite([]); }

/* ---------- totals ----------
   Returns everything a cart or checkout view needs, already split
   into purchasable and quote-only. Nothing downstream has to
   re-derive pricing, so the numbers cannot drift between views. */
function cartTotals(){
  const items = cartRead();
  const lines = items.map(i=>{
    const p = ORT_PRODUCTS.find(x=>x.slug===i.slug);
    const pr = ortPrice(p);
    return {
      product:p, qty:i.qty, mode:p.mode,
      unitRef:pr.ref, unitFee:pr.fee, unitTotal:pr.total,
      lineRef:pr.ref * i.qty,
      lineFee:pr.fee * i.qty,
      lineTotal:pr.total * i.qty,
    };
  });

  const buy   = lines.filter(l=>l.mode === 'buy');
  const quote = lines.filter(l=>l.mode !== 'buy');

  const subtotal = buy.reduce((n,l)=> n + l.lineRef, 0);
  const fee      = buy.reduce((n,l)=> n + l.lineFee, 0);

  return {
    lines, buy, quote,
    itemCount: lines.reduce((n,l)=> n + l.qty, 0),
    subtotal, fee,
    total: subtotal + fee,
    hasQuoteItems: quote.length > 0,
    isEmpty: lines.length === 0,
  };
}

/* ---------- header badge ---------- */
function cartRefreshBadge(){
  const n = cartCount();
  document.querySelectorAll('[data-cart-count]').forEach(el=>{
    el.textContent = n > 99 ? '99+' : tNum(n);
    el.hidden = n === 0;
  });
}

/* ---------- drawer ----------
   Opens on add-to-cart so the customer gets confirmation without
   losing the page they were reading. */
function cartRenderDrawer(){
  const body = document.getElementById('cart-body');
  const foot = document.getElementById('cart-foot');
  if(!body) return;
  const T = cartTotals();

  if(T.isEmpty){
    body.innerHTML = `<div class="cart-empty">
      <p data-t="cart.empty">${t('cart.empty')}</p>
      <a class="btn btn-signal btn-sm" href="equipment.html">${t('cart.browse')} <span class="arw">→</span></a>
    </div>`;
    foot.hidden = true;
    return;
  }
  foot.hidden = false;

  body.innerHTML = T.lines.map(l=>{
    const p = l.product;
    return `<div class="cart-line">
      <a class="cart-fig" href="product.html?p=${p.slug}">${FIG[p.figure]}</a>
      <div class="cart-info">
        <div class="cart-brand">${p.brand}</div>
        <a class="cart-name ltr" href="product.html?p=${p.slug}">${p.model}</a>
        <span class="badge b-${p.label}" style="margin-block-start:.4rem">${t('label.'+p.label)}</span>
        <div class="qty" role="group">
          <button class="qty-b" data-qty-dec="${p.slug}" aria-label="${t('cart.decrease')}">−</button>
          <input class="qty-i" type="number" min="1" max="99" value="${l.qty}"
                 data-qty-set="${p.slug}" aria-label="${t('cart.qty')}">
          <button class="qty-b" data-qty-inc="${p.slug}" aria-label="${t('cart.increase')}">+</button>
          <button class="qty-x" data-qty-rm="${p.slug}">${t('cart.remove')}</button>
        </div>
      </div>
      <div class="cart-money">
        ${l.mode === 'buy'
          ? `<strong>${tMoney(l.lineTotal)}</strong><small>${tMoney(l.unitTotal)} ${t('cart.each')}</small>`
          : `<em class="cart-quote">${t('cart.byQuote')}</em>`}
      </div>
    </div>`;
  }).join('');

  foot.innerHTML = cartSummaryHTML(T, { compact:true }) + `
    <div class="cart-actions">
      <a class="btn btn-wa" data-send-wa href="#" target="_blank" rel="noopener">
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.5 14.4c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35z"/><path d="M12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2zm0 18.2a8.2 8.2 0 01-4.2-1.15l-.3-.18-3.1.81.83-3.02-.2-.31A8.2 8.2 0 1112 20.2z"/></svg> <span>${t('send.wa')}</span></a>
      <a class="btn btn-line" data-send-mail href="#">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="2.5" y="4.5" width="19" height="15" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M3 6l9 6.5L21 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg> <span>${t('send.mail')}</span></a>
      <a class="lnk" href="cart.html" style="justify-content:center">${t('cart.view')}</a>
    </div>`;
  cartRefreshSendLinks();
}

/* Shared summary block, used by the drawer and the cart page so
   the two can never show different numbers. */
function cartSummaryHTML(T, { compact=false } = {}){
  const feePct = ORT_PRODUCTS[0] ? ORT_PRODUCTS[0].feePercent : 10;
  return `
  <div class="cart-sum">
    ${T.buy.length ? `
      <div class="sum-row"><span>${t('cart.subtotal')}</span><span class="num">${tMoney(T.subtotal)}</span></div>
      <div class="sum-row"><span>${t('cart.fee',{pct:tNum(feePct)})}</span><span class="num">${tMoney(T.fee)}</span></div>
      <div class="sum-row"><span>${t('cart.goodsTotal')}</span><span class="num">${tMoney(T.total)}</span></div>
      <!-- Delivery is shown as a line with no figure rather than
           omitted. A customer who sees a total with no mention of
           shipping assumes shipping is included. -->
      <div class="sum-row delivery-row">
        <span>${t('cart.delivery')}</span>
        <span class="num pending">${t('cart.deliveryQuoted')}</span>
      </div>
      <div class="sum-row total"><span>${t('cart.total')}</span><span class="num">${tMoney(T.total)} <small>+ ${t('cart.delivery').toLowerCase()}</small></span></div>
    ` : ''}
    ${T.hasQuoteItems ? `
      <div class="sum-note">
        <strong>${t('cart.quoteItems',{n:tNum(T.quote.length)})}</strong>
        <span>${t('cart.quoteNote')}</span>
      </div>` : ''}
    ${!compact && T.buy.length ? `
      <div class="sum-note" style="margin-block-start:.85rem">
        <strong>${t('cart.delivery')}</strong>
        <span>${t('cart.deliveryNote')}</span>
      </div>
      <p class="sum-fine">${t('cart.dutiesNote')}</p>
      <p class="sum-fine">${t('cart.priceNote')}</p>` : ''}
  </div>`;
}

/* ---------- add-to-cart feedback ---------- */
function cartFlash(slug){
  const p = ORT_PRODUCTS.find(x=>x.slug===slug);
  let el = document.getElementById('cart-toast');
  if(!el){
    el = document.createElement('div');
    el.id = 'cart-toast'; el.className = 'toast';
    document.body.appendChild(el);
  }
  el.innerHTML = `<span class="toast-tick">✓</span>
    <span>${t('cart.added',{name:`<span class="ltr">${p.brand} ${p.model}</span>`})}</span>
    <button class="toast-cta" data-open-cart>${t('cart.view')}</button>`;
  el.classList.add('in');
  clearTimeout(el._t);
  el._t = setTimeout(()=> el.classList.remove('in'), 4000);
}

function cartOpen(){
  document.getElementById('cart-drawer')?.classList.add('open');
  document.getElementById('cart-scrim')?.classList.add('in');
  document.body.style.overflow = 'hidden';
  cartRenderDrawer();
}
function cartClose(){
  document.getElementById('cart-drawer')?.classList.remove('open');
  document.getElementById('cart-scrim')?.classList.remove('in');
  document.body.style.overflow = '';
}

/* ---------- global wiring ----------
   Delegated so it works for markup rendered after load. */
document.addEventListener('click', e=>{
  const add = e.target.closest('[data-add-cart]');
  if(add){
    e.preventDefault();
    const slug = add.dataset.addCart;
    // A button may name its own quantity field (the sticky mobile bar
    // has one); otherwise fall back to the inline one on the page.
    const src = add.dataset.qtySource || 'buy-qty';
    const qtyInput = document.getElementById(src) || document.getElementById('buy-qty');
    cartAdd(slug, qtyInput ? Math.max(1, parseInt(qtyInput.value,10)||1) : 1);
    cartFlash(slug);
    return;
  }
  if(e.target.closest('[data-open-cart]')){ e.preventDefault(); cartOpen(); return; }
  if(e.target.closest('[data-close-cart]')){ e.preventDefault(); cartClose(); return; }

  const inc = e.target.closest('[data-qty-inc]');
  if(inc){ const s=inc.dataset.qtyInc; const l=cartRead().find(i=>i.slug===s); cartSetQty(s,(l?.qty||0)+1); return; }
  const dec = e.target.closest('[data-qty-dec]');
  if(dec){ const s=dec.dataset.qtyDec; const l=cartRead().find(i=>i.slug===s); cartSetQty(s,(l?.qty||1)-1); return; }
  const rm = e.target.closest('[data-qty-rm]');
  if(rm){ cartRemove(rm.dataset.qtyRm); return; }
});

document.addEventListener('change', e=>{
  const set = e.target.closest('[data-qty-set]');
  if(set) cartSetQty(set.dataset.qtySet, parseInt(set.value,10)||1);
});

document.addEventListener('keydown', e=>{
  if(e.key === 'Escape') cartClose();
});

/* Any cart change refreshes the badge and any open view. */
document.addEventListener('ort:cart', ()=>{
  cartRefreshBadge();
  cartRenderDrawer();
  document.dispatchEvent(new CustomEvent('ort:cart-view'));
});

/* Language change re-renders cart text too. */
document.addEventListener('ort:lang', ()=>{
  cartRefreshBadge();
  cartRenderDrawer();
});

/* =========================================================
   SENDING THE CART
   ---------------------------------------------------------
   There is no payment on the site. A customer builds a cart and
   then sends it to ORT WATT, either on WhatsApp or by email, and
   the conversation continues from there.

   The whole point is that they should not have to retype what
   they chose, so the message is composed for them.
   ========================================================= */

/* Plain-text summary of the cart, used by both routes. */
function cartAsText({ withPrices = true } = {}){
  const T = cartTotals();
  if (T.isEmpty) return '';
  const lines = T.lines.map(l => {
    const p = l.product;
    const price = l.mode === 'buy' ? ` — ${tMoney(l.unitTotal)} ${t('cart.each')}` : ` — ${t('cart.byQuote')}`;
    return `• ${tNum(l.qty)} x ${p.brand} ${p.model}${withPrices ? price : ''}`;
  });
  let out = lines.join('\n');
  if (withPrices && T.buy.length) {
    out += `\n\n${t('cart.goodsTotal')}: ${tMoney(T.total)}`
         + `\n(${t('send.inclFeeNote', { pct: tNum(ORT_PRODUCTS[0]?.feePercent ?? 10) })})`;
  }
  return out;
}

/* WhatsApp. wa.me carries the message in the URL, and very long
   URLs get truncated by some clients, so a large cart falls back
   to naming the item count rather than listing everything. */
function cartWhatsAppLink(){
  const T = cartTotals();
  if (T.isEmpty) return ortWhatsApp();

  let body = `${t('send.waGreeting')}\n\n${cartAsText()}\n\n${t('send.waClosing')}`;
  const encoded = encodeURIComponent(body);

  if (encoded.length > 1800) {
    body = `${t('send.waGreeting')}\n\n`
         + t('send.waTooLong', { n: tNum(T.itemCount) })
         + `\n\n${cartAsText({ withPrices: false })}`;
  }
  return `https://wa.me/${ORT_WHATSAPP}?text=${encodeURIComponent(body)}`;
}

/* Email. mailto opens whatever the customer already uses, with the
   cart written into the body. No form, no account needed. */
function cartMailtoLink(){
  const T = cartTotals();
  const subject = t('send.mailSubject');
  const body = `${t('send.mailGreeting')}\n\n${cartAsText()}\n\n${t('send.mailClosing')}`;
  return `mailto:${ORT_ORDERS_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/* Both links are rebuilt whenever the cart or the language changes,
   so a stale message can never be sent. */
function cartRefreshSendLinks(){
  document.querySelectorAll('[data-send-wa]').forEach(a => { a.href = cartWhatsAppLink(); });
  document.querySelectorAll('[data-send-mail]').forEach(a => { a.href = cartMailtoLink(); });
}
document.addEventListener('ort:cart', cartRefreshSendLinks);
document.addEventListener('ort:lang', cartRefreshSendLinks);
document.addEventListener('DOMContentLoaded', cartRefreshSendLinks);
