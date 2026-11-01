import fs from 'fs';

const HEAD = (o)=>`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${o.t} — ORT WATT</title>
<meta name="description" content="${o.d}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="css/system.css">
<link rel="stylesheet" href="css/components.css">
${o.style?`<style>${o.style}</style>`:''}
</head>
<body${o.titleKey?` data-page-title="${o.titleKey}"`:''}${o.descKey?` data-page-desc="${o.descKey}"`:''}>
<div id="slot-gate"></div>
<div id="slot-header"></div>
<main id="main">
${o.body}
</main>
<div id="slot-footer"></div>
<script src="js/strings.js"></script>
<script src="js/i18n.js"></script>
<script src="js/data.js"></script>
<script src="js/api.js"></script>
<script src="js/ui.js"></script>
<script src="js/layout.js"></script>
${o.script?`<script>${o.script}</script>`:''}
</body>
</html>`;

const phead = (crumbK, h1K, ledeK)=>`
  <section class="phead">
    <div class="phead-in">
      <nav class="crumbs"><a href="index.html" data-t="err.home"></a> <span>/</span> <span data-t="${crumbK}"></span></nav>
      <h1 data-t="${h1K}"></h1>
      <p class="lede" data-t="${ledeK}"></p>
    </div>
  </section>`;

const TICK = `<svg viewBox="0 0 16 16" fill="none"><path d="M3 8.5l3.5 3.5L13 4.5" stroke="currentColor" stroke-width="2"/></svg>`;
const li = k=>`<li>${TICK}<span data-t="${k}"></span></li>`;
const fld = (id,labelK,type='text',req=true,phK='',optional=false)=>`
  <div class="fld">
    <label for="${id}"><span data-t="${labelK}"></span>${optional?` <span class="opt">(<span data-t="form.optional"></span>)</span>`:''}</label>
    <input id="${id}" name="${id}" type="${type}"${req?' required':''}${phK?` data-t-ph="${phK}"`:''}>
    <div class="err-msg"></div>
  </div>`;
const area = (id,labelK,phK,req=false)=>`
  <div class="fld">
    <label for="${id}" data-t="${labelK}"></label>
    <textarea id="${id}" name="${id}"${req?' required':''} data-t-ph="${phK}"></textarea>
    <div class="err-msg"></div>
  </div>`;
const files = (hintK='form.filesHint')=>`
  <div class="fld">
    <label for="files"><span data-t="form.files"></span> <span class="opt">(<span data-t="form.optional"></span>)</span></label>
    <input id="files" name="files" type="file" multiple accept="image/*,.pdf">
    <div class="hint" data-t="${hintK}"></div>
  </div>`;
const msgs = `<div class="msg err" hidden></div><div class="msg ok" hidden></div>`;
const submit = k=>`<button class="btn btn-signal" type="submit"><span data-t="${k}"></span> <span class="arw">→</span></button>`;

const P = {};

/* ---------- ORT APPROVED ---------- */
P['ort-approved.html'] = {
  t:'ORT Approved', d:'What the ORT Approved mark means and how the quality score is calculated.',
  titleKey:'label.approved', descKey:'label.approvedWhat',
  body: phead('nav.why','label.approved','label.notCert') + `
  <section class="sec wrap">
    <div class="split l top">
      <div class="rv"><div class="idx"><b>01</b> <span data-t="nav.why"></span></div></div>
      <div class="ledger rv d1">
        ${[['selected','b-selected'],['verified','b-verified'],['approved','b-approved'],['premium','b-premium']].map(([k,c],i)=>`
        <div class="led" style="grid-template-columns:4.5rem 11rem 1fr">
          <span class="led-n">0${i+1}</span>
          <span class="badge ${c}">${TICK}<span data-t="label.${k}"></span></span>
          <p data-t="label.${k}What"></p>
        </div>`).join('')}
      </div>
    </div>
  </section>

  <section class="sec light">
    <div class="wrap split top" style="gap:clamp(2rem,6vw,5rem)">
      <div class="rv">
        <div class="idx"><b>02</b> <span data-t="score.label"></span></div>
        <h2 class="t-h2" style="margin-block-start:1.5rem" data-t="score.explain"></h2>
        <p class="lede" style="margin-block-start:1rem" data-t="score.explainBody"></p>
        <p class="mono xs dim" style="margin-block-start:2rem" data-t="score.tapHint"></p>
      </div>
      <div class="rv d1">
        <div id="dial-mount" style="margin-block-end:2rem"></div>
        <div id="crit-mount"></div>
      </div>
    </div>
  </section>

  <section class="sec wrap">
    <div class="rv" style="max-inline-size:42rem">
      <div class="idx"><b>03</b> <span data-t="label.notCert"></span></div>
    </div>
  </section>`,
  script:`function r(){
    document.getElementById('dial-mount').innerHTML=ortDial(4.7);
    document.getElementById('crit-mount').innerHTML=ortCriteria({reliability:4.8,value:4.9,performance:4.7,warranty:4.5,parts:4.6},'cw');
    ortBindCriteria();ortReveal();}
  document.addEventListener('DOMContentLoaded',r);document.addEventListener('ort:lang',r);`,
};

