/* =========================================================
   ui.js — interaction layer.
   Scroll reveal, the ORT Score dial (signature component),
   the "Help me choose" flow, the interactive system diagram,
   product tiles, tabs and form validation.

   Everything that renders strings re-renders on 'ort:lang',
   which is what makes language switching complete.
   ========================================================= */

/* ---------- Scroll reveal ---------- */

/* One arrow, used by every process flow on the site. Fixed 64x16
   grid means the shaft length and head size never vary. */
const FLOW_ARROW = `<svg class="flow-arw" viewBox="0 0 64 16" fill="none" aria-hidden="true">
  <line class="shaft" x1="2" y1="8" x2="48" y2="8" stroke-linecap="round"/>
  <polygon class="head" points="46,2.5 60,8 46,13.5"/>
</svg>`;

function ortReveal(){
  const els = document.querySelectorAll('.rv, .draw, .gauge');
  if(!('IntersectionObserver' in window)){
    els.forEach(e=>e.classList.add('in')); return;
  }
  const io = new IntersectionObserver(entries=>{
    entries.forEach(en=>{
      if(!en.isIntersecting) return;
      en.target.classList.add('in');
      // Fill any measured bar. Matching on the data attribute rather
      // than one class name means new bar types animate automatically.
      en.target.querySelectorAll?.('[data-pct]').forEach(b=>{
        b.style.inlineSize = (b.dataset.pct||0)+'%';
      });
      io.unobserve(en.target);
    });
  },{ threshold:.15, rootMargin:'0px 0px -6% 0px' });
  els.forEach(e=>io.observe(e));
}

/* ---------- Signature: the ORT Score dial ----------
   A radial gauge reused on the homepage, product cards and
   product pages, so the score becomes a recognisable mark
   rather than just a number. */
/* ---------- SIGNATURE: the measured gauge ----------
   The score is a reading taken by an engineer, so it is drawn as
   an instrument: a 0-5 scale with ticks and a needle, not a
   dashboard donut. ortDial keeps its name so existing callers
   and pages continue to work. */
function ortDial(score, { size='' } = {}){
  const pct = Math.max(0, Math.min(5, score)) / 5 * 100;
  // A tick at every whole number; 0 and 5 are the scale's bounds.
  const ticks = Array.from({length:6}, (_,i)=>{
    const at = i/5*100;
    const major = (i===0 || i===5);
    return `<span class="gauge-tick${major?' major':''}" style="inset-inline-start:${at}%"></span>`
         + `<span class="gauge-num" style="inset-inline-start:${at}%">${tNum(i)}</span>`;
  }).join('');
  return `<div class="gauge ${size}" style="--w:${pct}%">
    <div class="gauge-read">
      <span class="gauge-val">${tScore(score)}</span>
      <span class="gauge-of">${t('score.outOf')}</span>
      <span class="gauge-word">${scoreWord(score)}</span>
    </div>
    <div class="gauge-scale" role="img"
         aria-label="${t('score.outOf')} ${tScore(score)}">
      <span class="gauge-axis"></span>
      <span class="gauge-fill"></span>
      ${ticks}
      <span class="gauge-needle" style="inset-inline-start:${pct}%"></span>
    </div>
  </div>`;
}

/* Interactive criteria list — clicking a row explains it in
   plain language, so the score is not a black box. */
function ortCriteria(scores, targetId){
  const rows = [
    ['reliability', scores.reliability], ['value', scores.value],
    ['performance', scores.performance], ['warranty', scores.warranty],
    ['parts', scores.parts],
  ];
  return `<div class="crit" data-crit>
    ${rows.map(([k,v],i)=>`
      <button class="crit-r${i===0?' on':''}" data-what="score.${k}What">
        <span class="k">${t('score.'+k)}</span>
        <span class="bar"><i data-pct="${v/5*100}"></i></span>
        <span class="v">${tScore(v)}</span>
      </button>`).join('')}
    <p class="crit-what" id="${targetId}">${t('score.reliabilityWhat')}</p>
  </div>`;
}

function ortBindCriteria(scope=document){
  scope.querySelectorAll('[data-crit]').forEach(group=>{
    const out = group.querySelector('.crit-what');
    group.querySelectorAll('.crit-r').forEach(row=>{
      row.addEventListener('click', ()=>{
        group.querySelectorAll('.crit-r').forEach(r=>r.classList.toggle('on', r===row));
        out.textContent = t(row.dataset.what);
      });
    });
  });
}

