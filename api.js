/* =========================================================
   api.js — connection to the server.
   Same address as the website, so a relative path works and
   there is no CORS configuration to get wrong.
   ========================================================= */

const API_BASE = '/api';

const ortAuth = {
  get token(){ return localStorage.getItem('ort-token'); },
  set token(v){ v ? localStorage.setItem('ort-token', v) : localStorage.removeItem('ort-token'); },
  get user(){ const r = localStorage.getItem('ort-user'); return r ? JSON.parse(r) : null; },
  set user(u){ u ? localStorage.setItem('ort-user', JSON.stringify(u)) : localStorage.removeItem('ort-user'); },
  logout(){ this.token = null; this.user = null; },
};

async function ortFetch(path, { method='GET', body, isForm=false } = {}){
  const headers = {};
  if(!isForm) headers['Content-Type'] = 'application/json';
  if(ortAuth.token) headers['Authorization'] = 'Bearer ' + ortAuth.token;
  let res;
  try{
    res = await fetch(API_BASE + path, {
      method, headers,
      body: isForm ? body : (body ? JSON.stringify(body) : undefined),
    });
  }catch{
    throw new Error(t('form.offline'));
  }
  let data = {};
  try{ data = await res.json(); }catch{}
  if(!res.ok) throw new Error(data.error || t('form.genericError'));
  return data;
}

const ortApi = {
  register: p => ortFetch('/auth/register', { method:'POST', body:p }),
  login:    p => ortFetch('/auth/login',    { method:'POST', body:p }),
  me:       () => ortFetch('/auth/me'),
  categories: () => ortFetch('/categories'),
  products:  c => ortFetch('/products' + (c ? `?category=${c}` : '')),
  product:   s => ortFetch('/products/' + s),
  submitRequest: fd => ortFetch('/requests', { method:'POST', body:fd, isForm:true }),
  myRequests: () => ortFetch('/requests/mine'),
};

/* Wire a request form to the server, with translated
   validation and messages. */
function ortWireForm(formId, kind){
  const form = document.getElementById(formId);
  if(!form) return;
  const err = form.querySelector('.msg.err');
  const ok  = form.querySelector('.msg.ok');
  form.addEventListener('submit', async e=>{
    e.preventDefault();
    err.hidden = true; ok.hidden = true;
    if(!ortValidate(form)) return;
    const btn = form.querySelector('[type=submit]');
    const span = btn.querySelector('span:first-child') || btn;
    const original = span.textContent;
    btn.disabled = true; span.textContent = t('form.sending');
    try{
      const fd = new FormData(form);
      fd.append('kind', kind);
      await ortApi.submitRequest(fd);
      form.reset();
      ok.textContent = t('form.successBody');
      ok.hidden = false;
      ok.scrollIntoView({ behavior:'smooth', block:'center' });
    }catch(ex){
      err.textContent = ex.message;
      err.hidden = false;
    }finally{
      btn.disabled = false; span.textContent = original;
    }
  });
}