/* ---------- HOW WE SELECT ---------- */
P['how-we-select.html'] = {
  t:'How We Select', d:'The process ORT uses to research, evaluate and select solar equipment.',
  titleKey:'home.funnelKicker', descKey:'home.funnelBody',
  body: phead('nav.why','home.funnelTitle','home.funnelBody') + `
  <section class="sec wrap">
    <div class="rail rv">
      ${[1,2,3,4].map(n=>`<div class="rail-s"><span class="n">0${n}</span><h4 data-t="home.funnelStep${n}"></h4><p data-t="home.funnelStep${n}d"></p></div>`).join('')}
    </div>
  </section>
  <section class="sec light">
    <div class="wrap split" style="align-items:center">
      <div class="rv">
        <div class="idx"><b>—</b> <span data-t="home.funnelKicker"></span></div>
        <h2 class="t-h2" style="margin-block-start:1.25rem" data-t="home.proofTitle"></h2>
        <p class="lede" style="margin-block-start:1rem" data-t="home.proofBody"></p>
        <a class="lnk" style="margin-block-start:1.5rem" href="equipment.html"><span data-t="home.proofCta"></span> <span class="arw">→</span></a>
      </div>
      <div class="stats rv d1" style="grid-template-columns:1fr 1fr">
        <div class="stat"><div class="v">4</div><div class="k" data-t="home.funnelKicker"></div></div>
        <div class="stat"><div class="v">5</div><div class="k" data-t="score.label"></div></div>
        <div class="stat"><div class="v">10%</div><div class="k" data-t="price.fee"></div></div>
        <div class="stat"><div class="v">USD</div><div class="k" data-t="common.usd"></div></div>
      </div>
    </div>
  </section>`,
};

/* ---------- TRANSPARENT PRICING ---------- */
P['transparent-pricing.html'] = {
  t:'Transparent Pricing', d:'Supplier reference price plus a flat 10% quality and service fee, always shown separately.',
  titleKey:'price.title', descKey:'price.sub',
  body: phead('nav.why','price.title','price.sub') + `
  <section class="sec" style="background:var(--navy-900)">
    <div class="wrap eqn rv">
      <div class="eq-c"><div class="k" data-t="price.ref"></div><div class="v" id="e1"></div><div class="n" data-t="price.refNote"></div></div>
      <div class="eq-op">+</div>
      <div class="eq-c"><div class="k" data-t="price.fee"></div><div class="v">10<span style="font-size:.5em">%</span></div><div class="n" id="e2"></div></div>
      <div class="eq-op">=</div>
      <div class="eq-c tot"><div class="k" data-t="price.total"></div><div class="v" id="e3"></div><div class="n" data-t="price.totalNote"></div></div>
    </div>
  </section>

  <section class="sec wrap">
    <div class="split l top">
      <div class="rv">
        <div class="idx"><b>01</b> <span data-t="price.covers"></span></div>
        <p class="lede" style="margin-block-start:1.5rem" data-t="price.honest"></p>
      </div>
      <ul class="checks rv d1">
        ${[1,2,3,4,5,6,7,8,9,10,11].map(n=>li('price.c'+n)).join('')}
      </ul>
    </div>
  </section>

  <section class="sec light">
    <div class="wrap">
      <div class="rv" style="max-inline-size:42rem;margin-block-end:2rem">
        <div class="idx"><b>02</b> <span data-t="price.whyChanges"></span></div>
      </div>
      <div class="ledger rv">
        ${[1,2,3,4,5].map(n=>`<div class="led" style="grid-template-columns:4.5rem 12rem 1fr"><span class="led-n">0${n}</span><h3 style="font-size:1rem" data-t="price.f${n}"></h3><p data-t="price.f${n}d"></p></div>`).join('')}
      </div>
      <p class="sm dim rv" style="margin-block-start:1.5rem" data-t="price.currencyNote"></p>
    </div>
  </section>`,
  script:`function r(){document.getElementById('e1').textContent=tMoney(500);
    document.getElementById('e2').textContent='= '+tMoney(50);
    document.getElementById('e3').textContent=tMoney(550);ortReveal();}
  document.addEventListener('DOMContentLoaded',r);document.addEventListener('ort:lang',r);`,
};

/* ---------- ENGINEERING ---------- */
P['engineering.html'] = {
  t:'Engineering', d:'System design, sizing, commissioning, troubleshooting and after sales support.',
  titleKey:'nav.engineering', descKey:'eng.sub',
  body: phead('nav.engineering','eng.title','eng.sub') + `
  <section class="sec wrap">
    <div class="ledger rv">
      ${[1,2,3,4,5,6,7,8].map(n=>`<div class="led"><span class="led-n">0${n}</span><h3 data-t="eng.s${n}"></h3><p data-t="eng.s${n}d"></p><span></span></div>`).join('')}
    </div>
  </section>
  <section class="sec light">
    <div class="wrap split" style="align-items:center">
      <div class="rv">
        <div class="idx"><b>—</b> <span data-t="nav.engineeringSub"></span></div>
        <h2 class="t-h2" style="margin-block-start:1.25rem" data-t="eng.twoWays"></h2>
        <p class="lede" style="margin-block-start:1rem" data-t="eng.twoWaysBody"></p>
      </div>
      <div class="rv d1 stk">
        <a class="btn btn-solid" style="inline-size:100%" href="ask-an-engineer.html"><span data-t="nav.ask"></span> <span class="arw">→</span></a>
        <a class="btn btn-line" style="inline-size:100%" href="solar-study.html"><span data-t="study.title"></span> <span class="arw">→</span></a>
        <button class="btn btn-line" style="inline-size:100%" data-open-chooser><span data-t="nav.helpCta"></span> <span class="arw">→</span></button>
      </div>
    </div>
  </section>`,
};