/* ---------- Product tile ---------- */
function ortTile(p){
  const pr = ortPrice(p);
  const tx = pText(p);
  const badge = { approved:'b-approved', premium:'b-premium', verified:'b-verified', selected:'b-selected' }[p.label];
  return `
  <a class="tile" href="product.html?p=${p.slug}">
    <div class="tile-fig">
      ${ortFig(p)}
      <span class="tile-mark b-${p.label}">${t('label.'+p.label)}</span>
      <span class="tile-reveal">${p.capacity} · ${t('eq.'+p.availability)}</span>
    </div>
    <div class="tile-body">
      <div class="tile-brand">${p.brand} · ${tx.catLabel}</div>
      <h3>${p.model}</h3>
    </div>
    <div class="tile-foot">
      <div class="tile-price">
        <span class="tile-ref"><s>${tMoney(pr.ref)}</s> <em>${t('eq.refPrice')}</em></span>
        ${tMoney(pr.total)}
        <small>${t('common.usd')} · ${t(p.mode==='buy'?'eq.fixedPrice':'eq.byQuote')}</small>
        <small class="tile-qc">${t('eq.qcIncluded',{pct:tNum(p.feePercent)})}</small>
      </div>
      ${ortDial(p.score, { size:'sm' })}
    </div>
  </a>`;
}

/* ---------- Help me choose ----------
   Three questions, then a plain-language recommendation.
   This is the main answer to "I don't know what I need". */
const CH_STEPS = [
  { q:'chooser.q1', opts:[['home','q1a'],['business','q1b'],['industrial','q1c']] },
  { q:'chooser.q2', opts:[['backup','q2a'],['bill','q2b'],['existing','q2c']] },
  { q:'chooser.q3', opts:[['none','q3a'],['some','q3b'],['expert','q3c']] },
];

function chooserResult(a){
  let recKey, cat;
  if(a[1] === 'existing'){ recKey='recExisting'; cat='inverters'; }
  else if(a[0] === 'industrial'){ recKey='recIndustrial'; cat='complete'; }
  else if(a[0] === 'business'){ recKey = a[1]==='backup' ? 'recBackupBiz' : 'recBillBiz'; cat = a[1]==='backup'?'batteries':'panels'; }
  else { recKey = a[1]==='backup' ? 'recBackupHome' : 'recBillHome'; cat = a[1]==='backup'?'complete':'panels'; }
  const note = a[2]==='expert' ? 'recNoteExpert' : (a[2]==='none' ? 'recNoteBeginner' : null);
  return { recKey, cat, note };
}

function buildChooser(){
  if(document.getElementById('chooser')) return;
  const el = document.createElement('div');
  el.id = 'chooser';
  el.className = 'chooser';
  el.setAttribute('role','dialog');
  el.setAttribute('aria-modal','true');
  el.innerHTML = `<div class="ch-box"><div id="ch-body"></div></div>`;
  document.body.appendChild(el);

  let step = 0, answers = [];

  function render(){
    const body = document.getElementById('ch-body');
    if(step < CH_STEPS.length){
      const s = CH_STEPS[step];
      body.innerHTML = `
        <div class="ch-top">
          <div>
            <div class="idx"><b>${String(step+1).padStart(2,'0')}</b> ${t('chooser.step',{n:step+1,total:CH_STEPS.length})}</div>
            <div class="ch-prog">${CH_STEPS.map((_,i)=>`<i class="${i<=step?'on':''}"></i>`).join('')}</div>
          </div>
          <button class="ico" data-ch-close aria-label="${t('common.close')}">
            <svg viewBox="0 0 20 20" fill="none"><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" stroke-width="1.6"/></svg>
          </button>
        </div>
        <h2 class="ch-q">${t(s.q)}</h2>
        <div class="ch-opts">
          ${s.opts.map(([val,key])=>`
            <button class="ch-opt" data-val="${val}">
              <span><strong>${t('chooser.'+key)}</strong><span>${t('chooser.'+key+'Sub')}</span></span>
              <span class="go">→</span>
            </button>`).join('')}
        </div>
        ${step>0?`<button class="lnk" style="margin-block-start:1.5rem" data-ch-back>← ${t('chooser.back')}</button>`:''}`;
    }else{
      const { recKey, cat, note } = chooserResult(answers);
      body.innerHTML = `
        <div class="ch-top">
          <div>
            <div class="idx"><b>✓</b> ${t('chooser.recFor')}</div>
          </div>
          <button class="ico" data-ch-close aria-label="${t('common.close')}">
            <svg viewBox="0 0 20 20" fill="none"><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" stroke-width="1.6"/></svg>
          </button>
        </div>
        <h2 class="ch-q">${t('chooser.resultTitle')}</h2>
        <div class="ch-rec"><p>${t('chooser.'+recKey)}</p></div>
        ${note?`<p class="ch-note">${t('chooser.'+note)}</p>`:''}
        <div class="row" style="margin-block-start:1.75rem">
          <a class="btn btn-signal" href="ask-an-engineer.html">${t('chooser.resultAsk')} <span class="arw">→</span></a>
          <a class="btn btn-line" href="equipment.html?c=${cat}">${t('chooser.resultBrowse')}</a>
        </div>
        <button class="lnk" style="margin-block-start:1.5rem" data-ch-restart>${t('chooser.restart')}</button>`;
    }

    body.querySelectorAll('[data-val]').forEach(b=>
      b.addEventListener('click', ()=>{ answers[step]=b.dataset.val; step++; render(); }));
    body.querySelector('[data-ch-back]')?.addEventListener('click', ()=>{ step--; render(); });
    body.querySelector('[data-ch-restart]')?.addEventListener('click', ()=>{ step=0; answers=[]; render(); });
    body.querySelectorAll('[data-ch-close]').forEach(b=>b.addEventListener('click', closeChooser));
  }

  function openChooser(){ el.classList.add('open'); document.body.style.overflow='hidden'; step=0; answers=[]; render(); }
  function closeChooser(){ el.classList.remove('open'); document.body.style.overflow=''; }

  document.addEventListener('click', e=>{
    if(e.target.closest('[data-open-chooser]')){ e.preventDefault(); openChooser(); }
  });
  el.addEventListener('click', e=>{ if(e.target===el) closeChooser(); });
  document.addEventListener('keydown', e=>{ if(e.key==='Escape') closeChooser(); });
  document.addEventListener('ort:lang', ()=>{ if(el.classList.contains('open')) render(); });
}