/* ---------- ASK AN ENGINEER ---------- */
P['ask-an-engineer.html'] = {
  t:'Ask an Engineer', d:'Describe what you need to power and an ORT engineer will tell you what fits.',
  titleKey:'nav.ask', descKey:'ask.sub',
  body: phead('nav.engineering','ask.title','ask.sub') + `
  <section class="sec wrap">
    <div class="split r top">
      <div class="rv d1" style="border:1px solid var(--hair);padding:clamp(1.5rem,3vw,2.5rem)">
        <form class="form" id="ask-form" novalidate>
          ${msgs}
          <div class="f2">${fld('full_name','form.fullName','text',true,'form.namePh')}${fld('email','form.email','email',true,'form.emailPh')}</div>
          <div class="f2">${fld('country','form.country')}${fld('city','form.city','text',false,'form.cityPh')}</div>
          ${fld('mobile','form.mobile','tel',false,'',true)}
          ${area('message','form.askLabel','form.askPh',true)}
          ${files('form.billHint')}
          ${submit('form.send')}
        </form>
      </div>
      <aside class="rv">
        <div class="idx"><b>01</b> <span data-t="ask.next"></span></div>
        <div class="ledger" style="margin-block-start:1.5rem">
          ${[1,2,3].map(n=>`<div class="led" style="grid-template-columns:2.5rem 1fr"><span class="led-n">${n}</span><p data-t="ask.n${n}"></p></div>`).join('')}
        </div>
        <div style="border:1px solid var(--hair);padding:1.35rem;margin-block-start:1.75rem">
          <h4 class="t-h3" style="font-size:1rem" data-t="ask.fullStudy"></h4>
          <p class="sm muted" style="margin-block-start:.5rem" data-t="ask.fullStudyBody"></p>
          <a class="lnk lnk-signal" style="margin-block-start:.9rem" href="solar-study.html"><span data-t="ask.fullStudyCta"></span> <span class="arw">→</span></a>
        </div>
      </aside>
    </div>
  </section>`,
  script:`ortWireForm('ask-form','ask_engineer');
    const sp=new URLSearchParams(location.search).get('p');
    if(sp){const pr=ORT_PRODUCTS.find(x=>x.slug===sp);const ta=document.getElementById('message');
      if(pr&&ta)ta.value=pr.brand+' '+pr.model+' — ';}`,
};