/* ---------- Interactive system diagram ---------- */
function ortDiagram(mountId){
  const mount = document.getElementById(mountId);
  if(!mount) return;

  const NODES = ['panels','inverter','battery','home','grid'];
  let active = 'panels';

  /* Each component is drawn as a filled illustration with a solid
     outline, so it reads clearly on a light surface. The previous
     version used hairline strokes in a near-white tone and simply
     disappeared. */
  const ART = {
    panels:`<g>
      <rect x="8" y="16" width="86" height="52" rx="2" class="pt-fill"/>
      <path d="M8 33h86M8 50h86M37 16v52M65 16v52" class="pt-line"/>
      <path d="M51 68v14M32 82h38" class="pt-line"/>
    </g>`,
    inverter:`<g>
      <rect x="18" y="8" width="66" height="76" rx="3" class="pt-fill"/>
      <rect x="28" y="18" width="46" height="24" rx="2" class="pt-inner"/>
      <path d="M34 30c5-11 10-11 15 0s10 11 15 0" class="pt-line"/>
      <circle cx="34" cy="56" r="4" class="pt-line"/>
      <circle cx="51" cy="56" r="4" class="pt-line"/>
      <circle cx="68" cy="56" r="4" class="pt-line"/>
      <path d="M30 72h42" class="pt-line"/>
    </g>`,
    battery:`<g>
      <rect x="10" y="20" width="82" height="54" rx="3" class="pt-fill"/>
      <path d="M10 38h82M10 56h82" class="pt-line"/>
      <rect x="28" y="12" width="14" height="8" rx="1" class="pt-inner"/>
      <rect x="60" y="12" width="14" height="8" rx="1" class="pt-inner"/>
      <path d="M54 42l-8 12h10l-8 12" class="pt-bolt"/>
    </g>`,
    home:`<g>
      <path d="M8 46 L51 12 L94 46" class="pt-line"/>
      <rect x="18" y="46" width="66" height="38" rx="2" class="pt-fill"/>
      <rect x="32" y="58" width="14" height="14" rx="1" class="pt-inner"/>
      <rect x="56" y="58" width="14" height="26" rx="1" class="pt-inner"/>
    </g>`,
    grid:`<g>
      <path d="M51 8 L30 84 M51 8 L72 84 M36 40h30 M32 60h38" class="pt-line"/>
      <path d="M38 22h26" class="pt-line"/>
      <circle cx="51" cy="8" r="4" class="pt-bolt"/>
    </g>`,
  };

  function render(){
    const cells = NODES.map((k,i)=>`
      <button class="dg-cell${k===active?' on':''}" data-node="${k}"
              aria-pressed="${k===active}">
        <span class="dg-art">
          <svg viewBox="0 0 102 92" aria-hidden="true">${ART[k]}</svg>
        </span>
        <span class="dg-cap">${t('diagram.'+k)}</span>
      </button>
      ${i < NODES.length-1 ? `<span class="dg-join" aria-hidden="true">
          <svg viewBox="0 0 40 12"><path d="M2 6h28" class="j-line"/><path d="M28 2l8 4-8 4z" class="j-head"/></svg>
        </span>` : ''}`).join('');

    mount.innerHTML = `
      <div class="dg-flowline">${cells}</div>
      <div class="dg-detail" id="dg-detail" role="status" aria-live="polite"></div>`;

    mount.querySelectorAll('[data-node]').forEach(b=>{
      const pick = ()=>{ active = b.dataset.node; render(); };
      b.addEventListener('click', pick);
    });
    detail();
  }

  function detail(){
    const d = mount.querySelector('#dg-detail');
    if(d) d.innerHTML = `
      <h4>${t('diagram.'+active)}</h4>
      <p>${t('diagram.'+active+'What')}</p>`;
  }

  render();
  document.addEventListener('ort:lang', render);
}