/* ---------- SOLAR STUDY (multi-step) ---------- */
P['solar-study.html'] = {
  t:'Solar Study', d:'Request a complete solar project study from the ORT engineering team.',
  titleKey:'study.title', descKey:'study.sub',
  style:`.wiz-steps{display:flex;gap:.4rem;margin-block-end:2rem;}
    .wiz-steps i{block-size:2px;flex:1;background:var(--hair);transition:background .3s;}
    .wiz-steps i.on{background:var(--signal);}
    .wiz-pane[hidden]{display:none;}`,
  body: phead('nav.engineering','study.title','study.sub') + `
  <section class="sec wrap">
    <div class="split r top">
      <div class="rv d1" style="border:1px solid var(--hair);padding:clamp(1.5rem,3vw,2.5rem)">
        <div class="mono xs dim" id="wiz-label" style="margin-block-end:.75rem"></div>
        <div class="wiz-steps">${[0,1,2,3,4].map(i=>`<i data-step="${i}"></i>`).join('')}</div>
        <form class="form" id="study-form" novalidate>
          ${msgs}
          <div class="wiz-pane" data-pane="0">
            <h3 class="t-h3" style="margin-block-end:1.25rem" data-t="study.s1q"></h3>
            <div class="fld"><label for="property_type" data-t="study.propertyType"></label>
              <select id="property_type" name="property_type"></select></div>
            <div class="fld" style="margin-block-start:1.35rem"><label for="existing" data-t="study.existing"></label>
              <select id="existing" name="existing"></select></div>
            <div class="f2" style="margin-block-start:1.35rem">${fld('country','form.country')}${fld('city','form.city')}</div>
          </div>
          <div class="wiz-pane" data-pane="1" hidden>
            <h3 class="t-h3" style="margin-block-end:1.25rem" data-t="study.s2q"></h3>
            ${area('message','form.askLabel','study.appliancesPh')}
          </div>
          <div class="wiz-pane" data-pane="2" hidden>
            <h3 class="t-h3" style="margin-block-end:1.25rem" data-t="study.s3q"></h3>
            ${area('backup','study.s3','study.backupPh')}
          </div>
          <div class="wiz-pane" data-pane="3" hidden>
            <h3 class="t-h3" style="margin-block-end:1.25rem" data-t="study.s4q"></h3>
            ${files('study.filesHint')}
          </div>
          <div class="wiz-pane" data-pane="4" hidden>
            <h3 class="t-h3" style="margin-block-end:1.25rem" data-t="study.s5q"></h3>
            <div class="f2">${fld('full_name','form.fullName','text',true,'form.namePh')}${fld('email','form.email','email',true,'form.emailPh')}</div>
            ${fld('mobile','form.mobile','tel',false,'',true)}
          </div>
          <div class="row" style="justify-content:space-between;margin-block-start:1.5rem">
            <button class="btn btn-line" type="button" id="wiz-back" hidden><span data-t="chooser.back"></span></button>
            <button class="btn btn-signal" type="button" id="wiz-next"><span data-t="chooser.next"></span> <span class="arw">→</span></button>
            <button class="btn btn-signal" type="submit" id="wiz-send" hidden><span data-t="form.submit"></span> <span class="arw">→</span></button>
          </div>
        </form>
      </div>
      <aside class="rv">
        <div class="idx"><b>01</b> <span data-t="study.includes"></span></div>
        <ul class="checks one" style="margin-block-start:1.5rem">${[1,2,3,4,5,6,7].map(n=>li('study.i'+n)).join('')}</ul>
      </aside>
    </div>
  </section>`,
  script:`
  (function(){
    let step=0; const TOTAL=5;
    const panes=[...document.querySelectorAll('.wiz-pane')];
    function fillSelects(){
      const pt=document.getElementById('property_type');
      pt.innerHTML=['house','apartment','office','shop','warehouse','factory','farm','other']
        .map(k=>'<option>'+t('study.'+k)+'</option>').join('');
      const ex=document.getElementById('existing');
      ex.innerHTML=['exNone','exPanels','exExtend','exReplace']
        .map(k=>'<option>'+t('study.'+k)+'</option>').join('');
    }
    function show(){
      panes.forEach((p,i)=>p.hidden=i!==step);
      document.querySelectorAll('.wiz-steps i').forEach((el,i)=>el.classList.toggle('on',i<=step));
      document.getElementById('wiz-label').textContent=t('study.progress',{n:step+1,total:TOTAL});
      document.getElementById('wiz-back').hidden=step===0;
      document.getElementById('wiz-next').hidden=step===TOTAL-1;
      document.getElementById('wiz-send').hidden=step!==TOTAL-1;
    }
    document.getElementById('wiz-next').addEventListener('click',()=>{if(step<TOTAL-1){step++;show();}});
    document.getElementById('wiz-back').addEventListener('click',()=>{if(step>0){step--;show();}});
    function init(){fillSelects();show();}
    document.addEventListener('DOMContentLoaded',init);
    document.addEventListener('ort:lang',init);
    ortWireForm('study-form','study');
  })();`,
};

/* ---------- INSTALLATION ---------- */
P['installation.html'] = {
  t:'Installation', d:'Professional solar installation coordinated by ORT through verified local installers.',
  titleKey:'nav.installation', descKey:'install.sub',
  body: phead('nav.installation','install.title','install.sub') + `
  <section class="sec wrap">
    <div class="idx rv" style="margin-block-end:2rem"><b>01</b> <span data-t="install.how"></span></div>
    <div class="rail rv" style="grid-template-columns:repeat(6,1fr)">
      ${[1,2,3,4,5,6].map(n=>`<div class="rail-s"><span class="n">0${n}</span><h4 data-t="install.s${n}"></h4><p data-t="install.s${n}d"></p></div>`).join('')}
    </div>
    <style>@media(max-width:1000px){.rail{grid-template-columns:repeat(3,1fr)!important}}@media(max-width:600px){.rail{grid-template-columns:repeat(2,1fr)!important}}</style>
  </section>

  <section class="sec light">
    <div class="wrap split" style="align-items:center">
      <div class="rv">
        <span class="badge b-approved">${TICK}<span data-t="install.verified"></span></span>
        <h2 class="t-h2" style="margin-block-start:1.5rem" data-t="install.verifiedBody"></h2>
      </div>
      <ul class="checks one rv d1">${[1,2,3,4,5].map(n=>li('install.v'+n)).join('')}</ul>
    </div>
  </section>

  <section class="sec wrap">
    <div class="split top">
      <div class="rv">
        <div class="idx"><b>02</b> <span data-t="install.pricing"></span></div>
        <p class="lede" style="margin-block-start:1.5rem" data-t="install.pricingBody"></p>
        <ul class="checks one" style="margin-block-start:1.5rem">${[1,2,3,4,5,6,7,8].map(n=>li('install.p'+n)).join('')}</ul>
      </div>
      <div class="rv d1" style="border:1px solid var(--hair);padding:clamp(1.5rem,3vw,2.25rem)">
        <h3 class="t-h3" style="margin-block-end:1.5rem" data-t="install.requestTitle"></h3>
        <form class="form" id="inst-form" novalidate>
          ${msgs}
          <div class="f2">${fld('full_name','form.fullName','text',true,'form.namePh')}${fld('email','form.email','email',true,'form.emailPh')}</div>
          <div class="f2">${fld('country','form.country')}${fld('city','form.city')}</div>
          <div class="f2">
            <div class="fld"><label for="project_type" data-t="install.projectType"></label><select id="project_type" name="project_type"></select></div>
            <div class="fld"><label for="owns" data-t="install.ownsEquipment"></label><select id="owns" name="owns"></select></div>
          </div>
          ${area('message','install.siteLabel','install.sitePh',true)}
          ${files()}
          ${submit('form.submit')}
        </form>
      </div>
    </div>
  </section>`,
  script:`function fill(){
    document.getElementById('project_type').innerHTML=['residential','commercial','industrial'].map(k=>'<option>'+t('install.'+k)+'</option>').join('');
    document.getElementById('owns').innerHTML=['ownNo','ownYes','ownPartly'].map(k=>'<option>'+t('install.'+k)+'</option>').join('');}
  document.addEventListener('DOMContentLoaded',fill);document.addEventListener('ort:lang',fill);
  ortWireForm('inst-form','installation');`,
};

/* ---------- REQUEST QUOTE ---------- */
P['request-quote.html'] = {
  t:'Request a Quote', d:'Request a firm quotation for solar equipment.',
  titleKey:'footer.quote', descKey:'price.sub',
  body: phead('footer.quote','footer.quote','price.sub') + `
  <section class="sec wrap">
    <div class="split r top">
      <div class="rv d1" style="border:1px solid var(--hair);padding:clamp(1.5rem,3vw,2.5rem)">
        <div id="pnote" hidden style="border:1px solid var(--signal);padding:.9rem 1rem;margin-block-end:1.35rem;font-size:var(--t-sm)"></div>
        <form class="form" id="quote-form" novalidate>
          ${msgs}
          <div class="f2">${fld('full_name','form.fullName','text',true,'form.namePh')}${fld('email','form.email','email',true,'form.emailPh')}</div>
          <div class="f2">${fld('country','form.country')}${fld('city','form.city','text',false)}</div>
          ${fld('mobile','form.mobile','tel',false,'',true)}
          ${area('message','form.message','form.askPh',true)}
          ${submit('form.submit')}
        </form>
      </div>
      <aside class="rv">
        <div class="idx"><b>01</b> <span data-t="price.title"></span></div>
        <p class="lede" style="margin-block-start:1.5rem" data-t="price.sub"></p>
        <a class="lnk lnk-signal" style="margin-block-start:1.25rem" href="transparent-pricing.html"><span data-t="home.priceCta"></span> <span class="arw">→</span></a>
      </aside>
    </div>
  </section>`,
  script:`ortWireForm('quote-form','quote');
    function pn(){const sp=new URLSearchParams(location.search).get('p');
      if(!sp)return;const pr=ORT_PRODUCTS.find(x=>x.slug===sp);if(!pr)return;
      const n=document.getElementById('pnote');
      n.innerHTML='<strong class="ltr">'+pr.brand+' '+pr.model+'</strong> · '+tMoney(ortPrice(pr).total);
      n.hidden=false;const m=document.getElementById('message');if(m&&!m.value)m.value=pr.brand+' '+pr.model+' — ';}
    document.addEventListener('DOMContentLoaded',pn);document.addEventListener('ort:lang',pn);`,
};

/* ---------- ABOUT ---------- */
P['about.html'] = {
  t:'About', d:'ORT WATT is the solar and energy division of ORT BÂTIMENT, based in Dubai.',
  titleKey:'nav.about', descKey:'about.sub',
  body: phead('nav.about','about.title','about.sub') + `
  <section class="sec wrap">
    <div class="split l top">
      <div class="rv"><div class="idx"><b>01</b> <span data-t="nav.about"></span></div></div>
      <div class="rv d1 stk">
        <p class="lede" data-t="about.p1"></p>
        <p class="muted" data-t="about.p2"></p>
        <p class="muted" data-t="about.p3"></p>
      </div>
    </div>
  </section>
  <section class="sec light">
    <div class="wrap">
      <div class="rv" style="margin-block-end:2.5rem">
        <div class="idx"><b>02</b> <span data-t="about.commitments"></span></div>
      </div>
      <div class="rail rv">
        ${[1,2,3,4].map(n=>`<div class="rail-s"><span class="n">0${n}</span><h4 data-t="about.c${n}"></h4><p data-t="about.c${n}d"></p></div>`).join('')}
      </div>
    </div>
  </section>
  <section class="sec wrap">
    <div class="split l top">
      <div class="rv"><div class="idx"><b>03</b> <span data-t="about.structure"></span></div></div>
      <p class="lede rv d1" data-t="about.structureBody"></p>
    </div>
  </section>`,
};