function ortTabs(scope=document){
  scope.querySelectorAll('.tabs').forEach(group=>{
    group.querySelectorAll('.tab').forEach(tab=>{
      tab.addEventListener('click', ()=>{
        const key = tab.dataset.tab;
        group.querySelectorAll('.tab').forEach(x=>x.classList.toggle('on', x===tab));
        const host = group.parentElement;
        host.querySelectorAll('[data-panel]').forEach(p=>{ p.hidden = p.dataset.panel !== key; });
      });
    });
  });
}

/* ---------- Form validation, in the visitor's language ---------- */
function ortValidate(form){
  let ok = true;
  form.querySelectorAll('[required]').forEach(inp=>{
    const fld = inp.closest('.fld');
    const err = fld?.querySelector('.err-msg');
    let bad = false, msg = '';
    if(!inp.value.trim()){ bad = true; msg = t('form.required'); }
    else if(inp.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inp.value)){
      bad = true; msg = t('form.invalidEmail');
    }
    else if(inp.type === 'password' && inp.value.length < 8){
      bad = true; msg = t('form.passwordShort');
    }
    fld?.classList.toggle('bad', bad);
    if(err && bad) err.textContent = msg;
    if(bad) ok = false;
  });
  return ok;
}

document.addEventListener('DOMContentLoaded', ()=>{ ortTabs(); });

/* ---------- Chooser, rendered inline into a page ----------
   The modal is a convenience; this is the canonical destination so
   "Help me choose" always leads somewhere, script or no script. */
function ortChooserInline(mountId){
  const mount = document.getElementById(mountId);
  if(!mount) return;
  let step = 0, answers = [];

  function render(){
    if(step < CH_STEPS.length){
      const s = CH_STEPS[step];
      mount.innerHTML = `
        <div class="ch-top">
          <div>
            <div class="idx"><b>${String(step+1).padStart(2,'0')}</b> ${t('chooser.step',{n:step+1,total:CH_STEPS.length})}</div>
            <div class="ch-prog">${CH_STEPS.map((_,i)=>`<i class="${i<=step?'on':''}"></i>`).join('')}</div>
          </div>
        </div>
        <h2 class="ch-q">${t(s.q)}</h2>
        <div class="ch-opts">
          ${s.opts.map(([val,key])=>`
            <button class="ch-opt" data-val="${val}">
              <span><strong>${t('chooser.'+key)}</strong><span>${t('chooser.'+key+'Sub')}</span></span>
              <span class="arw">→</span>
            </button>`).join('')}
        </div>
        ${step>0?`<button class="lnk" style="margin-block-start:1.5rem" data-ch-back>← ${t('chooser.back')}</button>`:''}`;
    } else {
      const { recKey, cat, note } = chooserResult(answers);
      mount.innerHTML = `
        <div class="ch-top"><div><div class="idx"><b>✓</b> ${t('chooser.recFor')}</div></div></div>
        <h2 class="ch-q">${t('chooser.resultTitle')}</h2>
        <div class="ch-rec"><p>${t('chooser.'+recKey)}</p></div>
        ${note?`<p class="ch-note">${t('chooser.'+note)}</p>`:''}
        <div class="row" style="margin-block-start:1.5rem">
          <a class="btn btn-signal" href="ask-an-engineer.html">${t('chooser.resultAsk')} <span class="arw">→</span></a>
          <a class="btn btn-line" href="equipment.html?c=${cat}">${t('chooser.resultBrowse')}</a>
        </div>
        <button class="lnk" style="margin-block-start:1.5rem" data-ch-restart>${t('chooser.restart')}</button>`;
    }
    mount.querySelectorAll('[data-val]').forEach(b=>
      b.addEventListener('click', ()=>{ answers[step]=b.dataset.val; step++; render();
        mount.scrollIntoView({behavior:'smooth',block:'center'}); }));
    mount.querySelector('[data-ch-back]')?.addEventListener('click', ()=>{ step--; render(); });
    mount.querySelector('[data-ch-restart]')?.addEventListener('click', ()=>{ step=0; answers=[]; render(); });
  }
  render();
}