/* ---------- CONTACT ---------- */
P['contact.html'] = {
  t:'Contact', d:'Contact ORT WATT in Dubai.',
  titleKey:'nav.contact', descKey:'contact.sub',
  body: phead('nav.contact','contact.title','contact.sub') + `
  <section class="sec wrap">
    <div class="split r top">
      <div class="rv d1" style="border:1px solid var(--hair);padding:clamp(1.5rem,3vw,2.5rem)">
        <h3 class="t-h3" style="margin-block-end:1.5rem" data-t="contact.sendMessage"></h3>
        <form class="form" id="contact-form" novalidate>
          ${msgs}
          <div class="f2">${fld('full_name','form.fullName','text',true,'form.namePh')}${fld('email','form.email','email',true,'form.emailPh')}</div>
          <div class="f2">${fld('country','form.country','text',false)}${fld('mobile','form.mobile','tel',false,'',true)}</div>
          ${area('message','form.message','form.askPh',true)}
          ${submit('form.send')}
        </form>
      </div>
      <aside class="rv stk-lg">
        <div>
          <div class="idx"><b>01</b> <span data-t="contact.location"></span></div>
          <p class="t-h3" style="margin-block-start:1rem" data-t="contact.dubai"></p>
          <p class="sm dim" style="margin-block-start:.5rem" data-t="footer.division"></p>
        </div>
        <div>
          <div class="idx"><b>02</b> <span data-t="contact.faster"></span></div>
          <div class="ledger" style="margin-block-start:1rem">
            <a class="led" style="grid-template-columns:1fr auto" href="ask-an-engineer.html"><h3 style="font-size:1rem" data-t="contact.r1"></h3><span class="go">→</span></a>
            <a class="led" style="grid-template-columns:1fr auto" href="request-quote.html"><h3 style="font-size:1rem" data-t="contact.r2"></h3><span class="go">→</span></a>
            <a class="led" style="grid-template-columns:1fr auto" href="solar-study.html"><h3 style="font-size:1rem" data-t="contact.r3"></h3><span class="go">→</span></a>
            <a class="led" style="grid-template-columns:1fr auto" href="installation.html"><h3 style="font-size:1rem" data-t="contact.r4"></h3><span class="go">→</span></a>
          </div>
        </div>
      </aside>
    </div>
  </section>`,
  script:`ortWireForm('contact-form','ask_engineer');`,
};

/* ---------- LOGIN ---------- */
P['login.html'] = {
  t:'Log in', d:'Log in to your ORT WATT account.',
  titleKey:'nav.login', descKey:'account.loginSide',
  style:`.auth{min-block-size:calc(100vh - 4.75rem);display:grid;grid-template-columns:1fr 1fr;}
    @media(max-width:860px){.auth{grid-template-columns:1fr;}.auth-side{display:none;}}
    .auth-f{display:grid;place-items:center;padding:clamp(2rem,6vw,4rem);}
    .auth-f>div{inline-size:100%;max-inline-size:26rem;}
    .auth-side{background:var(--navy-900);padding:clamp(2rem,5vw,4rem);display:flex;flex-direction:column;justify-content:space-between;border-inline-start:1px solid var(--hair);}`,
  body:`
  <div class="auth">
    <div class="auth-f">
      <div>
        <div class="idx"><b>01</b> <span data-t="nav.login"></span></div>
        <h1 class="t-h1" style="margin-block:1.25rem 2rem;font-size:clamp(1.9rem,3.4vw,2.6rem)" data-t="account.loginTitle"></h1>
        <form class="form" id="login-form" novalidate>
          ${msgs}
          ${fld('email','form.email','email',true,'form.emailPh')}
          ${fld('password','form.password','password')}
          <div class="row" style="justify-content:space-between">
            <label class="sm muted" style="display:flex;gap:.5rem;align-items:center"><input type="checkbox" name="remember" style="inline-size:auto"> <span data-t="form.rememberMe"></span></label>
            <a class="lnk" href="#" data-t="form.forgotPassword"></a>
          </div>
          ${submit('form.logIn')}
        </form>
        <p class="sm muted" style="margin-block-start:1.5rem"><span data-t="form.noAccount"></span> <a class="lnk" href="signup.html" data-t="form.createOne"></a></p>
      </div>
    </div>
    <div class="auth-side">
      <div class="idx"><b>—</b> <span data-t="nav.account"></span></div>
      <div>
        <h2 class="t-h2" data-t="account.loginSide"></h2>
        <ul class="checks one" style="margin-block-start:2rem">${[1,2,3,4,5].map(n=>li('account.l'+n)).join('')}</ul>
      </div>
      <p class="mono xs dim">ORT WATT · DUBAI</p>
    </div>
  </div>`,
  script:`document.getElementById('login-form').addEventListener('submit',async e=>{
    e.preventDefault();const f=e.target,err=f.querySelector('.msg.err');err.hidden=true;
    if(!ortValidate(f))return;
    const b=f.querySelector('[type=submit]');b.disabled=true;
    try{const r=await ortApi.login({email:f.email.value,password:f.password.value});
      ortAuth.token=r.token;ortAuth.user=r.user;location.href='dashboard.html';}
    catch(ex){err.textContent=ex.message;err.hidden=false;}finally{b.disabled=false;}});`,
};

/* ---------- SIGNUP ---------- */
P['signup.html'] = {
  t:'Create account', d:'Create an ORT WATT customer account.',
  titleKey:'nav.signup', descKey:'account.loginSide',
  style:`.auth{min-block-size:calc(100vh - 4.75rem);display:grid;grid-template-columns:1fr 1fr;}
    @media(max-width:860px){.auth{grid-template-columns:1fr;}.auth-side{display:none;}}
    .auth-f{display:grid;place-items:center;padding:clamp(2rem,6vw,4rem);}
    .auth-f>div{inline-size:100%;max-inline-size:28rem;}
    .auth-side{background:var(--navy-900);padding:clamp(2rem,5vw,4rem);display:flex;flex-direction:column;justify-content:space-between;border-inline-start:1px solid var(--hair);}`,
  body:`
  <div class="auth">
    <div class="auth-f">
      <div>
        <div class="idx"><b>01</b> <span data-t="nav.signup"></span></div>
        <h1 class="t-h1" style="margin-block:1.25rem 2rem;font-size:clamp(1.9rem,3.4vw,2.6rem)" data-t="account.signupTitle"></h1>
        <form class="form" id="signup-form" novalidate>
          ${msgs}
          <div class="f2">${fld('first_name','form.firstName')}${fld('last_name','form.lastName')}</div>
          ${fld('email','form.email','email',true,'form.emailPh')}
          <div class="f2">${fld('password','form.password','password')}${fld('confirm_password','form.confirmPassword','password')}</div>
          ${fld('mobile','form.mobile','tel',false,'',true)}
          ${submit('nav.signup')}
        </form>
        <p class="sm muted" style="margin-block-start:1.5rem"><span data-t="form.haveAccount"></span> <a class="lnk" href="login.html" data-t="form.logIn"></a></p>
      </div>
    </div>
    <div class="auth-side">
      <div class="idx"><b>—</b> <span data-t="nav.account"></span></div>
      <div>
        <h2 class="t-h2" data-t="account.loginSide"></h2>
        <ul class="checks one" style="margin-block-start:2rem">${[1,2,3,4,5].map(n=>li('account.l'+n)).join('')}</ul>
      </div>
      <p class="mono xs dim">ORT WATT · DUBAI</p>
    </div>
  </div>`,
  script:`document.getElementById('signup-form').addEventListener('submit',async e=>{
    e.preventDefault();const f=e.target,err=f.querySelector('.msg.err');err.hidden=true;
    if(!ortValidate(f))return;
    if(f.password.value!==f.confirm_password.value){err.textContent=t('form.passwordMismatch');err.hidden=false;return;}
    const b=f.querySelector('[type=submit]');b.disabled=true;
    try{const r=await ortApi.register({first_name:f.first_name.value,last_name:f.last_name.value,
      email:f.email.value,password:f.password.value,confirm_password:f.confirm_password.value,mobile:f.mobile.value||null});
      ortAuth.token=r.token;ortAuth.user=r.user;location.href='dashboard.html';}
    catch(ex){err.textContent=ex.message;err.hidden=false;}finally{b.disabled=false;}});`,
};

/* ---------- DASHBOARD ---------- */
P['dashboard.html'] = {
  t:'My account', d:'Your requests, quotes and installations.',
  titleKey:'account.myAccount', descKey:'account.sub',
  style:`.dash{display:grid;grid-template-columns:15rem 1fr;gap:clamp(2rem,4vw,3.5rem);align-items:start;}
    @media(max-width:860px){.dash{grid-template-columns:1fr;}}
    .dnav a,.dnav button{display:block;inline-size:100%;text-align:start;padding:.7rem .25rem;border-block-end:1px solid var(--hair);font-size:var(--t-sm);color:var(--on-dark-2);}
    .dnav a:hover{color:var(--on-dark);}
    .rq{display:grid;grid-template-columns:auto 1fr auto;gap:1rem;align-items:center;padding-block:1.1rem;border-block-end:1px solid var(--hair);}
    @media(max-width:640px){.rq{grid-template-columns:1fr auto;}}
    .st{font-family:var(--f-m);font-size:var(--t-mono);letter-spacing:.1em;text-transform:uppercase;padding:.3rem .55rem;border:1px solid currentColor;}`,
  body:`
  <section class="phead" style="padding-block:clamp(2rem,4vw,3rem)">
    <div class="phead-in">
      <nav class="crumbs"><a href="index.html" data-t="err.home"></a> <span>/</span> <span data-t="account.myAccount"></span></nav>
      <h1 id="hello" style="font-size:clamp(1.75rem,3vw,2.4rem);margin-block:1rem .5rem" data-t="account.myAccount"></h1>
      <p class="lede" style="font-size:var(--t-body)" data-t="account.sub"></p>
    </div>
  </section>
  <section class="sec wrap" style="padding-block:clamp(2.5rem,5vw,4rem)">
    <div class="dash">
      <aside class="dnav">
        <div class="idx" style="margin-block-end:1rem"><b>01</b> <span data-t="account.myAccount"></span></div>
        <a href="#req" data-t="account.requests"></a>
        <a href="ask-an-engineer.html" data-t="nav.ask"></a>
        <a href="request-quote.html" data-t="footer.quote"></a>
        <a href="installation.html" data-t="nav.installation"></a>
        <a href="contact.html" data-t="account.support"></a>
        <button class="btn btn-line btn-sm" id="logout" style="margin-block-start:1.5rem;inline-size:100%"><span data-t="account.logout"></span></button>
      </aside>
      <div>
        <div id="nologin" hidden class="empty">
          <h3 data-t="account.notLoggedIn"></h3>
          <p data-t="account.notLoggedInBody"></p>
          <div class="row" style="justify-content:center">
            <a class="btn btn-signal" href="login.html"><span data-t="nav.login"></span> <span class="arw">→</span></a>
            <a class="btn btn-line" href="signup.html" data-t="nav.signup"></a>
          </div>
        </div>
        <div id="dbody" hidden>
          <div class="stats" style="padding-block-end:2rem;border-block-end:1px solid var(--hair)">
            <div class="stat"><div class="v" id="s1">0</div><div class="k" data-t="account.total"></div></div>
            <div class="stat"><div class="v" id="s2">0</div><div class="k" data-t="account.open"></div></div>
            <div class="stat"><div class="v" id="s3">0</div><div class="k" data-t="account.quoted"></div></div>
            <div class="stat"><div class="v" id="s4">0</div><div class="k" data-t="account.closed"></div></div>
          </div>
          <h2 class="t-h3" id="req" style="margin-block:2rem 1rem" data-t="account.requests"></h2>
          <div id="rlist"></div>
        </div>
      </div>
    </div>
  </section>`,
  script:`
  let CACHE=null;
  async function load(){
    const nologin=document.getElementById('nologin'),dbody=document.getElementById('dbody');
    if(!ortAuth.token){nologin.hidden=false;return;}
    try{
      const me=await ortApi.me();
      document.getElementById('hello').textContent=t('account.welcome',{name:me.user.first_name});
      const {requests}=await ortApi.myRequests();CACHE=requests;dbody.hidden=false;paint();
    }catch(e){nologin.hidden=false;}
  }
  function paint(){
    if(!CACHE)return;
    const K={quote:'account.kindQuote',study:'account.kindStudy',ask_engineer:'account.kindAsk',installation:'account.kindInstall'};
    const S={new:'account.stNew',in_review:'account.stReview',quoted:'account.stQuoted',answered:'account.stAnswered',closed:'account.stClosed'};
    document.getElementById('s1').textContent=tNum(CACHE.length);
    document.getElementById('s2').textContent=tNum(CACHE.filter(r=>['new','in_review'].includes(r.status)).length);
    document.getElementById('s3').textContent=tNum(CACHE.filter(r=>r.status==='quoted').length);
    document.getElementById('s4').textContent=tNum(CACHE.filter(r=>r.status==='closed').length);
    const l=document.getElementById('rlist');
    l.innerHTML=CACHE.length?CACHE.map(r=>
      '<div class="rq"><span class="mono xs dim">'+tDate(r.created_at)+'</span>'+
      '<div><strong>'+t(K[r.kind]||'account.kindAsk')+'</strong><div class="sm muted">'+((r.message||'').slice(0,80)||'—')+'</div></div>'+
      '<span class="st">'+t(S[r.status]||'account.stNew')+'</span></div>').join('')
      :'<div class="empty"><h3>'+t('account.emptyTitle')+'</h3><p>'+t('account.emptyBody')+'</p><a class="btn btn-signal" href="ask-an-engineer.html">'+t('nav.ask')+' <span class="arw">→</span></a></div>';
  }
  document.addEventListener('DOMContentLoaded',()=>{load();
    document.getElementById('logout').addEventListener('click',()=>{ortAuth.logout();location.href='index.html';});});
  document.addEventListener('ort:lang',paint);`,
};

/* ---------- 404 ---------- */
P['404.html'] = {
  t:'Not found', d:'That page does not exist.',
  titleKey:'err.title', descKey:'err.body',
  body:`
  <section class="sec wrap" style="min-block-size:62vh;display:grid;place-items:center;text-align:center">
    <div style="max-inline-size:34rem">
      <div class="mono" style="font-size:clamp(4rem,12vw,8rem);color:var(--signal);line-height:1;letter-spacing:-.04em">404</div>
      <h1 class="t-h2" style="margin-block:1.5rem 1rem" data-t="err.title"></h1>
      <p class="muted" data-t="err.body"></p>
      <div class="row" style="justify-content:center;margin-block-start:2rem">
        <a class="btn btn-signal" href="index.html"><span data-t="err.home"></span> <span class="arw">→</span></a>
        <a class="btn btn-line" href="equipment.html" data-t="nav.equipment"></a>
        <a class="btn btn-line" href="ask-an-engineer.html" data-t="nav.ask"></a>
      </div>
    </div>
  </section>`,
};

let n=0;
for(const [f,cfg] of Object.entries(P)){ fs.writeFileSync(f, HEAD(cfg)); n++; }
console.log('Generated '+n+' pages.');
